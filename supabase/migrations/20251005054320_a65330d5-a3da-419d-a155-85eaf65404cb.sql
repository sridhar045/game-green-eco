-- Fix ambiguous column in student leaderboard RPC and correct streak logic

-- 1) Replace get_student_leaderboard_by_scope with fully qualified columns
create or replace function public.get_student_leaderboard_by_scope(scope text)
returns table(
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
  normalized_scope := lower(coalesce(scope, ''));

  select p.organization_code, p.region_district, p.region_state, p.region_country
  into curr_org_code, curr_district, curr_state, curr_country
  from public.profiles p
  where p.user_id = auth.uid();

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

-- 2) Fix streak logic on lesson completion
create or replace function public.update_user_stats_on_lesson_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_completed = true and (old.is_completed is null or old.is_completed = false) then
    declare
      today_date date := current_date;
      last_activity date;
      current_streak integer;
      new_eco_points integer;
      new_level integer;
    begin
      select p.last_activity_date, p.streak_days, p.eco_points + 25
      into last_activity, current_streak, new_eco_points
      from public.profiles p
      where p.user_id = new.user_id;

      -- Streak update rules
      if last_activity is null then
        current_streak := 1;
      elsif last_activity = today_date then
        -- no change
        current_streak := current_streak;
      elsif last_activity = (today_date - interval '1 day') then
        current_streak := current_streak + 1;
      else
        current_streak := 1;
      end if;

      new_level := greatest(1, (new_eco_points / 200) + 1);

      update public.profiles 
      set 
        completed_lessons = completed_lessons + 1,
        eco_points = new_eco_points,
        level = new_level,
        streak_days = current_streak,
        last_activity_date = today_date,
        updated_at = now()
      where user_id = new.user_id;
    end;
  end if;
  return new;
end;
$$;

-- 3) Fix streak logic also on mission approval
create or replace function public.update_user_stats_on_mission_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and (old.status is null or old.status != 'approved') then
    declare
      today_date date := current_date;
      last_activity date;
      current_streak integer;
      new_eco_points integer;
      new_level integer;
    begin
      select p.last_activity_date, p.streak_days, p.eco_points + coalesce(new.points_awarded,0)
      into last_activity, current_streak, new_eco_points
      from public.profiles p
      where p.user_id = new.user_id;

      if last_activity is null then
        current_streak := 1;
      elsif last_activity = today_date then
        current_streak := current_streak;
      elsif last_activity = (today_date - interval '1 day') then
        current_streak := current_streak + 1;
      else
        current_streak := 1;
      end if;

      new_level := greatest(1, (new_eco_points / 200) + 1);

      update public.profiles 
      set 
        completed_missions = completed_missions + 1,
        eco_points = new_eco_points,
        level = new_level,
        streak_days = current_streak,
        last_activity_date = today_date,
        updated_at = now()
      where user_id = new.user_id;
    end;
  end if;
  return new;
end;
$$;