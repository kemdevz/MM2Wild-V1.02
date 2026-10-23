const encoder = new TextEncoder();

const REEL_PATTERN = [
  "green", "gold", "blue", "gold", "blue",
  "purple", "blue", "gold", "blue", "gold",
  "blue", "gold", "blue", "gold", "blue",
];

export const ROULETTE_COLORS = ["blue", "green", "gold", "purple"];

export const ROULETTE_MULTIPLIERS = {
  blue: 2,
  green: 14,
  gold: 2,
  purple: 7,
};

export const ROULETTE_BETTING_MS = 20 * 1000;
export const ROULETTE_SPINNING_MS = 5 * 1000;
export const ROULETTE_WAITING_MS = 2 * 1000;
export const ROULETTE_TICK_MS = 250;
export const EOS_BLOCKS_AHEAD = 4;
export const EOS_POLL_MS = 500;
export const EOS_PREFETCH_MS = 2500;

const DEFAULT_EOS_RPC_URL = "https://eos.greymass.com";
const EOS_MAINNET_CHAIN_ID = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906";

function generateServerSeed() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Hex(key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(message),
  );
  return Array.from(new Uint8Array(signature), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

function sha256Hex(input) {
  return crypto.subtle
    .digest("SHA-256", encoder.encode(input))
    .then((hash) =>
      Array.from(new Uint8Array(hash), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join(""),
    );
}

async function computeResult(serverSeed, clientSeed, nonce, eosBlockId) {
  const hash = await hmacSha256Hex(serverSeed, `${clientSeed}:${nonce}:${eosBlockId}`);
  const value = parseInt(hash.slice(0, 8), 16);
  const tileIndex = value % REEL_PATTERN.length;
  return { color: REEL_PATTERN[tileIndex], tileIndex };
}

function eosSettings(env) {
  return {
    url: (env?.EOS_RPC_URL || DEFAULT_EOS_RPC_URL).replace(/\/$/, ""),
    blocksAhead: Math.max(1, Number(env?.EOS_BLOCKS_AHEAD) || EOS_BLOCKS_AHEAD),
  };
}

async function eosRequest(settings, path, body = {}) {
  const response = await fetch(`${settings.url}/v1/chain/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(`EOS ${path} request failed.`);
  return data;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}


function supabaseSettings(env) {
  const url = (env?.SUPABASE_URL || "").replace(/\/$/, "");
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && key ? { url, key } : null;
}

function createSupabaseStore(env) {
  const settings = supabaseSettings(env);
  if (!settings) return null;

  const request = (path, init = {}) =>
    fetch(`${settings.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: settings.key,
        Authorization: `Bearer ${settings.key}`,
        ...init.headers,
      },
    });

  return {
    async loadActiveSeed() {
      const query = new URLSearchParams({
        active: "eq.true",
        select: "id,server_seed,server_seed_hash,client_seed,nonce",
        order: "created_at.desc",
        limit: "1",
      });
      const response = await request(`mm2wild_roulette_seed?${query}`);
      const rows = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(rows)) return null;
      return rows[0] || null;
    },

    async loadJackpotState() {
      const response = await request("rpc/mm2wild_get_roulette_jackpot", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: "{}",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result) return null;
      return {
        amount: Number(result.amount || 0),
        greenStreak: Number(result.greenStreak || 0),
      };
    },

    async createSeed() {
      const serverSeed = generateServerSeed();
      const serverSeedHash = await sha256Hex(serverSeed);
      const response = await request("mm2wild_roulette_seed", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          server_seed: serverSeed,
          server_seed_hash: serverSeedHash,
          client_seed: "",
        }),
      });
      const rows = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(rows) || !rows[0]) return null;
      return rows[0];
    },

    async bumpNonce(seedId, currentNonce) {
      const query = new URLSearchParams({ id: `eq.${seedId}`, select: "nonce" });
      const response = await request(`mm2wild_roulette_seed?${query}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ nonce: currentNonce + 1 }),
      });
      const rows = await response.json().catch(() => null);
      return rows?.[0]?.nonce ?? currentNonce + 1;
    },

    async rotateSeed(currentSeedId) {
      const deactivateQuery = new URLSearchParams({ id: `eq.${currentSeedId}` });
      await request(`mm2wild_roulette_seed?${deactivateQuery}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          active: false,
          rotated_at: new Date().toISOString(),
        }),
      });
      return this.createSeed();
    },

    async createPendingRound(round) {
      const response = await request("mm2wild_roulette_rounds", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({
          id: round.id,
          seed_id: round.seedId,
          nonce: round.nonce,
          client_seed: round.clientSeed,
          result: null,
          total_pot: round.totalPot,
          total_players: round.totalPlayers,
          eos_block_num: round.eosBlockNum,
          eos_block_id: null,
          eos_chain_id: round.eosChainId,
          eos_block_status: "pending",
          eos_requested_at: new Date().toISOString(),
        }),
      });
      const rows = await response.json().catch(() => null);
      if (!response.ok || !rows?.[0]?.id) throw new Error("Could not persist the EOS block commitment.");
      return rows[0].id;
    },

    async completePendingRound(roundId, eosBlockId, result, tileIndex) {
      const query = new URLSearchParams({ id: `eq.${roundId}`, select: "id" });
      const response = await request(`mm2wild_roulette_rounds?${query}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          eos_block_id: eosBlockId,
          eos_block_status: "mined",
          eos_mined_at: new Date().toISOString(),
          result,
          tile_index: tileIndex,
        }),
      });
      const rows = await response.json().catch(() => null);
      if (!response.ok || !rows?.[0]?.id) throw new Error("Could not save the mined EOS block.");
      return rows[0].id;
    },

    async saveBet(game) {
      const response = await request("mm2wild_roulette_bets", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          round_id: game.roundId,
          user_uuid: game.userUuid,
          color: game.color,
          amount: game.amount,
          result: game.result,
          multiplier: game.multiplier,
          payout: game.payout,
          profit: game.profit,
          status: game.status,
        }),
      });
      if (!response.ok) throw new Error("Could not persist the roulette bet.");
    },

    async processJackpot(round) {
      const response = await request("rpc/mm2wild_process_roulette_jackpot", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          p_round_id: round.roundId,
          p_green_bets: round.greenBets,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result) {
        throw new Error(result?.message || "Could not process the roulette jackpot.");
      }
      return {
        amount: Math.round(Number(result.amount || 0)),
        greenStreak: Number(result.greenStreak || 0),
        triggered: Boolean(result.triggered),
        potAmount: Math.round(Number(result.potAmount || 0)),
        paidAmount: Math.round(Number(result.paidAmount || 0)),
        payouts: Array.isArray(result.payouts) ? result.payouts.map((payout) => ({
          userUuid: payout.userUuid,
          roundId: payout.roundId,
          payout: Math.round(Number(payout.payout || 0)),
        })) : [],
      };
    },

    async loadRecentRounds(limit = 100) {
      const query = new URLSearchParams({
        select: "id,nonce,result,tile_index,total_players,created_at,eos_block_num,eos_block_id,eos_chain_id,eos_block_status,eos_requested_at,eos_mined_at",
        result: "not.is.null",
        order: "created_at.desc",
        limit: String(limit),
      });
      const response = await request(`mm2wild_roulette_rounds?${query}`);
      const rows = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(rows)) return [];
      return rows.map((row) => ({
        id: row.id,
        roundNumber: row.nonce,
        color: row.result,
        tileIndex: row.tile_index,
        players: row.total_players,
        time: row.created_at,
        eosBlockNum: row.eos_block_num,
        eosBlockId: row.eos_block_id,
        eosChainId: row.eos_chain_id,
        eosBlockStatus: row.eos_block_status,
        eosRequestedAt: row.eos_requested_at,
        eosMinedAt: row.eos_mined_at,
      }));
    },

    async getUser(userUuid) {
      const query = new URLSearchParams({
        uuid: `eq.${userUuid}`,
        select: "uuid,username,mm2_balance,total_wagered",
        limit: "1",
      });
      const response = await request(`mm2wild_users?${query}`);
      const rows = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(rows)) return null;
      return rows[0] || null;
    },

    async deductBalance(userUuid, amount) {
      const response = await request("rpc/mm2wild_place_roulette_wager", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          p_user_uuid: userUuid,
          p_amount: amount,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.balance == null) {
        return { ok: false, error: result?.message || "Could not deduct balance." };
      }
      return { ok: true, balance: Number(result.balance) };
    },

    async creditBalance(userUuid, amount) {
      const user = await this.getUser(userUuid);
      if (!user) return { ok: false, error: "Account not found." };
      const newBalance = Number(user.mm2_balance || 0) + amount;
      const query = new URLSearchParams({ uuid: `eq.${userUuid}` });
      await request(`mm2wild_users?${query}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ mm2_balance: newBalance }),
      });
      return { ok: true, balance: newBalance };
    },

    async recordBet(userUuid, amount, profit, status, multiplier) {
      await request("mm2wild_bets", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_uuid: userUuid,
          game: "roulette",
          status,
          amount,
          profit,
          multiplier,
        }),
      });
    },
  };
}

function createMemoryStore() {
  let seed = null;
  const rounds = [];
  const balances = new Map();
  let jackpotAmount = 0;
  let jackpotGreenRounds = [];
  const processedJackpotRounds = new Map();

  return {
    async loadActiveSeed() {
      if (!seed) {
        const serverSeed = generateServerSeed();
        seed = {
          id: crypto.randomUUID(),
          server_seed: serverSeed,
          server_seed_hash: await sha256Hex(serverSeed),
          client_seed: "",
          nonce: 0,
        };
      }
      return seed;
    },
    async loadJackpotState() {
      return { amount: jackpotAmount, greenStreak: jackpotGreenRounds.length };
    },
    async createSeed() {
      const serverSeed = generateServerSeed();
      seed = {
        id: crypto.randomUUID(),
        server_seed: serverSeed,
        server_seed_hash: await sha256Hex(serverSeed),
        client_seed: "",
        nonce: 0,
      };
      return seed;
    },
    async bumpNonce(seedId, currentNonce) {
      if (seed && seed.id === seedId) seed.nonce = currentNonce + 1;
      return seed ? seed.nonce : currentNonce + 1;
    },
    async rotateSeed() {
      return this.createSeed();
    },
    async createPendingRound(round) {
      const existing = rounds.find((entry) => entry.id === round.id);
      if (existing) return existing.id;
      rounds.unshift({
        id: round.id,
        roundNumber: round.nonce,
        color: null,
        players: round.totalPlayers,
        time: new Date().toISOString(),
        eosBlockNum: round.eosBlockNum,
        eosBlockId: null,
        eosChainId: round.eosChainId,
        eosBlockStatus: "pending",
      });
      if (rounds.length > 100) rounds.pop();
      return round.id;
    },
    async completePendingRound(roundId, eosBlockId, result, tileIndex) {
      const round = rounds.find((entry) => entry.id === roundId);
      if (!round) throw new Error("Pending roulette round was not found.");
      round.color = result;
      round.tileIndex = tileIndex;
      round.eosBlockId = eosBlockId;
      round.eosBlockStatus = "mined";
      round.eosMinedAt = new Date().toISOString();
      return roundId;
    },
    async saveBet() {
    },
    async processJackpot(round) {
      const processed = processedJackpotRounds.get(round.roundId);
      if (processed) return processed;

      const contribution = Math.round(round.totalPot * 0.005);
      jackpotAmount = Math.round(jackpotAmount + contribution);
      if (round.result === "green") {
        jackpotGreenRounds.push({ roundId: round.roundId, bets: round.greenBets });
      } else {
        jackpotGreenRounds = [];
      }

      const result = {
        amount: jackpotAmount,
        greenStreak: jackpotGreenRounds.length,
        triggered: false,
        potAmount: 0,
        paidAmount: 0,
        payouts: [],
      };

      if (jackpotGreenRounds.length === 3) {
        result.triggered = true;
        result.potAmount = jackpotAmount;
        const third = jackpotAmount / 3;
        for (const greenRound of jackpotGreenRounds) {
          const roundTotal = greenRound.bets.reduce((sum, bet) => sum + bet.amount, 0);
          if (roundTotal <= 0) continue;
          for (const bet of greenRound.bets) {
            const payout = Math.floor(third * (bet.amount / roundTotal) + Number.EPSILON);
            if (payout <= 0) continue;
            const current = balances.get(bet.userUuid) ?? 10000;
            balances.set(bet.userUuid, current + payout);
            result.paidAmount += payout;
            result.payouts.push({ userUuid: bet.userUuid, roundId: greenRound.roundId, payout });
          }
        }
        result.paidAmount = Math.round(result.paidAmount);
        jackpotAmount = Math.max(0, Math.round(jackpotAmount - result.paidAmount));
        jackpotGreenRounds = [];
        result.amount = jackpotAmount;
        result.greenStreak = 0;
      }

      processedJackpotRounds.set(round.roundId, result);
      return result;
    },
    async loadRecentRounds(limit = 100) {
      return rounds.slice(0, limit);
    },
    async getUser(userUuid) {
      const balance = balances.get(userUuid) ?? 10000;
      return { uuid: userUuid, username: `User-${userUuid.slice(0, 6)}`, mm2_balance: balance };
    },
    async deductBalance(userUuid, amount) {
      const current = balances.get(userUuid) ?? 10000;
      if (current < amount) return { ok: false, error: "Insufficient balance." };
      const newBalance = current - amount;
      balances.set(userUuid, newBalance);
      return { ok: true, balance: newBalance };
    },
    async creditBalance(userUuid, amount) {
      const current = balances.get(userUuid) ?? 10000;
      const newBalance = current + amount;
      balances.set(userUuid, newBalance);
      return { ok: true, balance: newBalance };
    },
    async recordBet() {
    },
  };
}

export function createRouletteState({ env = null, now = () => Date.now() } = {}) {
  const store = env ? (createSupabaseStore(env) || createMemoryStore()) : createMemoryStore();
  const eos = eosSettings(env);

  let phase = "betting";
  let phaseEndsAt = now() + ROULETTE_BETTING_MS;
  let currentResult = null;
  let currentTileIndex = null;
  let currentRoundId = null;
  let currentEosBlockNum = null;
  let currentEosBlockId = null;
  let preparedEosTarget = null;
  let eosTargetPromise = null;
  let history = [];
  let pots = emptyPots();
  let bets = new Map();
  let jackpotAmount = 0;
  let jackpotGreenStreak = 0;
  let jackpotContributionSettled = false;
  let seedRow = null;
  let roundNonce = 0;
  let readyPromise = null;
  let tickTimer = null;
  let spinTimer = null;
  let listeners = new Set();

  function emptyPots() {
    const obj = {};
    for (const color of ROULETTE_COLORS) obj[color] = { players: new Map(), amount: 0 };
    return obj;
  }

  function publicPots() {
    const obj = {};
    for (const color of ROULETTE_COLORS) {
      const playerList = [];
      for (const [uuid, info] of pots[color].players) {
        playerList.push({ uuid, name: info.name, avatar: info.avatar, amount: info.amount });
      }
      obj[color] = {
        players: pots[color].players.size,
        amount: pots[color].amount,
        playerList,
      };
    }
    return obj;
  }

  function publicJackpot() {
    const pendingContribution = jackpotContributionSettled
      ? 0
      : Math.round(roundTotals().totalPot * 0.005);
    return {
      amount: Math.round(jackpotAmount + pendingContribution),
      greenStreak: jackpotGreenStreak,
    };
  }

  function snapshot(userUuid) {
    const remaining = Math.max(0, phaseEndsAt - now());
    const playerBets = userUuid ? bets.get(userUuid) : null;
    return {
      type: "roulette_state",
      phase,
      remaining,
      totalDuration: phase === "betting"
        ? ROULETTE_BETTING_MS
        : phase === "spinning"
          ? ROULETTE_SPINNING_MS
          : phase === "waiting"
            ? ROULETTE_WAITING_MS
            : 0,
      result: currentResult,
      tileIndex: currentTileIndex,
      eosBlockNum: currentEosBlockNum,
      eosBlockId: currentEosBlockId,
      history: history.slice(0, 100),
      pots: publicPots(),
      jackpot: publicJackpot(),
      myBet: playerBets ? playerBets.map((b) => ({ color: b.color, amount: b.amount })) : null,
      fairness: seedRow
        ? {
            serverSeedHash: seedRow.server_seed_hash,
            clientSeed: seedRow.client_seed,
            nonce: roundNonce,
          }
        : null,
    };
  }

  function broadcast(payload) {
    const data = JSON.stringify(payload);
    for (const listener of listeners) {
      try { listener(data, null); } catch {}
    }
  }

  function sendToUser(userUuid, payload) {
    const data = JSON.stringify(payload);
    for (const listener of listeners) {
      try { listener(data, userUuid); } catch {}
    }
  }

  async function ready() {
    if (!readyPromise) {
      readyPromise = (async () => {
        seedRow = await store.loadActiveSeed();
        if (!seedRow) seedRow = await store.createSeed();
        roundNonce = seedRow.nonce || 0;
        history = await store.loadRecentRounds(100);
        try {
          const jackpot = await store.loadJackpotState();
          if (jackpot) {
            jackpotAmount = jackpot.amount;
            jackpotGreenStreak = jackpot.greenStreak;
          }
        } catch (error) {
          console.error("Could not load roulette jackpot state:", error);
        }
      })().catch(() => {});
    }
    await readyPromise;
  }

  function startBetting() {
    phase = "betting";
    phaseEndsAt = now() + ROULETTE_BETTING_MS;
    currentResult = null;
    currentTileIndex = null;
    currentRoundId = null;
    currentEosBlockNum = null;
    currentEosBlockId = null;
    preparedEosTarget = null;
    eosTargetPromise = null;
    pots = emptyPots();
    bets = new Map();
    jackpotContributionSettled = false;
    broadcast({ type: "roulette_phase", phase: "betting", endsAt: phaseEndsAt });
    scheduleMining();
  }

  function scheduleMining() {
    if (spinTimer) clearTimeout(spinTimer);
    spinTimer = setTimeout(() => void mineEosBlock(), Math.max(0, phaseEndsAt - now()));
  }

  async function startWaiting(result, tileIndex) {
    phase = "waiting";
    phaseEndsAt = now() + ROULETTE_WAITING_MS;
    broadcast({ type: "roulette_phase", phase: "waiting", endsAt: phaseEndsAt });
    await resolveRound(result, tileIndex);
    const remaining = Math.max(0, phaseEndsAt - now());
    if (spinTimer) clearTimeout(spinTimer);
    spinTimer = setTimeout(startBetting, remaining);
  }

  function roundTotals() {
    let totalPot = 0;
    const playerSet = new Set();
    for (const color of ROULETTE_COLORS) {
      totalPot += pots[color].amount;
      for (const uuid of pots[color].players.keys()) playerSet.add(uuid);
    }
    return { totalPot, totalPlayers: playerSet.size };
  }

  async function fetchEosTarget(projectToCountdownEnd) {
    const candidate = await eosRequest(eos, "get_info");
    const blocksUntilCountdownEnd = projectToCountdownEnd
      ? Math.max(0, Math.ceil((phaseEndsAt - now()) / 500))
      : 0;
    const blockNum = Number(candidate.head_block_num) + blocksUntilCountdownEnd + eos.blocksAhead;
    if (candidate.chain_id !== EOS_MAINNET_CHAIN_ID || !Number.isSafeInteger(blockNum)) {
      throw new Error("The configured RPC is not an EOS mainnet endpoint.");
    }
    return { chainId: candidate.chain_id, blockNum };
  }

  function prepareEosTarget() {
    if (preparedEosTarget || eosTargetPromise) return;
    eosTargetPromise = fetchEosTarget(true)
      .then((target) => {
        preparedEosTarget = target;
        return target;
      })
      .catch(() => {
        eosTargetPromise = null;
        return null;
      });
  }

  async function mineEosBlock() {
    if (!seedRow) await ready();
    if (phase !== "betting") return;
    phase = "mining";
    phaseEndsAt = now();

    let target = preparedEosTarget;
    if (!target && eosTargetPromise) target = await eosTargetPromise;
    while (phase === "mining" && !target) {
      try {
        target = await fetchEosTarget(false);
      } catch {
        await wait(EOS_POLL_MS);
      }
    }
    if (phase !== "mining") return;
    currentEosBlockNum = target.blockNum;

    broadcast({
      type: "roulette_mining",
      blockNumber: currentEosBlockNum,
      nonce: roundNonce,
      serverSeedHash: seedRow.server_seed_hash,
      clientSeed: seedRow.client_seed || "",
    });

    const totals = roundTotals();
    const pendingRoundId = crypto.randomUUID();
    while (phase === "mining" && !currentRoundId) {
      try {
        currentRoundId = await store.createPendingRound({
          id: pendingRoundId,
          seedId: seedRow.id,
          nonce: roundNonce,
          clientSeed: seedRow.client_seed || "",
          totalPot: totals.totalPot,
          totalPlayers: totals.totalPlayers,
          eosBlockNum: currentEosBlockNum,
          eosChainId: target.chainId,
        });
      } catch {
        await wait(EOS_POLL_MS);
      }
    }
    if (phase !== "mining") return;

    let block;
    while (phase === "mining") {
      try {
        block = await eosRequest(eos, "get_block", { block_num_or_id: currentEosBlockNum });
        if (block?.id) break;
      } catch {}
      await wait(EOS_POLL_MS);
    }
    if (phase !== "mining" || !block?.id) return;

    currentEosBlockId = block.id;
    const outcome = await computeResult(
      seedRow.server_seed,
      seedRow.client_seed || "",
      roundNonce,
      currentEosBlockId,
    );

    while (phase === "mining") {
      try {
        await store.completePendingRound(
          currentRoundId,
          currentEosBlockId,
          outcome.color,
          outcome.tileIndex,
        );
        break;
      } catch {
        await wait(EOS_POLL_MS);
      }
    }
    if (phase !== "mining") return;

    startSpin(outcome.color, outcome.tileIndex);
  }

  function startSpin(result, tileIndex) {
    phase = "spinning";
    phaseEndsAt = now() + ROULETTE_SPINNING_MS;
    currentResult = result;
    currentTileIndex = tileIndex;

    broadcast({
      type: "roulette_spin",
      color: result,
      tileIndex,
      nonce: roundNonce,
      serverSeedHash: seedRow.server_seed_hash,
      clientSeed: seedRow.client_seed || "",
      eosBlockNum: currentEosBlockNum,
      eosBlockId: currentEosBlockId,
      endsAt: phaseEndsAt,
    });

    if (spinTimer) clearTimeout(spinTimer);
    spinTimer = setTimeout(() => void startWaiting(result, tileIndex), ROULETTE_SPINNING_MS);
  }

  async function resolveRound(result, tileIndex) {
    const completedRoundNonce = roundNonce;
    let totalPot = 0;
    const playerSet = new Set();
    for (const color of ROULETTE_COLORS) {
      totalPot += pots[color].amount;
      for (const uuid of pots[color].players.keys()) playerSet.add(uuid);
    }

    const roundId = currentRoundId;

    try {
      roundNonce = await store.bumpNonce(seedRow.id, roundNonce);
    } catch {
      roundNonce += 1;
    }

    history.unshift({
      id: roundId,
      roundNumber: completedRoundNonce,
      color: result,
      tileIndex,
      players: playerSet.size,
      time: new Date().toISOString(),
      eosBlockNum: currentEosBlockNum,
      eosBlockId: currentEosBlockId,
      eosBlockStatus: "mined",
    });
    if (history.length > 100) history.pop();

    const multiplier = ROULETTE_MULTIPLIERS[result];
    const payouts = [];
    for (const [userUuid, userBets] of bets) {
      let totalPayout = 0;
      for (const bet of userBets) {
        const won = bet.color === result;
        const payout = won ? bet.amount * multiplier : 0;
        const profit = won ? payout - bet.amount : -bet.amount;
        const status = won ? "won" : "lost";

        try {
          await store.saveBet({
            roundId,
            userUuid,
            color: bet.color,
            amount: bet.amount,
            result,
            multiplier: won ? multiplier : 0,
            payout,
            profit,
            status,
          });
        } catch {}

        try {
          await store.recordBet(userUuid, bet.amount, profit, status, won ? multiplier : 0);
        } catch {}

        if (won) totalPayout += payout;
      }

      if (totalPayout > 0) {
        try {
          const creditResult = await store.creditBalance(userUuid, totalPayout);
          if (creditResult.ok) payouts.push({ userUuid, payout: totalPayout, balance: creditResult.balance });
        } catch {}
      }
    }

    const greenBets = [];
    for (const [userUuid, userBets] of bets) {
      const greenAmount = userBets
        .filter((bet) => bet.color === "green")
        .reduce((sum, bet) => sum + bet.amount, 0);
      if (greenAmount > 0) greenBets.push({ userUuid, amount: greenAmount });
    }

    let jackpotResult = null;
    try {
      jackpotResult = await store.processJackpot({
        roundId,
        result,
        totalPot,
        greenBets,
      });
      jackpotAmount = jackpotResult.amount;
      jackpotGreenStreak = jackpotResult.greenStreak;
      jackpotContributionSettled = true;
    } catch (error) {
      console.error("Could not process roulette jackpot:", error);
    }

    broadcast({
      type: "roulette_result",
      color: result,
      tileIndex,
      multiplier,
      history: history.slice(0, 100),
      pots: publicPots(),
      payouts,
      jackpot: {
        amount: jackpotAmount,
        greenStreak: jackpotGreenStreak,
        triggered: Boolean(jackpotResult?.triggered),
        potAmount: jackpotResult?.potAmount || 0,
        paidAmount: jackpotResult?.paidAmount || 0,
      },
      eosBlockNum: currentEosBlockNum,
      eosBlockId: currentEosBlockId,
    });

    const jackpotPayoutsByUser = new Map();
    for (const payout of jackpotResult?.payouts || []) {
      jackpotPayoutsByUser.set(
        payout.userUuid,
        (jackpotPayoutsByUser.get(payout.userUuid) || 0) + payout.payout,
      );
    }
    const affectedUsers = new Set([...bets.keys(), ...jackpotPayoutsByUser.keys()]);
    for (const userUuid of affectedUsers) {
      const userBets = bets.get(userUuid) || [];
      let totalPayout = 0;
      for (const bet of userBets) {
        if (bet.color === result) totalPayout += bet.amount * multiplier;
      }
      const jackpotPayout = jackpotPayoutsByUser.get(userUuid) || 0;
      const won = totalPayout > 0 || jackpotPayout > 0;
      try {
        const user = await store.getUser(userUuid);
        if (user) {
          sendToUser(userUuid, {
            type: "roulette_balance",
            balance: Number(user.mm2_balance || 0),
            won,
            payout: totalPayout,
            jackpotPayout,
          });
        }
      } catch {}
    }

  }

  function tick() {
    if (phase === "betting" && now() >= phaseEndsAt) {
      void mineEosBlock();
      return;
    }
    if (phase === "betting" && phaseEndsAt - now() <= EOS_PREFETCH_MS) prepareEosTarget();
    broadcast({ type: "roulette_tick", phase, remaining: Math.max(0, phaseEndsAt - now()) });
  }

  function startTickTimer() {
    if (tickTimer) return;
    tickTimer = setInterval(() => {
      if (listeners.size === 0) {
        clearInterval(tickTimer);
        tickTimer = null;
        return;
      }
      tick();
    }, ROULETTE_TICK_MS);
  }

  const api = {
    async ready() {
      await ready();
      return snapshot();
    },

    snapshot,
    getBet: (userUuid) => {
      const userBets = bets.get(userUuid);
      if (!userBets || userBets.length === 0) return null;
      return userBets;
    },

    subscribe(listener) {
      listeners.add(listener);
      startTickTimer();
      return () => { listeners.delete(listener); };
    },

    async placeBet(userUuid, userName, color, amount, avatar = null) {
      await ready();
      if (phase !== "betting") return { ok: false, error: "Betting is closed for this round." };
      if (!ROULETTE_COLORS.includes(color)) return { ok: false, error: "Invalid color." };
      const value = Math.max(0, Math.floor(Number(amount) || 0));
      if (!value) return { ok: false, error: "Enter a valid bet amount." };

      const deduction = await store.deductBalance(userUuid, value);
      if (!deduction.ok) return { ok: false, error: deduction.error };

      const existing = bets.get(userUuid) || [];
      const existingOnColor = existing.find((b) => b.color === color);
      if (existingOnColor) {
        existingOnColor.amount += value;
      } else {
        existing.push({ color, amount: value, name: userName, avatar });
      }
      bets.set(userUuid, existing);

      const potPlayer = pots[color].players.get(userUuid);
      if (potPlayer) {
        potPlayer.amount += value;
      } else {
        pots[color].players.set(userUuid, { name: userName, avatar, amount: value });
      }
      pots[color].amount += value;

      broadcast({ type: "roulette_pots", pots: publicPots(), jackpot: publicJackpot() });

      return { ok: true, bet: { color, amount: value }, balance: deduction.balance };
    },

    async start() {
      await ready();
      if (phase === "betting" && phaseEndsAt <= now()) {
        phaseEndsAt = now() + ROULETTE_BETTING_MS;
      }
      if (phase === "betting") scheduleMining();
      startTickTimer();
      return snapshot();
    },

    reset() {
      phase = "betting";
      phaseEndsAt = now() + ROULETTE_BETTING_MS;
      currentResult = null;
      currentTileIndex = null;
      currentRoundId = null;
      currentEosBlockNum = null;
      currentEosBlockId = null;
      preparedEosTarget = null;
      eosTargetPromise = null;
      history = [];
      pots = emptyPots();
      bets = new Map();
      jackpotContributionSettled = false;
    },
  };

  return api;
}
