-- Migration 034 introduced shared MM2/crypto columns. A fixed scale of eight
-- supports crypto but makes whole MM2 values appear as 68000.00000000 in
-- Supabase. Unconstrained numeric preserves crypto precision without padding
-- whole-number values with zeroes.

alter table public.mm2wild_users
  alter column mm2_balance type numeric(20, 0) using round(mm2_balance),
  alter column crypto_balance type numeric using trim_scale(crypto_balance),
  alter column total_deposited type numeric(20, 0) using round(total_deposited),
  alter column total_wagered type numeric using trim_scale(total_wagered);

-- These are MM2-only amount columns and must remain whole numbers.
alter table public.mm2wild_transactions
  alter column amount type numeric(20, 0) using round(amount);

alter table public.mm2wild_affiliates
  alter column available_earnings type numeric(20, 0) using round(available_earnings),
  alter column total_earned type numeric(20, 0) using round(total_earned),
  alter column total_wagered type numeric(20, 0) using round(total_wagered);

alter table public.mm2wild_tips
  alter column amount type numeric using trim_scale(amount);

alter table public.mm2wild_bets
  alter column amount type numeric using trim_scale(amount),
  alter column profit type numeric using trim_scale(profit);

alter table public.mm2wild_case_openings
  alter column balance_after type numeric using trim_scale(balance_after);

alter table public.mm2wild_roulette_rounds
  alter column total_pot type numeric using trim_scale(total_pot),
  alter column jackpot_contribution type numeric(20, 0) using round(jackpot_contribution),
  alter column jackpot_pot_amount type numeric(20, 0) using round(jackpot_pot_amount),
  alter column jackpot_paid_amount type numeric(20, 0) using round(jackpot_paid_amount);

alter table public.mm2wild_roulette_bets
  alter column amount type numeric using trim_scale(amount),
  alter column payout type numeric using trim_scale(payout),
  alter column profit type numeric using trim_scale(profit),
  alter column jackpot_payout type numeric(20, 0) using round(jackpot_payout);

alter table public.mm2wild_cases
  alter column price type numeric(20, 0) using round(price);

alter table public.mm2wild_case_openings
  alter column total_cost type numeric(20, 0) using round(total_cost),
  alter column total_value type numeric(20, 0) using round(total_value);

alter table public.mm2wild_coinflip
  alter column creator_wager type numeric(20, 0) using round(creator_wager),
  alter column joiner_wager type numeric(20, 0) using round(joiner_wager);

alter table public.mm2wild_items
  alter column value type numeric using trim_scale(
    case when value >= 1 then round(value) else value end
  );

alter table public.mm2wild_rains
  alter column pool type numeric using trim_scale(pool);

alter table public.mm2wild_rain_entries
  alter column payout type numeric using trim_scale(payout);

-- Remove padding already stored by fixed-scale expressions. With an
-- unconstrained numeric column, trim_scale keeps meaningful crypto decimals
-- and removes only trailing zeroes.
update public.mm2wild_users
   set crypto_balance = trim_scale(crypto_balance),
       total_wagered = trim_scale(total_wagered);

update public.mm2wild_tips
   set amount = trim_scale(amount);

update public.mm2wild_bets
   set amount = trim_scale(amount),
       profit = trim_scale(profit);

update public.mm2wild_roulette_bets
   set amount = trim_scale(amount),
       payout = trim_scale(payout),
       profit = trim_scale(profit);

update public.mm2wild_rains
   set pool = trim_scale(pool);

update public.mm2wild_rain_entries
   set payout = trim_scale(payout);

-- Normalize future writes as well, including values produced by arithmetic in
-- database functions. Meaningful crypto decimals are preserved.
create or replace function public.mm2wild_trim_amount_scales()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_table_name = 'mm2wild_users' then
    new.crypto_balance := trim_scale(new.crypto_balance);
    new.total_wagered := trim_scale(new.total_wagered);
  elsif tg_table_name = 'mm2wild_tips' then
    new.amount := trim_scale(new.amount);
  elsif tg_table_name = 'mm2wild_bets' then
    new.amount := trim_scale(new.amount);
    new.profit := trim_scale(new.profit);
  elsif tg_table_name = 'mm2wild_case_openings' then
    new.balance_after := trim_scale(new.balance_after);
  elsif tg_table_name = 'mm2wild_roulette_rounds' then
    new.total_pot := trim_scale(new.total_pot);
  elsif tg_table_name = 'mm2wild_roulette_bets' then
    new.amount := trim_scale(new.amount);
    new.payout := trim_scale(new.payout);
    new.profit := trim_scale(new.profit);
  elsif tg_table_name = 'mm2wild_rains' then
    new.pool := trim_scale(new.pool);
  elsif tg_table_name = 'mm2wild_rain_entries' then
    new.payout := trim_scale(new.payout);
  end if;
  return new;
end;
$$;

do $$
declare
  v_table text;
  v_trigger text;
begin
  foreach v_table in array array[
    'mm2wild_users',
    'mm2wild_tips',
    'mm2wild_bets',
    'mm2wild_case_openings',
    'mm2wild_roulette_rounds',
    'mm2wild_roulette_bets',
    'mm2wild_rains',
    'mm2wild_rain_entries'
  ] loop
    v_trigger := v_table || '_trim_amount_scales';
    execute format('drop trigger if exists %I on public.%I', v_trigger, v_table);
    execute format(
      'create trigger %I before insert or update on public.%I for each row execute function public.mm2wild_trim_amount_scales()',
      v_trigger,
      v_table
    );
  end loop;
end;
$$;
