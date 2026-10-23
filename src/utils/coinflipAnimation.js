export const COINFLIP_COUNTDOWN_MS = 3000;
export const COINFLIP_FLIP_MS = 2200;

function deterministicStartSide(gameId) {
  let hash = 2166136261;
  for (const character of String(gameId || "")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296 < 0.5 ? "heads" : "tails";
}

export function coinflipAnimationAsset(game) {
  if (!game?.winnerSide) return null;
  return `${deterministicStartSide(game.id)[0]}2${game.winnerSide[0]}`;
}
