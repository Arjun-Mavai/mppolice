-- Create a table for users
create table card_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  password text not null, -- In a real production app, never store plain text passwords. Use bcrypt.
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  plan_tier text default 'free' -- 'free', 'lite', 'pro'
);

-- Row Level Security (RLS) is recommended but for this simple example we will just query via API key (anon) 
-- Ensure you enable RLS if you move to client-side queries.
