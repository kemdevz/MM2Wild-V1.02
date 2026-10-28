create extension if not exists pgcrypto;

alter table public.mm2wild_battles
  add column if not exists server_seed_hash text,
  add column if not exists server_seed text,
  add column if not exists eos_block_num bigint,
  add column if not exists eos_block_id text,
  add column if not exists rolling_at timestamptz,
  add column if not exists settle_after timestamptz,
  add column if not exists payouts jsonb not null default '{}'::jsonb,
  add column if not exists winner_slots jsonb not null default '[]'::jsonb;

with generated as (
  select id, encode(gen_random_bytes(32), 'hex') as seed
    from public.mm2wild_battles
   where server_seed is null or server_seed_hash is null
)
update public.mm2wild_battles battle
   set server_seed = generated.seed,
       server_seed_hash = encode(digest(generated.seed, 'sha256'), 'hex')
  from generated
 where battle.id = generated.id;

alter table public.mm2wild_battles
  alter column server_seed set not null,
  alter column server_seed_hash set not null;

alter table public.mm2wild_battles
  drop constraint if exists mm2wild_battles_server_seed_check,
  drop constraint if exists mm2wild_battles_server_seed_hash_check,
  drop constraint if exists mm2wild_battles_eos_block_id_check,
  drop constraint if exists mm2wild_battles_payouts_check,
  drop constraint if exists mm2wild_battles_winner_slots_check;

alter table public.mm2wild_battles
  add constraint mm2wild_battles_server_seed_check check (server_seed ~ '^[0-9a-f]{64}$'),
  add constraint mm2wild_battles_server_seed_hash_check check (server_seed_hash ~ '^[0-9a-f]{64}$'),
  add constraint mm2wild_battles_eos_block_id_check check (eos_block_id is null or eos_block_id ~ '^[0-9a-f]{64}$'),
  add constraint mm2wild_battles_payouts_check check (jsonb_typeof(payouts) = 'object'),
  add constraint mm2wild_battles_winner_slots_check check (jsonb_typeof(winner_slots) = 'array');

drop function if exists public.mm2wild_create_battle(
  uuid, jsonb, integer, jsonb, integer, numeric, numeric, boolean, boolean,
  boolean, boolean, integer, boolean, integer, integer, boolean, boolean
);

create or replace function public.mm2wild_create_battle(
  p_user_uuid uuid, p_cases jsonb, p_rounds integer, p_player_layout jsonb,
  p_max_players integer, p_total_cost numeric, p_creator_cost numeric,
  p_share_mode boolean, p_crazy_mode boolean, p_jackpot_mode boolean,
  p_partial_funding boolean, p_funding_percent integer, p_borrow_mode boolean,
  p_borrow_percent integer, p_minimum_level integer, p_private boolean,
  p_fast_spin boolean, p_server_seed text, p_server_seed_hash text
) returns public.mm2wild_battles
language plpgsql security definer set search_path = public
as $$
declare
  v_user public.mm2wild_users%rowtype;
  v_battle public.mm2wild_battles%rowtype;
  v_expected_cost numeric(20, 0);
  v_access_key uuid;
begin
  if jsonb_typeof(p_cases) <> 'array' or jsonb_array_length(p_cases) < 1
     or jsonb_array_length(p_cases) > 100 or p_rounds < 1 or p_rounds > 100 then
    raise exception using errcode = 'P0001', message = 'Choose between 1 and 100 battle rounds.';
  end if;
  if jsonb_typeof(p_player_layout) <> 'array' or p_max_players < 2 or p_max_players > 6 then
    raise exception using errcode = 'P0001', message = 'Choose a valid player layout.';
  end if;
  if p_total_cost is null or p_total_cost <= 0 or p_total_cost <> trunc(p_total_cost)
     or p_creator_cost is null or p_creator_cost <= 0 or p_creator_cost <> trunc(p_creator_cost) then
    raise exception using errcode = 'P0001', message = 'The battle cost is invalid.';
  end if;
  if p_server_seed !~ '^[0-9a-f]{64}$' or p_server_seed_hash !~ '^[0-9a-f]{64}$'
     or encode(digest(p_server_seed, 'sha256'), 'hex') <> p_server_seed_hash then
    raise exception using errcode = 'P0001', message = 'The battle fairness data is invalid.';
  end if;
  if coalesce(p_partial_funding, false) and coalesce(p_borrow_mode, false) then
    raise exception using errcode = 'P0001', message = 'Partial funding and borrow cannot be combined.';
  end if;

  v_expected_cost := case
    when coalesce(p_partial_funding, false) then p_total_cost + round(p_total_cost * (p_max_players - 1) * p_funding_percent / 100)
    when coalesce(p_borrow_mode, false) then greatest(1, round(p_total_cost * (100 - p_borrow_percent) / 100))
    else p_total_cost
  end;
  if p_creator_cost <> v_expected_cost then
    raise exception using errcode = 'P0001', message = 'The creator cost is invalid.';
  end if;

  update public.mm2wild_users
     set mm2_balance = mm2_balance - p_creator_cost,
         total_wagered = total_wagered + p_creator_cost,
         total_bets = total_bets + 1
   where uuid = p_user_uuid and mm2_balance >= p_creator_cost
   returning * into v_user;
  if v_user.uuid is null then
    raise exception using errcode = 'P0001', message = 'Insufficient balance.';
  end if;

  v_access_key := case when coalesce(p_private, false) then gen_random_uuid() else null end;
  insert into public.mm2wild_battles (
    creator_uuid, creator_username, creator_avatar, cases, rounds, player_layout,
    max_players, players, total_cost, creator_cost, share_mode, crazy_mode,
    jackpot_mode, partial_funding, funding_percent, borrow_mode, borrow_percent,
    minimum_level, private, access_key, fast_spin, server_seed, server_seed_hash
  ) values (
    v_user.uuid, v_user.username, v_user.avatar_headshot, p_cases, p_rounds,
    p_player_layout, p_max_players,
    jsonb_build_array(jsonb_build_object(
      'uuid', v_user.uuid, 'username', v_user.username, 'avatar', v_user.avatar_headshot,
      'level', v_user.level, 'rank', v_user.rank, 'slot', 0, 'cost', p_creator_cost,
      'isBot', false
    )),
    p_total_cost, p_creator_cost, coalesce(p_share_mode, false), coalesce(p_crazy_mode, false),
    coalesce(p_jackpot_mode, false), coalesce(p_partial_funding, false),
    case when p_partial_funding then p_funding_percent else 0 end,
    coalesce(p_borrow_mode, false), case when p_borrow_mode then p_borrow_percent else 0 end,
    greatest(coalesce(p_minimum_level, 1), 1), coalesce(p_private, false), v_access_key,
    coalesce(p_fast_spin, false), p_server_seed, p_server_seed_hash
  ) returning * into v_battle;
  return v_battle;
end;
$$;

create or replace function public.mm2wild_join_battle(
  p_game_id text, p_user_uuid uuid, p_slot integer, p_access_key text default null
) returns public.mm2wild_battles
language plpgsql security definer set search_path = public
as $$
declare
  v_game public.mm2wild_battles%rowtype;
  v_user public.mm2wild_users%rowtype;
begin
  select * into v_game from public.mm2wild_battles
   where id::text = p_game_id or game_number::text = p_game_id for update;
  if v_game.id is null or v_game.status <> 'open' then
    raise exception using errcode = 'P0001', message = 'This battle is no longer open.';
  end if;
  if v_game.private and coalesce(p_access_key, '') <> v_game.access_key::text then
    raise exception using errcode = 'P0001', message = 'This private battle link is invalid.';
  end if;
  if p_slot < 0 or p_slot >= v_game.max_players
     or exists (select 1 from jsonb_array_elements(v_game.players) p where (p->>'slot')::integer = p_slot) then
    raise exception using errcode = 'P0001', message = 'That battle slot is unavailable.';
  end if;
  if exists (select 1 from jsonb_array_elements(v_game.players) p where p->>'uuid' = p_user_uuid::text) then
    raise exception using errcode = 'P0001', message = 'You have already joined this battle.';
  end if;

  update public.mm2wild_users
     set mm2_balance = mm2_balance - v_game.join_cost,
         total_wagered = total_wagered + v_game.join_cost,
         total_bets = total_bets + 1
   where uuid = p_user_uuid and mm2_balance >= v_game.join_cost and level >= v_game.minimum_level
   returning * into v_user;
  if v_user.uuid is null then
    raise exception using errcode = 'P0001', message = 'Insufficient balance or level.';
  end if;

  update public.mm2wild_battles
     set players = players || jsonb_build_array(jsonb_build_object(
           'uuid', v_user.uuid, 'username', v_user.username, 'avatar', v_user.avatar_headshot,
           'level', v_user.level, 'rank', v_user.rank, 'slot', p_slot,
           'cost', v_game.join_cost, 'isBot', false
         )),
         status = case when jsonb_array_length(players) + 1 >= max_players then 'in_progress' else status end,
         started_at = case when jsonb_array_length(players) + 1 >= max_players then now() else started_at end,
         updated_at = now()
   where id = v_game.id returning * into v_game;
  return v_game;
end;
$$;

create or replace function public.mm2wild_call_battle_bot(
  p_game_id text, p_user_uuid uuid, p_slot integer, p_bot_name text, p_bot_avatar text
) returns public.mm2wild_battles
language plpgsql security definer set search_path = public
as $$
declare v_game public.mm2wild_battles%rowtype;
begin
  select * into v_game from public.mm2wild_battles
   where id::text = p_game_id or game_number::text = p_game_id for update;
  if v_game.id is null or v_game.status <> 'open' then
    raise exception using errcode = 'P0001', message = 'This battle is no longer open.';
  end if;
  if v_game.creator_uuid <> p_user_uuid then
    raise exception using errcode = 'P0001', message = 'Only the creator can call a bot.';
  end if;
  if p_slot < 0 or p_slot >= v_game.max_players
     or exists (select 1 from jsonb_array_elements(v_game.players) p where (p->>'slot')::integer = p_slot) then
    raise exception using errcode = 'P0001', message = 'That battle slot is unavailable.';
  end if;
  update public.mm2wild_battles
     set players = players || jsonb_build_array(jsonb_build_object(
           'uuid', null, 'username', p_bot_name, 'avatar', p_bot_avatar,
           'level', 1, 'rank', 'bot', 'slot', p_slot, 'cost', join_cost, 'isBot', true
         )),
         status = case when jsonb_array_length(players) + 1 >= max_players then 'in_progress' else status end,
         started_at = case when jsonb_array_length(players) + 1 >= max_players then now() else started_at end,
         updated_at = now()
   where id = v_game.id returning * into v_game;
  return v_game;
end;
$$;

create or replace function public.mm2wild_prepare_battle(
  p_game_id uuid, p_results jsonb, p_payouts jsonb, p_winner_slots jsonb,
  p_eos_block_num bigint, p_eos_block_id text, p_rolling_at timestamptz,
  p_settle_after timestamptz
) returns public.mm2wild_battles
language plpgsql security definer set search_path = public
as $$
declare v_game public.mm2wild_battles%rowtype;
begin
  select * into v_game from public.mm2wild_battles where id = p_game_id for update;
  if v_game.id is null or v_game.status <> 'in_progress' then
    raise exception using errcode = 'P0001', message = 'This battle cannot be prepared.';
  end if;
  if jsonb_array_length(v_game.results) > 0 then return v_game; end if;
  if jsonb_typeof(p_results) <> 'array' or jsonb_array_length(p_results) <> v_game.rounds
     or jsonb_typeof(p_payouts) <> 'object' or jsonb_typeof(p_winner_slots) <> 'array'
     or p_eos_block_num <= 0 or p_eos_block_id !~ '^[0-9a-f]{64}$'
     or p_rolling_at is null or p_settle_after <= p_rolling_at then
    raise exception using errcode = 'P0001', message = 'The battle result is invalid.';
  end if;
  update public.mm2wild_battles set
    results = p_results, payouts = p_payouts, winner_slots = p_winner_slots,
    eos_block_num = p_eos_block_num, eos_block_id = p_eos_block_id,
    rolling_at = p_rolling_at, settle_after = p_settle_after, current_round = 0,
    updated_at = now()
  where id = p_game_id returning * into v_game;
  return v_game;
end;
$$;

create or replace function public.mm2wild_settle_battle(p_game_id uuid)
returns public.mm2wild_battles
language plpgsql security definer set search_path = public
as $$
declare
  v_game public.mm2wild_battles%rowtype;
  v_player jsonb;
  v_uuid uuid;
  v_slot integer;
  v_cost numeric(20, 0);
  v_payout numeric(20, 0);
begin
  select * into v_game from public.mm2wild_battles where id = p_game_id for update;
  if v_game.id is null then raise exception using errcode = 'P0001', message = 'Battle not found.'; end if;
  if v_game.status = 'complete' then return v_game; end if;
  if v_game.status <> 'in_progress' or v_game.settle_after is null or now() < v_game.settle_after then
    raise exception using errcode = 'P0001', message = 'This battle is not ready to settle.';
  end if;
  for v_player in select value from jsonb_array_elements(v_game.players)
  loop
    if coalesce((v_player->>'isBot')::boolean, false) then continue; end if;
    v_uuid := (v_player->>'uuid')::uuid;
    v_slot := (v_player->>'slot')::integer;
    v_cost := coalesce((v_player->>'cost')::numeric, case when v_slot = 0 then v_game.creator_cost else v_game.join_cost end);
    v_payout := coalesce((v_game.payouts->>v_slot::text)::numeric, 0);
    update public.mm2wild_users
       set mm2_balance = mm2_balance + v_payout,
           games_won = games_won + case when v_payout > 0 then 1 else 0 end
     where uuid = v_uuid;
    insert into public.mm2wild_bets (user_uuid, game, status, amount, profit, multiplier)
    values (v_uuid, 'battles', case when v_payout > v_cost then 'won' when v_payout = v_cost then 'push' else 'lost' end,
            v_cost, v_payout - v_cost, case when v_cost > 0 then round(v_payout / v_cost, 2) else 0 end);
  end loop;
  update public.mm2wild_battles set status = 'complete', current_round = rounds,
    completed_at = now(), updated_at = now() where id = p_game_id returning * into v_game;
  return v_game;
end;
$$;

create or replace function public.mm2wild_cancel_battle(p_game_id text, p_user_uuid uuid)
returns public.mm2wild_battles
language plpgsql security definer set search_path = public
as $$
declare
  v_game public.mm2wild_battles%rowtype;
  v_player jsonb;
  v_refund numeric(20, 0);
begin
  select * into v_game from public.mm2wild_battles
   where id::text = p_game_id or game_number::text = p_game_id for update;
  if v_game.id is null or v_game.status <> 'open' then
    raise exception using errcode = 'P0001', message = 'This battle can no longer be cancelled.';
  end if;
  if v_game.creator_uuid <> p_user_uuid then
    raise exception using errcode = 'P0001', message = 'Only the creator can cancel this battle.';
  end if;
  if now() < v_game.created_at + interval '5 minutes' then
    raise exception using errcode = 'P0001', message = 'You cannot cancel yet. Please wait five minutes.';
  end if;
  for v_player in select value from jsonb_array_elements(v_game.players)
  loop
    if coalesce((v_player->>'isBot')::boolean, false) or v_player->>'uuid' is null then continue; end if;
    v_refund := coalesce((v_player->>'cost')::numeric,
      case when (v_player->>'slot')::integer = 0 then v_game.creator_cost else v_game.join_cost end);
    update public.mm2wild_users set mm2_balance = mm2_balance + v_refund
     where uuid = (v_player->>'uuid')::uuid;
  end loop;
  update public.mm2wild_battles set status = 'cancelled', updated_at = now()
   where id = v_game.id returning * into v_game;
  return v_game;
end;
$$;

revoke all on function public.mm2wild_create_battle(uuid,jsonb,integer,jsonb,integer,numeric,numeric,boolean,boolean,boolean,boolean,integer,boolean,integer,integer,boolean,boolean,text,text) from public, anon, authenticated;
revoke all on function public.mm2wild_join_battle(text,uuid,integer,text) from public, anon, authenticated;
revoke all on function public.mm2wild_call_battle_bot(text,uuid,integer,text,text) from public, anon, authenticated;
revoke all on function public.mm2wild_prepare_battle(uuid,jsonb,jsonb,jsonb,bigint,text,timestamptz,timestamptz) from public, anon, authenticated;
revoke all on function public.mm2wild_settle_battle(uuid) from public, anon, authenticated;
revoke all on function public.mm2wild_cancel_battle(text,uuid) from public, anon, authenticated;

grant execute on function public.mm2wild_create_battle(uuid,jsonb,integer,jsonb,integer,numeric,numeric,boolean,boolean,boolean,boolean,integer,boolean,integer,integer,boolean,boolean,text,text) to service_role;
grant execute on function public.mm2wild_join_battle(text,uuid,integer,text) to service_role;
grant execute on function public.mm2wild_call_battle_bot(text,uuid,integer,text,text) to service_role;
grant execute on function public.mm2wild_prepare_battle(uuid,jsonb,jsonb,jsonb,bigint,text,timestamptz,timestamptz) to service_role;
grant execute on function public.mm2wild_settle_battle(uuid) to service_role;
grant execute on function public.mm2wild_cancel_battle(text,uuid) to service_role;
