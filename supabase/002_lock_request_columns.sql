-- The "receiver responds" policy lets the receiver update ANY column of a
-- request, e.g. change from_user or message. Only status should be changeable.
-- Run this once in the Supabase SQL Editor.

create or replace function public.only_status_can_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.from_user is distinct from old.from_user
     or new.to_user is distinct from old.to_user
     or new.message is distinct from old.message
     or new.created_at is distinct from old.created_at then
    raise exception 'Only the status of a connection request can be changed';
  end if;
  return new;
end;
$$;

create trigger connection_requests_only_status
  before update on public.connection_requests
  for each row execute function public.only_status_can_change();
