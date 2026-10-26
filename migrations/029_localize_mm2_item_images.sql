update public.mm2wild_items
set image_url = '/items/catalog/'
  || id::text
  || '.webp',
  updated_at = now();

update public.mm2wild_coinflip as game
set creator_items = coalesce((
      select jsonb_agg(
        jsonb_set(
          entry.item,
          '{imageUrl}',
          to_jsonb('/items/catalog/'
            || (entry.item->>'id')
            || '.webp'),
          true
        ) order by entry.position
      )
      from jsonb_array_elements(game.creator_items) with ordinality as entry(item, position)
    ), '[]'::jsonb),
    joiner_items = case when game.joiner_items is null then null else coalesce((
      select jsonb_agg(
        jsonb_set(
          entry.item,
          '{imageUrl}',
          to_jsonb('/items/catalog/'
            || (entry.item->>'id')
            || '.webp'),
          true
        ) order by entry.position
      )
      from jsonb_array_elements(game.joiner_items) with ordinality as entry(item, position)
    ), '[]'::jsonb) end;
