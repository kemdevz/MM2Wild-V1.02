const encoder = new TextEncoder();
const MAX_ITEMS = 100;
const HUMAN_COMMISSION = 0.05;
const DEFAULT_EOS_RPC_URL = "https://eos.greymass.com";
const EOS_MAINNET_CHAIN_ID = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906";
const EOS_BLOCKS_AHEAD = 2;
const EOS_POLL_MS = 250;
const EOS_TIMEOUT_MS = 10000;
const LOCAL_ITEM_IMAGES = {
  "chroma icecream": "/items/chroma-icecream.webp",
  "chroma sands": "/items/chroma-sands.webp",
  "chroma beachy": "/items/chroma-beachy.webp",
};
const COINFLIP_BOTS = [
  ["Travis", "/bots/travis.webp"],
  ["Drake", "/bots/drake.webp"],
  ["LeBron", "/bots/lebron.webp"],
  ["Ronaldo", "/bots/ronaldo.webp"],
  ["Messi", "/bots/messi.webp"],
  ["MrBeast", "/bots/mrbeast.webp"],
  ["Speed", "/bots/speed.webp"],
  ["The Rock", "/bots/rock.webp"],
];

function settings(env) {
  const url = (env?.SUPABASE_URL || "").replace(/\/$/, "");
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && key ? { url, key } : null;
}

function request(env, path, init = {}) {
  const config = settings(env);
  if (!config) throw new Error("Coinflip storage is not configured.");
  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      ...init.headers,
    },
  });
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function eosRequest(env, path, body = {}) {
  const baseUrl = String(env?.EOS_RPC_URL || DEFAULT_EOS_RPC_URL).replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/v1/chain/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(`EOS ${path} request failed.`);
  return data;
}

async function getFutureEosBlock(env) {
  const info = await eosRequest(env, "get_info");
  const blocksAhead = Math.max(1, Number(env?.COINFLIP_EOS_BLOCKS_AHEAD) || EOS_BLOCKS_AHEAD);
  const blockNumber = Number(info.head_block_num) + blocksAhead;
  if (info.chain_id !== EOS_MAINNET_CHAIN_ID || !Number.isSafeInteger(blockNumber)) {
    throw new Error("The configured RPC is not an EOS mainnet endpoint.");
  }

  const deadline = Date.now() + EOS_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const block = await eosRequest(env, "get_block", { block_num_or_id: blockNumber });
      if (/^[0-9a-f]{64}$/i.test(String(block?.id || ""))) {
        return { blockNumber, blockHash: block.id.toLowerCase() };
      }
    } catch {}
    await wait(EOS_POLL_MS);
  }
  throw new Error("The EOS block could not be mined in time. Please try again.");
}

function randomSeed() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function formatItem(item) {
  const rawImageUrl = String(item.image_url ?? item.imageUrl ?? "").trim()
    || LOCAL_ITEM_IMAGES[String(item.name || "").trim().toLowerCase()]
    || "";
  return {
    id: item.id,
    name: item.name,
    value: Number(item.value),
    imageUrl: rawImageUrl && !rawImageUrl.startsWith("/")
      ? `/api/coinflip/item-image?url=${encodeURIComponent(rawImageUrl)}`
      : rawImageUrl,
    rarity: item.rarity,
  };
}

function formatGame(row) {
  const complete = row.status === "complete";
  return {
    id: row.id,
    number: Number(row.game_number),
    status: row.status,
    creator: {
      uuid: row.creator_uuid,
      username: row.creator_username,
      avatar: row.creator_avatar,
      side: row.creator_side,
      items: (row.creator_items || []).map(formatItem),
      wager: Number(row.creator_wager),
    },
    joiner: row.joiner_uuid || row.joiner_is_bot ? {
      uuid: row.joiner_uuid,
      username: row.joiner_username,
      avatar: row.joiner_avatar,
      side: row.creator_side === "heads" ? "tails" : "heads",
      items: (row.joiner_items || []).map(formatItem),
      wager: Number(row.joiner_wager),
      isBot: Boolean(row.joiner_is_bot),
    } : null,
    winnerUuid: row.winner_uuid,
    winnerSide: row.winner_side,
    minimum: Number((Number(row.creator_wager) * 0.95).toFixed(2)),
    maximum: Number((Number(row.creator_wager) * 1.05).toFixed(2)),
    commission: Number(row.commission_rate ?? HUMAN_COMMISSION),
    fairness: {
      hashedSeed: row.server_seed_hash,
      serverSeed: complete ? row.server_seed : null,
      eosBlock: complete ? Number(row.eos_block_num) || null : null,
      eosHash: complete ? row.eos_block_id || null : null,
    },
    createdAt: row.created_at,
    joinedAt: row.joined_at,
    completedAt: row.completed_at,
  };
}

async function catalogueItems(env, itemIds) {
  const ids = [...new Set((itemIds || []).map((value) => String(value).trim()).filter(Boolean))];
  if (!ids.length || ids.length > MAX_ITEMS) {
    throw new Error(`Select between 1 and ${MAX_ITEMS} valid items.`);
  }
  const areUuids = ids.every((id) => /^[0-9a-f-]{36}$/i.test(id));
  const query = new URLSearchParams({ select: "id,name,value,image_url,rarity" });
  query.set(areUuids ? "id" : "name", `in.(${ids.map((value) => `"${value.replace(/["\\]/g, "")}"`).join(",")})`);
  const response = await request(env, `mm2wild_items?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows) || rows.length !== ids.length) {
    throw new Error("One or more selected items are unavailable.");
  }
  const byKey = new Map(rows.map((row) => [areUuids ? row.id : row.name, row]));
  return ids.map((id) => formatItem(byKey.get(id)));
}

function totalValue(items) {
  return Math.round(items.reduce((sum, item) => sum + item.value, 0));
}

async function rpc(env, name, body) {
  const response = await request(env, `rpc/${name}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || "The coinflip could not be updated.");
  return result;
}

export async function listCoinflips(env, { limit = 50 } = {}) {
  const query = new URLSearchParams({
    select: "*",
    status: "in.(open,complete)",
    order: "created_at.desc",
    limit: String(Math.min(Math.max(Number(limit) || 50, 1), 100)),
  });
  const response = await request(env, `mm2wild_coinflip?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) throw new Error(rows?.message || "Could not load coinflips.");
  return rows.map(formatGame);
}

export async function listCoinflipItems(env) {
  const pageSize = 1000;
  const rows = [];
  let total = null;

  while (total === null || rows.length < total) {
    const query = new URLSearchParams({
      select: "id,name,value,image_url,rarity",
      order: "value.desc,id.asc",
      limit: String(pageSize),
      offset: String(rows.length),
    });
    const response = await request(env, `mm2wild_items?${query}`, {
      headers: { Prefer: "count=exact" },
    });
    const page = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(page)) throw new Error(page?.message || "Could not load items.");

    const contentRange = response.headers.get("content-range") || "";
    const totalMatch = contentRange.match(/\/(\d+)$/);
    if (totalMatch) total = Number(totalMatch[1]);
    rows.push(...page);

    if (!page.length || (total === null && page.length < pageSize)) break;
  }

  return rows.map(formatItem);
}

export async function createCoinflip(env, user, itemIds, side) {
  const items = await catalogueItems(env, itemIds);
  const wager = totalValue(items);
  const serverSeed = randomSeed();
  const serverSeedHash = await sha256(serverSeed);
  const row = await rpc(env, "mm2wild_create_coinflip", {
    p_user_uuid: user.uuid,
    p_creator_side: side,
    p_creator_items: items,
    p_creator_wager: wager,
    p_server_seed: serverSeed,
    p_server_seed_hash: serverSeedHash,
  });
  return formatGame(row);
}

export async function joinCoinflip(env, user, gameId, itemIds) {
  if (!/^[0-9a-f-]{36}$/i.test(String(gameId || ""))) throw new Error("Invalid coinflip.");
  const gameQuery = new URLSearchParams({ id: `eq.${gameId}`, select: "*", limit: "1" });
  const gameResponse = await request(env, `mm2wild_coinflip?${gameQuery}`);
  const games = await gameResponse.json().catch(() => null);
  if (!gameResponse.ok || !games?.[0]) throw new Error("This coinflip was not found.");
  const openGame = games[0];
  if (openGame.status !== "open") throw new Error("This coinflip is no longer open.");

  const items = await catalogueItems(env, itemIds);
  const wager = totalValue(items);
  const eos = await getFutureEosBlock(env);
  const resultHash = await sha256(`${openGame.server_seed}:${gameId}:${user.uuid}:${eos.blockHash}`);
  const winnerSide = parseInt(resultHash.slice(0, 8), 16) % 2 === 0 ? "heads" : "tails";
  const row = await rpc(env, "mm2wild_join_coinflip", {
    p_game_id: gameId,
    p_user_uuid: user.uuid,
    p_joiner_items: items,
    p_joiner_wager: wager,
    p_winner_side: winnerSide,
    p_result_hash: resultHash,
    p_eos_block_num: eos.blockNumber,
    p_eos_block_id: eos.blockHash,
  });
  return formatGame(row);
}

export async function callCoinflipBot(env, user, gameId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(gameId || ""))) throw new Error("Invalid coinflip.");
  const gameQuery = new URLSearchParams({ id: `eq.${gameId}`, select: "*", limit: "1" });
  const gameResponse = await request(env, `mm2wild_coinflip?${gameQuery}`);
  const games = await gameResponse.json().catch(() => null);
  if (!gameResponse.ok || !games?.[0]) throw new Error("This coinflip was not found.");
  const openGame = games[0];
  if (openGame.status !== "open") throw new Error("This coinflip is no longer open.");
  if (openGame.creator_uuid !== user.uuid) throw new Error("Only the creator can call a bot.");

  const selectorHash = await sha256(`${openGame.server_seed}:${gameId}:bot`);
  const bot = COINFLIP_BOTS[Number.parseInt(selectorHash.slice(0, 8), 16) % COINFLIP_BOTS.length];
  const eos = await getFutureEosBlock(env);
  const resultHash = await sha256(`${openGame.server_seed}:${gameId}:bot:${bot[0]}:${eos.blockHash}`);
  const winnerSide = Number.parseInt(resultHash.slice(0, 8), 16) % 2 === 0 ? "heads" : "tails";
  const row = await rpc(env, "mm2wild_call_coinflip_bot", {
    p_game_id: gameId,
    p_user_uuid: user.uuid,
    p_bot_name: bot[0],
    p_bot_avatar: bot[1],
    p_winner_side: winnerSide,
    p_result_hash: resultHash,
    p_eos_block_num: eos.blockNumber,
    p_eos_block_id: eos.blockHash,
  });
  return formatGame(row);
}

export async function proxyCoinflipItemImage(env, sourceUrl) {
  let url;
  try {
    url = new URL(String(sourceUrl || ""));
  } catch {
    return new Response("Invalid image URL.", { status: 400 });
  }
  const allowed = url.protocol === "https:"
    && url.hostname === "raw.githubusercontent.com"
    && url.pathname.startsWith("/JonathanGao/MM2ValuesPlus/");
  if (!allowed) return new Response("Image source is not allowed.", { status: 400 });

  const response = await fetch(url.toString(), {
    headers: { accept: "image/webp,image/*;q=0.8" },
    cf: { cacheEverything: true, cacheTtl: 604800 },
  });
  if (!response.ok) return new Response("Item image is unavailable.", { status: response.status });
  return new Response(response.body, {
    headers: {
      "content-type": response.headers.get("content-type") || "image/webp",
      "cache-control": "public, max-age=604800, immutable",
    },
  });
}
