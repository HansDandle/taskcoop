-- Storage RLS policies for the id-documents bucket.
-- Workers must be able to upload their own documents; only admins can read them.

-- Allow authenticated users to upload into their own UID-prefixed folder
CREATE POLICY "Users can upload own ID documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'id-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to replace/update their own documents
CREATE POLICY "Users can update own ID documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'id-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own documents (needed for upload confirmation)
CREATE POLICY "Users can read own ID documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can read all documents in this bucket
CREATE POLICY "Admins can read all ID documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-documents'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
