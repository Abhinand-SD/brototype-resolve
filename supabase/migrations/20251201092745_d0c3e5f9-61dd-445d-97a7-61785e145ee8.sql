-- Make complaint-attachments bucket public so attachments can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'complaint-attachments';

-- Fix the admin update policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Admins can update complaints" ON public.complaints;

CREATE POLICY "Admins can update complaints"
ON public.complaints
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));