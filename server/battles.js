const MAX_ROUNDS = 100;

function settings(env) {
  const url = (env?.SUPABASE_URL || "").replace(/\/$/, "");
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && key ? { url, key } : null;
}

function request(env, path, init = {}) {
  const config = settings(env);
  if (!config) throw new Error("Battle storage is not configured.");
  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      ...init.headers,
    },
  });
}

function formatBattle(row) {
  return {
    id: row.id,
    number: Number(row.game_number),
    status: row.status,
    creator: {
      uuid: row.creator_uuid,
      username: row.creator_username,
      avatar: row.creator_avatar,
    },
    cases: Array.isArray(row.cases) ? row.cases : [],
    rounds: Number(row.rounds),
    playerLayout: Array.isArray(row.player_layout) ? row.player_layout.map(Number) : [1, 1],
    maxPlayers: Number(row.max_players),
    players: Array.isArray(row.players) ? row.players : [],
    totalCost: Number(row.total_cost),
    cost: Number(row.join_cost ?? row.creator_cost),
    modes: {
      share: Boolean(row.share_mode),
      crazy: Boolean(row.crazy_mode),
      jackpot: Boolean(row.jackpot_mode),
      partial: Boolean(row.partial_funding),
      borrow: Boolean(row.borrow_mode),
      private: Boolean(row.private),
      fastSpin: Boolean(row.fast_spin),
    },
    fundingPercent: Number(row.funding_percent),
    borrowPercent: Number(row.borrow_percent),
    minimumLevel: Number(row.minimum_level),
    accessKey: row.access_key || null,
    currentRound: Number(row.current_round),
    results: Array.isArray(row.results) ? row.results : [],
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

async function rpc(env, name, body) {
  const response = await request(env, `rpc/${name}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || "The battle could not be created.");
  return result;
}

export async function listBattles(env, { limit = 100 } = {}) {
  const query = new URLSearchParams({
    select: "*",
    private: "eq.false",
    status: "in.(open,in_progress,complete)",
    order: "created_at.desc",
    limit: String(Math.min(Math.max(Number(limit) || 100, 1), 100)),
  });
  const response = await request(env, `mm2wild_battles?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) throw new Error(rows?.message || "Could not load battles.");
  return rows.map(formatBattle);
}

export async function getBattle(env, identifier, key = "") {
  const value = String(identifier || "");
  const field = /^\d+$/.test(value) ? "game_number" : /^[0-9a-f-]{36}$/i.test(value) ? "id" : null;
  if (!field) return null;
  const query = new URLSearchParams({ [field]: `eq.${value}`, select: "*", limit: "1" });
  const response = await request(env, `mm2wild_battles?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) throw new Error(rows?.message || "Could not load this battle.");
  const row = rows[0];
  if (!row || (row.private && row.access_key !== key)) return null;
  return formatBattle(row);
}

async function catalogueCases(env, selections) {
  if (!Array.isArray(selections) || !selections.length) throw new Error("Add at least one case.");
  const normalized = selections.map((entry) => ({
    id: Number(entry?.caseId),
    quantity: Number(entry?.quantity),
  }));
  if (normalized.some((entry) => !Number.isSafeInteger(entry.id) || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 25)) {
    throw new Error("One or more case quantities are invalid.");
  }
  const rounds = normalized.reduce((sum, entry) => sum + entry.quantity, 0);
  if (rounds > MAX_ROUNDS) throw new Error(`Choose no more than ${MAX_ROUNDS} battle rounds.`);
  const ids = [...new Set(normalized.map((entry) => entry.id))];
  const query = new URLSearchParams({
    id: `in.(${ids.join(",")})`, active: "eq.true",
    select: "id,slug,name,image_url,price,risk",
  });
  const response = await request(env, `mm2wild_cases?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows) || rows.length !== ids.length) {
    throw new Error("One or more selected cases are unavailable.");
  }
  const byId = new Map(rows.map((row) => [Number(row.id), row]));
  const cases = normalized.map(({ id, quantity }) => {
    const row = byId.get(id);
    return {
      id, slug: row.slug, name: row.name, imageUrl: row.image_url,
      price: Number(row.price), risk: Number(row.risk), quantity,
    };
  });
  return {
    cases,
    rounds,
    totalCost: Math.round(cases.reduce((sum, item) => sum + item.price * item.quantity, 0)),
  };
}

export async function createBattle(env, user, payload) {
  const catalogue = await catalogueCases(env, payload?.cases);
  const layout = Array.isArray(payload?.playerLayout) ? payload.playerLayout.map(Number) : [];
  const maxPlayers = layout.reduce((sum, size) => sum + size, 0);
  const validLayouts = ["1,1", "1,1,1", "1,1,1,1", "1,1,1,1,1,1", "2,2", "2,2,2", "3,3"];
  if (!validLayouts.includes(layout.join(","))) throw new Error("Choose a valid player layout.");

  const partial = payload?.partial === true;
  const borrow = payload?.borrow === true;
  if (partial && borrow) throw new Error("Partial funding and borrow cannot be combined.");
  const fundingPercent = partial ? Math.min(100, Math.max(1, Math.round(Number(payload?.fundingPercent) || 0))) : 0;
  const borrowPercent = borrow ? Math.min(80, Math.max(20, Math.round(Number(payload?.borrowPercent) || 0))) : 0;
  const creatorCost = partial
    ? catalogue.totalCost + Math.round(catalogue.totalCost * (maxPlayers - 1) * fundingPercent / 100)
    : borrow
      ? Math.max(1, Math.round(catalogue.totalCost * (1 - borrowPercent / 100)))
      : catalogue.totalCost;

  const row = await rpc(env, "mm2wild_create_battle", {
    p_user_uuid: user.uuid,
    p_cases: catalogue.cases,
    p_rounds: catalogue.rounds,
    p_player_layout: layout,
    p_max_players: maxPlayers,
    p_total_cost: catalogue.totalCost,
    p_creator_cost: creatorCost,
    p_share_mode: payload?.share === true,
    p_crazy_mode: payload?.crazy === true,
    p_jackpot_mode: payload?.jackpot === true,
    p_partial_funding: partial,
    p_funding_percent: fundingPercent,
    p_borrow_mode: borrow,
    p_borrow_percent: borrowPercent,
    p_minimum_level: payload?.minimumLevel === true ? 2 : 1,
    p_private: payload?.private === true,
    p_fast_spin: payload?.fastSpin === true,
  });
  return formatBattle(row);
}
