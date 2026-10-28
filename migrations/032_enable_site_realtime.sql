-- Publish every current MM2Wild table to Supabase Realtime. Browser clients never
-- receive rows directly: the application server emits sanitized invalidations.
do $$
declare
  v_table record;
begin
  for v_table in
    select tablename
      from pg_tables
     where schemaname = 'public'
       and tablename like 'mm2wild\_%' escape '\'
  loop
    execute format('alter table public.%I replica identity full', v_table.tablename);
    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = v_table.tablename
    ) then
      execute format('alter publication supabase_realtime add table public.%I', v_table.tablename);
    end if;
  end loop;
end;
$$;

-- Include the recipient profile snapshot needed by the original site's tip card.
create or replace function public.mm2wild_tip_user(
  p_sender_uuid uuid,
  p_recipient_username text,
  p_balance_type text,
  p_amount numeric,
  p_show_in_chat boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance_type text;
  v_amount numeric(20, 8);
  v_recipient public.mm2wild_users%rowtype;
  v_sender_balance numeric(20, 8);
  v_tip_id uuid;
  v_sent_at timestamptz;
  v_received_at timestamptz;
begin
  v_balance_type := lower(trim(p_balance_type));
  if v_balance_type not in ('mm2', 'crypto') then
    raise exception using errcode = 'P0001', message = 'Select a valid balance.';
  end if;

  v_amount := case when v_balance_type = 'crypto' then round(p_amount, 8) else round(p_amount) end;
  if v_amount is null or v_amount <= 0 or v_amount <> p_amount then
    raise exception using errcode = 'P0001', message = case
      when v_balance_type = 'crypto' then 'Enter a valid amount with no more than eight decimal places.'
      else 'Enter a whole-number MM2 amount.'
    end;
  end if;

  select * into v_recipient
    from public.mm2wild_users
   where lower(username) = lower(trim(p_recipient_username))
   limit 1;
  if v_recipient.uuid is null then
    raise exception using errcode = 'P0001', message = 'User not found.';
  end if;
  if v_recipient.uuid = p_sender_uuid then
    raise exception using errcode = 'P0001', message = 'You cannot tip yourself.';
  end if;

  if v_balance_type = 'crypto' then
    update public.mm2wild_users set crypto_balance = crypto_balance - v_amount
     where uuid = p_sender_uuid and crypto_balance >= v_amount
     returning crypto_balance into v_sender_balance;
    if v_sender_balance is null then
      raise exception using errcode = 'P0001', message = 'Insufficient crypto balance.';
    end if;
    update public.mm2wild_users set crypto_balance = crypto_balance + v_amount where uuid = v_recipient.uuid;
  else
    update public.mm2wild_users set mm2_balance = mm2_balance - v_amount
     where uuid = p_sender_uuid and mm2_balance >= v_amount
     returning mm2_balance into v_sender_balance;
    if v_sender_balance is null then
      raise exception using errcode = 'P0001', message = 'Insufficient MM2 balance.';
    end if;
    update public.mm2wild_users set mm2_balance = mm2_balance + v_amount where uuid = v_recipient.uuid;
  end if;

  insert into public.mm2wild_tips (sender_uuid, recipient_uuid, balance_type, amount, show_in_chat)
  values (p_sender_uuid, v_recipient.uuid, v_balance_type, v_amount, coalesce(p_show_in_chat, true))
  returning id, sent_at, received_at into v_tip_id, v_sent_at, v_received_at;

  return jsonb_build_object(
    'id', v_tip_id,
    'recipient_username', v_recipient.username,
    'recipient_avatar', v_recipient.avatar_headshot,
    'recipient_level', v_recipient.level,
    'recipient_xp', v_recipient.xp,
    'recipient_rank', v_recipient.rank,
    'balance_type', v_balance_type,
    'amount', v_amount,
    'sent_at', v_sent_at,
    'received_at', v_received_at,
    'show_in_chat', coalesce(p_show_in_chat, true)
  );
end;
$$;

revoke all on function public.mm2wild_tip_user(uuid, text, text, numeric, boolean)
  from public, anon, authenticated;
grant execute on function public.mm2wild_tip_user(uuid, text, text, numeric, boolean)
  to service_role;
