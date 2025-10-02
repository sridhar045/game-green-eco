-- Create badges for each mission
INSERT INTO public.badges (name, description, category, image_url, requirements) VALUES
('Tree Hugger', 'Awarded for planting trees and contributing to reforestation', 'mission', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400', '{"mission_category": "tree_planting"}'),
('Water Warrior', 'Awarded for water conservation efforts', 'mission', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', '{"mission_category": "water_conservation"}'),
('Waste Wizard', 'Awarded for waste reduction and recycling initiatives', 'mission', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400', '{"mission_category": "waste_management"}'),
('Energy Champion', 'Awarded for energy conservation activities', 'mission', 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400', '{"mission_category": "energy"}'),
('Eco Educator', 'Awarded for environmental education and awareness', 'mission', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400', '{"mission_category": "education"}');

-- Add iteration tracking to mission_submissions
ALTER TABLE public.mission_submissions 
ADD COLUMN IF NOT EXISTS iteration INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS completion_count INTEGER DEFAULT 0;

-- Update the mission approval trigger to award badges and handle iterations
CREATE OR REPLACE FUNCTION public.award_mission_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mission_category text;
  badge_record RECORD;
BEGIN
  -- Only award if mission is now approved and wasn't approved before
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get mission category
    SELECT category INTO mission_category
    FROM public.missions
    WHERE id = NEW.mission_id;
    
    -- Find matching badge for this mission category
    FOR badge_record IN 
      SELECT id FROM public.badges 
      WHERE requirements->>'mission_category' = mission_category
    LOOP
      -- Award badge (can be earned multiple times)
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (NEW.user_id, badge_record.id);
    END LOOP;
    
    -- Increment completion count
    UPDATE public.mission_submissions
    SET completion_count = completion_count + 1
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for badge awarding
DROP TRIGGER IF EXISTS trg_award_mission_badge ON public.mission_submissions;
CREATE TRIGGER trg_award_mission_badge
  AFTER UPDATE ON public.mission_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.award_mission_badge();