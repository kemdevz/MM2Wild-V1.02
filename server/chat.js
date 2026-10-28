
import { WebSocketServer } from "ws";
import { createRainState, createSupabaseRainStore, formatRainState } from "./rain.js";
import { createRouletteState } from "./roulette.js";
import { subscribeToSupabaseChanges } from "./supabaseRealtime.js";

const HISTORY_LIMIT = 50;
const MAX_BODY_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 2000;


function colorForLevel(level) {
  if (level >= 30) return "#F33972";
  if (level >= 20) return "#F36D39";
  return "#BEBEBE";
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function safeString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.slice(0, maxLength);
}


async function resolveUser(cookieHeader, verifySession) {
  if (!cookieHeader || typeof verifySession !== "function") return null;
  const match = cookieHeader.match(/mm2wild_session=([^;]+)/);
  if (!match) return null;
  try {
    const session = await verifySession(match[1]);
    if (!session) return null;
    return {
      uuid: session.uuid,
      name: session.username || `User ${session.robloxUserId}`,
      rank: session.rank || "user",
      level: session.level ?? 1,
      xp: session.xp ?? 0,
      avatar: session.avatar_headshot,
    };
  } catch {
    return null;
  }
}

function profileFor(user) {
  if (!user) return null;
  return {
    rank: user.rank || "user",
    level: user.level ?? 1,
    xp: user.xp ?? 0,
    color: colorForLevel(user.level ?? 1),
    avatar: user.avatar,
  };
}

export function attachChatServer(httpServer, options = {}) {
  const verifySession = options.verifySession;
  const wss = new WebSocketServer({
    noServer: true,
    path: "/api/chat",
  });

  const history = [];
  const clients = new Set();
  const clientSockets = new Map();
  const clientPresenceIds = new Map();
  const rain = createRainState({ store: createSupabaseRainStore(options.env) });
  let rainInterval = null;
  const roulette = createRouletteState({ env: options.env });
  let rouletteStarted = false;

  async function broadcastRain() {
    await rain.tick();
    broadcast(formatRainState(rain));
  }

  function broadcast(payload) {
    const data = JSON.stringify(payload);
    for (const client of clients) {
      if (client.readyState === client.OPEN) client.send(data);
    }
  }

  function broadcastPresence() {
    broadcast({ type: "presence", online: new Set(clientPresenceIds.values()).size });
  }

  function recordMessage(message) {
    history.push(message);
    if (history.length > HISTORY_LIMIT) history.shift();
  }

  function announceUserTip({ sender, recipient, amount, balanceType }) {
    const tipMessage = {
      type: "user-tip",
      sender,
      recipient,
      amount,
      balanceType,
    };
    recordMessage(tipMessage);
    broadcast(tipMessage);
  }

  subscribeToSupabaseChanges(options.env, broadcast);

  async function handleConnection(socket, user, clientId, presenceId) {
    const profile = profileFor(user);
    const identity = user ? { name: user.name, ...profile } : null;

    const previousSocket = clientSockets.get(clientId);
    if (previousSocket && previousSocket !== socket) {
      clients.delete(previousSocket);
      clientPresenceIds.delete(previousSocket);
      previousSocket.close(1000, "Replaced by a refreshed connection");
    }
    clientSockets.set(clientId, socket);
    clients.add(socket);
    clientPresenceIds.set(socket, presenceId);

    await rain.ready();
    socket.send(
      JSON.stringify({
        type: "init",
        online: new Set(clientPresenceIds.values()).size,
        messages: history,
        you: identity,
        rain: rain.state(user?.uuid),
      }),
    );
    broadcastPresence();

    if (!rouletteStarted) {
      rouletteStarted = true;
      void roulette.start();
    }
    const rouletteState = await roulette.ready();
    socket.send(JSON.stringify({ ...rouletteState, type: "roulette_init" }));

    const unsubscribeRoulette = roulette.subscribe((data, scopeUuid) => {
      if (socket.readyState !== socket.OPEN) return;
      if (scopeUuid && scopeUuid !== user?.uuid) return;
      socket.send(data);
    });


    if (!rainInterval) {
      rainInterval = setInterval(() => {
        if (clients.size === 0) {
          clearInterval(rainInterval);
          rainInterval = null;
          return;
        }
        void broadcastRain();
      }, 1000);
    }

    let lastMessageAt = 0;

    socket.on("message", async (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (!["chat", "rain_tip", "rain_join", "roulette_bet"].includes(payload?.type)) return;

      if (!identity) {
        const action = payload.type === "chat" ? "send messages to the chat" : payload.type === "rain_tip" ? "tip the rain" : payload.type === "rain_join" ? "join the rain" : "place a roulette bet";
        socket.send(JSON.stringify({ type: "error", error: `Sign in to ${action}.` }));
        return;
      }

      if (payload.type === "roulette_bet") {
        const result = await roulette.placeBet(user.uuid, identity.name, payload.color, payload.amount, user.avatar);
        if (!result.ok) {
          socket.send(JSON.stringify({ type: "roulette_error", error: result.error }));
          return;
        }
        socket.send(JSON.stringify({
          type: "roulette_bet_confirmed",
          bet: result.bet,
          balance: result.balance,
        }));
        return;
      }

      if (payload.type === "rain_tip") {
        const result = await rain.tip(payload.amount);
        if (!result.ok) {
          socket.send(JSON.stringify({ type: "error", error: result.error }));
          return;
        }
        await broadcastRain();
        const tipMessage = {
          type: "rain-tip",
          sender: identity,
          amount: Math.max(0, Math.round(Number(payload.amount) || 0)),
        };
        recordMessage(tipMessage);
        broadcast(tipMessage);
        return;
      }

      if (payload.type === "rain_join") {
        const result = await rain.join(user.uuid, identity);
        if (!result.ok) {
          socket.send(JSON.stringify({ type: "error", error: result.error }));
          return;
        }
        await broadcastRain();
        socket.send(JSON.stringify({ type: "rain_joined", rainId: rain.state().rainId }));
        return;
      }

      const body = safeString(payload.body, MAX_BODY_LENGTH).trim();
      if (!body) return;
      const replyName = safeString(payload.reply?.name, 64).trim();
      const replyBody = safeString(payload.reply?.body, MAX_BODY_LENGTH).trim();
      const repliedMessage = [...history]
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
      if (now - lastMessageAt < RATE_LIMIT_WINDOW_MS) {
        socket.send(
          JSON.stringify({
            type: "error",
            error:
              "Slow mode is enabled. Please wait before sending another message",
          }),
        );
        return;
      }
      lastMessageAt = now;

      const message = {
        type: "chat",
        name: identity.name,
        body,
        time: nowTime(),
        user: profile,
        ...(reply ? { reply } : {}),
      };
      recordMessage(message);
      broadcast(message);
    });

    socket.on("close", () => {
      if (clientSockets.get(clientId) === socket) clientSockets.delete(clientId);
      clientPresenceIds.delete(socket);
      if (clients.delete(socket)) broadcastPresence();
      unsubscribeRoulette();
    });
    socket.on("error", () => {
      if (clientSockets.get(clientId) === socket) clientSockets.delete(clientId);
      clientPresenceIds.delete(socket);
      if (clients.delete(socket)) broadcastPresence();
      unsubscribeRoulette();
    });
  }

  httpServer.on("upgrade", (request, socket, head) => {
    const requestUrl = new URL(request.url, "http://localhost");
    if (requestUrl.pathname !== "/api/chat") return;

    wss.handleUpgrade(request, socket, head, async (ws) => {
      const cookieHeader = request.headers.cookie || "";
      const user = await resolveUser(cookieHeader, verifySession);
      const clientId = requestUrl.searchParams.get("clientId")?.slice(0, 128) || crypto.randomUUID();
      const presenceId = requestUrl.searchParams.get("presenceId")?.slice(0, 128) || clientId;
      await handleConnection(ws, user, clientId, presenceId);
    });
  });

  return { wss, rain, announceUserTip };
}
