-- app_notificaciones.sql
create table if not exists public.app_notificaciones (
  id text primary key,
  tipo text not null default 'sistema',
  titulo text not null default '',
  mensaje text not null default '',
  leida boolean not null default false,
  fecha text not null default '',
  metadata text default null
);

alter table public.app_notificaciones enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all access' and tablename = 'app_notificaciones') then
    create policy "Allow all access" on public.app_notificaciones for all using (true) with check (true);
  end if;
end $$;
