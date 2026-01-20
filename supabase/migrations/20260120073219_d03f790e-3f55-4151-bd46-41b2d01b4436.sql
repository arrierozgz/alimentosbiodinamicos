-- Add DELETE policy for user_preferences to allow users to delete their own preferences
CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);