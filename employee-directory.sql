-- Applied to the Employee App project. No passwords or privileged API keys belong here.
create table public.directory_admins (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);
alter table public.directory_admins enable row level security;
revoke all on public.directory_admins from anon, authenticated;
grant select on public.directory_admins to authenticated;
create policy "Admins can check their own membership"
    on public.directory_admins for select to authenticated
    using (user_id = (select auth.uid()));

create table public.employees (
    id uuid primary key default gen_random_uuid(),
    name text not null check (length(trim(name)) between 1 and 120),
    title text not null check (length(trim(title)) between 1 and 120),
    department text not null check (length(trim(department)) between 1 and 80),
    email text not null check (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
    image text not null default '' check (image = '' or image ~ '^https?://'),
    bio text not null default '' check (length(bio) <= 2000),
    skills text[] not null default '{}' check (cardinality(skills) <= 20),
    linkedin text not null default '' check (linkedin = '' or linkedin ~ '^https?://'),
    github text not null default '' check (github = '' or github ~ '^https?://'),
    portfolio text not null default '' check (portfolio = '' or portfolio ~ '^https?://'),
    location text not null default '' check (length(location) <= 160),
    region text not null default '' check(length(region)<=100),
    country text not null default '' check(length(country)<=100),
    time_zone text not null default '' check(length(time_zone)<=100),
    joining_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index employees_name_idx on public.employees (name);
alter table public.employees enable row level security;
revoke all on public.employees from anon, authenticated;
grant select on public.employees to anon, authenticated;
grant insert, update, delete on public.employees to authenticated;
create policy "Anyone can view the directory"
    on public.employees for select to anon, authenticated using (true);
create policy "Approved admins can add employees"
    on public.employees for insert to authenticated
    with check (exists (select 1 from public.directory_admins where user_id = (select auth.uid())));
create policy "Approved admins can edit employees"
    on public.employees for update to authenticated
    using (exists (select 1 from public.directory_admins where user_id = (select auth.uid())))
    with check (exists (select 1 from public.directory_admins where user_id = (select auth.uid())));
create policy "Approved admins can remove employees"
    on public.employees for delete to authenticated
    using (exists (select 1 from public.directory_admins where user_id = (select auth.uid())));

-- Public employee photos, with restricted uploads and a 2 MiB per-photo limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('employee-photos', 'employee-photos', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp']);
create policy "Directory admins can view photo metadata"
    on storage.objects for select to authenticated
    using (bucket_id = 'employee-photos' and exists
           (select 1 from public.directory_admins where user_id = (select auth.uid())));
create policy "Directory admins can upload photos"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'employee-photos' and exists
                (select 1 from public.directory_admins where user_id = (select auth.uid())));
create policy "Directory admins can remove photos"
    on storage.objects for delete to authenticated
    using (bucket_id = 'employee-photos' and exists
           (select 1 from public.directory_admins where user_id = (select auth.uid())));

-- The project event trigger must not be callable through the public API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
