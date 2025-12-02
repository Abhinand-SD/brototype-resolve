-- Function to update complaint status securely via RPC
CREATE OR REPLACE FUNCTION public.update_complaint_status(
  _complaint_id uuid,
  _new_status complaint_status,
  _resolution_note text
)
RETURNS public.complaints
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_row public.complaints;
BEGIN
  -- Ensure only admins can update complaints
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can update complaints'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.complaints
  SET
    status = _new_status,
    resolution_note = _resolution_note,
    updated_at = NOW()
  WHERE id = _complaint_id
  RETURNING * INTO updated_row;

  RETURN updated_row;
END;
$$;