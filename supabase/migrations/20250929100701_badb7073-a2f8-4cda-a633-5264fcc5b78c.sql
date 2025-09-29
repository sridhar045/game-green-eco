-- Add organization_code column to profiles table
ALTER TABLE public.profiles ADD COLUMN organization_code text;

-- Create index for efficient lookups
CREATE INDEX idx_profiles_organization_code ON public.profiles(organization_code);

-- Create a function to generate unique 4-digit organization codes
CREATE OR REPLACE FUNCTION public.generate_organization_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_code text;
    code_exists boolean;
BEGIN
    LOOP
        -- Generate a random 4-digit code
        new_code := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
        
        -- Check if this code already exists
        SELECT EXISTS(
            SELECT 1 FROM public.profiles 
            WHERE organization_code = new_code
        ) INTO code_exists;
        
        -- If code doesn't exist, we can use it
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$;

-- Update the handle_new_user function to automatically generate organization codes for organizations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    org_code text := NULL;
BEGIN
    -- Generate organization code if role is organization
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'organization' THEN
        org_code := generate_organization_code();
    END IF;

    INSERT INTO public.profiles (
        user_id, 
        display_name, 
        role, 
        organization_name, 
        region_district, 
        region_state, 
        region_country, 
        gender,
        organization_code
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'organization_name',
        NEW.raw_user_meta_data->>'region_district',
        NEW.raw_user_meta_data->>'region_state',
        COALESCE(NEW.raw_user_meta_data->>'region_country', 'India'),
        NEW.raw_user_meta_data->>'gender',
        CASE 
            WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'organization' THEN org_code 
            ELSE NEW.raw_user_meta_data->>'organization_code'
        END
    );
    
    RETURN NEW;
END;
$$;