-- SQL script to create the `messages` table for the internal chat widget
-- Run this in your Supabase project's SQL editor (or via CLI)

create extension if not exists "uuid-ossp"; -- required for uuid_generate_v4()

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  "from" text not null,
  created_at timestamp with time zone default now()
);

-- Enable Realtime for the table (Supabase UI provides a checkbox, but you can also set it via the API)
-- In the Supabase dashboard, go to 'Table editor' -> 'messages' -> 'Enable Realtime'

-- Enable Row Level Security for the table
alter table public.messages enable row level security;

-- Allow any authenticated user to read messages
create policy "allow select" on public.messages for select using (auth.role() = 'authenticated');

-- Allow any authenticated user to insert messages
create policy "allow insert" on public.messages for insert with check (auth.role() = 'authenticated');

-- Index on created_at for ordering
create index if not exists idx_messages_created_at on public.messages (created_at desc);
