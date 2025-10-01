-- 1) Create helper table to store each organization's code for the org user (avoids self-referencing profiles in policies)
create table if not exists public.organization_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger organization_memberships_set_updated_at
before update on public.organization_memberships
for each row execute function public.set_updated_at();

-- 2) Seed memberships from existing organization profiles
insert into public.organization_memberships (user_id, organization_code)
select p.user_id, p.organization_code
from public.profiles p
where p.role = 'organization' and p.organization_code is not null
on conflict (user_id) do update
set organization_code = excluded.organization_code,
    updated_at = now();

-- 3) Keep memberships in sync when profiles change
create or replace function public.sync_organization_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'organization' and new.organization_code is not null then
    insert into public.organization_memberships (user_id, organization_code, updated_at)
    values (new.user_id, new.organization_code, now())
    on conflict (user_id) do update
      set organization_code = excluded.organization_code,
          updated_at = now();
  else
    -- If the user is no longer an organization, remove the membership
    delete from public.organization_memberships where user_id = new.user_id;
  end if;
  return new;
end;
$$;

-- Create trigger on profiles inserts/updates
create or replace trigger trg_sync_org_membership
after insert or update of role, organization_code on public.profiles
for each row execute function public.sync_organization_membership();

-- 4) Replace the recursive policy on profiles with a non-recursive one
-- Drop existing problematic policy if it exists
drop policy if exists "Organizations can view their students profiles" on public.profiles;

-- Recreate policy without self-referencing profiles
create policy "Organizations can view their students profiles"
on public.profiles
for select
using (
  -- Allow org users to view student rows belonging to their org
  role = 'student' and organization_code in (
    select om.organization_code
    from public.organization_memberships om
    where om.user_id = auth.uid()
  )
);
