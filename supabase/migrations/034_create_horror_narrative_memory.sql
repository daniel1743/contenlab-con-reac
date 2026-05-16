create table if not exists public.horror_narrative_memory (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null default 'Sin tema',
  style text default '',
  hook text default '',
  final_line text default '',
  memorable_line text default '',
  symbols jsonb not null default '[]'::jsonb,
  score integer not null default 0,
  impact_score integer not null default 0,
  clip_moment text default '',
  weaknesses jsonb not null default '[]'::jsonb,
  transmedia_brief text default '',
  focus text default '',
  feedback text not null default 'generated' check (feedback in ('generated', 'liked', 'neutral', 'disliked')),
  script_signature text default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists horror_narrative_memory_user_created_idx
  on public.horror_narrative_memory (user_id, created_at desc);

create index if not exists horror_narrative_memory_user_signature_idx
  on public.horror_narrative_memory (user_id, script_signature);

alter table public.horror_narrative_memory enable row level security;

drop policy if exists "Users can read own horror narrative memory" on public.horror_narrative_memory;
create policy "Users can read own horror narrative memory"
  on public.horror_narrative_memory
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own horror narrative memory" on public.horror_narrative_memory;
create policy "Users can insert own horror narrative memory"
  on public.horror_narrative_memory
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own horror narrative memory" on public.horror_narrative_memory;
create policy "Users can update own horror narrative memory"
  on public.horror_narrative_memory
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own horror narrative memory" on public.horror_narrative_memory;
create policy "Users can delete own horror narrative memory"
  on public.horror_narrative_memory
  for delete
  using (auth.uid() = user_id);
