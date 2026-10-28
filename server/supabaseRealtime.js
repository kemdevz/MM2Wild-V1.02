import { createClient } from "@supabase/supabase-js";

let realtimeClient = null;
let realtimeChannel = null;
const listeners = new Set();

function settings(env) {
  const url = String(env?.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const serviceKey = String(env?.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return url && serviceKey ? { url, serviceKey } : null;
}

export function subscribeToSupabaseChanges(env, listener) {
  if (typeof listener !== "function") return () => {};
  listeners.add(listener);

  const config = settings(env);
  if (!config || realtimeChannel) {
    return () => listeners.delete(listener);
  }

  realtimeClient = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 20 } },
  });

  realtimeChannel = realtimeClient
    .channel("mm2wild-site-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public" },
      (payload) => {
        const change = {
          type: "supabase_change",
          table: String(payload.table || ""),
          eventType: String(payload.eventType || "").toUpperCase(),
          commitTimestamp: payload.commit_timestamp || new Date().toISOString(),
        };
        for (const notify of listeners) notify(change);
      },
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.warn(`Supabase realtime channel status: ${status}`);
      }
    });

  return () => listeners.delete(listener);
}
