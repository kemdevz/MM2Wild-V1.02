alter table public.mm2wild_coinflip
  add column if not exists joiner_is_bot boolean not null default false,
  add column if not exists commission_rate numeric(5, 4) not null default 0.05,
  add column if not exists eos_block_num bigint,
  add column if not exists eos_block_id text;

alter table public.mm2wild_coinflip
  drop constraint if exists mm2wild_coinflip_eos_block_num_check,
  drop constraint if exists mm2wild_coinflip_eos_block_id_check;

alter table public.mm2wild_coinflip
  add constraint mm2wild_coinflip_eos_block_num_check
    check (eos_block_num is null or eos_block_num > 0),
  add constraint mm2wild_coinflip_eos_block_id_check
    check (eos_block_id is null or eos_block_id ~ '^[0-9a-f]{64}$');

alter table public.mm2wild_coinflip
  drop constraint if exists mm2wild_coinflip_complete_fields;

alter table public.mm2wild_coinflip
  add constraint mm2wild_coinflip_complete_fields check (
    status <> 'complete' or (
      joiner_wager is not null and winner_side is not null and result_hash is not null and
      joined_at is not null and completed_at is not null and
      ((joiner_is_bot and joiner_uuid is null) or
       (not joiner_is_bot and joiner_uuid is not null and winner_uuid is not null))
    )
  );

create or replace function public.mm2wild_create_coinflip(
  p_user_uuid uuid,
  p_creator_side text,
  p_creator_items jsonb,
  p_creator_wager numeric,
  p_server_seed text,
  p_server_seed_hash text
) returns public.mm2wild_coinflip
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.mm2wild_users%rowtype;
  v_game public.mm2wild_coinflip%rowtype;
  v_open_games integer;
begin
  if p_creator_side not in ('heads', 'tails') then
    raise exception using errcode = 'P0001', message = 'Choose heads or tails.';
  end if;
  if p_creator_wager is null or p_creator_wager <> trunc(p_creator_wager)
     or p_creator_wager < 1 or p_creator_wager > 100000 then
    raise exception using errcode = 'P0001', message = 'Coinflip value must be between 1 and 100,000.';
  end if;

  select count(*) into v_open_games
    from public.mm2wild_coinflip
   where creator_uuid = p_user_uuid and status = 'open';
  if v_open_games >= 5 then
    raise exception using errcode = 'P0001', message = 'You can have a maximum of 5 open coinflips.';
  end if;

  update public.mm2wild_users
     set mm2_balance = mm2_balance - p_creator_wager,
         total_wagered = total_wagered + p_creator_wager,
         total_bets = total_bets + 1
   where uuid = p_user_uuid and mm2_balance >= p_creator_wager
   returning * into v_user;
  if v_user.uuid is null then
    raise exception using errcode = 'P0001', message = 'Insufficient balance.';
  end if;

  insert into public.mm2wild_coinflip (
    creator_uuid, creator_username, creator_avatar, creator_side,
    creator_items, creator_wager, server_seed, server_seed_hash
  ) values (
    v_user.uuid, v_user.username, v_user.avatar_headshot, p_creator_side,
    p_creator_items, p_creator_wager, p_server_seed, p_server_seed_hash
  ) returning * into v_game;
  return v_game;
end;
$$;

drop function if exists public.mm2wild_join_coinflip(uuid, uuid, jsonb, numeric, text, text);
drop function if exists public.mm2wild_join_coinflip(uuid, uuid, jsonb, numeric, text, text, bigint, text);

create function public.mm2wild_join_coinflip(
  p_game_id uuid,
  p_user_uuid uuid,
  p_joiner_items jsonb,
  p_joiner_wager numeric,
  p_winner_side text,
  p_result_hash text,
  p_eos_block_num bigint,
  p_eos_block_id text
) returns public.mm2wild_coinflip
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.mm2wild_coinflip%rowtype;
  v_joiner public.mm2wild_users%rowtype;
  v_winner uuid;
  v_payout numeric(20, 0);
begin
  select * into v_game from public.mm2wild_coinflip where id = p_game_id for update;
  if v_game.id is null or v_game.status <> 'open' then
    raise exception using errcode = 'P0001', message = 'This coinflip is no longer open.';
  end if;
  if v_game.creator_uuid = p_user_uuid then
    raise exception using errcode = 'P0001', message = 'You cannot join your own coinflip.';
  end if;
  if p_joiner_wager < round(v_game.creator_wager * 0.95, 2)
     or p_joiner_wager > round(v_game.creator_wager * 1.05, 2) then
    raise exception using errcode = 'P0001', message = 'Your items are outside this coinflip''s value range.';
  end if;
  if p_joiner_wager <> trunc(p_joiner_wager) then
    raise exception using errcode = 'P0001', message = 'Coinflip wagers must be whole numbers.';
  end if;
  if p_winner_side not in ('heads', 'tails') then
    raise exception using errcode = 'P0001', message = 'The coinflip result is invalid.';
  end if;
  if p_eos_block_num is null or p_eos_block_num <= 0
     or p_eos_block_id !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = 'P0001', message = 'The EOS fairness data is invalid.';
  end if;

  update public.mm2wild_users
     set mm2_balance = mm2_balance - p_joiner_wager,
         total_wagered = total_wagered + p_joiner_wager,
         total_bets = total_bets + 1
   where uuid = p_user_uuid and mm2_balance >= p_joiner_wager
   returning * into v_joiner;
  if v_joiner.uuid is null then
    raise exception using errcode = 'P0001', message = 'Insufficient balance.';
  end if;

  v_winner := case when p_winner_side = v_game.creator_side then v_game.creator_uuid else p_user_uuid end;
  v_payout := round((v_game.creator_wager + p_joiner_wager) * 0.95);

  update public.mm2wild_users
     set mm2_balance = mm2_balance + v_payout,
         games_won = games_won + 1
   where uuid = v_winner;

  update public.mm2wild_coinflip set
    joiner_uuid = v_joiner.uuid,
    joiner_username = v_joiner.username,
    joiner_avatar = v_joiner.avatar_headshot,
    joiner_items = p_joiner_items,
    joiner_wager = p_joiner_wager,
    joiner_is_bot = false,
    commission_rate = 0.05,
    winner_uuid = v_winner,
    winner_side = p_winner_side,
    result_hash = p_result_hash,
    eos_block_num = p_eos_block_num,
    eos_block_id = p_eos_block_id,
    status = 'complete',
    joined_at = now(),
    completed_at = now()
  where id = v_game.id
  returning * into v_game;

  insert into public.mm2wild_bets (user_uuid, game, status, amount, profit, multiplier)
  values
    (v_game.creator_uuid, 'coinflip', case when v_winner = v_game.creator_uuid then 'won' else 'lost' end,
     v_game.creator_wager, case when v_winner = v_game.creator_uuid then v_payout - v_game.creator_wager else -v_game.creator_wager end,
     case when v_winner = v_game.creator_uuid then v_payout / v_game.creator_wager else 0 end),
    (v_joiner.uuid, 'coinflip', case when v_winner = v_joiner.uuid then 'won' else 'lost' end,
     p_joiner_wager, case when v_winner = v_joiner.uuid then v_payout - p_joiner_wager else -p_joiner_wager end,
     case when v_winner = v_joiner.uuid then v_payout / p_joiner_wager else 0 end);

  return v_game;
end;
$$;

drop function if exists public.mm2wild_call_coinflip_bot(uuid, uuid, text, text, text, text);
drop function if exists public.mm2wild_call_coinflip_bot(uuid, uuid, text, text, text, text, bigint, text);

create function public.mm2wild_call_coinflip_bot(
  p_game_id uuid,
  p_user_uuid uuid,
  p_bot_name text,
  p_bot_avatar text,
  p_winner_side text,
  p_result_hash text,
  p_eos_block_num bigint,
  p_eos_block_id text
) returns public.mm2wild_coinflip
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.mm2wild_coinflip%rowtype;
  v_payout numeric(20, 0);
  v_creator_won boolean;
begin
  select * into v_game from public.mm2wild_coinflip where id = p_game_id for update;
  if v_game.id is null or v_game.status <> 'open' then
    raise exception using errcode = 'P0001', message = 'This coinflip is no longer open.';
  end if;
  if v_game.creator_uuid <> p_user_uuid then
    raise exception using errcode = 'P0001', message = 'Only the creator can call a bot.';
  end if;
  if p_winner_side not in ('heads', 'tails') then
    raise exception using errcode = 'P0001', message = 'The coinflip result is invalid.';
  end if;
  if p_eos_block_num is null or p_eos_block_num <= 0
     or p_eos_block_id !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = 'P0001', message = 'The EOS fairness data is invalid.';
  end if;

  v_creator_won := p_winner_side = v_game.creator_side;
  v_payout := round((v_game.creator_wager * 2) * 0.925);

  if v_creator_won then
    update public.mm2wild_users
       set mm2_balance = mm2_balance + v_payout,
           games_won = games_won + 1
     where uuid = v_game.creator_uuid;
  end if;

  update public.mm2wild_coinflip set
    joiner_uuid = null,
    joiner_username = p_bot_name,
    joiner_avatar = p_bot_avatar,
    joiner_items = v_game.creator_items,
    joiner_wager = v_game.creator_wager,
    joiner_is_bot = true,
    commission_rate = 0.075,
    winner_uuid = case when v_creator_won then v_game.creator_uuid else null end,
    winner_side = p_winner_side,
    result_hash = p_result_hash,
    eos_block_num = p_eos_block_num,
    eos_block_id = p_eos_block_id,
    status = 'complete',
    joined_at = now(),
    completed_at = now()
  where id = v_game.id
  returning * into v_game;

  insert into public.mm2wild_bets (user_uuid, game, status, amount, profit, multiplier)
  values (
    v_game.creator_uuid, 'coinflip', case when v_creator_won then 'won' else 'lost' end,
    v_game.creator_wager, case when v_creator_won then v_payout - v_game.creator_wager else -v_game.creator_wager end,
    case when v_creator_won then v_payout / v_game.creator_wager else 0 end
  );

  return v_game;
end;
$$;

revoke all on function public.mm2wild_join_coinflip(uuid, uuid, jsonb, numeric, text, text, bigint, text)
  from public, anon, authenticated;
revoke all on function public.mm2wild_call_coinflip_bot(uuid, uuid, text, text, text, text, bigint, text)
  from public, anon, authenticated;
