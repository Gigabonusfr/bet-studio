-- Drop restrictive policy for INSERT
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- Create permissive policy for anonymous uploads
CREATE POLICY "Anyone can upload to game-assets"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'game-assets');

-- Also allow anyone to update/delete their uploads
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

CREATE POLICY "Anyone can update game-assets"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'game-assets');

CREATE POLICY "Anyone can delete game-assets"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'game-assets');