-- Fix avatar storage issues

-- Make sure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'user-avatars';

-- Disable RLS on storage.objects for user-avatars bucket specifically
-- (This ensures public read access works)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but with proper policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Anyone can view user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create simpler, more permissive policies for user avatars
CREATE POLICY "Public read access for user avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Authenticated users can manage user avatars" ON storage.objects
    FOR ALL USING (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

-- Alternative: Create specific policies for each operation
CREATE POLICY "Users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-avatars' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-avatars' AND
        auth.role() = 'authenticated'
    ); 