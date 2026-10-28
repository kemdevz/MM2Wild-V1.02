-- MM2 values are whole-item values. Round legacy fractional MM2 data once and
-- store future MM2 amounts without a decimal scale. Crypto and rate fields stay
-- fractional by design.

alter table public.mm2wild_users
  alter column mm2_balance type numeric(20, 0) using round(mm2_balance),
  alter column total_deposited type numeric(20, 0) using round(total_deposited),
  alter column total_wagered type numeric(20, 0) using round(total_wagered);

alter table public.mm2wild_transactions
  alter column amount type numeric(20, 0) using round(amount);

alter table public.mm2wild_bets
  alter column amount type numeric(20, 0) using round(amount),
  alter column profit type numeric(20, 0) using round(profit);

alter table public.mm2wild_affiliates
  alter column available_earnings type numeric(20, 0) using round(available_earnings),
  alter column total_earned type numeric(20, 0) using round(total_earned),
  alter column total_wagered type numeric(20, 0) using round(total_wagered);

alter table public.mm2wild_rains
  alter column pool type numeric(20, 0) using round(pool);

alter table public.mm2wild_rain_entries
  alter column payout type numeric(20, 0) using round(payout);

alter table public.mm2wild_roulette_rounds
  alter column total_pot type numeric(20, 0) using round(total_pot),
  alter column jackpot_contribution type numeric(20, 0) using round(jackpot_contribution),
  alter column jackpot_pot_amount type numeric(20, 0) using round(jackpot_pot_amount),
  alter column jackpot_paid_amount type numeric(20, 0) using round(jackpot_paid_amount);

alter table public.mm2wild_roulette_bets
  alter column amount type numeric(20, 0) using round(amount),
  alter column payout type numeric(20, 0) using round(payout),
  alter column profit type numeric(20, 0) using round(profit),
  alter column jackpot_payout type numeric(20, 0) using round(jackpot_payout);

alter table public.mm2wild_cases
  alter column price type numeric(20, 0) using round(price);

alter table public.mm2wild_case_openings
  alter column total_cost type numeric(20, 0) using round(total_cost),
  alter column total_value type numeric(20, 0) using round(total_value),
  alter column balance_after type numeric(20, 0) using round(balance_after);

alter table public.mm2wild_coinflip
  alter column creator_wager type numeric(20, 0) using round(creator_wager),
  alter column joiner_wager type numeric(20, 0) using round(joiner_wager);

alter table public.mm2wild_items
  -- The item catalog intentionally supports positive sub-one values. Only
  -- values at or above one are MM2 whole-number values.
  alter column value type numeric using trim_scale(
    case when value >= 1 then round(value) else value end
  );

-- Tips share one column between MM2 and crypto, so retain eight-place crypto
-- precision while requiring MM2 tip rows to be whole numbers.
update public.mm2wild_tips
   set amount = round(amount)
 where balance_type = 'mm2';

alter table public.mm2wild_tips
  drop constraint if exists mm2wild_tips_whole_mm2_amount_check;

alter table public.mm2wild_tips
  add constraint mm2wild_tips_whole_mm2_amount_check
  check (balance_type = 'crypto' or amount = trunc(amount));

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

  v_amount := case
    when v_balance_type = 'crypto' then round(p_amount, 8)
    else round(p_amount)
  end;
  if v_amount is null or v_amount <= 0 or v_amount <> p_amount then
    raise exception using errcode = 'P0001', message = case
      when v_balance_type = 'crypto' then 'Enter a valid amount with no more than eight decimal places.'
      else 'Enter a whole-number MM2 amount.'
    end;
  end if;

  select *
    into v_recipient
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
    update public.mm2wild_users
       set crypto_balance = crypto_balance - v_amount
     where uuid = p_sender_uuid
       and crypto_balance >= v_amount
    returning crypto_balance into v_sender_balance;

    if v_sender_balance is null then
      raise exception using errcode = 'P0001', message = 'Insufficient crypto balance.';
    end if;

    update public.mm2wild_users
       set crypto_balance = crypto_balance + v_amount
     where uuid = v_recipient.uuid;
  else
    update public.mm2wild_users
       set mm2_balance = mm2_balance - v_amount
     where uuid = p_sender_uuid
       and mm2_balance >= v_amount
    returning mm2_balance into v_sender_balance;

    if v_sender_balance is null then
      raise exception using errcode = 'P0001', message = 'Insufficient MM2 balance.';
    end if;

    update public.mm2wild_users
       set mm2_balance = mm2_balance + v_amount
     where uuid = v_recipient.uuid;
  end if;

  insert into public.mm2wild_tips (
    sender_uuid,
    recipient_uuid,
    balance_type,
    amount,
    show_in_chat
  ) values (
    p_sender_uuid,
    v_recipient.uuid,
    v_balance_type,
    v_amount,
    coalesce(p_show_in_chat, true)
  ) returning id, sent_at, received_at
    into v_tip_id, v_sent_at, v_received_at;

  return jsonb_build_object(
    'id', v_tip_id,
    'recipient_username', v_recipient.username,
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

create or replace function public.mm2wild_place_roulette_wager(
  p_user_uuid uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount numeric(20, 0);
  v_balance numeric(20, 0);
begin
  v_amount := round(p_amount);
  if v_amount is null or v_amount <= 0 or v_amount <> p_amount then
    raise exception using errcode = 'P0001', message = 'Enter a whole-number wager amount.';
  end if;

  update public.mm2wild_users
     set mm2_balance = mm2_balance - v_amount,
         total_wagered = total_wagered + v_amount
   where uuid = p_user_uuid
     and mm2_balance >= v_amount
  returning mm2_balance into v_balance;

  if v_balance is null then
    raise exception using errcode = 'P0001', message = 'Insufficient balance.';
  end if;

  return jsonb_build_object('balance', v_balance);
end;
$$;

revoke all on function public.mm2wild_place_roulette_wager(uuid, numeric)
  from public, anon, authenticated;
grant execute on function public.mm2wild_place_roulette_wager(uuid, numeric)
  to service_role;

create or replace function public.mm2wild_settle_rain(p_rain_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rain public.mm2wild_rains%rowtype;
  v_participant_count integer;
  v_total_units bigint;
  v_base_units bigint;
  v_extra_units integer;
  v_payout numeric(20, 0);
  v_entry record;
  v_payouts jsonb := '[]'::jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('mm2wild_rain_' || p_rain_id::text));

  select * into v_rain
    from public.mm2wild_rains
   where id = p_rain_id
   for update;

  if v_rain.id is null then
    raise exception using errcode = 'P0001', message = 'Rain not found.';
  end if;

  if v_rain.status in ('cooldown', 'completed') then
    select coalesce(jsonb_agg(jsonb_build_object(
      'userUuid', user_uuid,
      'name', username,
      'robloxUserId', roblox_user_id,
      'payout', payout
    ) order by joined_at, user_uuid), '[]'::jsonb)
      into v_payouts
      from public.mm2wild_rain_entries
     where rain_id = p_rain_id;

    return jsonb_build_object(
      'rainId', v_rain.id,
      'pool', v_rain.pool,
      'participantCount', jsonb_array_length(v_payouts),
      'payouts', v_payouts
    );
  end if;

  if v_rain.status <> 'joining' then
    raise exception using errcode = 'P0001', message = 'Rain is not ready to settle.';
  end if;

  select count(*) into v_participant_count
    from public.mm2wild_rain_entries
   where rain_id = p_rain_id;

  if v_participant_count > 0 then
    v_total_units := v_rain.pool::bigint;
    v_base_units := v_total_units / v_participant_count;
    v_extra_units := mod(v_total_units, v_participant_count)::integer;

    for v_entry in
      select user_uuid, username, roblox_user_id,
             row_number() over (order by joined_at, user_uuid) as payout_order
        from public.mm2wild_rain_entries
       where rain_id = p_rain_id
       order by joined_at, user_uuid
    loop
      v_payout := v_base_units
        + case when v_entry.payout_order <= v_extra_units then 1 else 0 end;

      update public.mm2wild_users
         set mm2_balance = mm2_balance + v_payout
       where uuid = v_entry.user_uuid;

      if not found then
        raise exception using errcode = 'P0001', message = 'Rain participant account not found.';
      end if;

      update public.mm2wild_rain_entries
         set payout = v_payout
       where rain_id = p_rain_id
         and user_uuid = v_entry.user_uuid;

      v_payouts := v_payouts || jsonb_build_array(jsonb_build_object(
        'userUuid', v_entry.user_uuid,
        'name', v_entry.username,
        'robloxUserId', v_entry.roblox_user_id,
        'payout', v_payout
      ));
    end loop;
  end if;

  update public.mm2wild_rains
     set status = 'cooldown', updated_at = now()
   where id = p_rain_id;

  return jsonb_build_object(
    'rainId', v_rain.id,
    'pool', v_rain.pool,
    'participantCount', v_participant_count,
    'payouts', v_payouts
  );
end;
$$;

revoke all on function public.mm2wild_settle_rain(uuid)
  from public, anon, authenticated;
grant execute on function public.mm2wild_settle_rain(uuid)
  to service_role;
