-- SQL Script to enable automated blog media sync to Google Drive
-- Copy and paste this script directly into your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/pxgurlmrtoxlmlpiyqrj/sql)

-- 1. Enable pg_net extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Create the webhook notifier function
CREATE OR REPLACE FUNCTION public.sync_blog_post_to_google_drive()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
  author_record RECORD;
  payload JSONB;
BEGIN
  -- Fetch the author's full_name and team_name from profiles
  SELECT full_name, team_name INTO author_record
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Build custom payload combining the blog post and author info
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', jsonb_build_object(
      'id', NEW.id,
      'media_url', NEW.media_url,
      'caption', NEW.caption,
      'author_name', COALESCE(author_record.full_name, 'Anonymous'),
      'team_name', COALESCE(author_record.team_name, 'Individual_Submissions')
    )
  );

  PERFORM net.http_post(
    url := 'https://script.google.com/macros/s/AKfycbyNOpWZ-vec82PEEFS8lhiDNBxoohd662-lmyEESMJ_iSJ7qYx6FiGYbqKU8JLPA_o0wg/exec',
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  RETURN NEW;
END;
$$;

-- 3. Bind the function as a trigger on the 'blog_posts' table (only on insert)
DROP TRIGGER IF EXISTS tr_sync_blog_post_to_google_drive ON public.blog_posts;
CREATE TRIGGER tr_sync_blog_post_to_google_drive
AFTER INSERT ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.sync_blog_post_to_google_drive();
