-- app_descuentos.sql
create table if not exists public.app_descuentos (
  id text primary key,
  codigo text not null unique,
  descripcion text not null default '',
  tipo text not null default 'porcentaje',
  valor numeric not null default 0,
  min_pedido numeric not null default 0,
  activo boolean not null default true,
  valido_desde text not null default '',
  valido_hasta text not null default '',
  usos_maximos integer not null default 0,
  usos_actuales integer not null default 0,
  creado_en text not null default ''
);

alter table public.app_descuentos enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow all access' and tablename = 'app_descuentos') then
    create policy "Allow all access" on public.app_descuentos for all using (true) with check (true);
  end if;
end $$;
