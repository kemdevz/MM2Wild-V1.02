drop function if exists public.mm2wild_place_plinko(
  uuid, uuid, text, numeric, text, integer, integer, numeric, numeric, bigint, text
);

drop table if exists public.mm2wild_plinko;
drop table if exists public.mm2wild_mines;

delete from public.mm2wild_bets
where lower(game) in ('plinko', 'mines');
