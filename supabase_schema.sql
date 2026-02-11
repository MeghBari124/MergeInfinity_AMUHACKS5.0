-- Enable UUID extension for generating unique IDs
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null,
  name text,
  role text default 'student',
  points int default 0,
  badges jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Issues table
create table if not exists issues (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  description text,
  image_data text, -- Storing Base64 string for now
  location text,
  category text,
  urgency text,
  status text default 'pending',
  is_duplicate boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create indexes for performance
create index if not exists issues_user_id_idx on issues(user_id);
create index if not exists issues_status_idx on issues(status);
