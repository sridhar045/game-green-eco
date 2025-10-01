-- Allow organizations to view mission submissions from students with matching organization_code
CREATE POLICY "Organizations can view their students submissions"
ON public.mission_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles org_profile
    WHERE org_profile.user_id = auth.uid()
    AND org_profile.role = 'organization'
    AND org_profile.organization_code IN (
      SELECT student_profile.organization_code
      FROM public.profiles student_profile
      WHERE student_profile.user_id = mission_submissions.user_id
      AND student_profile.role = 'student'
    )
  )
);

-- Allow organizations to update mission submissions from their students (for approval/rejection)
CREATE POLICY "Organizations can update their students submissions"
ON public.mission_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles org_profile
    WHERE org_profile.user_id = auth.uid()
    AND org_profile.role = 'organization'
    AND org_profile.organization_code IN (
      SELECT student_profile.organization_code
      FROM public.profiles student_profile
      WHERE student_profile.user_id = mission_submissions.user_id
      AND student_profile.role = 'student'
    )
  )
);

-- Allow organizations to view profiles of students with matching organization_code
CREATE POLICY "Organizations can view their students profiles"
ON public.profiles
FOR SELECT
USING (
  -- Users can view their own profile (existing)
  auth.uid() = user_id
  OR
  -- Organizations can view their students
  EXISTS (
    SELECT 1 FROM public.profiles org_profile
    WHERE org_profile.user_id = auth.uid()
    AND org_profile.role = 'organization'
    AND org_profile.organization_code = profiles.organization_code
    AND profiles.role = 'student'
  )
);