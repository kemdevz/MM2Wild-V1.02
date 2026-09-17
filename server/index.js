import { createRainState, createSupabaseRainStore, formatRainState } from "./rain.js";
import { createRouletteState } from "./roulette.js";
import { transferUserTip } from "./tips.js";
import {
  createCoinflip,
  joinCoinflip,
  listCoinflipItems,
  listCoinflips,
} from "./coinflip.js";

const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });

const verificationWords = [
  "acorn", "amber", "anchor", "apple", "autumn", "bamboo", "beacon",
  "berry", "birch", "blossom", "breeze", "brook", "candle", "canyon",
  "cabin", "care", "cedar", "chart", "cherry", "cloud", "clover", "coral", "cottage", "creek",
  "crystal", "daisy", "dawn", "dolphin", "dove", "dream", "drum",
  "duck", "eagle", "elm", "fair", "feather", "fern", "field", "finch", "flame",
  "forest", "garden", "glow", "grape", "grove", "harbor", "harp",
  "hamster", "hazel", "helmet", "heron", "hill", "honey", "horse", "island", "ivy", "jade",
  "lake", "lantern", "leaf", "lemon", "lily", "loom", "maple", "meadow",
  "melon", "mint", "moon", "mountain", "oak", "ocean", "olive", "orbit", "orchid",
  "owl", "pearl", "pebble", "pillar", "pine", "pond", "quick", "rainbow", "real", "reed", "river",
  "robin", "rose", "sage", "shell", "signal", "sky", "snow", "sparrow", "spring",
  "stag", "star", "stone", "stream", "summer", "summit", "sun", "swan", "tree",
  "tulip", "valley", "violet", "wave", "whale", "willow", "winter", "wise",
];

const encoder = new TextEncoder();
const challengeLifetimeSeconds = 10 * 60;
const sessionLifetimeSeconds = 7 * 24 * 60 * 60;

function secureRandomIndex(maximum) {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return Math.floor((value[0] / 4294967296) * maximum);
}

function createVerificationPhrase() {
  const words = [...verificationWords];
  for (let index = words.length - 1; index > 0; index -= 1) {
    const randomIndex = secureRandomIndex(index + 1);
    [words[index], words[randomIndex]] = [words[randomIndex], words[index]];
  }
  return words.slice(0, 17).join(", ");
}

function encodeBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function authSecret(env) {
  const secret = (env.MM2WILD_USER_SECRET || "").trim();
  return secret.length >= 32 ? secret : null;
}

async function createSignedToken(payload, secret) {
  const encodedPayload = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(secret),
    encoder.encode(encodedPayload),
  );
  return `${encodedPayload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function verifySignedToken(token, secret) {
  try {
    const [encodedPayload, encodedSignature, remainder] = token.split(".");
    if (!encodedPayload || !encodedSignature || remainder) return null;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(secret),
      decodeBase64Url(encodedSignature),
      encoder.encode(encodedPayload),
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload)));
    if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function phraseWords(value) {
  return value.toLowerCase().match(/[a-z]+/g) || [];
}

function containsWordSequence(source, sequence) {
  if (sequence.length === 0 || source.length < sequence.length) return false;
  for (let start = 0; start <= source.length - sequence.length; start += 1) {
    if (sequence.every((word, offset) => source[start + offset] === word)) return true;
  }
  return false;
}

function metaContent(html, attributeName, attributeValue) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of metaTags) {
    const attributes = {};
    const attributePattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let match;

    while ((match = attributePattern.exec(tag))) {
      attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? "";
    }

    if (
      attributes[attributeName]?.toLowerCase() === attributeValue.toLowerCase()
    ) {
      return attributes.content || "";
    }
  }

  return "";
}

async function getPublicProfileBio(userId) {
  const profileUrl = `https://www.roblox.com/users/${encodeURIComponent(userId)}/profile`;
  const response = await fetch(profileUrl, {
    cache: "no-store",
    redirect: "follow",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
  });

  if (response.status === 404) {
    return { error: "Roblox user not found.", status: 404 };
  }
  if (!response.ok) {
    return { error: "Roblox is unavailable right now.", status: 502 };
  }

  const html = await response.text();
  const description =
    metaContent(html, "name", "description") ||
    metaContent(html, "property", "og:description");

  if (!description) {
    return {
      error: "The public Roblox profile bio could not be loaded.",
      status: 502,
    };
  }

  return { description, profileUrl };
}

async function getRobloxProfile(userId) {
  const response = await fetch(
    `https://users.roblox.com/v1/users/${encodeURIComponent(userId)}`,
    { headers: { accept: "application/json" } },
  );
  if (!response.ok) throw new Error("Roblox is unavailable right now.");
  const profile = await response.json();
  if (String(profile.id) !== userId) {
    throw new Error("Roblox returned an invalid profile.");
  }
  return profile;
}

async function getRobloxAvatar(userId) {
  const response = await fetch(
    "https://thumbnails.roblox.com/v1/users/avatar-headshot?" +
      new URLSearchParams({
        userIds: String(userId),
        size: "180x180",
        format: "Webp",
        isCircular: "false",
      }),
  );
  if (!response.ok) throw new Error("Roblox avatar could not be loaded.");
  const payload = await response.json();
  const avatarUrl = payload.data?.[0]?.imageUrl;
  if (!avatarUrl) throw new Error("Roblox avatar is still processing.");
  return avatarUrl;
}

async function getRobloxUser(request) {
  const url = new URL(request.url);
  const username = (url.searchParams.get("username") || "").trim();
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return json({ error: "Enter a valid Roblox username." }, 400);
  }

  const userResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
  });
  if (!userResponse.ok) return json({ error: "Roblox is unavailable right now." }, 502);
  const user = (await userResponse.json()).data?.[0];
  if (!user) return json({ error: "Roblox user not found." }, 404);

  try {
    return json({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      avatarUrl: await getRobloxAvatar(user.id),
    });
  } catch (error) {
    return json({ error: error.message }, 502);
  }
}

async function getVerificationPhrase(request, env) {
  const secret = authSecret(env);
  if (!secret) return json({ error: "Secure sign-in is not configured." }, 503);

  const url = new URL(request.url);
  const userId = (url.searchParams.get("userId") || "").trim();
  if (!/^\d+$/.test(userId)) {
    return json({ error: "A valid Roblox user ID is required." }, 400);
  }

  const phrase = createVerificationPhrase();
  const now = Math.floor(Date.now() / 1000);
  const challenge = await createSignedToken(
    { type: "roblox-bio", userId, phrase, iat: now, exp: now + challengeLifetimeSeconds },
    secret,
  );
  return json({ userId, phrase, challenge, wordCount: 17 });
}

function supabaseSettings(env) {
  const url = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && serviceKey ? { url, serviceKey } : null;
}

async function supabaseRequest(env, path, init = {}) {
  const settings = supabaseSettings(env);
  if (!settings) throw new Error("Secure account storage is not configured.");
  return fetch(`${settings.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: settings.serviceKey,
      Authorization: `Bearer ${settings.serviceKey}`,
      ...init.headers,
    },
  });
}

async function upsertMM2WildUser(env, profile, avatarUrl) {
  const response = await supabaseRequest(
    env,
    "mm2wild_users?on_conflict=roblox_user_id",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        roblox_user_id: Number(profile.id),
        username: profile.name,
        avatar_headshot: avatarUrl,
      }),
    },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(payload) || !payload[0]) {
    throw new Error(payload?.message || "Your account could not be saved.");
  }
  return payload[0];
}

async function verifyRobloxBio(request, env) {
  const secret = authSecret(env);
  if (!secret) return json({ error: "Secure sign-in is not configured." }, 503);

  const body = await request.json().catch(() => null);
  const userId = String(body?.userId || "").trim();
  const phrase = String(body?.phrase || "").trim();
  const challengeToken = String(body?.challenge || "").trim();
  const words = phraseWords(phrase);
  if (!/^\d+$/.test(userId)) return json({ error: "A valid Roblox user ID is required." }, 400);
  if (words.length !== 17 || words.some((word) => !verificationWords.includes(word))) {
    return json({ error: "The verification phrase is invalid." }, 400);
  }

  const challenge = await verifySignedToken(challengeToken, secret);
  if (
    challenge?.type !== "roblox-bio" ||
    challenge.userId !== userId ||
    challenge.phrase !== phrase
  ) {
    return json({ error: "The verification phrase has expired. Please try again." }, 400);
  }

  const publicProfile = await getPublicProfileBio(userId);
  if (!publicProfile.description) {
    return json({ error: publicProfile.error }, publicProfile.status);
  }
  if (!containsWordSequence(phraseWords(publicProfile.description), words)) {
    return json({ error: "Your Roblox bio doesn't match the verification phrase." }, 409);
  }

  try {
    const profile = await getRobloxProfile(userId);
    const account = await upsertMM2WildUser(env, profile, await getRobloxAvatar(profile.id));
    const now = Math.floor(Date.now() / 1000);
    const session = await createSignedToken(
      { type: "session", uuid: account.uuid, robloxUserId: String(profile.id), iat: now, exp: now + sessionLifetimeSeconds },
      secret,
    );
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    return json(
      { verified: true, user: account },
      200,
      {
        "set-cookie": `mm2wild_session=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetimeSeconds}${secure}`,
      },
    );
  } catch (error) {
    return json({ error: error.message || "Your account could not be saved." }, 503);
  }
}

function cookieValue(request, name) {
  const cookies = request.headers.get("cookie") || "";
  for (const cookie of cookies.split(";")) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return value.join("=");
  }
  return "";
}

function missingSession(request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return json(
    { error: "The login session could not be found" },
    401,
    {
      "set-cookie": `mm2wild_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`,
    },
  );
}

async function resolveSessionUser(sessionCookie, env) {
  if (!sessionCookie) return null;
  const secret = authSecret(env);
  if (!secret) return null;
  const session = await verifySignedToken(sessionCookie, secret);
  if (session?.type !== "session" || !session.uuid) return null;

  try {
    const query = new URLSearchParams({ uuid: `eq.${session.uuid}`, select: "*", limit: "1" });
    const response = await supabaseRequest(env, `mm2wild_users?${query}`);
    const rows = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(rows) || !rows[0]) return null;
    if (String(rows[0].roblox_user_id) !== session.robloxUserId) return null;
    return rows[0];
  } catch {
    return null;
  }
}

async function getSession(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);
  return json({ user });
}

function formatAffiliate(row) {
  return {
    id: row.id,
    code: row.code,
    commissionRate: Number(row.commission_rate || 0),
    availableEarnings: Number(row.available_earnings || 0),
    totalEarned: Number(row.total_earned || 0),
    totalWagered: Number(row.total_wagered || 0),
    activeUsers: Number(row.active_users || 0),
    totalUsers: Number(row.total_users || 0),
    createdAt: row.created_at,
  };
}

async function getAffiliate(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);

  const query = new URLSearchParams({
    user_uuid: `eq.${user.uuid}`,
    select: "id,code,commission_rate,available_earnings,total_earned,total_wagered,active_users,total_users,created_at",
    limit: "1",
  });
  const response = await supabaseRequest(env, `mm2wild_affiliates?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) {
    return json({ error: "Could not load your affiliate account." }, 503);
  }

  return json({ affiliate: rows[0] ? formatAffiliate(rows[0]) : null });
}

async function createAffiliate(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);

  const body = await request.json().catch(() => null);
  const code = String(body?.code || "").trim().toLowerCase();
  if (!/^[a-z0-9_-]{3,24}$/.test(code)) {
    return json({ error: "Use 3 to 24 letters, numbers, underscores, or hyphens." }, 400);
  }

  const existingQuery = new URLSearchParams({
    user_uuid: `eq.${user.uuid}`,
    select: "id,code,commission_rate,available_earnings,total_earned,total_wagered,active_users,total_users,created_at",
    limit: "1",
  });
  const existingResponse = await supabaseRequest(env, `mm2wild_affiliates?${existingQuery}`);
  const existingRows = await existingResponse.json().catch(() => null);
  if (!existingResponse.ok || !Array.isArray(existingRows)) {
    return json({ error: "Could not check your affiliate account." }, 503);
  }
  if (existingRows[0]) return json({ affiliate: formatAffiliate(existingRows[0]) });

  const response = await supabaseRequest(env, "mm2wild_affiliates", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ user_uuid: user.uuid, code }),
  });
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows) || !rows[0]) {
    if (response.status === 409 || rows?.code === "23505") {
      return json({ error: "That affiliate code is already taken." }, 409);
    }
    return json({ error: rows?.message || "Your affiliate code could not be saved." }, 503);
  }

  return json({ affiliate: formatAffiliate(rows[0]) }, 201);
}

async function sendUserTip(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const sender = await resolveSessionUser(sessionCookie, env);
  if (!sender) return missingSession(request);

  const body = await request.json().catch(() => null);
  const recipientUsername = String(body?.username || "").trim();
  const amountText = String(body?.amount || "").trim();
  const balanceType = body?.balanceType === "crypto" ? "crypto" : "mm2";
  const showInChat = body?.showInChat !== false;

  if (!/^[A-Za-z0-9_]{3,20}$/.test(recipientUsername)) {
    return json({ error: "Enter a valid username." }, 400);
  }
  const decimalPlaces = balanceType === "crypto" ? 8 : 2;
  const amountPattern = new RegExp(`^\\d+(?:\\.\\d{1,${decimalPlaces}})?$`);
  if (!amountPattern.test(amountText) || Number(amountText) <= 0) {
    return json({ error: `Enter a valid amount with no more than ${decimalPlaces} decimal places.` }, 400);
  }

  try {
    const tip = await transferUserTip(
      env,
      sender.uuid,
      recipientUsername,
      balanceType,
      Number(amountText),
      showInChat,
    );
    if (showInChat) {
      const announcement = {
        sender: sender.username,
        recipient: tip.recipient_username,
        amount: Number(tip.amount).toLocaleString("en-US", {
          maximumFractionDigits: tip.balance_type === "crypto" ? 8 : 2,
        }),
        balanceType: tip.balance_type,
      };
      if (typeof env.CHAT_ANNOUNCE === "function") {
        env.CHAT_ANNOUNCE(announcement);
      } else if (env.CHAT_ROOM) {
        const roomId = env.CHAT_ROOM.idFromName("global");
        await env.CHAT_ROOM.get(roomId).fetch("https://mm2wild.internal/internal/tip-announcement", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(announcement),
        });
      }
    }
    return json({ tip });
  } catch (error) {
    const message = error.message || "The tip could not be sent.";
    const status = message === "User not found." ? 404 : 409;
    return json({ error: message }, status);
  }
}

export { resolveSessionUser };

export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.history = [];
    this.sessions = new Set();
    this.clientSockets = new Map();
    this.rain = createRainState({ store: createSupabaseRainStore(env) });
    this.rainInterval = null;
    this.roulette = createRouletteState({ env });
    this.rouletteStarted = false;
  }

  async broadcastRain() {
    await this.rain.tick();
    this.broadcast(formatRainState(this.rain));
  }

  startRainInterval() {
    if (this.rainInterval) return;
    this.rainInterval = setInterval(() => {
      if (this.sessions.size === 0) {
        clearInterval(this.rainInterval);
        this.rainInterval = null;
        return;
      }
      void this.broadcastRain();
    }, 1000);
  }

  announceUserTip({ sender, recipient, amount, balanceType }) {
    const tipMessage = {
      type: "chat",
      name: "Tip Bot",
      body: `${sender} tipped ${recipient} ${amount} ${balanceType === "crypto" ? "crypto" : "MM2"} coins!`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      user: { level: 99, color: "#E5AD4E", avatar: "/coin.webp" },
    };
    this.history.push(tipMessage);
    if (this.history.length > 50) this.history.shift();
    for (const peer of this.sessions) {
      if (peer.readyState === 1) peer.send(JSON.stringify(tipMessage));
    }
  }

  async fetch(request) {
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname === "/internal/tip-announcement" && request.method === "POST") {
      const announcement = await request.json().catch(() => null);
      if (announcement?.sender && announcement?.recipient && announcement?.amount) {
        this.announceUserTip(announcement);
      }
      return json({ announced: true });
    }
    if (request.headers.get("upgrade") !== "websocket") {
      return json({ error: "This route requires a WebSocket connection." }, 426);
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const sessionCookie = (cookieHeader.match(/mm2wild_session=([^;]+)/) || [])[1] || "";
    const account = await resolveSessionUser(sessionCookie, this.env);
    const profile = account
      ? {
          name: account.username,
          rank: account.rank || "user",
          level: account.level ?? 1,
          color: chatColorForLevel(account.level ?? 1),
          avatar: account.avatar_headshot,
        }
      : null;

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const clientId = requestUrl.searchParams.get("clientId")?.slice(0, 128) || crypto.randomUUID();
    const presenceId = requestUrl.searchParams.get("presenceId")?.slice(0, 128) || clientId;
    const previousSocket = this.clientSockets.get(clientId);
    if (previousSocket && previousSocket !== server) {
      this.sessions.delete(previousSocket);
      previousSocket.close(1000, "Replaced by a refreshed connection");
    }
    this.clientSockets.set(clientId, server);
    this.sessions.add(server);

    server.serializeAttachment({ profile, userUuid: account?.uuid || null, presenceId, lastMessageAt: 0 });

    await this.rain.ready();
    server.send(
      JSON.stringify({
        type: "init",
        online: this.onlineCount(),
        messages: this.history,
        you: profile,
        rain: this.rain.state(account?.uuid),
      }),
    );
    this.broadcastPresence();
    this.startRainInterval();

    if (!this.rouletteStarted) {
      this.rouletteStarted = true;
      void this.roulette.start();
    }
    const rouletteState = await this.roulette.ready();
    server.send(JSON.stringify({ ...rouletteState, type: "roulette_init" }));

    const unsubscribeRoulette = this.roulette.subscribe((data, scopeUuid) => {
      if (server.readyState !== 1) return;
      if (scopeUuid && scopeUuid !== account?.uuid) return;
      server.send(data);
    });

    server.addEventListener("message", async (event) => {
      const attachment = server.deserializeAttachment() || {};
      const identity = attachment.profile || profile;
      const userUuid = attachment.userUuid || account?.uuid;

      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!["chat", "rain_tip", "rain_join", "roulette_bet"].includes(payload?.type)) return;

      if (!userUuid || !identity) {
        const action = payload.type === "chat" ? "send messages to the chat" : payload.type === "rain_tip" ? "tip the rain" : payload.type === "rain_join" ? "join the rain" : "place a roulette bet";
        server.send(JSON.stringify({ type: "error", error: `Sign in to ${action}.` }));
        return;
      }

      if (payload.type === "roulette_bet") {
        const result = await this.roulette.placeBet(userUuid, identity.name, payload.color, payload.amount, account?.avatar_headshot);
        if (!result.ok) {
          server.send(JSON.stringify({ type: "roulette_error", error: result.error }));
          return;
        }
        server.send(JSON.stringify({
          type: "roulette_bet_confirmed",
          bet: result.bet,
          balance: result.balance,
        }));
        return;
      }

      if (payload.type === "rain_tip") {
        const result = await this.rain.tip(payload.amount);
        if (!result.ok) {
          server.send(JSON.stringify({ type: "error", error: result.error }));
          return;
        }
        await this.broadcastRain();
        const tipMessage = {
          type: "chat",
          name: "Rain Bot",
          body: `${identity.name} tipped ${payload.amount} coins to the rain pot!`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
          user: { level: 99, color: "#E5AD4E", avatar: "/coin.webp" },
        };
        this.history.push(tipMessage);
        if (this.history.length > 50) this.history.shift();
        for (const peer of this.sessions) {
          if (peer.readyState === 1) peer.send(JSON.stringify(tipMessage));
        }
        return;
      }

      if (payload.type === "rain_join") {
        const result = await this.rain.join(userUuid, identity);
        if (!result.ok) {
          server.send(JSON.stringify({ type: "error", error: result.error }));
          return;
        }
        await this.broadcastRain();
        server.send(JSON.stringify({ type: "rain_joined", rainId: this.rain.state().rainId }));
        return;
      }

      const body = String(payload.body || "").slice(0, 500).trim();
      if (!body) return;
      const replyName = String(payload.reply?.name || "").slice(0, 64).trim();
      const replyBody = String(payload.reply?.body || "").slice(0, 500).trim();
      const repliedMessage = [...this.history]
        .reverse()
        .find((entry) => entry.name === replyName && entry.body === replyBody);
      const reply =
        replyName && replyBody
          ? {
              name: replyName,
              body: replyBody,
              ...(repliedMessage?.user ? { user: repliedMessage.user } : {}),
            }
          : null;

      const now = Date.now();
      if (now - (attachment.lastMessageAt || 0) < 2000) {
        server.send(
          JSON.stringify({
            type: "error",
            error:
              "Slow mode is enabled. Please wait before sending another message",
          }),
        );
        return;
      }
      server.serializeAttachment({ ...attachment, lastMessageAt: now });

      const message = {
        type: "chat",
        name: identity.name,
        body,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        user: identity,
        ...(reply ? { reply } : {}),
      };
      this.history.push(message);
      if (this.history.length > 50) this.history.shift();
      for (const peer of this.sessions) {
        if (peer.readyState === 1) peer.send(JSON.stringify(message));
      }
    });

    server.addEventListener("close", () => {
      if (this.clientSockets.get(clientId) === server) this.clientSockets.delete(clientId);
      if (this.sessions.delete(server)) this.broadcastPresence();
      unsubscribeRoulette();
    });
    server.addEventListener("error", () => {
      if (this.clientSockets.get(clientId) === server) this.clientSockets.delete(clientId);
      if (this.sessions.delete(server)) this.broadcastPresence();
      unsubscribeRoulette();
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  broadcastPresence() {
    const data = JSON.stringify({ type: "presence", online: this.onlineCount() });
    for (const peer of this.sessions) {
      if (peer.readyState === 1) peer.send(data);
    }
  }

  onlineCount() {
    const presenceIds = new Set();
    for (const peer of this.sessions) {
      const attachment = peer.deserializeAttachment?.() || {};
      presenceIds.add(attachment.presenceId || attachment.userUuid || "anonymous");
    }
    return presenceIds.size;
  }
}

async function coinflipRequest(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);

  try {
    const body = await request.json().catch(() => null);
    const action = String(body?.action || "");
    const game = action === "join"
      ? await joinCoinflip(env, user, body?.gameId, body?.itemIds)
      : await createCoinflip(env, user, body?.itemIds, body?.side);
    const refreshedUser = await resolveSessionUser(sessionCookie, env);
    return json({ game, balance: Number(refreshedUser?.mm2_balance || 0) }, action === "join" ? 200 : 201);
  } catch (error) {
    const message = error.message || "The coinflip could not be updated.";
    const status = /invalid|select|choose|outside|own coinflip/i.test(message) ? 400
      : /no longer open|not found/i.test(message) ? 409
      : /insufficient/i.test(message) ? 409
      : 503;
    return json({ error: message }, status);
  }
}

function chatColorForLevel(level) {
  if (level >= 30) return "#F33972";
  if (level >= 20) return "#F36D39";
  return "#BEBEBE";
}


function generateServerSeed() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input) {
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function getActiveFairnessSeed(env, userUuid) {
  const query = new URLSearchParams({
    user_uuid: `eq.${userUuid}`,
    active: "eq.true",
    select: "*",
    limit: "1",
    order: "created_at.desc",
  });
  const response = await supabaseRequest(env, `mm2wild_fairness?${query}`);
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows)) {
    throw new Error("Could not load fairness data.");
  }
  return rows[0] || null;
}

async function createFairnessSeed(env, userUuid, clientSeed = "") {
  const serverSeed = generateServerSeed();
  const serverSeedHash = await sha256Hex(serverSeed);
  const response = await supabaseRequest(
    env,
    "mm2wild_fairness",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_uuid: userUuid,
        server_seed: serverSeed,
        server_seed_hash: serverSeedHash,
        client_seed: clientSeed,
      }),
    },
  );
  const rows = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(rows) || !rows[0]) {
    throw new Error("Could not create a new fairness seed.");
  }
  return rows[0];
}

async function getFairness(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);

  try {
    let seed = await getActiveFairnessSeed(env, user.uuid);
    if (!seed) seed = await createFairnessSeed(env, user.uuid);

    const prevQuery = new URLSearchParams({
      user_uuid: `eq.${user.uuid}`,
      active: "eq.false",
      select: "server_seed,server_seed_hash,client_seed,games_played,rotated_at",
      limit: "1",
      order: "rotated_at.desc",
    });
    const prevResponse = await supabaseRequest(env, `mm2wild_fairness?${prevQuery}`);
    const prevRows = await prevResponse.json().catch(() => null);
    const previousSeed = prevRows?.[0] || null;

    return json({
      serverSeedHash: seed.server_seed_hash,
      clientSeed: seed.client_seed,
      gamesPlayed: seed.games_played,
      previousSeed: previousSeed
        ? {
            serverSeed: previousSeed.server_seed,
            serverSeedHash: previousSeed.server_seed_hash,
            clientSeed: previousSeed.client_seed,
            gamesPlayed: previousSeed.games_played,
          }
        : null,
    });
  } catch (error) {
    return json({ error: error.message }, 503);
  }
}

async function updateClientSeed(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);

  const body = await request.json().catch(() => null);
  const clientSeed = String(body?.clientSeed || "").trim();
  if (clientSeed.length < 4 || clientSeed.length > 64) {
    return json({ error: "Client seed must be 4-64 characters." }, 400);
  }
  if (!/^[A-Za-z0-9_-]+$/.test(clientSeed)) {
    return json({ error: "Client seed may only contain letters, numbers, hyphens and underscores." }, 400);
  }

  try {
    let seed = await getActiveFairnessSeed(env, user.uuid);
    if (!seed) seed = await createFairnessSeed(env, user.uuid, clientSeed);

    const patchQuery = new URLSearchParams({ id: `eq.${seed.id}`, select: "*" });
    const response = await supabaseRequest(
      env,
      `mm2wild_fairness?${patchQuery}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({ client_seed: clientSeed }),
      },
    );
    const rows = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(rows) || !rows[0]) {
      throw new Error("Could not update the client seed.");
    }
    return json({
      serverSeedHash: rows[0].server_seed_hash,
      clientSeed: rows[0].client_seed,
      gamesPlayed: rows[0].games_played,
    });
  } catch (error) {
    return json({ error: error.message }, 503);
  }
}

async function rotateServerSeed(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);

  try {
    let current = await getActiveFairnessSeed(env, user.uuid);
    if (!current) current = await createFairnessSeed(env, user.uuid);

    const deactivateQuery = new URLSearchParams({ id: `eq.${current.id}` });
    await supabaseRequest(
      env,
      `mm2wild_fairness?${deactivateQuery}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ active: false, rotated_at: new Date().toISOString() }),
      },
    );

    const newSeed = await createFairnessSeed(env, user.uuid, current.client_seed);

    return json({
      previousSeed: {
        serverSeed: current.server_seed,
        serverSeedHash: current.server_seed_hash,
        clientSeed: current.client_seed,
        gamesPlayed: current.games_played,
      },
      serverSeedHash: newSeed.server_seed_hash,
      clientSeed: newSeed.client_seed,
      gamesPlayed: newSeed.games_played,
    });
  } catch (error) {
    return json({ error: error.message }, 503);
  }
}


const VALID_GAME_FILTERS = ["all", "mines", "plinko", "battles", "coinflip", "roulette", "cases", "upgrader"];


const VALID_METHOD_FILTERS = ["all", "rakeback", "mm2_deposit", "mm2_withdraw", "crypto_deposit", "crypto_withdraw", "tip_sent", "tip_received", "affiliate"];


async function getSessions(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get("perPage") || "10", 10) || 10));
  const offset = (page - 1) * perPage;

  const filterStr = `user_uuid=eq.${user.uuid}`;
  const dataQuery = `${filterStr}&select=id,browser,os,ip_address,country_code,country_name,is_current,last_active&order=last_active.desc&limit=${perPage}&offset=${offset}`;
  const countQuery = `${filterStr}&select=id`;

  const [dataResponse, countResponse] = await Promise.all([
    supabaseRequest(env, `mm2wild_sessions?${dataQuery}`),
    supabaseRequest(env, `mm2wild_sessions?${countQuery}`, {
      headers: { Prefer: "count=exact", Range: "0-0" },
    }),
  ]);

  const rows = await dataResponse.json().catch(() => null);
  if (!dataResponse.ok || !Array.isArray(rows)) {
    return json({ error: "Could not load sessions." }, 503);
  }

  const total = parseInt(countResponse.headers.get("content-range")?.split("/")[1] || "0", 10) || 0;

  return json({
    sessions: rows.map((row) => ({
      id: row.id,
      browser: row.browser,
      os: row.os,
      ipAddress: row.ip_address,
      countryCode: row.country_code,
      countryName: row.country_name,
      isCurrent: row.is_current,
      lastActive: row.last_active,
    })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
}

async function getTransactionHistory(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);

  const url = new URL(request.url);
  const method = (url.searchParams.get("method") || "all").trim();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get("perPage") || "10", 10) || 10));
  const offset = (page - 1) * perPage;

  const filters = [`user_uuid=eq.${user.uuid}`];
  if (method !== "all" && VALID_METHOD_FILTERS.includes(method)) {
    filters.push(`method=eq.${method}`);
  }

  const filterStr = filters.join("&");
  const dataQuery = `${filterStr}&select=id,method,status,amount,created_at&order=created_at.desc&limit=${perPage}&offset=${offset}`;
  const countQuery = `${filterStr}&select=id`;

  const [dataResponse, countResponse] = await Promise.all([
    supabaseRequest(env, `mm2wild_transactions?${dataQuery}`),
    supabaseRequest(env, `mm2wild_transactions?${countQuery}`, {
      headers: { Prefer: "count=exact", Range: "0-0" },
    }),
  ]);

  const rows = await dataResponse.json().catch(() => null);
  if (!dataResponse.ok || !Array.isArray(rows)) {
    return json({ error: "Could not load transaction history." }, 503);
  }

  const total = parseInt(countResponse.headers.get("content-range")?.split("/")[1] || "0", 10) || 0;

  return json({
    transactions: rows.map((row) => ({
      id: row.id,
      method: row.method,
      status: row.status,
      amount: Number(row.amount || 0),
      date: row.created_at,
    })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
}

async function getBetHistory(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  const user = await resolveSessionUser(sessionCookie, env);
  if (!user) return missingSession(request);

  const url = new URL(request.url);
  const game = (url.searchParams.get("game") || "all").trim();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get("perPage") || "10", 10) || 10));
  const offset = (page - 1) * perPage;

  const filters = [`user_uuid=eq.${user.uuid}`];
  if (game !== "all" && VALID_GAME_FILTERS.includes(game)) {
    filters.push(`game=eq.${game}`);
  }

  const query = new URLSearchParams({
    [filters.join("&")]: "",
    select: "id,game,status,amount,profit,multiplier,created_at",
    order: "created_at.desc",
    limit: String(perPage),
    offset: String(offset),
  });


  const filterStr = filters.join("&");
  const dataQuery = `${filterStr}&select=id,game,status,amount,profit,multiplier,created_at&order=created_at.desc&limit=${perPage}&offset=${offset}`;
  const countQuery = `${filterStr}&select=id`;

  const [dataResponse, countResponse] = await Promise.all([
    supabaseRequest(env, `mm2wild_bets?${dataQuery}`),
    supabaseRequest(env, `mm2wild_bets?${countQuery}`, {
      headers: { Prefer: "count=exact", Range: "0-0" },
    }),
  ]);

  const rows = await dataResponse.json().catch(() => null);
  if (!dataResponse.ok || !Array.isArray(rows)) {
    return json({ error: "Could not load bet history." }, 503);
  }

  const total = parseInt(countResponse.headers.get("content-range")?.split("/")[1] || "0", 10) || 0;

  return json({
    bets: rows.map((row) => ({
      id: row.id,
      game: row.game,
      status: row.status,
      amount: Number(row.amount || 0),
      profit: Number(row.profit || 0),
      multiplier: Number(row.multiplier || 0),
      date: row.created_at,
    })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      const id = env.CHAT_ROOM.idFromName("global");
      return env.CHAT_ROOM.get(id).fetch(request);
    }

    if (url.pathname === "/api/roblox-user" && request.method === "GET") {
      try {
        return await getRobloxUser(request);
      } catch {
        return json({ error: "Roblox is unavailable right now." }, 502);
      }
    }
    if (url.pathname === "/api/verification-phrase" && request.method === "GET") {
      return getVerificationPhrase(request, env);
    }
    if (url.pathname === "/api/verify-roblox-bio" && request.method === "POST") {
      try {
        return await verifyRobloxBio(request, env);
      } catch {
        return json({ error: "The verification request could not be completed." }, 500);
      }
    }
    if (url.pathname === "/api/session" && request.method === "GET") {
      return getSession(request, env);
    }
    if (url.pathname === "/api/coinflip" && request.method === "GET") {
      try {
        return json({ games: await listCoinflips(env, { limit: url.searchParams.get("limit") }) });
      } catch (error) {
        return json({ error: error.message || "Could not load coinflips." }, 503);
      }
    }
    if (url.pathname === "/api/coinflip/items" && request.method === "GET") {
      try {
        return json({ items: await listCoinflipItems(env) });
      } catch (error) {
        return json({ error: error.message || "Could not load items." }, 503);
      }
    }
    if (url.pathname === "/api/coinflip" && request.method === "POST") {
      return coinflipRequest(request, env);
    }
    if (url.pathname === "/api/tips" && request.method === "POST") {
      return sendUserTip(request, env);
    }
    if (url.pathname === "/api/affiliates" && request.method === "GET") {
      try {
        return await getAffiliate(request, env);
      } catch (error) {
        return json({ error: error.message || "Could not load your affiliate account." }, 503);
      }
    }
    if (url.pathname === "/api/affiliates" && request.method === "POST") {
      try {
        return await createAffiliate(request, env);
      } catch (error) {
        return json({ error: error.message || "Your affiliate code could not be saved." }, 503);
      }
    }
    if (url.pathname === "/api/fairness" && request.method === "GET") {
      return getFairness(request, env);
    }
    if (url.pathname === "/api/fairness/client-seed" && request.method === "POST") {
      try {
        return await updateClientSeed(request, env);
      } catch {
        return json({ error: "The client seed could not be updated." }, 500);
      }
    }
    if (url.pathname === "/api/fairness/rotate" && request.method === "POST") {
      try {
        return await rotateServerSeed(request, env);
      } catch {
        return json({ error: "The server seed could not be rotated." }, 500);
      }
    }
    if (url.pathname === "/api/bets" && request.method === "GET") {
      return getBetHistory(request, env);
    }
    if (url.pathname === "/api/transactions" && request.method === "GET") {
      return getTransactionHistory(request, env);
    }
    if (url.pathname === "/api/sessions" && request.method === "GET") {
      return getSessions(request, env);
    }
    if (url.pathname.startsWith("/api/")) return json({ error: "API route not found." }, 404);
    return env.ASSETS.fetch(request);
  },
};
