-- Fix infinite recursion in profiles RLS policy
-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Organizations can view their students" ON public.profiles;

-- Keep only the basic user access policies
-- Users can view their own profile (this one is safe)
-- Users can update their own profile (this one is safe) 
-- Users can create their own profile (this one is safe)

-- No additional policies needed for now to avoid recursion issues
-- If organization access is needed later, it should be implemented with security definer functions