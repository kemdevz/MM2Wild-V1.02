-- Keep every wager and payout in the currency selected when the game is created.
alter table public.mm2wild_bets add column if not exists balance_type text not null default 'mm2';
alter table public.mm2wild_case_openings add column if not exists balance_type text not null default 'mm2';
alter table public.mm2wild_coinflip add column if not exists balance_type text not null default 'mm2';
alter table public.mm2wild_coinflip add column if not exists currency_finalized boolean not null default false;
alter table public.mm2wild_battles add column if not exists balance_type text not null default 'mm2';
alter table public.mm2wild_battles add column if not exists currency_finalized boolean not null default false;
alter table public.mm2wild_roulette_bets add column if not exists balance_type text not null default 'mm2';
alter table public.mm2wild_rains add column if not exists balance_type text;
alter table public.mm2wild_rains add column if not exists currency_settled_at timestamptz;
-- Shared MM2/crypto columns must accept fractional crypto values without
-- forcing eight trailing zeroes onto whole MM2 values.
alter table public.mm2wild_users alter column crypto_balance type numeric using trim_scale(crypto_balance), alter column total_wagered type numeric using trim_scale(total_wagered);
alter table public.mm2wild_tips alter column amount type numeric using trim_scale(amount);
alter table public.mm2wild_bets alter column amount type numeric using trim_scale(amount), alter column profit type numeric using trim_scale(profit);
alter table public.mm2wild_case_openings alter column balance_after type numeric using trim_scale(balance_after);
alter table public.mm2wild_roulette_rounds alter column total_pot type numeric using trim_scale(total_pot);
alter table public.mm2wild_roulette_bets alter column amount type numeric using trim_scale(amount), alter column payout type numeric using trim_scale(payout), alter column profit type numeric using trim_scale(profit);
alter table public.mm2wild_rains alter column pool type numeric using trim_scale(pool);
alter table public.mm2wild_rain_entries alter column payout type numeric using trim_scale(payout);

update public.mm2wild_coinflip set currency_finalized = true where status = 'complete';
update public.mm2wild_battles set currency_finalized = true where status in ('complete', 'cancelled');
update public.mm2wild_rains set balance_type = 'mm2' where balance_type is null and status in ('joining', 'cooldown', 'completed');

do $$
declare v_table text;
begin
  foreach v_table in array array['mm2wild_bets','mm2wild_case_openings','mm2wild_coinflip','mm2wild_battles','mm2wild_roulette_bets','mm2wild_rains']
  loop
    execute format('alter table public.%I drop constraint if exists %I', v_table, v_table || '_balance_type_check');
    execute format('alter table public.%I add constraint %I check (balance_type is null or balance_type in (''mm2'', ''crypto''))', v_table, v_table || '_balance_type_check');
  end loop;
end $$;

create or replace function public.mm2wild_record_case_opening_currency(
  p_user_uuid uuid, p_case_id bigint, p_quantity integer, p_results jsonb,
  p_server_seed text, p_server_seed_hash text, p_balance_type text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_type text := lower(coalesce(p_balance_type, 'mm2'));
  v_before public.mm2wild_users%rowtype;
  v_opening public.mm2wild_case_openings%rowtype;
  v_cost numeric;
  v_balance numeric;
  v_started timestamptz := clock_timestamp();
begin
  if v_type not in ('mm2','crypto') then raise exception using errcode='P0001', message='Select a valid balance.'; end if;
  if v_type = 'mm2' then
    v_opening := public.mm2wild_record_case_opening(p_user_uuid,p_case_id,p_quantity,p_results,p_server_seed,p_server_seed_hash);
    update public.mm2wild_case_openings set balance_type='mm2' where id=v_opening.id;
    return to_jsonb(v_opening) || jsonb_build_object('balance_type','mm2');
  end if;
  select * into v_before from public.mm2wild_users where uuid=p_user_uuid for update;
  select price * p_quantity into v_cost from public.mm2wild_cases where id=p_case_id and active=true;
  if v_before.uuid is null or v_cost is null or v_before.crypto_balance < v_cost then raise exception using errcode='P0001', message='Insufficient crypto balance.'; end if;
  update public.mm2wild_users set crypto_balance=crypto_balance-v_cost, mm2_balance=mm2_balance+v_cost where uuid=p_user_uuid;
  v_opening := public.mm2wild_record_case_opening(p_user_uuid,p_case_id,p_quantity,p_results,p_server_seed,p_server_seed_hash);
  v_balance := v_before.crypto_balance - v_cost + v_opening.total_value;
  update public.mm2wild_users set mm2_balance=v_before.mm2_balance, crypto_balance=v_balance where uuid=p_user_uuid;
  update public.mm2wild_case_openings set balance_type='crypto', balance_after=v_balance where id=v_opening.id returning * into v_opening;
  update public.mm2wild_bets set balance_type='crypto' where user_uuid=p_user_uuid and game='cases' and created_at>=v_started;
  return to_jsonb(v_opening);
end $$;

create or replace function public.mm2wild_create_coinflip_currency(
  p_user_uuid uuid, p_creator_side text, p_creator_items jsonb, p_creator_wager numeric,
  p_server_seed text, p_server_seed_hash text, p_balance_type text
) returns public.mm2wild_coinflip language plpgsql security definer set search_path=public as $$
declare v_type text:=lower(coalesce(p_balance_type,'mm2')); v_before public.mm2wild_users%rowtype; v_game public.mm2wild_coinflip%rowtype;
begin
  if v_type not in ('mm2','crypto') then raise exception using errcode='P0001', message='Select a valid balance.'; end if;
  if v_type='crypto' then
    select * into v_before from public.mm2wild_users where uuid=p_user_uuid for update;
    if v_before.uuid is null or v_before.crypto_balance<p_creator_wager then raise exception using errcode='P0001', message='Insufficient crypto balance.'; end if;
    update public.mm2wild_users set crypto_balance=crypto_balance-p_creator_wager, mm2_balance=mm2_balance+p_creator_wager where uuid=p_user_uuid;
  end if;
  v_game:=public.mm2wild_create_coinflip(p_user_uuid,p_creator_side,p_creator_items,p_creator_wager,p_server_seed,p_server_seed_hash);
  update public.mm2wild_coinflip set balance_type=v_type where id=v_game.id returning * into v_game;
  return v_game;
end $$;

create or replace function public.mm2wild_join_coinflip_currency(
  p_game_id uuid, p_user_uuid uuid, p_joiner_items jsonb, p_joiner_wager numeric,
  p_winner_side text, p_result_hash text, p_eos_block_num bigint, p_eos_block_id text
) returns public.mm2wild_coinflip language plpgsql security definer set search_path=public as $$
declare v_game public.mm2wild_coinflip%rowtype; v_before public.mm2wild_users%rowtype; v_payout numeric; v_started timestamptz:=clock_timestamp();
begin
  select * into v_game from public.mm2wild_coinflip where id=p_game_id for update;
  if v_game.balance_type='crypto' then
    select * into v_before from public.mm2wild_users where uuid=p_user_uuid for update;
    if v_before.uuid is null or v_before.crypto_balance<p_joiner_wager then raise exception using errcode='P0001', message='Insufficient crypto balance.'; end if;
    update public.mm2wild_users set crypto_balance=crypto_balance-p_joiner_wager, mm2_balance=mm2_balance+p_joiner_wager where uuid=p_user_uuid;
  end if;
  v_game:=public.mm2wild_join_coinflip(p_game_id,p_user_uuid,p_joiner_items,p_joiner_wager,p_winner_side,p_result_hash,p_eos_block_num,p_eos_block_id);
  if v_game.balance_type='crypto' and not v_game.currency_finalized then
    v_payout:=round((v_game.creator_wager+v_game.joiner_wager)*(1-v_game.commission_rate),2);
    update public.mm2wild_users set mm2_balance=mm2_balance-v_payout, crypto_balance=crypto_balance+v_payout where uuid=v_game.winner_uuid;
    update public.mm2wild_bets set balance_type='crypto' where user_uuid in (v_game.creator_uuid,p_user_uuid) and game='coinflip' and created_at>=v_started;
  end if;
  update public.mm2wild_coinflip set currency_finalized=true where id=v_game.id returning * into v_game;
  return v_game;
end $$;

create or replace function public.mm2wild_call_coinflip_bot_currency(
  p_game_id uuid, p_user_uuid uuid, p_bot_name text, p_bot_avatar text, p_winner_side text,
  p_result_hash text, p_eos_block_num bigint, p_eos_block_id text
) returns public.mm2wild_coinflip language plpgsql security definer set search_path=public as $$
declare v_game public.mm2wild_coinflip%rowtype; v_payout numeric; v_started timestamptz:=clock_timestamp();
begin
  v_game:=public.mm2wild_call_coinflip_bot(p_game_id,p_user_uuid,p_bot_name,p_bot_avatar,p_winner_side,p_result_hash,p_eos_block_num,p_eos_block_id);
  if v_game.balance_type='crypto' and not v_game.currency_finalized then
    if v_game.winner_uuid=v_game.creator_uuid then
      v_payout:=round(v_game.creator_wager*2*(1-v_game.commission_rate),2);
      update public.mm2wild_users set mm2_balance=mm2_balance-v_payout, crypto_balance=crypto_balance+v_payout where uuid=v_game.creator_uuid;
    end if;
    update public.mm2wild_bets set balance_type='crypto' where user_uuid=v_game.creator_uuid and game='coinflip' and created_at>=v_started;
  end if;
  update public.mm2wild_coinflip set currency_finalized=true where id=v_game.id returning * into v_game;
  return v_game;
end $$;

create or replace function public.mm2wild_create_battle_currency(
  p_user_uuid uuid, p_cases jsonb, p_rounds integer, p_player_layout jsonb, p_max_players integer,
  p_total_cost numeric, p_creator_cost numeric, p_share_mode boolean, p_crazy_mode boolean,
  p_jackpot_mode boolean, p_partial_funding boolean, p_funding_percent integer, p_borrow_mode boolean,
  p_borrow_percent integer, p_minimum_level integer, p_private boolean, p_fast_spin boolean,
  p_server_seed text, p_server_seed_hash text, p_balance_type text
) returns public.mm2wild_battles language plpgsql security definer set search_path=public as $$
declare v_type text:=lower(coalesce(p_balance_type,'mm2')); v_user public.mm2wild_users%rowtype; v_game public.mm2wild_battles%rowtype;
begin
  if v_type not in ('mm2','crypto') then raise exception using errcode='P0001', message='Select a valid balance.'; end if;
  if v_type='crypto' then
    select * into v_user from public.mm2wild_users where uuid=p_user_uuid for update;
    if v_user.uuid is null or v_user.crypto_balance<p_creator_cost then raise exception using errcode='P0001', message='Insufficient crypto balance.'; end if;
    update public.mm2wild_users set crypto_balance=crypto_balance-p_creator_cost, mm2_balance=mm2_balance+p_creator_cost where uuid=p_user_uuid;
  end if;
  v_game:=public.mm2wild_create_battle(p_user_uuid,p_cases,p_rounds,p_player_layout,p_max_players,p_total_cost,p_creator_cost,p_share_mode,p_crazy_mode,p_jackpot_mode,p_partial_funding,p_funding_percent,p_borrow_mode,p_borrow_percent,p_minimum_level,p_private,p_fast_spin,p_server_seed,p_server_seed_hash);
  update public.mm2wild_battles set balance_type=v_type where id=v_game.id returning * into v_game;
  return v_game;
end $$;

create or replace function public.mm2wild_join_battle_currency(p_game_id text,p_user_uuid uuid,p_slot integer,p_access_key text default null)
returns public.mm2wild_battles language plpgsql security definer set search_path=public as $$
declare v_game public.mm2wild_battles%rowtype; v_user public.mm2wild_users%rowtype;
begin
  select * into v_game from public.mm2wild_battles where id::text=p_game_id or game_number::text=p_game_id for update;
  if v_game.balance_type='crypto' then
    select * into v_user from public.mm2wild_users where uuid=p_user_uuid for update;
    if v_user.uuid is null or v_user.crypto_balance<v_game.join_cost then raise exception using errcode='P0001', message='Insufficient crypto balance.'; end if;
    update public.mm2wild_users set crypto_balance=crypto_balance-v_game.join_cost, mm2_balance=mm2_balance+v_game.join_cost where uuid=p_user_uuid;
  end if;
  return public.mm2wild_join_battle(p_game_id,p_user_uuid,p_slot,p_access_key);
end $$;

create or replace function public.mm2wild_settle_battle_currency(p_game_id uuid)
returns public.mm2wild_battles language plpgsql security definer set search_path=public as $$
declare v_game public.mm2wild_battles%rowtype; v_player jsonb; v_uuid uuid; v_payout numeric; v_started timestamptz:=clock_timestamp();
begin
  select * into v_game from public.mm2wild_battles where id=p_game_id for update;
  if v_game.status='complete' and v_game.currency_finalized then return v_game; end if;
  v_game:=public.mm2wild_settle_battle(p_game_id);
  if v_game.balance_type='crypto' and not v_game.currency_finalized then
    for v_player in select value from jsonb_array_elements(v_game.players) loop
      if coalesce((v_player->>'isBot')::boolean,false) or v_player->>'uuid' is null then continue; end if;
      v_uuid:=(v_player->>'uuid')::uuid; v_payout:=coalesce((v_game.payouts->>(v_player->>'slot'))::numeric,0);
      if v_payout>0 then update public.mm2wild_users set mm2_balance=mm2_balance-v_payout,crypto_balance=crypto_balance+v_payout where uuid=v_uuid; end if;
    end loop;
    update public.mm2wild_bets set balance_type='crypto' where game='battles' and created_at>=v_started;
  end if;
  update public.mm2wild_battles set currency_finalized=true where id=p_game_id returning * into v_game;
  return v_game;
end $$;

create or replace function public.mm2wild_cancel_battle_currency(p_game_id text,p_user_uuid uuid)
returns public.mm2wild_battles language plpgsql security definer set search_path=public as $$
declare v_game public.mm2wild_battles%rowtype; v_player jsonb; v_uuid uuid; v_refund numeric;
begin
  select * into v_game from public.mm2wild_battles where id::text=p_game_id or game_number::text=p_game_id for update;
  v_game:=public.mm2wild_cancel_battle(p_game_id,p_user_uuid);
  if v_game.balance_type='crypto' and not v_game.currency_finalized then
    for v_player in select value from jsonb_array_elements(v_game.players) loop
      if coalesce((v_player->>'isBot')::boolean,false) or v_player->>'uuid' is null then continue; end if;
      v_uuid:=(v_player->>'uuid')::uuid; v_refund:=coalesce((v_player->>'cost')::numeric,case when (v_player->>'slot')::integer=0 then v_game.creator_cost else v_game.join_cost end);
      update public.mm2wild_users set mm2_balance=mm2_balance-v_refund,crypto_balance=crypto_balance+v_refund where uuid=v_uuid;
    end loop;
  end if;
  update public.mm2wild_battles set currency_finalized=true where id=v_game.id returning * into v_game;
  return v_game;
end $$;

create or replace function public.mm2wild_place_roulette_wager_currency(p_user_uuid uuid,p_amount numeric,p_balance_type text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_type text:=lower(coalesce(p_balance_type,'mm2')); v_amount numeric; v_balance numeric;
begin
  if v_type not in ('mm2','crypto') then raise exception using errcode='P0001', message='Select a valid balance.'; end if;
  v_amount:=case when v_type='crypto' then round(p_amount,8) else round(p_amount) end;
  if v_amount is null or v_amount<=0 or v_amount<>p_amount then raise exception using errcode='P0001', message='Enter a valid wager amount.'; end if;
  if v_type='crypto' then
    update public.mm2wild_users set crypto_balance=crypto_balance-v_amount,total_wagered=total_wagered+v_amount where uuid=p_user_uuid and crypto_balance>=v_amount returning crypto_balance into v_balance;
  else
    update public.mm2wild_users set mm2_balance=mm2_balance-v_amount,total_wagered=total_wagered+v_amount where uuid=p_user_uuid and mm2_balance>=v_amount returning mm2_balance into v_balance;
  end if;
  if v_balance is null then raise exception using errcode='P0001', message='Insufficient balance.'; end if;
  return jsonb_build_object('balance',v_balance,'balanceType',v_type);
end $$;

create or replace function public.mm2wild_credit_game_balance(p_user_uuid uuid,p_amount numeric,p_balance_type text)
returns numeric language plpgsql security definer set search_path=public as $$
declare v_balance numeric;
begin
  if lower(p_balance_type)='crypto' then update public.mm2wild_users set crypto_balance=crypto_balance+p_amount where uuid=p_user_uuid returning crypto_balance into v_balance;
  else update public.mm2wild_users set mm2_balance=mm2_balance+p_amount where uuid=p_user_uuid returning mm2_balance into v_balance; end if;
  if v_balance is null then raise exception using errcode='P0001', message='Account not found.'; end if;
  return v_balance;
end $$;

create or replace function public.mm2wild_tip_rain(p_rain_id uuid,p_user_uuid uuid,p_amount numeric,p_balance_type text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_rain public.mm2wild_rains%rowtype; v_type text:=lower(coalesce(p_balance_type,'mm2')); v_amount numeric; v_balance numeric;
begin
  select * into v_rain from public.mm2wild_rains where id=p_rain_id for update;
  if v_rain.id is null or v_rain.status<>'active' then raise exception using errcode='P0001', message='This rain is not accepting tips.'; end if;
  if v_type not in ('mm2','crypto') then raise exception using errcode='P0001', message='Select a valid balance.'; end if;
  if v_rain.balance_type is not null and v_rain.balance_type<>v_type then raise exception using errcode='P0001', message='This rain is using a different balance type.'; end if;
  v_amount:=case when v_type='crypto' then round(p_amount,8) else round(p_amount) end;
  if v_amount is null or v_amount<=0 or v_amount<>p_amount then raise exception using errcode='P0001', message='Enter a valid tip amount.'; end if;
  if v_type='crypto' then update public.mm2wild_users set crypto_balance=crypto_balance-v_amount where uuid=p_user_uuid and crypto_balance>=v_amount returning crypto_balance into v_balance;
  else update public.mm2wild_users set mm2_balance=mm2_balance-v_amount where uuid=p_user_uuid and mm2_balance>=v_amount returning mm2_balance into v_balance; end if;
  if v_balance is null then raise exception using errcode='P0001', message='Insufficient balance.'; end if;
  update public.mm2wild_rains set pool=pool+v_amount,balance_type=v_type,updated_at=now() where id=p_rain_id returning * into v_rain;
  return jsonb_build_object('pool',v_rain.pool,'balance',v_balance,'balanceType',v_type);
end $$;

create or replace function public.mm2wild_settle_rain_currency(p_rain_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_rain public.mm2wild_rains%rowtype; v_entry record; v_count integer;
  v_scale numeric:=1; v_total_units numeric; v_base_units numeric; v_extra integer;
  v_payout numeric; v_payouts jsonb:='[]'::jsonb;
begin
  select * into v_rain from public.mm2wild_rains where id=p_rain_id for update;
  if v_rain.id is null then raise exception using errcode='P0001',message='Rain not found.'; end if;
  if v_rain.currency_settled_at is not null then
    select coalesce(jsonb_agg(jsonb_build_object('userUuid',user_uuid,'name',username,'robloxUserId',roblox_user_id,'payout',payout) order by joined_at),'[]'::jsonb) into v_payouts from public.mm2wild_rain_entries where rain_id=p_rain_id;
    return jsonb_build_object('rainId',p_rain_id,'pool',v_rain.pool,'participantCount',jsonb_array_length(v_payouts),'payouts',v_payouts,'balanceType',coalesce(v_rain.balance_type,'mm2'));
  end if;
  if v_rain.status<>'joining' then raise exception using errcode='P0001',message='Rain is not ready to settle.'; end if;
  select count(*) into v_count from public.mm2wild_rain_entries where rain_id=p_rain_id;
  if coalesce(v_rain.balance_type,'mm2')='crypto' then v_scale:=100000000; end if;
  v_total_units:=floor(v_rain.pool*v_scale); v_base_units:=case when v_count>0 then floor(v_total_units/v_count) else 0 end; v_extra:=case when v_count>0 then mod(v_total_units,v_count)::integer else 0 end;
  for v_entry in select user_uuid,username,roblox_user_id,row_number() over(order by joined_at,user_uuid) as n from public.mm2wild_rain_entries where rain_id=p_rain_id order by joined_at,user_uuid loop
    v_payout:=(v_base_units+case when v_entry.n<=v_extra then 1 else 0 end)/v_scale;
    if coalesce(v_rain.balance_type,'mm2')='crypto' then update public.mm2wild_users set crypto_balance=crypto_balance+v_payout where uuid=v_entry.user_uuid;
    else update public.mm2wild_users set mm2_balance=mm2_balance+v_payout where uuid=v_entry.user_uuid; end if;
    update public.mm2wild_rain_entries set payout=v_payout where rain_id=p_rain_id and user_uuid=v_entry.user_uuid;
    v_payouts:=v_payouts||jsonb_build_array(jsonb_build_object('userUuid',v_entry.user_uuid,'name',v_entry.username,'robloxUserId',v_entry.roblox_user_id,'payout',v_payout));
  end loop;
  update public.mm2wild_rains set status='cooldown',currency_settled_at=now(),updated_at=now() where id=p_rain_id;
  return jsonb_build_object('rainId',p_rain_id,'pool',v_rain.pool,'participantCount',v_count,'payouts',v_payouts,'balanceType',coalesce(v_rain.balance_type,'mm2'));
end $$;

revoke all on function public.mm2wild_record_case_opening_currency(uuid,bigint,integer,jsonb,text,text,text) from public,anon,authenticated;
revoke all on function public.mm2wild_create_coinflip_currency(uuid,text,jsonb,numeric,text,text,text) from public,anon,authenticated;
revoke all on function public.mm2wild_join_coinflip_currency(uuid,uuid,jsonb,numeric,text,text,bigint,text) from public,anon,authenticated;
revoke all on function public.mm2wild_call_coinflip_bot_currency(uuid,uuid,text,text,text,text,bigint,text) from public,anon,authenticated;
revoke all on function public.mm2wild_create_battle_currency(uuid,jsonb,integer,jsonb,integer,numeric,numeric,boolean,boolean,boolean,boolean,integer,boolean,integer,integer,boolean,boolean,text,text,text) from public,anon,authenticated;
revoke all on function public.mm2wild_join_battle_currency(text,uuid,integer,text) from public,anon,authenticated;
revoke all on function public.mm2wild_settle_battle_currency(uuid) from public,anon,authenticated;
revoke all on function public.mm2wild_cancel_battle_currency(text,uuid) from public,anon,authenticated;
revoke all on function public.mm2wild_place_roulette_wager_currency(uuid,numeric,text) from public,anon,authenticated;
revoke all on function public.mm2wild_credit_game_balance(uuid,numeric,text) from public,anon,authenticated;
revoke all on function public.mm2wild_tip_rain(uuid,uuid,numeric,text) from public,anon,authenticated;
revoke all on function public.mm2wild_settle_rain_currency(uuid) from public,anon,authenticated;

grant execute on function public.mm2wild_record_case_opening_currency(uuid,bigint,integer,jsonb,text,text,text) to service_role;
grant execute on function public.mm2wild_create_coinflip_currency(uuid,text,jsonb,numeric,text,text,text) to service_role;
grant execute on function public.mm2wild_join_coinflip_currency(uuid,uuid,jsonb,numeric,text,text,bigint,text) to service_role;
grant execute on function public.mm2wild_call_coinflip_bot_currency(uuid,uuid,text,text,text,text,bigint,text) to service_role;
grant execute on function public.mm2wild_create_battle_currency(uuid,jsonb,integer,jsonb,integer,numeric,numeric,boolean,boolean,boolean,boolean,integer,boolean,integer,integer,boolean,boolean,text,text,text) to service_role;
grant execute on function public.mm2wild_join_battle_currency(text,uuid,integer,text) to service_role;
grant execute on function public.mm2wild_settle_battle_currency(uuid) to service_role;
grant execute on function public.mm2wild_cancel_battle_currency(text,uuid) to service_role;
grant execute on function public.mm2wild_place_roulette_wager_currency(uuid,numeric,text) to service_role;
grant execute on function public.mm2wild_credit_game_balance(uuid,numeric,text) to service_role;
grant execute on function public.mm2wild_tip_rain(uuid,uuid,numeric,text) to service_role;
grant execute on function public.mm2wild_settle_rain_currency(uuid) to service_role;
