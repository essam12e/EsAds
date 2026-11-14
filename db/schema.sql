-- أكاديمية المتجر: users, sessions, notifications and the RPC functions the site calls.
-- Tables live in a private schema with no direct grants; every access goes through
-- SECURITY DEFINER functions that authenticate with the caller's session token.

create extension if not exists pgcrypto;
create schema if not exists academy;

create table if not exists academy.users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_lower text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists academy.sessions (
  token_hash text primary key,
  user_id uuid not null references academy.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_user_idx on academy.sessions(user_id);

create table if not exists academy.notifications (
  id bigserial primary key,
  user_id uuid not null references academy.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on academy.notifications(user_id, created_at desc);

alter table academy.users enable row level security;
alter table academy.sessions enable row level security;
alter table academy.notifications enable row level security;

-- ---------- internal helpers (not granted to API roles) ----------

create or replace function academy.hash_token(p_token text) returns text
language sql immutable
set search_path = academy, public, extensions
as $$ select encode(digest(p_token, 'sha256'), 'hex') $$;

create or replace function academy.new_session(p_user uuid) returns text
language plpgsql security definer
set search_path = academy, public, extensions
as $$
declare v_token text := encode(gen_random_bytes(32), 'hex');
begin
  delete from academy.sessions where expires_at < now();
  insert into academy.sessions(token_hash, user_id, expires_at)
  values (academy.hash_token(v_token), p_user, now() + interval '30 days');
  return v_token;
end $$;

create or replace function academy.session_user_row(p_token text) returns academy.users
language sql stable security definer
set search_path = academy, public, extensions
as $$
  select u.* from academy.sessions s join academy.users u on u.id = s.user_id
  where p_token is not null and s.token_hash = academy.hash_token(p_token) and s.expires_at > now()
$$;

create or replace function academy.user_json(u academy.users) returns jsonb
language sql stable
set search_path = academy, public, extensions
as $$
  select jsonb_build_object(
    'id', u.id, 'username', u.username, 'role', u.role, 'status', u.status,
    'unread', (select count(*) from academy.notifications n where n.user_id = u.id and n.read_at is null)
  )
$$;

-- ---------- public API ----------

create or replace function public.app_register(p_username text, p_password text) returns jsonb
language plpgsql security definer
set search_path = academy, public, extensions
as $$
declare
  v_name text := btrim(coalesce(p_username, ''));
  v_user academy.users;
begin
  if v_name !~ '^[A-Za-z0-9_.\-ء-ي]{3,24}$' then
    return jsonb_build_object('error', 'bad_username');
  end if;
  if length(coalesce(p_password, '')) < 8 or length(p_password) > 72 then
    return jsonb_build_object('error', 'bad_password');
  end if;
  if (select count(*) from academy.users where created_at > now() - interval '1 hour') >= 200 then
    return jsonb_build_object('error', 'busy');
  end if;
  if exists (select 1 from academy.users where username_lower = lower(v_name)) then
    return jsonb_build_object('error', 'taken');
  end if;
  insert into academy.users(username, username_lower, password_hash)
  values (v_name, lower(v_name), crypt(p_password, gen_salt('bf', 10)))
  returning * into v_user;
  insert into academy.notifications(user_id, kind, title, body)
  values (v_user.id, 'pending', 'تم استلام طلب التسجيل',
          'حسابك الآن بانتظار موافقة الإدارة. سيصلك إشعار هنا فور اتخاذ القرار.');
  return jsonb_build_object('token', academy.new_session(v_user.id), 'user', academy.user_json(v_user));
end $$;

create or replace function public.app_login(p_username text, p_password text) returns jsonb
language plpgsql security definer
set search_path = academy, public, extensions
as $$
declare v_user academy.users;
begin
  select * into v_user from academy.users where username_lower = lower(btrim(coalesce(p_username, '')));
  if not found then
    perform crypt(coalesce(p_password, ''), gen_salt('bf', 10));
    return jsonb_build_object('error', 'invalid');
  end if;
  if v_user.locked_until is not null and v_user.locked_until > now() then
    return jsonb_build_object('error', 'locked');
  end if;
  if v_user.password_hash <> crypt(coalesce(p_password, ''), v_user.password_hash) then
    update academy.users
       set failed_attempts = failed_attempts + 1,
           locked_until = case when failed_attempts + 1 >= 8 then now() + interval '15 minutes' else locked_until end
     where id = v_user.id;
    return jsonb_build_object('error', 'invalid');
  end if;
  update academy.users set failed_attempts = 0, locked_until = null where id = v_user.id;
  return jsonb_build_object('token', academy.new_session(v_user.id), 'user', academy.user_json(v_user));
end $$;

create or replace function public.app_session(p_token text) returns jsonb
language plpgsql stable security definer
set search_path = academy, public, extensions
as $$
declare v_user academy.users := academy.session_user_row(p_token);
begin
  if v_user.id is null then return null; end if;
  return academy.user_json(v_user);
end $$;

create or replace function public.app_logout(p_token text) returns jsonb
language plpgsql security definer
set search_path = academy, public, extensions
as $$
begin
  delete from academy.sessions where token_hash = academy.hash_token(p_token);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.app_notifications(p_token text) returns jsonb
language plpgsql stable security definer
set search_path = academy, public, extensions
as $$
declare v_user academy.users := academy.session_user_row(p_token);
begin
  if v_user.id is null then return jsonb_build_object('error', 'unauthorized'); end if;
  return jsonb_build_object('items', coalesce((
    select jsonb_agg(jsonb_build_object('id', n.id, 'kind', n.kind, 'title', n.title, 'body', n.body,
                                        'read', n.read_at is not null, 'created_at', n.created_at)
                     order by n.created_at desc)
    from (select * from academy.notifications where user_id = v_user.id order by created_at desc limit 50) n
  ), '[]'::jsonb));
end $$;

create or replace function public.app_notifications_read(p_token text) returns jsonb
language plpgsql security definer
set search_path = academy, public, extensions
as $$
declare v_user academy.users := academy.session_user_row(p_token);
begin
  if v_user.id is null then return jsonb_build_object('error', 'unauthorized'); end if;
  update academy.notifications set read_at = now() where user_id = v_user.id and read_at is null;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.admin_users(p_token text) returns jsonb
language plpgsql stable security definer
set search_path = academy, public, extensions
as $$
declare v_user academy.users := academy.session_user_row(p_token);
begin
  if v_user.id is null or v_user.role <> 'admin' then
    return jsonb_build_object('error', 'forbidden');
  end if;
  return jsonb_build_object('items', coalesce((
    select jsonb_agg(jsonb_build_object('id', u.id, 'username', u.username, 'status', u.status,
                                        'created_at', u.created_at, 'decided_at', u.decided_at)
                     order by (u.status = 'pending') desc, u.created_at desc)
    from academy.users u where u.role = 'user'
  ), '[]'::jsonb));
end $$;

create or replace function public.admin_set_status(p_token text, p_user_id uuid, p_status text) returns jsonb
language plpgsql security definer
set search_path = academy, public, extensions
as $$
declare
  v_admin academy.users := academy.session_user_row(p_token);
  v_target academy.users;
begin
  if v_admin.id is null or v_admin.role <> 'admin' then
    return jsonb_build_object('error', 'forbidden');
  end if;
  if p_status not in ('approved', 'rejected') then
    return jsonb_build_object('error', 'bad_status');
  end if;
  select * into v_target from academy.users where id = p_user_id and role = 'user';
  if not found then return jsonb_build_object('error', 'not_found'); end if;
  if v_target.status = p_status then return jsonb_build_object('ok', true); end if;
  update academy.users set status = p_status, decided_at = now() where id = p_user_id;
  if p_status = 'approved' then
    insert into academy.notifications(user_id, kind, title, body)
    values (p_user_id, 'approved', 'حسابك جاهز للاستخدام',
            'تمت الموافقة على حسابك. يمكنك الآن الدخول إلى جميع أدلة أكاديمية المتجر.');
  else
    insert into academy.notifications(user_id, kind, title, body)
    values (p_user_id, 'rejected', 'تم رفض طلب التسجيل',
            'نعتذر، لم تتم الموافقة على حسابك. للاستفسار تواصل مع المطوّر عبر واتساب.');
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- ---------- grants ----------

revoke all on schema academy from public;
revoke all on all tables in schema academy from public;
revoke all on all functions in schema academy from public;

do $$
declare fn text;
begin
  foreach fn in array array[
    'app_register(text, text)', 'app_login(text, text)', 'app_session(text)', 'app_logout(text)',
    'app_notifications(text)', 'app_notifications_read(text)',
    'admin_users(text)', 'admin_set_status(text, uuid, text)'
  ] loop
    execute format('revoke all on function public.%s from public', fn);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('grant execute on function public.%s to anon, authenticated', fn);
    end if;
  end loop;
end $$;
