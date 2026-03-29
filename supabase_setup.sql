-- ============================================================
-- Crew Loading Master - Supabase Database Setup
-- Run this entire script in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create the main state table
create table if not exists crew_loading_state (
  id          text primary key,
  projects    jsonb not null default '[]',
  roster      jsonb not null default '[]',
  updated_at  timestamptz default now()
);

-- 2. Insert the initial empty row
insert into crew_loading_state (id, projects, roster)
values ('main', '[]', '[]')
on conflict (id) do nothing;

-- 3. Enable Row Level Security
alter table crew_loading_state enable row level security;

-- 4. Allow all operations (internal tool, no user auth needed)
drop policy if exists "allow all" on crew_loading_state;
create policy "allow all"
  on crew_loading_state
  for all
  using (true)
  with check (true);

-- 5. Auto-update the updated_at timestamp on every save
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on crew_loading_state;
create trigger set_updated_at
  before update on crew_loading_state
  for each row execute function update_updated_at();

-- 6. Enable real-time so changes sync across browser tabs
alter publication supabase_realtime add table crew_loading_state;

-- Done! Your table is ready.
-- Next: go to Settings > API in your Supabase dashboard
-- and copy your Project URL and anon key into Netlify env vars.
