-- Kalapoorti MVP schema (run in Supabase SQL Editor)

-- ============ TABLES ============

-- One profile per signed-up user (linked to Supabase's built-in auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  created_at timestamptz not null default now()
);

-- Master list of skills (so "flute" and "Flute " are never two different skills)
create table public.skills (
  id bigint generated always as identity primary key,
  name text not null,
  category text,
  created_at timestamptz not null default now()
);
create unique index skills_name_unique on public.skills (lower(name));

-- Which skills a user can teach or wants to learn
create table public.user_skills (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id bigint not null references public.skills(id) on delete cascade,
  kind text not null check (kind in ('teach', 'learn')),
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz not null default now(),
  unique (user_id, skill_id, kind)
);
create index user_skills_skill_kind_idx on public.user_skills (skill_id, kind);

-- Requests to connect between two users
create table public.connection_requests (
  id bigint generated always as identity primary key,
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  message text,
  created_at timestamptz not null default now(),
  check (from_user <> to_user),
  unique (from_user, to_user)
);

-- Messages between two connected users
create table public.messages (
  id bigint generated always as identity primary key,
  connection_id bigint not null references public.connection_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_connection_idx on public.messages (connection_id, created_at);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ROW LEVEL SECURITY ============

alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.user_skills enable row level security;
alter table public.connection_requests enable row level security;
alter table public.messages enable row level security;

-- profiles: any logged-in user can view; only you can edit your own
create policy "profiles are viewable by logged-in users"
  on public.profiles for select to authenticated using (true);
create policy "users update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- skills: read-only for users (you add new skills from the dashboard for now)
create policy "skills are viewable by logged-in users"
  on public.skills for select to authenticated using (true);

-- user_skills: anyone logged in can see (needed for matching); you manage only your own
create policy "user_skills viewable by logged-in users"
  on public.user_skills for select to authenticated using (true);
create policy "users add own skills"
  on public.user_skills for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own skills"
  on public.user_skills for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own skills"
  on public.user_skills for delete to authenticated using (auth.uid() = user_id);

-- connection_requests: only the two people involved can see; sender creates, receiver responds
create policy "participants view requests"
  on public.connection_requests for select to authenticated
  using (auth.uid() in (from_user, to_user));
create policy "users send requests"
  on public.connection_requests for insert to authenticated
  with check (auth.uid() = from_user and status = 'pending');
create policy "receiver responds to requests"
  on public.connection_requests for update to authenticated
  using (auth.uid() = to_user) with check (auth.uid() = to_user);

-- messages: only the two people in an ACCEPTED connection can read or send
create policy "participants read messages"
  on public.messages for select to authenticated
  using (exists (
    select 1 from public.connection_requests c
    where c.id = connection_id
      and c.status = 'accepted'
      and auth.uid() in (c.from_user, c.to_user)
  ));
create policy "participants send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.connection_requests c
      where c.id = connection_id
        and c.status = 'accepted'
        and auth.uid() in (c.from_user, c.to_user)
    )
  );

-- ============ MATCHING FUNCTION ============
-- Returns users where: they teach something I want to learn
-- AND I teach something they want to learn.

create or replace function public.find_matches()
returns table (
  match_user_id uuid,
  match_name text,
  they_teach_me text[],
  i_teach_them text[]
)
language sql
stable
security invoker
set search_path = public
as $$
  with theirs_to_me as (
    select t.user_id, array_agg(distinct s.name) as skills
    from user_skills t
    join user_skills l
      on l.skill_id = t.skill_id and l.kind = 'learn' and l.user_id = auth.uid()
    join skills s on s.id = t.skill_id
    where t.kind = 'teach' and t.user_id <> auth.uid()
    group by t.user_id
  ),
  mine_to_them as (
    select l.user_id, array_agg(distinct s.name) as skills
    from user_skills l
    join user_skills t
      on t.skill_id = l.skill_id and t.kind = 'teach' and t.user_id = auth.uid()
    join skills s on s.id = l.skill_id
    where l.kind = 'learn' and l.user_id <> auth.uid()
    group by l.user_id
  )
  select p.id, p.display_name, a.skills, b.skills
  from theirs_to_me a
  join mine_to_them b on b.user_id = a.user_id
  join profiles p on p.id = a.user_id;
$$;

-- ============ STARTER SKILLS ============

insert into public.skills (name, category) values
  ('Flute', 'Music'),
  ('Guitar', 'Music'),
  ('Singing', 'Music'),
  ('Painting', 'Art'),
  ('Sketching', 'Art'),
  ('Photography', 'Art'),
  ('Artificial Intelligence', 'Technology'),
  ('Python Programming', 'Technology'),
  ('Web Development', 'Technology'),
  ('Corporate Finance', 'Business'),
  ('Public Speaking', 'Business'),
  ('Spoken English', 'Language'),
  ('Hindi', 'Language'),
  ('Yoga', 'Wellness'),
  ('Cooking', 'Lifestyle')
on conflict do nothing;
