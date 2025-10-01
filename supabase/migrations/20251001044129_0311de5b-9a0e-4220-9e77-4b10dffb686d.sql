-- Create activity_log table to track all student activities
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_code text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- 'joined', 'mission_completed', 'mission_approved', 'mission_rejected', 'lesson_completed'
  activity_message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Organizations can view activities for their organization
CREATE POLICY "Organizations can view their activities"
ON public.activity_log
FOR SELECT
USING (
  organization_code IN (
    SELECT om.organization_code
    FROM public.organization_memberships om
    WHERE om.user_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX idx_activity_log_org_code ON public.activity_log(organization_code, created_at DESC);

-- Update trigger for mission approval to award points to organization and log activity
CREATE OR REPLACE FUNCTION public.update_org_stats_on_mission_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_org_code text;
  student_name text;
  mission_title text;
BEGIN
  -- Only update if mission is now approved and wasn't approved before
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get student's organization code and name
    SELECT p.organization_code, p.display_name
    INTO student_org_code, student_name
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id;
    
    -- Get mission title
    SELECT m.title INTO mission_title
    FROM public.missions m
    WHERE m.id = NEW.mission_id;
    
    -- Award points to organization (same points as student earned)
    IF student_org_code IS NOT NULL THEN
      UPDATE public.profiles
      SET 
        eco_points = eco_points + NEW.points_awarded,
        level = GREATEST(1, ((eco_points + NEW.points_awarded) / 2000) + 1),
        updated_at = now()
      WHERE role = 'organization' AND organization_code = student_org_code;
      
      -- Log activity
      INSERT INTO public.activity_log (organization_code, user_id, activity_type, activity_message, metadata)
      VALUES (
        student_org_code,
        NEW.user_id,
        'mission_approved',
        student_name || ' completed "' || mission_title || '" and earned ' || NEW.points_awarded || ' points',
        jsonb_build_object('mission_id', NEW.mission_id, 'points', NEW.points_awarded)
      );
    END IF;
  END IF;
  
  -- Log rejection
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    SELECT p.organization_code, p.display_name
    INTO student_org_code, student_name
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id;
    
    SELECT m.title INTO mission_title
    FROM public.missions m
    WHERE m.id = NEW.mission_id;
    
    IF student_org_code IS NOT NULL THEN
      INSERT INTO public.activity_log (organization_code, user_id, activity_type, activity_message, metadata)
      VALUES (
        student_org_code,
        NEW.user_id,
        'mission_rejected',
        student_name || '''s submission for "' || mission_title || '" was rejected',
        jsonb_build_object('mission_id', NEW.mission_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_update_org_stats_on_mission_approval ON public.mission_submissions;
CREATE TRIGGER trg_update_org_stats_on_mission_approval
AFTER INSERT OR UPDATE OF status ON public.mission_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_org_stats_on_mission_approval();

-- Update trigger for student joining organization
CREATE OR REPLACE FUNCTION public.award_org_points_on_student_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_code text;
  student_name text;
BEGIN
  -- Check if student role and has organization_code
  IF NEW.role = 'student' AND NEW.organization_code IS NOT NULL THEN
    -- Check if this is a new student joining (not an update)
    IF OLD.organization_code IS NULL OR OLD.organization_code != NEW.organization_code THEN
      -- Award 50 points to organization
      UPDATE public.profiles
      SET 
        eco_points = eco_points + 50,
        level = GREATEST(1, ((eco_points + 50) / 2000) + 1),
        updated_at = now()
      WHERE role = 'organization' AND organization_code = NEW.organization_code;
      
      -- Log activity
      INSERT INTO public.activity_log (organization_code, user_id, activity_type, activity_message, metadata)
      VALUES (
        NEW.organization_code,
        NEW.user_id,
        'joined',
        NEW.display_name || ' joined the organization',
        jsonb_build_object('student_id', NEW.user_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_award_org_points_on_student_join ON public.profiles;
CREATE TRIGGER trg_award_org_points_on_student_join
AFTER INSERT OR UPDATE OF organization_code ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.award_org_points_on_student_join();

-- Update lesson completion trigger to log activity for organizations
CREATE OR REPLACE FUNCTION public.log_lesson_completion_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_org_code text;
  student_name text;
  lesson_title text;
BEGIN
  -- Only log if lesson is now completed and wasn't completed before
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    -- Get student's organization code and name
    SELECT p.organization_code, p.display_name
    INTO student_org_code, student_name
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id;
    
    -- Get lesson title
    SELECT l.title INTO lesson_title
    FROM public.lessons l
    WHERE l.id = NEW.lesson_id;
    
    -- Log activity if student is part of an organization
    IF student_org_code IS NOT NULL THEN
      INSERT INTO public.activity_log (organization_code, user_id, activity_type, activity_message, metadata)
      VALUES (
        student_org_code,
        NEW.user_id,
        'lesson_completed',
        student_name || ' completed lesson "' || lesson_title || '"',
        jsonb_build_object('lesson_id', NEW.lesson_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_log_lesson_completion_activity ON public.lesson_progress;
CREATE TRIGGER trg_log_lesson_completion_activity
AFTER INSERT OR UPDATE OF is_completed ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.log_lesson_completion_activity();

-- Log mission submission activity
CREATE OR REPLACE FUNCTION public.log_mission_submission_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_org_code text;
  student_name text;
  mission_title text;
BEGIN
  -- Only log if mission is now submitted and wasn't submitted before
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    -- Get student's organization code and name
    SELECT p.organization_code, p.display_name
    INTO student_org_code, student_name
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id;
    
    -- Get mission title
    SELECT m.title INTO mission_title
    FROM public.missions m
    WHERE m.id = NEW.mission_id;
    
    -- Log activity if student is part of an organization
    IF student_org_code IS NOT NULL THEN
      INSERT INTO public.activity_log (organization_code, user_id, activity_type, activity_message, metadata)
      VALUES (
        student_org_code,
        NEW.user_id,
        'mission_submitted',
        student_name || ' submitted proof for "' || mission_title || '"',
        jsonb_build_object('mission_id', NEW.mission_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_log_mission_submission_activity ON public.mission_submissions;
CREATE TRIGGER trg_log_mission_submission_activity
AFTER INSERT OR UPDATE OF status ON public.mission_submissions
FOR EACH ROW EXECUTE FUNCTION public.log_mission_submission_activity();