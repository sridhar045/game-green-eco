-- Fix security warning for generate_organization_code function
CREATE OR REPLACE FUNCTION public.generate_organization_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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