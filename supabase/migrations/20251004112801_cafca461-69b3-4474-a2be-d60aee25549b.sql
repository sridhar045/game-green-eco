-- Create new RPC to allow region scope selection for student leaderboard
create or replace function public.get_student_leaderboard_by_scope(scope text)
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
  curr_org_code text;
  curr_district text;
  curr_state text;
  curr_country text;
  normalized_scope text;
begin
  -- Normalize scope input
  normalized_scope := lower(coalesce(scope, ''));

  -- Get current user profile attributes
  select organization_code, region_district, region_state, region_country
  into curr_org_code, curr_district, curr_state, curr_country
  from public.profiles
  where user_id = auth.uid();

  if normalized_scope = 'organization' and curr_org_code is not null then
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student'
        and p.display_name is not null
        and p.organization_code = curr_org_code
      order by p.eco_points desc
      limit 100;
  elsif normalized_scope = 'district' and curr_district is not null then
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student'
        and p.display_name is not null
        and p.region_district = curr_district
      order by p.eco_points desc
      limit 100;
  elsif normalized_scope = 'state' and curr_state is not null then
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student'
        and p.display_name is not null
        and p.region_state = curr_state
      order by p.eco_points desc
      limit 100;
  elsif normalized_scope = 'country' and curr_country is not null then
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student'
        and p.display_name is not null
        and p.region_country = curr_country
      order by p.eco_points desc
      limit 100;
  else
    -- Fallback: return top globally
    return query
      select p.user_id, p.display_name, p.eco_points, p.completed_missions, p.completed_lessons, p.level,
             p.organization_name, p.region_district, p.region_state, p.region_country, p.organization_code
      from public.profiles p
      where p.role = 'student' and p.display_name is not null
      order by p.eco_points desc
      limit 100;
  end if;
end;
$$;

-- Ensure organization_name on student profiles is kept in sync
-- Create trigger to call existing sync_student_org_name() function
-- (Function already exists per project config)

-- Drop if exists to avoid duplicates
drop trigger if exists trg_sync_student_org_name on public.profiles;

create trigger trg_sync_student_org_name
before insert or update on public.profiles
for each row
execute function public.sync_student_org_name();