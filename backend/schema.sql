-- MediQueue SQL Migration Script

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users table
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  phone text not null,
  role text not null check (role in ('patient', 'doctor', 'receptionist')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Departments table
create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text
);

-- 3. Doctors table
create table if not exists public.doctors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade unique,
  department_id uuid references public.departments(id) on delete set null,
  specialization text,
  avg_consult_time integer default 15 -- in minutes
);

-- 4. Appointments table
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.users(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete cascade,
  appointment_date date not null,
  symptoms text,
  ai_suggestion text,
  token_code text unique,
  qr_code_url text,
  status text default 'scheduled' check (status in ('scheduled', 'checked_in', 'in_consultation', 'done', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Queue Entries table
create table if not exists public.queue_entries (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete cascade,
  token_number integer not null,
  position integer not null,
  status text default 'waiting' check (status in ('waiting', 'in_consultation', 'done', 'skipped')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. SMS Log table
create table if not exists public.sms_log (
  id uuid primary key default uuid_generate_v4(),
  phone text not null,
  message text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Announcements table
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  sender_id uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Simplified for development, should be tightened for production)
alter table public.users enable row level security;
create policy "Allow all users to see public.users" on public.users for select using (true);
create policy "Users can update their own data" on public.users for update using (auth.uid() = id);

-- Sample Data
-- insert into public.departments (name, description) values ('Cardiology', 'Heart related issues');
-- insert into public.departments (name, description) values ('Dermatology', 'Skin related issues');
