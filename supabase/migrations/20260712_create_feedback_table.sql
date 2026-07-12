-- ============================================================
-- Starlet 5.0 – Feedback Table Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create the feedback table
create table if not exists public.feedback (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- Submitter identity (linked to auth user)
  user_id         uuid references auth.users(id) on delete set null,
  name            text,
  email           text,
  college         text,

  -- Q1 – mandatory
  q1_experience   text not null,

  -- Q2 – mandatory
  q2_memorable_session text not null,

  -- Q3 – optional
  q3_best_memory  text,

  -- Q4 – optional blog upload (stores public URL from Storage)
  q4_blog_url     text,

  -- Q5 – mandatory
  q5_improve      text not null
);

-- 2. Row Level Security
alter table public.feedback enable row level security;

-- Attendees can only insert their own feedback
create policy "Attendees can submit feedback"
  on public.feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Admins can read all feedback
create policy "Admins can read all feedback"
  on public.feedback
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.user_role = 'admin'
    )
  );

-- Users can read their own feedback row
create policy "Users can read own feedback"
  on public.feedback
  for select
  to authenticated
  using (auth.uid() = user_id);


-- 3. Storage bucket for blog uploads (images/videos)
insert into storage.buckets (id, name, public)
values ('feedback-blogs', 'feedback-blogs', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload blog files
create policy "Authenticated users can upload blog files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'feedback-blogs');

-- Public read for all uploaded blog files
create policy "Public can view blog files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'feedback-blogs');
