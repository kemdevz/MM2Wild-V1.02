const encoder = new TextEncoder();
const MAX_ITEMS = 12;

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

function randomSeed() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function formatItem(item) {
  return {
    id: item.id,
    name: item.name,
    value: Number(item.value),
    imageUrl: item.image_url,
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
    joiner: row.joiner_uuid ? {
      uuid: row.joiner_uuid,
      username: row.joiner_username,
      avatar: row.joiner_avatar,
      side: row.creator_side === "heads" ? "tails" : "heads",
      items: (row.joiner_items || []).map(formatItem),
      wager: Number(row.joiner_wager),
    } : null,
    winnerUuid: row.winner_uuid,
    winnerSide: row.winner_side,
    minimum: Number((Number(row.creator_wager) * 0.9).toFixed(2)),
    maximum: Number((Number(row.creator_wager) * 1.1).toFixed(2)),
    fairness: {
      hashedSeed: row.server_seed_hash,
      serverSeed: complete ? row.server_seed : null,
      resultHash: complete ? row.result_hash : null,
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
  return Number(items.reduce((sum, item) => sum + item.value, 0).toFixed(2));
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
  const query = new URLSearchParams({
    select: "id,name,value,image_url,rarity",
    order: "value.desc",
    limit: "500",
  });
  const response = await request(env, `mm2wild_items?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) throw new Error(rows?.message || "Could not load items.");
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
  const resultHash = await sha256(`${openGame.server_seed}:${gameId}:${user.uuid}`);
  const winnerSide = parseInt(resultHash.slice(0, 8), 16) % 2 === 0 ? "heads" : "tails";
  const row = await rpc(env, "mm2wild_join_coinflip", {
    p_game_id: gameId,
    p_user_uuid: user.uuid,
    p_joiner_items: items,
    p_joiner_wager: wager,
    p_winner_side: winnerSide,
    p_result_hash: resultHash,
  });
  return formatGame(row);
}
