import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const applyChanges = process.argv.includes("--apply");
const targetDirectory = path.join(projectRoot, "public", "items", "catalog");
const manualSources = new Map([
  ["chroma icecream", "/items/chroma-icecream.webp"],
  ["chroma sands", "/items/chroma-sands.webp"],
  ["chroma beachy", "/items/chroma-beachy.webp"],
]);

function loadEnvFile(fileName, override = false) {
  const envPath = path.resolve(projectRoot, fileName);
  if (!fs.existsSync(envPath)) return;
  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const normalized = line.startsWith("export ") ? line.slice(7) : line;
    const separator = normalized.indexOf("=");
    if (separator === -1) continue;
    const key = normalized.slice(0, separator).trim();
    let value = normalized.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (override || !process.env[key]) process.env[key] = value;
  }
}

function localPath(item) {
  return `/items/catalog/${item.id}.webp`;
}

function headers(key, additional = {}) {
  return {
    apikey: key,
    ...(!String(key).startsWith("sb_secret_") ? { Authorization: `Bearer ${key}` } : {}),
    ...additional,
  };
}

async function fetchAllItems(baseUrl, key) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const url = new URL("/rest/v1/mm2wild_items", baseUrl);
    url.searchParams.set("select", "id,name,rarity,image_url");
    url.searchParams.set("order", "id.asc");
    url.searchParams.set("limit", "1000");
    url.searchParams.set("offset", String(offset));
    const response = await fetch(url, { headers: headers(key) });
    const page = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(page)) throw new Error(page?.message || "Could not load MM2 items.");
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

function assertWebp(bytes, itemName) {
  if (
    bytes.length < 12
    || bytes.subarray(0, 4).toString("ascii") !== "RIFF"
    || bytes.subarray(8, 12).toString("ascii") !== "WEBP"
  ) {
    throw new Error(`${itemName} did not return a valid WebP image.`);
  }
}

async function sourceBytes(item) {
  const source = String(item.image_url || "").trim() || manualSources.get(item.name.trim().toLowerCase());
  if (!source) throw new Error(`${item.name} has no image source.`);
  if (source.startsWith("/")) {
    return fs.readFileSync(path.join(projectRoot, "public", ...source.split("/").filter(Boolean)));
  }
  const response = await fetch(source, { headers: { "User-Agent": "MM2Wild-item-localizer" } });
  if (!response.ok) throw new Error(`Could not download ${item.name} (${response.status}).`);
  return Buffer.from(await response.arrayBuffer());
}

async function patchItem(baseUrl, key, item, imageUrl) {
  const url = new URL("/rest/v1/mm2wild_items", baseUrl);
  url.searchParams.set("id", `eq.${item.id}`);
  const response = await fetch(url, {
    method: "PATCH",
    headers: headers(key, { "content-type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify({ image_url: imageUrl, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`Could not update ${item.name}: ${(await response.text()).slice(0, 500)}`);
}

async function inBatches(values, size, callback) {
  for (let index = 0; index < values.length; index += size) {
    await Promise.all(values.slice(index, index + size).map(callback));
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);
const baseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !key) throw new Error("Supabase URL and service key are required.");

const items = await fetchAllItems(baseUrl, key);
const paths = items.map((item) => localPath(item));
const duplicates = paths.filter((value, index) => paths.indexOf(value) !== index);
if (duplicates.length) throw new Error(`Duplicate local image paths: ${[...new Set(duplicates)].join(", ")}`);

console.log(`Found ${items.length} MM2 item images to localize.`);
if (!applyChanges) {
  console.log("Dry run complete. Re-run with --apply to download assets and update Supabase.");
  process.exit(0);
}

fs.mkdirSync(targetDirectory, { recursive: true });
await inBatches(items, 10, async (item) => {
  const bytes = await sourceBytes(item);
  assertWebp(bytes, item.name);
  fs.writeFileSync(path.join(projectRoot, "public", ...localPath(item).split("/").filter(Boolean)), bytes);
});
console.log(`Downloaded and validated ${items.length} local WebP files.`);

await inBatches(items, 10, (item) => patchItem(baseUrl, key, item, localPath(item)));
console.log(`Updated ${items.length} Supabase image_url values to site-hosted paths.`);
