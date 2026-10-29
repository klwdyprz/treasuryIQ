-- TreasuryIQ database. Paste this whole file into Supabase > SQL Editor > Run.
create table if not exists settings (
  id int primary key default 1,
  company text default 'My Company',
  beginning_cash numeric default 0,
  min_cash numeric default 300000
);
insert into settings (id) values (1) on conflict do nothing;

create table if not exists transactions (
  id bigint generated always as identity primary key,
  date date not null,
  description text not null,
  category text,
  cash_in numeric default 0,
  cash_out numeric default 0
);
create table if not exists forecast (
  week int primary key check (week between 1 and 4),
  collections numeric default 0, other_in numeric default 0, suppliers numeric default 0,
  salaries numeric default 0, loan numeric default 0, other_exp numeric default 0
);
create table if not exists loans (
  id bigint generated always as identity primary key,
  name text not null, original numeric default 0, monthly_payment numeric default 0, outstanding numeric default 0
);
create table if not exists investments (
  id bigint generated always as identity primary key,
  name text not null, amount numeric default 0, rate numeric default 0, maturity date
);
create table if not exists payments (
  id bigint generated always as identity primary key,
  payee text not null, amount numeric default 0, stage int default 0
);
create table if not exists bank_items (
  id bigint generated always as identity primary key,
  date date not null, description text, amount numeric not null
);

-- Open access for the anon key, so anyone with the site link can read and edit.
-- Fine for a class demo. For real use, add Supabase Auth and tighten these policies.
do $$ declare t text; begin
  foreach t in array array['settings','transactions','forecast','loans','investments','payments','bank_items'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists open_access on %I', t);
    execute format('create policy open_access on %I for all to anon using (true) with check (true)', t);
  end loop;
end $$;