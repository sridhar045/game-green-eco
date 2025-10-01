-- Enable RLS (if not already enabled)
alter table public.organization_memberships enable row level security;

-- Recreate policies without IF NOT EXISTS (not supported)
drop policy if exists "Users can view their own membership" on public.organization_memberships;
create policy "Users can view their own membership"
on public.organization_memberships
for select
to authenticated
using (user_id = auth.uid());

-- Allow sync trigger owner to manage rows
drop policy if exists "Admin can manage memberships" on public.organization_memberships;
create policy "Admin can manage memberships"
on public.organization_memberships
for all
to supabase_admin
using (true)
with check (true);
