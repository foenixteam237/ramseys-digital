-- Alter users table to add notification preferences
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS notify_new_posts boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_likes boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_comments boolean NOT NULL DEFAULT true;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('NEW_POST', 'LIKE', 'COMMENT')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications (user_id, read);
