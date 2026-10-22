alter table public.mm2wild_roulette_rounds
  add column if not exists tile_index smallint;

alter table public.mm2wild_roulette_rounds
  drop constraint if exists mm2wild_roulette_rounds_tile_index_check;

alter table public.mm2wild_roulette_rounds
  add constraint mm2wild_roulette_rounds_tile_index_check
  check (tile_index between 0 and 14);
