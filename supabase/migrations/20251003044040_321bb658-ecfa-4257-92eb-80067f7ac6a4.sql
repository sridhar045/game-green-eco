-- Create function to return region-scoped student leaderboard bypassing RLS safely
create or replace function public.get_student_leaderboard()
returns table (
  user_id uuid,
  display_name text,
  eco_points integer,
  completed_missions integer,
  completed_lessons integer,
  level integer,
  organization_name text,
  region_district text,
  region_state text,
  region_country text,
  organization_code text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  curr_role text;
  curr_org_code text;
  curr_district text;
  curr_state text;
  curr_country text;
begin
  -- Get current user profile attributes
  select role, organization_code, region_district, region_state, region_country
  into curr_role, curr_org_code, curr_district, curr_state, curr_country
  from public.profiles
  where user_id = auth.uid();

  if curr_role = 'organization' and curr_org_code is not null then
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student'
        and p.display_name is not null
        and p.organization_code = curr_org_code
      order by p.eco_points desc
      limit 50;
  elsif curr_district is not null then
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student'
        and p.display_name is not null
        and p.region_district = curr_district
      order by p.eco_points desc
      limit 50;
  elsif curr_state is not null then
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student'
        and p.display_name is not null
        and p.region_state = curr_state
      order by p.eco_points desc
      limit 50;
  elsif curr_country is not null then
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student'
        and p.display_name is not null
        and p.region_country = curr_country
      order by p.eco_points desc
      limit 50;
  else
    -- Fallback: return top globally
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student' and p.display_name is not null
      order by p.eco_points desc
      limit 50;
  end if;
end;
$$;

-- Ensure only authenticated users can call the function
revoke all on function public.get_student_leaderboard() from public;
grant execute on function public.get_student_leaderboard() to authenticated;

-- Create trigger function to sync student.organization_name from their organization profile
create or replace function public.sync_student_org_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_name text;
begin
  if new.role = 'student' and new.organization_code is not null then
    select organization_name
      into org_name
    from public.profiles
    where role = 'organization' and organization_code = new.organization_code
    limit 1;

    if org_name is not null then
      new.organization_name := org_name;
    end if;
  end if;
  return new;
end;
$$;

-- Attach trigger on profiles to maintain organization_name for students
DROP TRIGGER IF EXISTS trg_sync_student_org_name ON public.profiles;
create trigger trg_sync_student_org_name
before insert or update of organization_code on public.profiles
for each row execute function public.sync_student_org_name();

-- Backfill organization_name for existing student profiles
update public.profiles s
set organization_name = o.organization_name
from public.profiles o
where s.role = 'student'
  and s.organization_code is not null
  and o.role = 'organization'
  and o.organization_code = s.organization_code
  and (s.organization_name is null or s.organization_name <> o.organization_name);
