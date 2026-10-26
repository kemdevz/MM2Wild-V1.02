

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");

function loadEnv(path) {
  const content = readFileSync(path, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

const env = loadEnv(envPath);
const SUPABASE_URL = env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const username = process.argv[2] || "Redbet_holder";
const count = parseInt(process.argv[3] || "25", 10);

const games = [
  { game: "coinflip", winChance: 0.49, baseMultiplier: 1.85 },
  { game: "upgrader", winChance: 0.45, baseMultiplier: 2.0 },
  { game: "battles", winChance: 0.48, baseMultiplier: 1.9 },
  { game: "cases", winChance: 0.4, baseMultiplier: 2.5 },
  { game: "roulette", winChance: 0.47, baseMultiplier: 2.0 },
];

const betAmounts = [14, 74, 170, 211, 384, 500, 750, 1000, 1200, 1500, 2000, 2300, 3000, 5000];

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateBet(userUuid) {
  const gameConfig = randomChoice(games);
  const amount = randomChoice(betAmounts);
  const won = Math.random() < gameConfig.winChance;
  const multiplier = won
    ? Math.round((gameConfig.baseMultiplier + (Math.random() * 1.5 - 0.5)) * 100) / 100
    : 0;
  const profit = won ? Math.round((amount * multiplier - amount) * 100) / 100 : -amount;


  const daysAgo = Math.random() * 7;
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  return {
    user_uuid: userUuid,
    game: gameConfig.game,
    status: won ? "won" : "lost",
    amount: amount,
    profit: profit,
    multiplier: multiplier,
    created_at: date.toISOString(),
  };
}

async function main() {

  const userResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/mm2wild_users?username=eq.${encodeURIComponent(username)}&select=uuid,username`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  );
  const users = await userResponse.json();
  if (!userResponse.ok || !users[0]) {
    console.error(`User "${username}" not found.`);
    process.exit(1);
  }

  const userUuid = users[0].uuid;
  console.log(`Seeding ${count} bets for ${username} (${userUuid})...`);


  const bets = Array.from({ length: count }, () => generateBet(userUuid));


  const batchSize = 25;
  let inserted = 0;
  for (let i = 0; i < bets.length; i += batchSize) {
    const batch = bets.slice(i, i + batchSize);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/mm2wild_bets`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "content-type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(batch),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Insert failed:", result);
      process.exit(1);
    }
    inserted += result.length;
  }

  const wins = bets.filter((b) => b.status === "won").length;
  const losses = bets.length - wins;
  const totalWagered = bets.reduce((sum, b) => sum + b.amount, 0);
  const totalProfit = bets.reduce((sum, b) => sum + b.profit, 0);

  console.log(`Done! Inserted ${inserted} bets.`);
  console.log(`  Wins: ${wins} | Losses: ${losses}`);
  console.log(`  Total wagered: ${totalWagered.toLocaleString()} coins`);
  console.log(`  Net profit: ${totalProfit >= 0 ? "+" : ""}${totalProfit.toLocaleString()} coins`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
