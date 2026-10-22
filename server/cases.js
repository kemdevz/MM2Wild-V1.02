const encoder = new TextEncoder();
const MAX_TICKET = 10_000_000;

function settings(env) {
  const url = (env?.SUPABASE_URL || "").replace(/\/$/, "");
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && key ? { url, key } : null;
}

function request(env, path, init = {}) {
  const config = settings(env);
  if (!config) throw new Error("Case storage is not configured.");
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

async function ticketFromSeed(serverSeed, reel) {
  const digest = await sha256(`${serverSeed}:${reel}`);
  return Number(BigInt(`0x${digest.slice(0, 13)}`) % BigInt(MAX_TICKET));
}

function formatItem(item) {
  return {
    itemId: Number(item.itemId),
    name: String(item.name || item.fullName || "Unknown Item"),
    fullName: String(item.fullName || item.name || "Unknown Item"),
    imageUrl: String(item.imageUrl || ""),
    rarity: String(item.rarity || "Godly"),
    price: Number(item.price || 0),
    tickets: Number(item.tickets || 0),
    range: Array.isArray(item.range) ? item.range.map(Number) : [0, 0],
    odds: Number(item.odds || 0),
  };
}

function formatCase(row, includeItems = false) {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    imageUrl: row.image_url,
    price: Number(row.price),
    volatility: Number(row.volatility),
    risk: Number(row.risk),
    marker: Number(row.marker),
    ...(includeItems ? { items: (row.items || []).map(formatItem) } : {}),
  };
}

async function databaseCase(env, slug) {
  const query = new URLSearchParams({
    slug: `eq.${slug}`,
    active: "eq.true",
    select: "id,slug,name,image_url,price,volatility,risk,marker,items",
    limit: "1",
  });
  const response = await request(env, `mm2wild_cases?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) {
    throw new Error(rows?.message || "Could not load this case.");
  }
  return rows[0] || null;
}

async function rpc(env, name, body) {
  const response = await request(env, `rpc/${name}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || "The case could not be opened.");
  return result;
}

export async function listCases(env) {
  const query = new URLSearchParams({
    select: "id,slug,name,image_url,price,volatility,risk,marker",
    active: "eq.true",
    order: "sort_order.asc",
    limit: "100",
  });
  const response = await request(env, `mm2wild_cases?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) throw new Error(rows?.message || "Could not load cases.");
  return rows.map((row) => formatCase(row));
}

export async function getCase(env, slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug || ""))) return null;
  const row = await databaseCase(env, slug);
  return row ? formatCase(row, true) : null;
}

export async function openCase(env, user, slug, quantity, demo = false) {
  const count = Number(quantity);
  if (!Number.isInteger(count) || count < 1 || count > 4) {
    throw new Error("Choose between 1 and 4 cases.");
  }
  const row = await databaseCase(env, slug);
  if (!row) throw new Error("This case is unavailable.");
  const caseItem = formatCase(row, true);
  const serverSeed = randomSeed();
  const serverSeedHash = await sha256(serverSeed);
  const results = await Promise.all(Array.from({ length: count }, async (_, reel) => {
    const ticket = await ticketFromSeed(serverSeed, reel);
    const winner = caseItem.items.find((item) => ticket >= item.range[0] && ticket <= item.range[1]);
    if (!winner) throw new Error("This case has invalid ticket ranges.");
    return { ...winner, ticket, reel };
  }));

  if (demo) {
    return {
      case: caseItem,
      quantity: count,
      results,
      totalCost: caseItem.price * count,
      totalValue: results.reduce((total, item) => total + item.price, 0),
      balance: null,
      fairness: { serverSeedHash, serverSeed },
      demo: true,
    };
  }
  if (!user?.uuid) throw new Error("The login session could not be found");

  const opening = await rpc(env, "mm2wild_record_case_opening", {
    p_user_uuid: user.uuid,
    p_case_id: caseItem.id,
    p_quantity: count,
    p_results: results,
    p_server_seed: serverSeed,
    p_server_seed_hash: serverSeedHash,
  });
  return {
    id: opening.id,
    case: caseItem,
    quantity: count,
    results,
    totalCost: Number(opening.total_cost),
    totalValue: Number(opening.total_value),
    balance: Number(opening.balance_after),
    fairness: { serverSeedHash, serverSeed },
    demo: false,
    openedAt: opening.opened_at,
  };
}
