import { getFutureEosBlock } from "./coinflip.js";

const MAX_ROUNDS = 100;
const MAX_TICKET = 10_000_000;
const COUNTDOWN_MS = 3_000;
const BATTLE_BOTS = [
  ["Travis", "/bots/travis.webp"], ["Drake", "/bots/drake.webp"],
  ["LeBron", "/bots/lebron.webp"], ["Ronaldo", "/bots/ronaldo.webp"],
  ["Messi", "/bots/messi.webp"], ["MrBeast", "/bots/mrbeast.webp"],
  ["Speed", "/bots/speed.webp"], ["The Rock", "/bots/rock.webp"],
  ["Diddy", "/bots/diddy.webp"], ["Putin", "/bots/putin.webp"],
];

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
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, ...init.headers },
  });
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomSeed() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function rpc(env, name, body) {
  const response = await request(env, `rpc/${name}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || "The battle request could not be completed.");
  return result;
}

function roundDuration(row) {
  return row.fast_spin ? 1_600 : 5_200;
}

function localBattleImage(item) {
  const itemId = Number(item?.itemId ?? item?.item_id ?? item?.id);
  if (Number.isSafeInteger(itemId) && itemId > 0) return `/items/${itemId}.webp`;
  const source = String(item?.imageUrl || item?.image_url || "");
  const pathId = source.match(/\/items\/(\d+)\.webp(?:$|[?#])/i)?.[1];
  return pathId ? `/items/${pathId}.webp` : source;
}

function normalizeBattleDrop(drop) {
  if (!drop || typeof drop !== "object") return drop;
  return {
    ...drop,
    imageUrl: localBattleImage(drop),
    reel: Array.isArray(drop.reel)
      ? drop.reel.map((item) => ({ ...item, imageUrl: localBattleImage(item) }))
      : drop.reel,
  };
}

function formatBattle(row) {
  const results = Array.isArray(row.results)
    ? row.results.map((round) => ({
        ...round,
        drops: Array.isArray(round?.drops) ? round.drops.map(normalizeBattleDrop) : [],
      }))
    : [];
  const payouts = row.payouts && typeof row.payouts === "object" ? row.payouts : {};
  const winners = new Set(Array.isArray(row.winner_slots) ? row.winner_slots.map(Number) : []);
  const rawPlayers = Array.isArray(row.players) ? row.players : [];
  const players = rawPlayers.map((player, index) => {
    const slot = Number.isInteger(player.slot) ? player.slot : index;
    const items = results.flatMap((round) => {
      const drop = (round?.drops || []).find((entry) => Number(entry.slot) === slot);
      return drop ? [{ ...drop, round: Number(round.round) }] : [];
    });
    return { ...player, slot, items, payout: Number(payouts[slot] || 0), winner: winners.has(slot) };
  });
  const rollingAt = row.rolling_at || null;
  let currentRound = Number(row.current_round) || 0;
  if (row.status === "in_progress" && rollingAt) {
    const elapsed = Date.now() - new Date(rollingAt).getTime();
    currentRound = elapsed < 0 ? 0 : Math.min(Number(row.rounds), Math.floor(elapsed / roundDuration(row)) + 1);
  }
  const phase = row.status === "in_progress" && rollingAt
    ? Date.now() < new Date(rollingAt).getTime() ? "countdown"
      : Date.now() >= new Date(rollingAt).getTime() + Number(row.rounds) * roundDuration(row) ? "tally" : "spinning"
    : row.status;
  return {
    id: row.id, number: Number(row.game_number), status: row.status,
    creator: { uuid: row.creator_uuid, username: row.creator_username, avatar: row.creator_avatar },
    cases: Array.isArray(row.cases) ? row.cases : [], rounds: Number(row.rounds),
    playerLayout: Array.isArray(row.player_layout) ? row.player_layout.map(Number) : [1, 1],
    maxPlayers: Number(row.max_players), players, totalCost: Number(row.total_cost),
    cost: Number(row.join_cost ?? row.creator_cost), creatorCost: Number(row.creator_cost),
    modes: { share: Boolean(row.share_mode), crazy: Boolean(row.crazy_mode), jackpot: Boolean(row.jackpot_mode), partial: Boolean(row.partial_funding), borrow: Boolean(row.borrow_mode), private: Boolean(row.private), fastSpin: Boolean(row.fast_spin) },
    fundingPercent: Number(row.funding_percent), borrowPercent: Number(row.borrow_percent),
    minimumLevel: Number(row.minimum_level), accessKey: row.access_key || null,
    balanceType: row.balance_type === "crypto" ? "crypto" : "mm2",
    currentRound, phase, results, payouts, winnerSlots: [...winners],
    createdAt: row.created_at, startedAt: row.started_at, rollingAt,
    settleAfter: row.settle_after || null, completedAt: row.completed_at,
    fairness: { serverSeedHash: row.server_seed_hash || null, serverSeed: row.status === "complete" ? row.server_seed || null : null, eosBlock: Number(row.eos_block_num) || null, eosHash: row.status === "complete" ? row.eos_block_id || null : null },
  };
}

async function fetchRow(env, identifier) {
  const value = String(identifier || "");
  const field = /^\d+$/.test(value) ? "game_number" : /^[0-9a-f-]{36}$/i.test(value) ? "id" : null;
  if (!field) return null;
  const query = new URLSearchParams({ [field]: `eq.${value}`, select: "*", limit: "1" });
  const response = await request(env, `mm2wild_battles?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) throw new Error(rows?.message || "Could not load this battle.");
  return rows[0] || null;
}

async function settleIfDue(env, row) {
  if (row?.status !== "in_progress" || !row.settle_after || new Date(row.settle_after).getTime() > Date.now()) return row;
  await rpc(env, "mm2wild_settle_battle_currency", { p_game_id: row.id });
  return fetchRow(env, row.id);
}

export async function listBattles(env, { limit = 100 } = {}) {
  const query = new URLSearchParams({ select: "*", private: "eq.false", status: "in.(open,in_progress,complete)", order: "created_at.desc", limit: String(Math.min(Math.max(Number(limit) || 100, 1), 100)) });
  const response = await request(env, `mm2wild_battles?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) throw new Error(rows?.message || "Could not load battles.");
  return rows.map(formatBattle);
}

export async function getBattle(env, identifier, key = "") {
  let row = await fetchRow(env, identifier);
  if (!row || (row.private && row.access_key !== key)) return null;
  if (row.status === "in_progress" && (!Array.isArray(row.results) || !row.results.length)) row = await prepareBattle(env, row);
  row = await settleIfDue(env, row);
  return formatBattle(row);
}

async function catalogueCases(env, selections) {
  if (!Array.isArray(selections) || !selections.length) throw new Error("Add at least one case.");
  const normalized = selections.map((entry) => ({ id: Number(entry?.caseId), quantity: Number(entry?.quantity) }));
  if (normalized.some((entry) => !Number.isSafeInteger(entry.id) || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 25)) throw new Error("One or more case quantities are invalid.");
  const rounds = normalized.reduce((sum, entry) => sum + entry.quantity, 0);
  if (rounds > MAX_ROUNDS) throw new Error(`Choose no more than ${MAX_ROUNDS} battle rounds.`);
  const ids = [...new Set(normalized.map((entry) => entry.id))];
  const query = new URLSearchParams({ id: `in.(${ids.join(",")})`, active: "eq.true", select: "id,slug,name,image_url,price,risk" });
  const response = await request(env, `mm2wild_cases?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows) || rows.length !== ids.length) throw new Error("One or more selected cases are unavailable.");
  const byId = new Map(rows.map((row) => [Number(row.id), row]));
  const cases = normalized.map(({ id, quantity }) => { const row = byId.get(id); return { id, slug: row.slug, name: row.name, imageUrl: row.image_url, price: Number(row.price), risk: Number(row.risk), quantity }; });
  return { cases, rounds, totalCost: Math.round(cases.reduce((sum, item) => sum + item.price * item.quantity, 0)) };
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
  const creatorCost = partial ? catalogue.totalCost + Math.round(catalogue.totalCost * (maxPlayers - 1) * fundingPercent / 100) : borrow ? Math.max(1, Math.round(catalogue.totalCost * (1 - borrowPercent / 100))) : catalogue.totalCost;
  const serverSeed = randomSeed();
  const serverSeedHash = await sha256(serverSeed);
  const row = await rpc(env, "mm2wild_create_battle_currency", {
    p_user_uuid: user.uuid, p_cases: catalogue.cases, p_rounds: catalogue.rounds,
    p_player_layout: layout, p_max_players: maxPlayers, p_total_cost: catalogue.totalCost,
    p_creator_cost: creatorCost, p_share_mode: payload?.share === true,
    p_crazy_mode: payload?.crazy === true, p_jackpot_mode: payload?.jackpot === true,
    p_partial_funding: partial, p_funding_percent: fundingPercent,
    p_borrow_mode: borrow, p_borrow_percent: borrowPercent,
    p_minimum_level: payload?.minimumLevel === true ? 2 : 1,
    p_private: payload?.private === true, p_fast_spin: payload?.fastSpin === true,
    p_server_seed: serverSeed, p_server_seed_hash: serverSeedHash,
    p_balance_type: payload?.balanceType === "crypto" ? "crypto" : "mm2",
  });
  return formatBattle(row);
}

async function caseCatalogueWithItems(env, battle) {
  const ids = [...new Set(battle.cases.map((entry) => Number(entry.id)))];
  const query = new URLSearchParams({ id: `in.(${ids.join(",")})`, select: "id,items" });
  const response = await request(env, `mm2wild_cases?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows) || rows.length !== ids.length) throw new Error("Battle cases could not be loaded.");
  return new Map(rows.map((row) => [
    Number(row.id),
    Array.isArray(row.items)
      ? row.items.map((item) => ({ ...item, imageUrl: localBattleImage(item) }))
      : [],
  ]));
}

function slotTeams(layout) {
  return layout.flatMap((size, team) => Array.from({ length: size }, () => team));
}

async function prepareBattle(env, row) {
  if (Array.isArray(row.results) && row.results.length) return row;
  const eos = await getFutureEosBlock(env);
  const caseItems = await caseCatalogueWithItems(env, row);
  const rounds = row.cases.flatMap((caseItem) => Array.from({ length: Math.max(1, Number(caseItem.quantity) || 1) }, () => caseItem)).slice(0, Number(row.rounds));
  const players = Array.isArray(row.players) ? row.players : [];
  const results = [];
  const totals = Array.from({ length: Number(row.max_players) }, () => 0);
  for (let roundIndex = 0; roundIndex < rounds.length; roundIndex += 1) {
    const caseItem = rounds[roundIndex];
    const items = caseItems.get(Number(caseItem.id)) || [];
    const drops = [];
    for (const player of players) {
      const slot = Number(player.slot);
      const digest = await sha256(`${row.server_seed}:${eos.blockHash}:${roundIndex}:${slot}`);
      const ticket = Number(BigInt(`0x${digest.slice(0, 13)}`) % BigInt(MAX_TICKET));
      const item = items.find((entry) => ticket >= Number(entry.range?.[0]) && ticket <= Number(entry.range?.[1]));
      if (!item) throw new Error("A battle case has invalid ticket ranges.");
      const reel = [];
      for (let reelIndex = 0; reelIndex < 10; reelIndex += 1) {
        const reelDigest = await sha256(`${row.server_seed}:${eos.blockHash}:${roundIndex}:${slot}:reel:${reelIndex}`);
        const reelTicket = Number(BigInt(`0x${reelDigest.slice(0, 13)}`) % BigInt(MAX_TICKET));
        const reelItem = items.find((entry) => reelTicket >= Number(entry.range?.[0]) && reelTicket <= Number(entry.range?.[1]));
        if (reelItem) reel.push({ itemId: Number(reelItem.itemId), name: reelItem.name, imageUrl: localBattleImage(reelItem), rarity: reelItem.rarity, price: Number(reelItem.price) });
      }
      reel.push({ itemId: Number(item.itemId), name: item.name, imageUrl: localBattleImage(item), rarity: item.rarity, price: Number(item.price) });
      const drop = { slot, itemId: Number(item.itemId), name: item.name, fullName: item.fullName || item.name, imageUrl: localBattleImage(item), rarity: item.rarity, price: Number(item.price), ticket, reel };
      drops.push(drop);
      totals[slot] += drop.price;
    }
    results.push({ round: roundIndex + 1, caseId: Number(caseItem.id), caseName: caseItem.name, drops });
  }
  const teams = slotTeams(row.player_layout.map(Number));
  const teamTotals = teams.reduce((all, team, slot) => { all[team] = (all[team] || 0) + totals[slot]; return all; }, []);
  let winningTeams = [];
  if (row.share_mode) winningTeams = [...new Set(teams)];
  else if (row.jackpot_mode) {
    const total = totals.reduce((sum, value) => sum + value, 0);
    const digest = await sha256(`${row.server_seed}:${eos.blockHash}:jackpot`);
    let ticket = total ? Number(BigInt(`0x${digest.slice(0, 13)}`) % BigInt(Math.max(1, Math.round(total)))) : 0;
    let winningSlot = 0;
    for (let slot = 0; slot < totals.length; slot += 1) { if (ticket < totals[slot]) { winningSlot = slot; break; } ticket -= totals[slot]; }
    winningTeams = [teams[winningSlot]];
  } else {
    const target = row.crazy_mode ? Math.min(...teamTotals) : Math.max(...teamTotals);
    winningTeams = teamTotals.map((value, team) => value === target ? team : -1).filter((team) => team >= 0);
  }
  const winnerSlots = teams.map((team, slot) => winningTeams.includes(team) ? slot : -1).filter((slot) => slot >= 0);
  const totalPrize = totals.reduce((sum, value) => sum + value, 0);
  const payouts = {};
  if (row.share_mode) {
    const amount = Math.floor(totalPrize / Math.max(1, players.length));
    players.forEach((player) => { payouts[player.slot] = amount; });
  } else {
    const perTeam = Math.floor(totalPrize / Math.max(1, winningTeams.length));
    for (const team of winningTeams) {
      const slots = winnerSlots.filter((slot) => teams[slot] === team);
      const amount = Math.floor(perTeam / Math.max(1, slots.length));
      slots.forEach((slot) => { payouts[slot] = amount; });
    }
  }
  const rollingAt = new Date(Date.now() + COUNTDOWN_MS);
  const settleAfter = new Date(rollingAt.getTime() + rounds.length * roundDuration(row) + rounds.length * 250 + 1_800);
  return rpc(env, "mm2wild_prepare_battle", {
    p_game_id: row.id, p_results: results, p_payouts: payouts, p_winner_slots: winnerSlots,
    p_eos_block_num: eos.blockNumber, p_eos_block_id: eos.blockHash,
    p_rolling_at: rollingAt.toISOString(), p_settle_after: settleAfter.toISOString(),
  });
}

export async function joinBattle(env, user, identifier, slot, key = "") {
  let row = await rpc(env, "mm2wild_join_battle_currency", { p_game_id: String(identifier), p_user_uuid: user.uuid, p_slot: Number(slot), p_access_key: key || null });
  if (row.status === "in_progress") row = await prepareBattle(env, row);
  return formatBattle(row);
}

export async function callBattleBot(env, user, identifier, slot) {
  const selector = await sha256(`${identifier}:${slot}:${Date.now()}`);
  const bot = BATTLE_BOTS[Number.parseInt(selector.slice(0, 8), 16) % BATTLE_BOTS.length];
  let row = await rpc(env, "mm2wild_call_battle_bot", { p_game_id: String(identifier), p_user_uuid: user.uuid, p_slot: Number(slot), p_bot_name: bot[0], p_bot_avatar: bot[1] });
  if (row.status === "in_progress") row = await prepareBattle(env, row);
  return formatBattle(row);
}

export async function cancelBattle(env, user, identifier) {
  return formatBattle(await rpc(env, "mm2wild_cancel_battle_currency", { p_game_id: String(identifier), p_user_uuid: user.uuid }));
}
