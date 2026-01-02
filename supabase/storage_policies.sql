-- 1. Create the bucket 'portfolio-media' if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to view files (SELECT)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'portfolio-media' );

-- 3. Allow Admin Users to Insert (Upload)
CREATE POLICY "Admin Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'portfolio-media' 
  AND auth.role() = 'authenticated' 
  AND (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- 4. Allow Admin Users to Update
CREATE POLICY "Admin Update" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'portfolio-media' 
  AND auth.role() = 'authenticated' 
  AND (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- 5. Allow Admin Users to Delete
CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'portfolio-media' 
  AND auth.role() = 'authenticated' 
  AND (select role from public.profiles where id = auth.uid()) = 'admin'
);
