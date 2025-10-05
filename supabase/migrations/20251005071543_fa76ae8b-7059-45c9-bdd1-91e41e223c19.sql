-- Ensure the mission-videos bucket exists (idempotent)
insert into storage.buckets (id, name, public)
values ('mission-videos', 'mission-videos', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own videos to mission-videos
create policy "Users can upload their own mission videos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'mission-videos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own mission videos
create policy "Users can view their own mission videos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mission-videos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow organization users to view videos of their students (same org_code)
create policy "Organizations can view students mission videos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mission-videos'
  and exists (
    select 1
    from public.profiles org_profile
    where org_profile.user_id = auth.uid()
      and org_profile.role = 'organization'
      and org_profile.organization_code in (
        select student_profile.organization_code
        from public.profiles student_profile
        where student_profile.user_id::text = (storage.foldername(name))[1]
          and student_profile.role = 'student'
      )
  )
);
