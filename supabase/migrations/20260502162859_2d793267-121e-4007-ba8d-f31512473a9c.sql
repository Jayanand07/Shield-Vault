
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Vault items (only ciphertext metadata stored)
create table public.vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  size bigint not null default 0,
  algorithm text not null default 'AES-256-GCM',
  iv text not null,
  ciphertext_path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);
alter table public.vault_items enable row level security;
create policy "vault_select_own" on public.vault_items for select using (auth.uid() = user_id);
create policy "vault_insert_own" on public.vault_items for insert with check (auth.uid() = user_id);
create policy "vault_delete_own" on public.vault_items for delete using (auth.uid() = user_id);

-- API keys (store hash only)
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  prefix text not null,
  key_hash text not null,
  last_used_at timestamptz,
  request_count integer not null default 0,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.api_keys enable row level security;
create policy "keys_select_own" on public.api_keys for select using (auth.uid() = user_id);
create policy "keys_insert_own" on public.api_keys for insert with check (auth.uid() = user_id);
create policy "keys_update_own" on public.api_keys for update using (auth.uid() = user_id);
create policy "keys_delete_own" on public.api_keys for delete using (auth.uid() = user_id);

-- Audit logs
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  resource text,
  ip text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create policy "audit_select_own" on public.audit_logs for select using (auth.uid() = user_id);
create policy "audit_insert_own" on public.audit_logs for insert with check (auth.uid() = user_id);

-- Rooms
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);
create table public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  unique(room_id, user_id)
);
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

create or replace function public.is_room_member(_room_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.room_members where room_id = _room_id and user_id = _user_id)
$$;

create policy "rooms_select_member" on public.rooms for select using (auth.uid() = owner_id or public.is_room_member(id, auth.uid()));
create policy "rooms_insert_owner" on public.rooms for insert with check (auth.uid() = owner_id);
create policy "rooms_update_owner" on public.rooms for update using (auth.uid() = owner_id);
create policy "rooms_delete_owner" on public.rooms for delete using (auth.uid() = owner_id);

create policy "members_select_self" on public.room_members for select using (user_id = auth.uid() or public.is_room_member(room_id, auth.uid()));
create policy "members_insert_owner" on public.room_members for insert with check (
  exists(select 1 from public.rooms where id = room_id and owner_id = auth.uid())
  or user_id = auth.uid()
);
create policy "members_delete_owner" on public.room_members for delete using (
  exists(select 1 from public.rooms where id = room_id and owner_id = auth.uid())
);

-- Profile auto-create trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket for vault (private)
insert into storage.buckets (id, name, public) values ('vault', 'vault', false)
on conflict (id) do nothing;

create policy "vault_storage_select_own" on storage.objects for select
  using (bucket_id = 'vault' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "vault_storage_insert_own" on storage.objects for insert
  with check (bucket_id = 'vault' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "vault_storage_delete_own" on storage.objects for delete
  using (bucket_id = 'vault' and auth.uid()::text = (storage.foldername(name))[1]);
