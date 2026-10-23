update public.mm2wild_items
set image_url = case lower(trim(name))
  when 'chroma icecream' then '/items/chroma-icecream.webp'
  when 'chroma sands' then '/items/chroma-sands.webp'
  when 'chroma beachy' then '/items/chroma-beachy.webp'
  else image_url
end,
updated_at = now()
where lower(trim(name)) in ('chroma icecream', 'chroma sands', 'chroma beachy');
