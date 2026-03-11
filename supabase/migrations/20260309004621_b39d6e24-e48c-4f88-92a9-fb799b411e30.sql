-- Create storage bucket for game assets (images and audio)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-assets',
  'game-assets',
  true,
  10485760, -- 10MB limit
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm']
);

-- Allow anyone to read files (public bucket)
create policy "Public Access"
on storage.objects for select
using (bucket_id = 'game-assets');

-- Allow authenticated users to upload files
create policy "Authenticated users can upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'game-assets');

-- Allow authenticated users to update their own files
create policy "Authenticated users can update"
on storage.objects for update
to authenticated
using (bucket_id = 'game-assets');

-- Allow authenticated users to delete their own files
create policy "Authenticated users can delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'game-assets');