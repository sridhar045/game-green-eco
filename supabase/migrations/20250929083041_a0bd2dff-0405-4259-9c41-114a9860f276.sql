-- Fix the RLS policy that was causing the "permission denied for table users" error
-- The existing policy was trying to access auth.users table which is not allowed from client

-- Drop the problematic policy
DROP POLICY IF EXISTS "Organizations can view their students" ON public.profiles;

-- Create a corrected policy that doesn't reference auth.users
CREATE POLICY "Organizations can view their students" 
ON public.profiles 
FOR SELECT 
USING (
  -- Organizations can view students from their organization
  EXISTS (
    SELECT 1 
    FROM public.profiles org_profile 
    WHERE org_profile.user_id = auth.uid() 
      AND org_profile.role = 'organization' 
      AND org_profile.organization_name IS NOT NULL
      AND org_profile.organization_name = profiles.organization_name
  )
);