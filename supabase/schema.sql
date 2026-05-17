-- =========================================
-- ENABLE EXTENSIONS
-- =========================================

create extension if not exists "uuid-ossp";

-- =========================================
-- PROFILES TABLE
-- =========================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  school text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- =========================================
-- NOTES TABLE
-- =========================================

create table notes (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  content text,
  category text default 'General',
  summary text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- =========================================
-- QUIZZES TABLE
-- =========================================

create table quizzes (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  score integer default 0,
  total_questions integer default 0,
  created_at timestamp with time zone default timezone('utc', now())
);

-- =========================================
-- QUIZ QUESTIONS TABLE
-- =========================================

create table quiz_questions (
  id bigint generated always as identity primary key,
  quiz_id bigint references quizzes(id) on delete cascade,
  question text not null,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- =========================================
-- FLASHCARDS TABLE
-- =========================================

create table flashcards (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- =========================================
-- STUDY SESSIONS TABLE
-- =========================================

create table study_sessions (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  duration integer default 0,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

-- =========================================
-- DAILY GOALS TABLE
-- =========================================

create table goals (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  goal text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

-- =========================================
-- AI CHAT HISTORY TABLE
-- =========================================

create table ai_chats (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  question text,
  answer text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- =========================================
-- NOTIFICATIONS TABLE
-- =========================================

create table notifications (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  message text,
  details text,
  type text default 'info',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

-- =========================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================

alter table profiles enable row level security;
alter table notes enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table flashcards enable row level security;
alter table study_sessions enable row level security;
alter table goals enable row level security;
alter table ai_chats enable row level security;
alter table notifications enable row level security;

-- =========================================
-- POLICIES
-- =========================================

create policy "Users can view own profile"
on profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles
for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on profiles
for insert
with check (auth.uid() = id);

create policy "Users manage own notes"
on notes
for all
using (auth.uid() = user_id);

create policy "Users manage own quizzes"
on quizzes
for all
using (auth.uid() = user_id);

create policy "Users manage own flashcards"
on flashcards
for all
using (auth.uid() = user_id);

create policy "Users manage own study sessions"
on study_sessions
for all
using (auth.uid() = user_id);

create policy "Users manage own goals"
on goals
for all
using (auth.uid() = user_id);

create policy "Users manage own ai chats"
on ai_chats
for all
using (auth.uid() = user_id);

create policy "Users manage own notifications"
on notifications
for all
using (auth.uid() = user_id);

-- =========================================
-- AUTO CREATE PROFILE AFTER SIGNUP
-- =========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================
-- STORAGE SETUP (Run in SQL Editor)
-- =========================================

-- Create avatars bucket
-- insert into storage.buckets (id, name, public)
-- values ('avatars', 'avatars', true);

-- Policy for viewing avatars
-- create policy "Avatar images are publicly accessible"
-- on storage.objects for select
-- using ( bucket_id = 'avatars' );

-- Policy for uploading avatars
-- create policy "Users can upload their own avatars"
-- on storage.objects for insert
-- with check (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );
