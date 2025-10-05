-- Add video_url column to mission_submissions table to store videos
ALTER TABLE mission_submissions ADD COLUMN IF NOT EXISTS video_url text;

-- Add comment to explain the column
COMMENT ON COLUMN mission_submissions.video_url IS 'URL of the video submitted by student for mission proof';

-- Create storage bucket for mission videos if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mission-videos',
  'mission-videos',
  false,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for mission-videos bucket
-- Students can upload their own videos
CREATE POLICY "Students can upload their own mission videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mission-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Students can view their own videos
CREATE POLICY "Students can view their own mission videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'mission-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Organizations can view videos from their students
CREATE POLICY "Organizations can view their students mission videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'mission-videos' AND
  EXISTS (
    SELECT 1 FROM profiles org_profile
    WHERE org_profile.user_id = auth.uid()
      AND org_profile.role = 'organization'
      AND org_profile.organization_code IN (
        SELECT student_profile.organization_code
        FROM profiles student_profile
        WHERE student_profile.user_id::text = (storage.foldername(name))[1]
          AND student_profile.role = 'student'
      )
  )
);

-- Students can update their own videos
CREATE POLICY "Students can update their own mission videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'mission-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Students can delete their own videos
CREATE POLICY "Students can delete their own mission videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'mission-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);