-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Managed via Auth, but we need a table for roles)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('admin', 'viewer')) default 'viewer',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can insert their own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- CATEGORIES
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  type text check (type in ('web', 'mobile', 'backend', 'devops', 'other')) default 'other',
  created_at timestamptz default now()
);

alter table categories enable row level security;

create policy "Categories are viewable by everyone" 
  on categories for select using (true);

create policy "Admins can manage categories" 
  on categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- PROJECTS
create table projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  stack text[], -- Array of strings
  featured boolean default false,
  status text check (status in ('draft', 'published')) default 'draft',
  thumbnail_url text,
  live_url text,
  repo_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

create policy "Published projects are viewable by everyone" 
  on projects for select using (status = 'published');

create policy "Admins can manage all projects" 
  on projects for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- PROJECT_CATEGORIES (Join Table)
create table project_categories (
  project_id uuid references projects(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (project_id, category_id)
);

alter table project_categories enable row level security;

create policy "Project categories are viewable by everyone" 
  on project_categories for select using (true);

create policy "Admins can manage project categories" 
  on project_categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- PROJECT_MEDIA
create table project_media (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  url text not null,
  type text check (type in ('image', 'video')) default 'image',
  orientation text check (orientation in ('portrait', 'landscape', 'square')) default 'landscape',
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table project_media enable row level security;

create policy "Media viewable by everyone" 
  on project_media for select using (true);

create policy "Admins can manage media" 
  on project_media for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- SITE_SETTINGS
create table site_settings (
  id uuid default uuid_generate_v4() primary key,
  full_name text,
  headline text,
  location text,
  email text,
  phone text,
  cv_url text,
  socials jsonb -- { twitter: "", github: "", linkedin: "" }
);

alter table site_settings enable row level security;

create policy "Settings viewable by everyone" 
  on site_settings for select using (true);

create policy "Admins can update settings" 
  on site_settings for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
  
-- Allow insert only if table is empty (seed) - handled separately or via manual insert initially.
create policy "Admins can insert settings" 
  on site_settings for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- CONTACT_MESSAGES
create table contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now(),
  read boolean default false
);

alter table contact_messages enable row level security;

create policy "Anyone can insert messages" 
  on contact_messages for insert with check (true);

create policy "Admins can view messages" 
  on contact_messages for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- TRIGGERS
-- Handle new user -> profile
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'viewer'); -- Default to viewer, update to admin manually in DB
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE BUCKET POLICIES (Note: Must be set in Storage UI or via specific SQL if supported)
-- Bucket: portfolio-media
-- Public Access: true
-- Policies:
-- SELECT: true (public)
-- INSERT/UPDATE/DELETE: Check regex for admin role
