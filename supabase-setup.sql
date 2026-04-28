-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/cacjhtiuddtqafdraqmg/sql

create table feedback (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text default '',
  text text not null,
  stars integer not null check (stars between 1 and 5),
  created_at timestamptz default now()
);

-- Allow anyone to read feedback
alter table feedback enable row level security;

create policy "Anyone can read feedback"
  on feedback for select
  using (true);

create policy "Anyone can insert feedback"
  on feedback for insert
  with check (true);
