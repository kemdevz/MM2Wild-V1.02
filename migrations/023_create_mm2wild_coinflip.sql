create extension if not exists pgcrypto;


create table if not exists public.mm2wild_coinflip (
  id uuid primary key default gen_random_uuid(),
  game_number bigint generated always as identity unique,
  creator_uuid uuid not null references public.mm2wild_users(uuid) on delete restrict,
  creator_username text not null,
  creator_avatar text,
  creator_side text not null check (creator_side in ('heads', 'tails')),
  creator_items jsonb not null default '[]'::jsonb check (jsonb_typeof(creator_items) = 'array'),
  creator_wager numeric(20, 2) not null check (creator_wager > 0),
  joiner_uuid uuid references public.mm2wild_users(uuid) on delete restrict,
  joiner_username text,
  joiner_avatar text,
  joiner_items jsonb check (joiner_items is null or jsonb_typeof(joiner_items) = 'array'),
  joiner_wager numeric(20, 2) check (joiner_wager is null or joiner_wager > 0),
  winner_uuid uuid references public.mm2wild_users(uuid) on delete restrict,
  winner_side text check (winner_side is null or winner_side in ('heads', 'tails')),
  status text not null default 'open' check (status in ('open', 'complete', 'cancelled')),
  server_seed text not null,
  server_seed_hash text not null,
  result_hash text,
  created_at timestamptz not null default now(),
  joined_at timestamptz,
  completed_at timestamptz,
  constraint mm2wild_coinflip_different_players check (joiner_uuid is null or joiner_uuid <> creator_uuid),
  constraint mm2wild_coinflip_complete_fields check (
    status <> 'complete' or
    (joiner_uuid is not null and joiner_wager is not null and winner_uuid is not null and
     winner_side is not null and result_hash is not null and joined_at is not null and completed_at is not null)
  )
);

create index if not exists idx_mm2wild_coinflip_status_created
  on public.mm2wild_coinflip (status, created_at desc);
create index if not exists idx_mm2wild_coinflip_creator_created
  on public.mm2wild_coinflip (creator_uuid, created_at desc);
create index if not exists idx_mm2wild_coinflip_joiner_created
  on public.mm2wild_coinflip (joiner_uuid, created_at desc);

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
begin
  if p_creator_side not in ('heads', 'tails') then
    raise exception using errcode = 'P0001', message = 'Choose heads or tails.';
  end if;
  if p_creator_wager is null or p_creator_wager <= 0 then
    raise exception using errcode = 'P0001', message = 'Select at least one item.';
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

create or replace function public.mm2wild_join_coinflip(
  p_game_id uuid,
  p_user_uuid uuid,
  p_joiner_items jsonb,
  p_joiner_wager numeric,
  p_winner_side text,
  p_result_hash text
) returns public.mm2wild_coinflip
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.mm2wild_coinflip%rowtype;
  v_joiner public.mm2wild_users%rowtype;
  v_winner uuid;
  v_payout numeric(20, 2);
begin
  select * into v_game from public.mm2wild_coinflip where id = p_game_id for update;
  if v_game.id is null or v_game.status <> 'open' then
    raise exception using errcode = 'P0001', message = 'This coinflip is no longer open.';
  end if;
  if v_game.creator_uuid = p_user_uuid then
    raise exception using errcode = 'P0001', message = 'You cannot join your own coinflip.';
  end if;
  if p_joiner_wager < round(v_game.creator_wager * 0.90, 2)
     or p_joiner_wager > round(v_game.creator_wager * 1.10, 2) then
    raise exception using errcode = 'P0001', message = 'Your items are outside this coinflip''s value range.';
  end if;
  if p_winner_side not in ('heads', 'tails') then
    raise exception using errcode = 'P0001', message = 'The coinflip result is invalid.';
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
  v_payout := v_game.creator_wager + p_joiner_wager;

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
    winner_uuid = v_winner,
    winner_side = p_winner_side,
    result_hash = p_result_hash,
    status = 'complete',
    joined_at = now(),
    completed_at = now()
  where id = v_game.id
  returning * into v_game;

  insert into public.mm2wild_bets (user_uuid, game, status, amount, profit, multiplier)
  values
    (v_game.creator_uuid, 'coinflip', case when v_winner = v_game.creator_uuid then 'won' else 'lost' end,
     v_game.creator_wager, case when v_winner = v_game.creator_uuid then p_joiner_wager else -v_game.creator_wager end,
     case when v_winner = v_game.creator_uuid then v_payout / v_game.creator_wager else 0 end),
    (v_joiner.uuid, 'coinflip', case when v_winner = v_joiner.uuid then 'won' else 'lost' end,
     p_joiner_wager, case when v_winner = v_joiner.uuid then v_game.creator_wager else -p_joiner_wager end,
     case when v_winner = v_joiner.uuid then v_payout / p_joiner_wager else 0 end);

  return v_game;
end;
$$;

alter table public.mm2wild_coinflip enable row level security;
revoke all on table public.mm2wild_coinflip from anon, authenticated;
revoke all on function public.mm2wild_create_coinflip(uuid, text, jsonb, numeric, text, text) from public, anon, authenticated;
revoke all on function public.mm2wild_join_coinflip(uuid, uuid, jsonb, numeric, text, text) from public, anon, authenticated;
