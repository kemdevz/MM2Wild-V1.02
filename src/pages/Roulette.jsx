import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import TripleGreenJackpotModal from "../components/TripleGreenJackpotModal";
import RouletteResultModal from "../components/RouletteResultModal";
const COLORS = [
  { id: "blue", label: "BLUE", multiplier: 2, gradient: "radial-gradient(50% 50%, rgb(91, 119, 246) 0%, rgb(65, 81, 218) 100%)", linearGradient: "linear-gradient(90deg, rgb(91, 119, 246) 0%, rgb(65, 81, 218) 100%)", shadow: "rgb(11, 36, 146)", text: "#7CB0FF", rgb: "91,119,246" },
  { id: "green", label: "GREEN", multiplier: 14, gradient: "radial-gradient(50% 50%, rgb(92, 223, 154) 0%, rgb(15, 195, 101) 100%)", linearGradient: "linear-gradient(90deg, rgb(92, 223, 154) 0%, rgb(15, 195, 101) 100%)", shadow: "rgb(11, 146, 76)", text: "#5CDF9A", rgb: "92,223,154" },
  { id: "gold", label: "GOLD", multiplier: 2, gradient: "radial-gradient(50% 50%, rgb(255, 216, 150) 0%, rgb(229, 173, 78) 100%)", linearGradient: "linear-gradient(90deg, rgb(255, 216, 150) 0%, rgb(229, 173, 78) 100%)", shadow: "rgb(201, 147, 55)", text: "#FFD896", rgb: "255,216,150" },
  { id: "purple", label: "PURPLE", multiplier: 7, gradient: "radial-gradient(50% 50%, rgb(223, 112, 233) 0%, rgb(193, 33, 233) 100%)", linearGradient: "linear-gradient(90deg, rgb(223, 112, 233) 0%, rgb(193, 33, 233) 100%)", shadow: "rgb(143, 44, 167)", text: "#DF70E9", rgb: "223,112,233" },
];

const COLOR_ICON = {
  blue: "character",
  green: "clover",
  gold: "person",
  purple: "crown",
};

const REEL_PATTERN = [
  { color: "green", icon: "clover" },
  { color: "gold", icon: "crown" },
  { color: "blue", icon: "character" },
  { color: "gold", icon: "person" },
  { color: "blue", icon: "character" },
  { color: "purple", icon: "crown" },
  { color: "blue", icon: "character" },
  { color: "gold", icon: "person" },
  { color: "blue", icon: "character" },
  { color: "gold", icon: "person" },
  { color: "blue", icon: "character" },
  { color: "gold", icon: "person" },
  { color: "blue", icon: "character" },
  { color: "gold", icon: "person" },
  { color: "blue", icon: "crown" },
];

const ITEM_BOX_SHADOW =
  "rgba(0, 0, 0, 0.25) 0px -4px 0px inset, rgba(255, 255, 255, 0.25) 0px 2.5px 0px inset";

const BETTING_DURATION_MS = 20_000;
const SPINNING_DURATION_MS = 5_000;
const WAITING_DURATION_MS = 2_000;
const MINING_BLOCK_DISPLAY_MS = 3_000;

const ICON_PATHS = {
  clover: (
    <>
      <path fill="currentColor" fillRule="evenodd" d="M11.274 7.122c.351-.829 1.189-1.364 2.133-1.364 1.267 0 2.297.972 2.297 2.168 0 .831-.513 1.6-1.308 1.958a.58.58 0 0 0-.326.716c.115.333.172.68.172 1.033 0 1.848-1.592 3.352-3.55 3.352-1.957 0-3.55-1.504-3.55-3.352 0-.353.058-.7.172-1.033a.58.58 0 0 0-.326-.716C6.194 9.526 5.68 8.757 5.68 7.926c0-1.196 1.03-2.168 2.297-2.168.945 0 1.782.535 2.134 1.364a.627.627 0 0 0 .581.372.627.627 0 0 0 .582-.372Zm-3.297 1.79c.346 0 .627-.265.627-.591v-.789c0-.327-.28-.591-.627-.591-.346 0-.626.264-.626.591v.789c0 .326.28.591.626.591Zm3.342 2.966.86-.813a.568.568 0 0 0 0-.836.653.653 0 0 0-.886 0l-.6.568-.602-.568a.653.653 0 0 0-.886 0 .568.568 0 0 0 0 .837l.86.812v1.332c0 .327.281.592.627.592s.627-.265.627-.592v-1.332Zm2.088-2.966c.346 0 .627-.265.627-.591v-.789c0-.327-.28-.591-.627-.591-.346 0-.626.264-.626.591v.789c0 .326.28.591.626.591Z" clipRule="evenodd" />
      <path fill="currentColor" fillRule="evenodd" d="M20.998 3.436a.592.592 0 0 1 .387.547v.788c0 1.068-.387 2.193-1 3.057a.926.926 0 0 0 .093-.037.659.659 0 0 1 .61.026.585.585 0 0 1 .297.503c0 1.533-.83 2.967-2.183 3.8a9.375 9.375 0 0 1-3.113 4.521 8.626 8.626 0 0 1-5.397 1.892 8.626 8.626 0 0 1-5.397-1.892 9.375 9.375 0 0 1-3.112-4.52C.83 11.287 0 9.853 0 8.32c0-.206.112-.396.297-.504a.659.659 0 0 1 .61-.026c.028.013.059.026.092.038C.386 6.964 0 5.839 0 4.77v-.788c0-.24.153-.455.387-.547a.654.654 0 0 1 .682.128c.539.509 1.19.894 1.905 1.132C4.59 1.786 7.504 0 10.692 0c3.189 0 6.102 1.786 7.719 4.696a5.125 5.125 0 0 0 1.904-1.132c.18-.169.449-.22.683-.128Zm-5.503 8.197c0-.314-.034-.625-.1-.93.963-.617 1.562-1.66 1.562-2.777 0-1.848-1.592-3.352-3.55-3.352-1.071 0-2.053.446-2.715 1.19-.66-.744-1.643-1.19-2.715-1.19-1.957 0-3.55 1.504-3.55 3.352 0 1.116.6 2.16 1.563 2.777a4.298 4.298 0 0 0-.1.93c0 2.5 2.154 4.534 4.802 4.534 2.649 0 4.803-2.034 4.803-4.534Z" clipRule="evenodd" />
    </>
  ),
  crown: (
    <path fill="currentColor" fillRule="evenodd" d="M12.835 3.105C13.64 1.219 15.562 0 17.729 0 20.636 0 23 2.214 23 4.936c0 1.89-1.178 3.64-3.001 4.456-.65.29-.97.987-.748 1.629.262.757.395 1.548.395 2.35 0 4.207-3.654 7.629-8.146 7.629-4.492 0-8.146-3.422-8.146-7.628 0-.803.133-1.594.395-2.351.221-.642-.098-1.338-.748-1.63C1.178 8.577 0 6.828 0 4.937 0 2.214 2.365 0 5.27 0c2.168 0 4.09 1.219 4.895 3.105.219.51.747.846 1.335.846s1.117-.335 1.335-.846ZM5.27 7.179c.794 0 1.437-.602 1.437-1.346V4.038c0-.743-.643-1.346-1.437-1.346s-1.438.603-1.438 1.346v1.795c0 .744.644 1.346 1.438 1.346Zm7.667 6.75 1.974-1.849a1.286 1.286 0 0 0 0-1.904 1.507 1.507 0 0 0-2.033 0L11.5 11.468l-1.38-1.292a1.507 1.507 0 0 0-2.032 0 1.286 1.286 0 0 0 0 1.904l1.975 1.85v3.032c0 .743.643 1.346 1.437 1.346s1.438-.603 1.438-1.346v-3.033Zm4.791-6.75c.794 0 1.438-.602 1.438-1.346V4.038c0-.743-.644-1.346-1.438-1.346-.794 0-1.437.603-1.437 1.346v1.795c0 .744.643 1.346 1.437 1.346Z" clipRule="evenodd" />
  ),
  character: (
    <path fill="currentColor" d="M8.147.677a.882.882 0 0 0-1.07-.65.892.892 0 0 0-.644 1.08l.161.658c.516-.3 1.11-.461 1.706-.464L8.147.677ZM1.482 6.94l.282.3c-.52.31-.95.772-1.23 1.31l-.29-.308c-.332-.352-.324-.93.018-1.289.342-.36.889-.365 1.22-.012ZM1.231 9.292c.217-.584.657-1.073 1.232-1.31.99-.408 2.246-.042 3.083.992 1.03 1.273 1.035 3.076.01 4.027-1.024.951-2.69.69-3.72-.582-.76-.939-.962-2.166-.605-3.127ZM23.756 8.242l-.29.308c-.28-.538-.71-1-1.23-1.31l.282-.3c.332-.352.878-.347 1.22.013.342.36.35.936.018 1.289ZM21.537 7.982c.576.238 1.014.724 1.232 1.31.357.961.155 2.188-.605 3.127-1.03 1.273-2.696 1.533-3.72.582-1.025-.951-1.02-2.754.01-4.027.837-1.034 2.093-1.4 3.083-.992ZM17.635 1.107l-.161.658a3.453 3.453 0 0 0-1.706-.464l.153-.624a.882.882 0 0 1 1.07-.65.892.892 0 0 1 .644 1.08ZM18.485 6.42c.259-1.506-.277-2.94-1.255-3.661a2.424 2.424 0 0 0-1.705-.467c-1.298.146-2.447 1.353-2.731 3.004-.336 1.953.665 3.787 2.237 4.097 1.571.31 3.118-1.02 3.454-2.974ZM9.037 9.393c-1.571.31-3.118-1.02-3.454-2.974-.336-1.952.666-3.787 2.237-4.097 1.572-.31 3.118 1.02 3.454 2.974.337 1.952-.665 3.787-2.237 4.097ZM18.669 17.362c0-3.573-3.265-7.504-6.74-7.504-3.405 0-6.796 3.996-6.796 7.504 0 1.546 1.17 2.8 2.613 2.8.571 0 1.1-.197 1.53-.53a.292.292 0 0 1 .423.08c.465.775 1.276 1.288 2.2 1.288.924 0 1.736-.514 2.2-1.29a.292.292 0 0 1 .425-.08c.43.335.959.532 1.531.532 1.443 0 2.613-1.254 2.614-2.8Z" />
  ),
  person: (
    <path fill="currentColor" fillRule="evenodd" d="M9.635 11.498c.832-.49 2.418-1.072 3.491-1.057.956-3.718-.862-11.15-3.71-10.386-1.399.374-1.298 1.532-1.141 3.33.125 1.433.285 3.271-.249 5.443.664.693 1.207 1.594 1.609 2.67Zm2.173.346c-.281.084-.55.184-.794.289 1.678.548 3.402 1.626 4.068 3.614a.371.371 0 0 0 .693.001c1.152-2.782-1.174-4.858-3.967-3.904ZM.35 11.584c.683-2.521 3.627-4.135 6.096-2.56.76.504 1.394 1.304 1.867 2.347-2.514-.818-5.108-.568-7.435.64a.372.372 0 0 1-.528-.428Zm9.303 1.428c-1.641 3.222-5.197 6.865-8.97 8.006.368.271.845.39 1.326.292 4.253-.849 7.82-3.727 9.731-7.604a6.856 6.856 0 0 0-2.087-.694Zm-1.158-.332C6.885 15.7 3.578 18.998.072 19.979a.516.516 0 0 0-.036.013l-.004.002a1.676 1.676 0 0 1 .764-1.75c1.49-.92 4.193-2.905 5.938-6.051a9.477 9.477 0 0 1 1.76.489Z" clipRule="evenodd" />
  ),
};

const ICON_VIEWBOX = {
  clover: "0 0 22 19",
  crown: "0 0 23 21",
  character: "0 0 24 21",
  person: "0 0 17 22",
};

function icon(name, className) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox={ICON_VIEWBOX[name]} className={className}>
      {ICON_PATHS[name]}
    </svg>
  );
}

function buildReel(views = 6) {
  return Array.from({ length: views * REEL_PATTERN.length }, (_, i) => ({
    ...REEL_PATTERN[i % REEL_PATTERN.length],
  }));
}

const ROULETTE_REEL = buildReel(8);

function iconForResult(colorId, tileIndex) {
  const parsedIndex = Number(tileIndex);
  if (Number.isInteger(parsedIndex) && parsedIndex >= 0) {
    return REEL_PATTERN[parsedIndex % REEL_PATTERN.length]?.icon || COLOR_ICON[colorId] || "clover";
  }
  return COLOR_ICON[colorId] || "clover";
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

const RouletteReel = memo(function RouletteReel({ reel, offset, spinning, duration, easing }) {
  return (
    <div className="relative">
      <div className="absolute top-7 sm:top-14 -translate-y-full w-45 h-25 sm:w-71 sm:h-40 left-1/2 -translate-x-1/2 pointer-events-none">
        <img src="/roulette/roulette-ilustration.svg" alt="" className="size-full no-interaction" />
      </div>
      <div className="w-full mx-auto sm:rounded-3xl relative overflow-hidden bg-[#283057]/60 backdrop-blur-3xl shadow-[inset_0px_2px_6px_rgba(0,0,0,0.32)] sm:px-4 py-4">
      <div
        className="h-25 overflow-hidden relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        {/* Center indicator line — only visible while spinning */}
        {spinning && (
          <div
            className="z-10 absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5"
            style={{ background: "linear-gradient(transparent 0%, white 15%, white 85%, transparent 100%)" }}
          />
        )}
        <div
          className="roulette-items-container flex relative will-change-transform"
          style={{
            transform: `translateX(${offset}px)`,
            transition: duration > 0
              ? `transform ${duration}ms ${easing}`
              : "none",
          }}
        >
          {reel.map((item, i) => {
            const color = COLORS.find((c) => c.id === item.color);
            return (
              <div key={i} className="roulette-item-container relative shrink-0" data-item>
                <div
                  className="rounded-xl size-24 flex items-center justify-center roulette-item size-[100px]"
                  style={{ background: color.gradient, boxShadow: ITEM_BOX_SHADOW }}
                >
                  {icon(item.icon, "drop-shadow-[0px_4px_12px_rgba(0,0,0,0.34)] size-12")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
});

function ShadowButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-8 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <div
        className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
        style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(104, 122, 202)" }}
      />
      <div
        className="font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3 rounded-[7px]"
        style={{
          height: "calc(100% - var(--sb-shadow-size,3px))",
          backgroundColor: "rgb(91, 101, 163)",
          color: "rgb(255, 255, 255)",
        }}
      >
        <div className="transition-opacity flex items-center justify-center size-full">
          {children}
        </div>
      </div>
    </button>
  );
}

export default function Roulette({ balanceType = "mm2" }) {
  const [offset, setOffset] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [easing, setEasing] = useState("cubic-bezier(0.25, 0.1, 0.1, 1)");
  const [betAmount, setBetAmount] = useState(0);
  const [balance, setBalance] = useState(10000);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState(null);
  const [jackpotModalOpen, setJackpotModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [phase, setPhase] = useState("betting");
  const [miningBlockNumber, setMiningBlockNumber] = useState(null);
  const [jackpotAmount, setJackpotAmount] = useState(0);
  const [jackpotGreenStreak, setJackpotGreenStreak] = useState(0);
  const [pots, setPots] = useState(() =>
    Object.fromEntries(COLORS.map((c) => [c.id, { players: 0, amount: 0 }])),
  );

  const reelRef = useRef(null);
  const itemWidthRef = useRef(100);
  const idleOffsetRef = useRef(0);
  const rafRef = useRef(null);
  const spinningRef = useRef(false);
  const socketRef = useRef(null);
  const spinTimeoutRef = useRef(null);
  const spinEndCleanupRef = useRef(null);
  const serverRemainingRef = useRef(BETTING_DURATION_MS);
  const serverUpdatedAtRef = useRef(Date.now());
  const phaseRef = useRef("betting");
  const countdownTextRef = useRef(null);
  const countdownBarRef = useRef(null);
  const countdownRafRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    let last = performance.now();
    function tick(now) {
      if (spinningRef.current) {
        rafRef.current = null;
        return;
      }
      const dt = now - last;
      last = now;
      idleOffsetRef.current -= (dt / 1000) * 36;
      const patternWidth = itemWidthRef.current * REEL_PATTERN.length;
      if (patternWidth > 0 && idleOffsetRef.current <= -patternWidth) {
        idleOffsetRef.current += patternWidth;
      }
      const reelElement = reelRef.current?.querySelector(".roulette-items-container");
      if (reelElement) {
        reelElement.style.transition = "none";
        reelElement.style.transform = `translateX(${idleOffsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [spinning]);

  useEffect(() => {
    function tick() {
      const elapsed = Date.now() - serverUpdatedAtRef.current;
      const interpolated = Math.max(0, serverRemainingRef.current - elapsed);
      if (phaseRef.current === "betting") {
        const bettingRemaining = Math.min(BETTING_DURATION_MS, interpolated);
        if (countdownTextRef.current) {
          countdownTextRef.current.textContent = `${(bettingRemaining / 1000).toFixed(2)}S`;
        }
        if (countdownBarRef.current) {
          countdownBarRef.current.style.width = `${(bettingRemaining / BETTING_DURATION_MS) * 100}%`;
        }
      } else if (countdownBarRef.current) {
        countdownBarRef.current.style.width = "0%";
      }
      countdownRafRef.current = requestAnimationFrame(tick);
    }
    countdownRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (countdownRafRef.current) cancelAnimationFrame(countdownRafRef.current);
    };
  }, [phase]);

  useEffect(() => {
    function measure() {
      if (!reelRef.current) return;
      const first = reelRef.current.querySelector("[data-item]");
      if (first) itemWidthRef.current = first.getBoundingClientRect().width;
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const showMessage = useCallback((text, kind = "info") => {
    setMessage({ text, kind });
    window.setTimeout(() => setMessage(null), 3000);
  }, []);
  const closeJackpotModal = useCallback(() => setJackpotModalOpen(false), []);
  const closeResultModal = useCallback(() => setSelectedResult(null), []);

  useEffect(() => {
    let disposed = false;
    fetch("/api/session", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!disposed && data?.user) {
          setBalance(Number(data.user[balanceType === "crypto" ? "crypto_balance" : "mm2_balance"] || 0));
        }
      })
      .catch(() => {});
    return () => { disposed = true; };
  }, [balanceType]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const clientIdKey = "mm2wild_roulette_client_id";
    let clientId = sessionStorage.getItem(clientIdKey);
    if (!clientId) {
      clientId = crypto.randomUUID();
      sessionStorage.setItem(clientIdKey, clientId);
    }
    const presenceIdKey = "mm2wild_presence_id";
    let presenceId = sessionStorage.getItem(presenceIdKey);
    if (!presenceId) {
      presenceId = crypto.randomUUID();
      sessionStorage.setItem(presenceIdKey, presenceId);
    }
    const socketUrl = `${protocol}//${window.location.host}/api/chat?clientId=${encodeURIComponent(clientId)}&presenceId=${encodeURIComponent(presenceId)}`;
    let disposed = false;
    let reconnectTimer = null;
    let miningBlockDisplayTimer = null;

    const showMiningBlock = (blockNumber) => {
      if (miningBlockDisplayTimer) clearTimeout(miningBlockDisplayTimer);
      miningBlockDisplayTimer = null;
      setMiningBlockNumber(blockNumber ?? null);
      if (blockNumber != null) {
        miningBlockDisplayTimer = setTimeout(() => {
          setMiningBlockNumber(null);
          miningBlockDisplayTimer = null;
        }, MINING_BLOCK_DISPLAY_MS);
      }
    };

    const animateSpin = (
      colorId,
      requestedDuration = SPINNING_DURATION_MS,
      winningTileIndex = null,
    ) => {
      const color = COLORS.find((c) => c.id === colorId);
      if (!color) return;
      const spinDuration = Math.max(0, Math.min(SPINNING_DURATION_MS, requestedDuration));

      const reelEl = reelRef.current?.querySelector(".roulette-items-container");
      if (!reelEl || !reelRef.current) return;

      const first = reelRef.current.querySelector("[data-item]");
      const itemWidth = first ? first.getBoundingClientRect().width : itemWidthRef.current;
      itemWidthRef.current = itemWidth;
      const containerWidth = reelRef.current.getBoundingClientRect().width;
      const currentOffset = idleOffsetRef.current;

      const currentCenterIndex = Math.round((containerWidth / 2 - currentOffset) / itemWidth);
      const patternLen = REEL_PATTERN.length;
      const parsedWinningTileIndex = Number(winningTileIndex);
      const hasWinningTileIndex = Number.isInteger(parsedWinningTileIndex)
        && parsedWinningTileIndex >= 0
        && parsedWinningTileIndex < patternLen;
      const minimumTargetIndex = currentCenterIndex + 50;
      let targetIndex;
      if (hasWinningTileIndex) {
        const slotsToWinningTile = (
          (parsedWinningTileIndex - minimumTargetIndex) % patternLen + patternLen
        ) % patternLen;
        targetIndex = minimumTargetIndex + slotsToWinningTile;
      } else {
        targetIndex = minimumTargetIndex;
        for (let i = 0; i < patternLen * 2; i++) {
          const idx = targetIndex + i;
          const pIdx = ((idx % patternLen) + patternLen) % patternLen;
          if (REEL_PATTERN[pIdx].color === colorId) {
            targetIndex = idx;
            break;
          }
        }
      }

      const targetItem = reelEl.querySelectorAll("[data-item]")[targetIndex];
      const viewportRect = reelEl.parentElement?.getBoundingClientRect();
      const targetRect = targetItem?.getBoundingClientRect();
      const centeredOffset = viewportRect && targetRect
        ? currentOffset
          + viewportRect.left + viewportRect.width / 2
          - targetRect.left - targetRect.width / 2
        : containerWidth / 2 - itemWidth * targetIndex - itemWidth / 2;
      const correctionDuration = Math.min(650, spinDuration);
      const travelDuration = Math.max(0, spinDuration - correctionDuration);
      const landingOffset = centeredOffset + (Math.random() * 98 - 49);
      spinningRef.current = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      setSpinning(true);

      reelEl.style.transition = "none";
      reelEl.style.transform = `translateX(${currentOffset}px)`;

      void reelEl.offsetHeight;

      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      if (spinEndCleanupRef.current) spinEndCleanupRef.current();

      let spinCompleted = false;
      const completeSpin = () => {
        if (spinCompleted) return;
        spinCompleted = true;
        if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
        if (spinEndCleanupRef.current) spinEndCleanupRef.current();
        spinEndCleanupRef.current = null;

        reelEl.style.transition = "none";
        reelEl.style.transform = `translateX(${centeredOffset}px)`;
        idleOffsetRef.current = centeredOffset;
        setDuration(0);
        setOffset(centeredOffset);
        setPhase("waiting");
        phaseRef.current = "waiting";
      };

      let spinStage = "idle";
      const beginCorrection = () => {
        if (spinCompleted || spinStage === "correction") return;
        if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
        spinStage = "correction";
        reelEl.style.transition = correctionDuration > 0
          ? `transform ${correctionDuration}ms cubic-bezier(0.2, 0, 0.2, 1)`
          : "none";
        reelEl.style.transform = `translateX(${centeredOffset}px)`;
        setEasing("cubic-bezier(0.2, 0, 0.2, 1)");
        setDuration(correctionDuration);
        setOffset(centeredOffset);
        if (correctionDuration > 0) {
          spinTimeoutRef.current = setTimeout(completeSpin, correctionDuration + 100);
        } else {
          completeSpin();
        }
      };

      const handleTransitionEnd = (event) => {
        if (event.target !== reelEl || event.propertyName !== "transform") return;
        if (spinStage === "travel") beginCorrection();
        else if (spinStage === "correction") completeSpin();
      };
      reelEl.addEventListener("transitionend", handleTransitionEnd);
      spinEndCleanupRef.current = () => reelEl.removeEventListener("transitionend", handleTransitionEnd);

      if (travelDuration > 0) {
        spinStage = "travel";
        reelEl.style.transition = `transform ${travelDuration}ms cubic-bezier(0.25, 0.1, 0.1, 1)`;
        reelEl.style.transform = `translateX(${landingOffset}px)`;
        setEasing("cubic-bezier(0.25, 0.1, 0.1, 1)");
        setDuration(travelDuration);
        setOffset(landingOffset);
        spinTimeoutRef.current = setTimeout(beginCorrection, travelDuration + 100);
      } else {
        beginCorrection();
      }
    };

    const handleMessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (payload.type) {
        case "roulette_init":
        case "roulette_state": {
          const nextPhase = payload.phase || "betting";
          const fallbackDuration = nextPhase === "betting"
            ? BETTING_DURATION_MS
            : nextPhase === "spinning"
              ? SPINNING_DURATION_MS
              : WAITING_DURATION_MS;
          const nextRemaining = payload.remaining
            ?? (payload.endsAt ? Math.max(0, payload.endsAt - Date.now()) : fallbackDuration);
          setPhase(nextPhase);
          showMiningBlock(nextPhase === "mining" ? payload.eosBlockNum : null);
          phaseRef.current = nextPhase;
          serverRemainingRef.current = nextRemaining;
          serverUpdatedAtRef.current = Date.now();
          if (payload.history) setHistory(payload.history.map((h) => ({
            id: h.id,
            roundNumber: h.roundNumber ?? h.nonce,
            players: h.players ?? 0,
            color: COLORS.find((c) => c.id === h.color) || { id: h.color, ...COLORS.find((c) => c.id === h.color) },
            tileIndex: h.tileIndex,
            icon: iconForResult(h.color, h.tileIndex),
            time: new Date(h.time),
          })));
          if (payload.pots) setPots(payload.pots);
          if (payload.jackpot) {
            setJackpotAmount(Number(payload.jackpot.amount || 0));
            setJackpotGreenStreak(Number(payload.jackpot.greenStreak || 0));
          }
          if (payload.result && payload.phase === "spinning") {
            animateSpin(payload.result, nextRemaining, payload.tileIndex);
          } else if (payload.result && payload.phase === "waiting") {
            animateSpin(payload.result, 0, payload.tileIndex);
          }
          break;
        }
        case "roulette_tick": {
          const nextPhase = payload.phase || "betting";
          if (phaseRef.current !== nextPhase) setPhase(nextPhase);
          phaseRef.current = nextPhase;
          serverRemainingRef.current = payload.remaining ?? 0;
          serverUpdatedAtRef.current = Date.now();
          break;
        }
        case "roulette_phase": {
          const nextPhase = payload.phase || "betting";
          const fallbackDuration = nextPhase === "betting"
            ? BETTING_DURATION_MS
            : nextPhase === "spinning"
              ? SPINNING_DURATION_MS
              : WAITING_DURATION_MS;
          const nextRemaining = payload.remaining
            ?? (payload.endsAt ? Math.max(0, payload.endsAt - Date.now()) : fallbackDuration);
          setPhase(nextPhase);
          phaseRef.current = nextPhase;
          if (nextPhase === "betting") showMiningBlock(null);
          serverRemainingRef.current = nextRemaining;
          serverUpdatedAtRef.current = Date.now();
          if (nextPhase === "betting") {
            if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
            if (spinEndCleanupRef.current) spinEndCleanupRef.current();
            spinEndCleanupRef.current = null;
            spinningRef.current = false;
            setSpinning(false);
            setDuration(0);
            idleOffsetRef.current = 0;
            setOffset(0);
            setPots(Object.fromEntries(COLORS.map((c) => [c.id, { players: 0, amount: 0 }])));
          }
          break;
        }
        case "roulette_mining": {
          setPhase("mining");
          phaseRef.current = "mining";
          showMiningBlock(payload.blockNumber);
          serverRemainingRef.current = 0;
          serverUpdatedAtRef.current = Date.now();
          break;
        }
        case "roulette_spin": {
          setPhase("spinning");
          phaseRef.current = "spinning";
          const spinRemaining = payload.remaining
            ?? (payload.endsAt ? Math.max(0, payload.endsAt - Date.now()) : SPINNING_DURATION_MS);
          serverRemainingRef.current = spinRemaining;
          serverUpdatedAtRef.current = Date.now();
          animateSpin(payload.color, spinRemaining, payload.tileIndex);
          break;
        }
        case "roulette_result": {
          if (payload.history) setHistory(payload.history.map((h) => ({
            id: h.id,
            roundNumber: h.roundNumber ?? h.nonce,
            players: h.players ?? 0,
            color: COLORS.find((c) => c.id === h.color) || { id: h.color },
            tileIndex: h.tileIndex,
            icon: iconForResult(h.color, h.tileIndex),
            time: new Date(h.time),
          })));
          if (payload.pots) setPots(payload.pots);
          if (payload.jackpot) {
            setJackpotAmount(Number(payload.jackpot.amount || 0));
            setJackpotGreenStreak(Number(payload.jackpot.greenStreak || 0));
          }
          fetch("/api/session", { credentials: "include" })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (data?.user) setBalance(Number(data.user[balanceType === "crypto" ? "crypto_balance" : "mm2_balance"] || 0));
            })
            .catch(() => {});
          break;
        }
        case "roulette_pots": {
          if (payload.pots) setPots(payload.pots);
          if (payload.jackpot) setJackpotAmount(Number(payload.jackpot.amount || 0));
          break;
        }
        case "roulette_bet_confirmed": {
          if (payload.balance != null) {
            const nextBalance = Number(payload.balance);
            setBalance(nextBalance);
            window.dispatchEvent(new CustomEvent("mm2wild:balance-updated", {
              detail: payload.balanceType === "crypto" ? { cryptoBalance: nextBalance } : { mm2Balance: nextBalance },
            }));
          }
          break;
        }
        case "roulette_balance": {
          const returnedBalance = balanceType === "crypto" ? payload.cryptoBalance : payload.mm2Balance;
          if (returnedBalance != null) {
            const nextBalance = Number(returnedBalance);
            setBalance(nextBalance);
            window.dispatchEvent(new CustomEvent("mm2wild:balance-updated", {
              detail: { mm2Balance: Number(payload.mm2Balance), cryptoBalance: Number(payload.cryptoBalance) },
            }));
          }
          if (Number(payload.jackpotPayout || 0) > 0) {
            showMessage(`TRIPLE GREEN JACKPOT +${formatNumber(Number(payload.jackpotPayout))}`, "win");
          }
          break;
        }
        case "roulette_error": {
          showMessage(payload.error || "Roulette error", "error");
          break;
        }
        default:
          break;
      }
    };

    const connect = () => {
      if (disposed) return;
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;
      socket.addEventListener("message", handleMessage);
      socket.addEventListener("close", () => {
        if (socketRef.current === socket) socketRef.current = null;
        if (!disposed) reconnectTimer = setTimeout(connect, 1500);
      });
      socket.addEventListener("error", () => {
      });
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (miningBlockDisplayTimer) clearTimeout(miningBlockDisplayTimer);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      if (spinEndCleanupRef.current) spinEndCleanupRef.current();
      spinEndCleanupRef.current = null;
      const socket = socketRef.current;
      if (socket) socket.close();
      socketRef.current = null;
    };
  }, [showMessage, balanceType]);

  const placeBet = useCallback((colorId) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      showMessage("Not connected to the server", "error");
      return;
    }
    if (phase !== "betting") {
      showMessage("Betting is closed for this round", "error");
      return;
    }
    if (betAmount <= 0) {
      showMessage("Enter a bet amount", "error");
      return;
    }
    socket.send(JSON.stringify({ type: "roulette_bet", color: colorId, amount: betAmount, balanceType }));
  }, [phase, betAmount, showMessage, balanceType]);

  const last100Counts = useMemo(() => {
    const counts = {};
    for (const c of COLORS) counts[c.id] = 0;
    for (const entry of history) {
      if (entry.color && counts[entry.color.id] !== undefined) counts[entry.color.id]++;
    }
    return counts;
  }, [history]);

  const bettingLocked = phase !== "betting";

  return (
    <div className="site-content">
      <div className="max-w-[1400px] mx-auto flex flex-col @container/content px-0 sm:px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
          <div className="page-content pt-6 sm:pt-12 pb-6 flex flex-col gap-6">
            {/* Header — pot card + sound/fairness buttons */}
            <div className="flex flex-col px-4 sm:px-0 gap-3 sm:gap-0 sm:flex-row justify-between items-center">
              <div className="w-full sm:w-auto flex items-center gap-2 justify-between text-sm font-medium p-3 bg-[#1C273F]/89 rounded-lg backdrop-blur-lg sm:p-0 sm:bg-transparent z-1">
                <div className="flex flex-col gap-0.5">
                  <p className="text-accent text-sm">TRIPLE GREEN POT</p>
                  <div className="flex items-center gap-1.5">
                    <img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5" />
                    <span className="tabular-nums">{formatNumber(jackpotAmount)}</span>
                    <button
                      type="button"
                      className="cursor-pointer ml-1 hover:opacity-80 transition-opacity"
                      aria-label="Info"
                      onClick={() => setJackpotModalOpen(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="text-accent/45 size-4.5" fill="currentColor">
                        <path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex gap-1.25">
                  {[0, 1, 2].map((idx) => {
                    const isActive = idx < jackpotGreenStreak;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setJackpotModalOpen(true)}
                        className="rounded-[10px] size-10 sm:size-12.5 flex items-center justify-center cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-accent/15 rounded-[10px]" style={{ display: isActive ? "none" : "block" }} />
                        <div
                          className="absolute inset-0 rounded-[10px]"
                          style={{
                            background: "radial-gradient(50% 50%, rgb(92, 223, 154) 0%, rgb(15, 195, 101) 100%)",
                            boxShadow: "rgba(0, 0, 0, 0.25) 0px -2px 0px inset, rgba(255, 255, 255, 0.25) 0px 1px 0px inset",
                            display: isActive ? "block" : "none",
                          }}
                        />
                        <div className="relative z-10">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 19" className={`size-8 transition-colors duration-300 ${isActive ? "text-white" : "text-[#212C4E]"}`}>
                            <path fill="currentColor" fillRule="evenodd" d="M11.274 7.122c.351-.829 1.189-1.364 2.133-1.364 1.267 0 2.297.972 2.297 2.168 0 .831-.513 1.6-1.308 1.958a.58.58 0 0 0-.326.716c.115.333.172.68.172 1.033 0 1.848-1.592 3.352-3.55 3.352-1.957 0-3.55-1.504-3.55-3.352 0-.353.058-.7.172-1.033a.58.58 0 0 0-.326-.716C6.194 9.526 5.68 8.757 5.68 7.926c0-1.196 1.03-2.168 2.297-2.168.945 0 1.782.535 2.134 1.364a.627.627 0 0 0 .581.372.627.627 0 0 0 .582-.372Zm-3.297 1.79c.346 0 .627-.265.627-.591v-.789c0-.327-.28-.591-.627-.591-.346 0-.626.264-.626.591v.789c0 .326.28.591.626.591Zm3.342 2.966.86-.813a.568.568 0 0 0 0-.836.653.653 0 0 0-.886 0l-.6.568-.602-.568a.653.653 0 0 0-.886 0 .568.568 0 0 0 0 .837l.86.812v1.332c0 .327.281.592.627.592s.627-.265.627-.592v-1.332Zm2.088-2.966c.346 0 .627-.265.627-.591v-.789c0-.327-.28-.591-.627-.591-.346 0-.626.264-.626.591v.789c0 .326.28.591.626.591Z" clipRule="evenodd" />
                            <path fill="currentColor" fillRule="evenodd" d="M20.998 3.436a.592.592 0 0 1 .387.547v.788c0 1.068-.387 2.193-1 3.057a.926.926 0 0 0 .093-.037.659.659 0 0 1 .61.026.585.585 0 0 1 .297.503c0 1.533-.83 2.967-2.183 3.8a9.375 9.375 0 0 1-3.113 4.521 8.626 8.626 0 0 1-5.397 1.892 8.626 8.626 0 0 1-5.397-1.892 9.375 9.375 0 0 1-3.112-4.52C.83 11.287 0 9.853 0 8.32c0-.206.112-.396.297-.504a.659.659 0 0 1 .61-.026c.028.013.059.026.092.038C.386 6.964 0 5.839 0 4.77v-.788c0-.24.153-.455.387-.547a.654.654 0 0 1 .682.128c.539.509 1.19.894 1.905 1.132C4.59 1.786 7.504 0 10.692 0c3.189 0 6.102 1.786 7.719 4.696a5.125 5.125 0 0 0 1.904-1.132c.18-.169.449-.22.683-.128Zm-5.503 8.197c0-.314-.034-.625-.1-.93.963-.617 1.562-1.66 1.562-2.777 0-1.848-1.592-3.352-3.55-3.352-1.071 0-2.053.446-2.715 1.19-.66-.744-1.643-1.19-2.715-1.19-1.957 0-3.55 1.504-3.55 3.352 0 1.116.6 2.16 1.563 2.777a4.298 4.298 0 0 0-.1.93c0 2.5 2.154 4.534 4.802 4.534 2.649 0 4.803-2.034 4.803-4.534Z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSoundOn((s) => !s)}
                  className="text-accent size-10 flex items-center justify-center rounded-lg bg-[#202D57] hover:bg-[#2D3D73] transition-colors cursor-pointer"
                  aria-label={soundOn ? "Mute sound" : "Unmute sound"}
                  aria-pressed={!soundOn}
                >
                  {soundOn ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" fill="currentColor">
                      <path d="M14 20.725v-2.05q2.25-.65 3.625-2.5t1.375-4.2-1.375-4.2T14 5.275v-2.05q3.1.7 5.05 3.138T21 11.975t-1.95 5.613T14 20.725M3 15V9h4l5-5v16l-5-5zm11 1V7.95q1.175.55 1.838 1.65T16.5 12q0 1.275-.663 2.363T14 16" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5">
                      <path fill="currentColor" d="m19.8 22.6-3.025-3.025q-.625.4-1.325.688t-1.45.462v-2.05q.35-.125.688-.25t.637-.3L12 14.8V20l-5-5H3V9h3.2L1.4 4.2l1.4-1.4 18.4 18.4zm-.2-5.8-1.45-1.45q.425-.775.638-1.625t.212-1.75q0-2.35-1.375-4.2T14 5.275v-2.05q3.1.7 5.05 3.138T21 11.975q0 1.325-.363 2.55T19.6 16.8m-3.35-3.35L14 11.2V7.95q1.175.55 1.838 1.65T16.5 12q0 .375-.062.738t-.188.712M12 9.2 9.4 6.6 12 4z" />
                    </svg>
                  )}
                </button>
                <a
                  href="/fairness"
                  className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-2.5 sm:px-3 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 20" className="size-5 sm:mr-1.25">
                    <path fill="currentColor" d="M8.912 11.375a.53.53 0 0 0-.53-.53h-.184L6.384 6.753c-.348.091-.698.171-1.05.24l1.706 3.852H3.372l1.684-3.8c-.41.074-.822.133-1.236.177l-1.606 3.623H2.03a.53.53 0 0 0-.529.53c-.008 1.82 1.933 3.04 3.706 3 1.772.041 3.714-1.181 3.706-3ZM18.972 10.845h-.185l-1.605-3.623a17.132 17.132 0 0 1-1.236-.176l1.683 3.8h-3.667l1.707-3.852a17.11 17.11 0 0 1-1.052-.241l-1.813 4.092h-.185a.53.53 0 0 0-.53.53c0 .827.404 1.596 1.136 2.165 1.364 1.106 3.777 1.106 5.142 0 .732-.57 1.135-1.338 1.135-2.165a.53.53 0 0 0-.53-.53ZM2.03 6.257c1.453 0 2.9-.197 4.3-.586a15.584 15.584 0 0 1 8.34 0c1.4.389 2.847.586 4.3.586.6 0 .737-.842.168-1.032a23.547 23.547 0 0 1-3.98-1.75l-.836-.465a7.892 7.892 0 0 0-3.292-.972v-.546c-.026-.701-1.034-.7-1.06 0v.546a7.892 7.892 0 0 0-3.292.972l-.837.465a23.543 23.543 0 0 1-3.979 1.75c-.57.19-.433 1.032.168 1.032ZM12.617 16.916H8.38c-.877 0-1.588.711-1.588 1.588 0 .293.237.53.53.53h6.352a.53.53 0 0 0 .53-.53c0-.877-.711-1.588-1.588-1.588Z" />
                    <path fill="currentColor" d="M9.969 15.857h1.059V6.171a14.236 14.236 0 0 0-1.06 0v9.686Z" />
                  </svg>
                  <span className="hidden sm:inline">FAIRNESS</span>
                </a>
              </div>
            </div>

            {/* Reel */}
            <div ref={reelRef} className="w-full">
              <RouletteReel reel={ROULETTE_REEL} offset={offset} spinning={spinning} duration={duration} easing={easing} />
            </div>

            <div className="flex flex-col gap-2 px-4 sm:px-0">
              <div className="min-h-6">
                {phase === "betting" ? (
                  <p className="font-semibold text-accent text-center">
                    ROLLING IN <span ref={countdownTextRef} className="text-white tabular-nums">20.00S</span>
                  </p>
                ) : phase === "mining" && miningBlockNumber != null ? (
                  <div className="font-semibold text-center flex items-center justify-center gap-2">
                    <svg className="size-4.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>MINING BLOCK</span>
                    {miningBlockNumber != null && <span className="text-accent">- #{miningBlockNumber}</span>}
                  </div>
                ) : (
                  <p className="font-semibold text-accent text-center">
                    {phase === "mining" || phase === "spinning" ? "ROLLING..." : "WAITING..."}
                  </p>
                )}
              </div>
              <div className="bg-[#313B6B] rounded-xl h-2 shadow-[inset_0px_2px_6px_rgba(0,0,0,0.32)] overflow-hidden">
                <div
                  ref={countdownBarRef}
                  className="h-full bg-[#E5AD4E] rounded-xl will-change-[width]"
                  style={{ width: phase === "betting" ? "100%" : "0%" }}
                />
              </div>
            </div>

              {/* History — LAST 10 + LAST 100 */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center px-4 sm:px-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-accent text-xs md:text-sm hidden sm:block">LAST 10</p>
                  <div className="overflow-hidden">
                    <div className="flex gap-1.5 md:gap-2 relative">
                      {history.length === 0 ? (
                        <span className="text-sm text-accent/50 py-1">No spins yet</span>
                      ) : (
                        history.slice(0, 10).map((entry, i) => {
                          const color = COLORS.find((c) => c.id === entry.color?.id);
                          if (!color) return null;
                          return (
                            <button
                              type="button"
                              key={`${entry.time?.getTime()}-${i}`}
                              className="rounded-full flex items-center justify-center cursor-pointer size-6 md:size-8"
                              onClick={() => setSelectedResult(entry)}
                              aria-label={`View Roulette result ${entry.roundNumber ?? i + 1}`}
                              style={{
                                background: color.gradient,
                                boxShadow: "rgba(0, 0, 0, 0.25) 0px -1.5px 0px inset, rgba(255, 255, 255, 0.25) 0px 1.5px 0px inset",
                              }}
                            >
                              {icon(entry.icon, "size-[62.5%] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.54)]")}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-accent text-right text-xs md:text-sm hidden sm:block">LAST 100</p>
                  <div className="flex items-center gap-2.5">
                    {COLORS.map((color) => (
                      <div key={color.id} className="flex items-center gap-1.5">
                        <div
                          className="rounded-full flex items-center justify-center size-6 md:size-8"
                          style={{
                            background: color.gradient,
                            boxShadow: "rgba(0, 0, 0, 0.25) 0px -1.5px 0px inset, rgba(255, 255, 255, 0.25) 0px 1.5px 0px inset",
                          }}
                        >
                          {icon(COLOR_ICON[color.id], "size-[62.5%] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.54)]")}
                        </div>
                        <span className="text-xs md:text-sm font-medium">{last100Counts[color.id]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            {/* Bet input */}
            <div className="flex-1 flex flex-col gap-2 px-4 sm:px-0">
              <div
                className="flex bg-[#283057] rounded-xl border-[1.5px] border-solid border-[#3E3C93] p-2"
                style={{ border: "1.5px solid rgb(62, 60, 147)" }}
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <img src="/coin.webp" alt="" className="bg-cover bg-center size-5.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="w-full relative flex group rounded-lg items-center justify-center">
                      <div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" />
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Enter amount"
                        value={betAmount || ""}
                        disabled={bettingLocked}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9.]/g, "");
                          setBetAmount(Math.max(0, Number(v) || 0));
                        }}
                        className="bg-transparent outline-none text-white font-medium text-sm placeholder:text-accent min-w-0 w-full bg-transparent outline-none size-full font-medium peer text-[15px] placeholder:text-accent"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={bettingLocked}
                    onClick={() => setBetAmount(0)}
                    className="text-accent text-sm py-1.5 px-2 hover:bg-[#917FB8]/10 rounded-md font-medium transition-colors"
                  >
                    CLEAR
                  </button>
                  <ShadowButton disabled={bettingLocked} onClick={() => setBetAmount((b) => b + 1)}>+1</ShadowButton>
                  <ShadowButton disabled={bettingLocked} onClick={() => setBetAmount((b) => b + 5)}>+5</ShadowButton>
                  <ShadowButton disabled={bettingLocked} onClick={() => setBetAmount((b) => b + 10)}>+10</ShadowButton>
                  <ShadowButton disabled={bettingLocked} onClick={() => setBetAmount((b) => b + 100)}>+100</ShadowButton>
                  <ShadowButton disabled={bettingLocked} onClick={() => setBetAmount((b) => Math.floor(b / 2))}>1/2</ShadowButton>
                  <ShadowButton disabled={bettingLocked} onClick={() => setBetAmount((b) => b * 2)}>X2</ShadowButton>
                  <ShadowButton disabled={bettingLocked} onClick={() => setBetAmount(balance)}>Max</ShadowButton>
                </div>
              </div>
            </div>

            {/* Place bet buttons */}
            <div className="flex gap-2 sm:gap-4 px-4 sm:px-0">
              {COLORS.map((color) => (
                <div key={color.id} className="flex-1 flex flex-col">
                  <div className={`md:h-13 relative transition-opacity ${bettingLocked ? "opacity-50" : ""}`}>
                    <div className="absolute top-1/2 left-0 right-0 bottom-0 rounded-xl" style={{ background: color.shadow }} />
                    <button
                      type="button"
                      disabled={bettingLocked || betAmount <= 0 || betAmount > balance}
                      onClick={() => placeBet(color.id)}
                      className="w-full h-[calc(100%-3px)] flex flex-col md:flex-row items-center justify-start px-3.5 py-2 md:py-0 rounded-xl text-white font-semibold hover:-translate-y-0.5 active:translate-y-0.5 transition-transform relative cursor-pointer disabled:cursor-not-allowed"
                      style={{ background: color.linearGradient }}
                    >
                      {icon(COLOR_ICON[color.id], "size-5.5 md:mr-2")}
                      <p className="font-semibold text-sm">
                        <span className="hidden sm:inline">PLACE</span> BET
                      </p>
                      <p className="font-semibold text-sm md:ml-auto">
                        <span className="hidden sm:inline">WIN</span> {color.multiplier}X
                      </p>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Per-color pot cards */}
            <div className="flex flex-col gap-3 px-4 sm:px-0">
              <div className="flex gap-4 min-w-0">
                {COLORS.map((color) => {
                  const pot = pots[color.id] || { players: 0, amount: 0, playerList: [] };
                  const playerList = pot.playerList || [];
                  return (
                    <div key={color.id} className={`flex-1 flex flex-col bg-[#283057] rounded-xl p-4 transition-all duration-150 self-start min-w-0 ${playerList.length > 0 ? "gap-3" : "gap-0"}`}>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <p className={`text-accent transition-all duration-200 ${playerList.length > 0 ? "opacity-100" : "opacity-60"}`}>
                          {pot.players} {pot.players === 1 ? "PLAYER" : "PLAYERS"}
                        </p>
                        <div className="flex items-center">
                          <img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5 mr-1.5" />
                          <span>{formatNumber(pot.amount)}</span>
                        </div>
                      </div>
                      {playerList.length > 0 && (
                        <>
                          <div className="bg-[#445696]/35 h-0.5 rounded-full" />
                          <div className="min-w-0 flex flex-col gap-2">
                            {playerList.map((player) => (
                              <div key={player.uuid} className="flex items-center justify-between gap-1.5 text-sm font-medium min-w-0">
                                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                  <div className="size-8.5 shrink-0 flex flex-col items-center relative bg-linear-to-b from-[#272539] from-5% to-[#3a3a5a] rounded-lg p-0.5">
                                    <div className="rounded-[6px] size-full flex items-center justify-center" style={{ backgroundColor: "rgb(26, 35, 57)" }}>
                                      {player.avatar ? (
                                        <img
                                          src={player.avatar}
                                          alt=""
                                          className="size-9/12 object-contain object-center rounded-[5px]"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className="size-full rounded-[5px] bg-[#3a3a5a] flex items-center justify-center text-xs text-accent/60">
                                          {player.name?.[0]?.toUpperCase() || "?"}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="font-medium truncate min-w-0">{player.name}</p>
                                </div>
                                <div className="flex items-center shrink-0">
                                  <img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5 mr-1.5" />
                                  <span className="tabular-nums font-medium">{formatNumber(player.amount)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Result banner */}
            <div className="h-10 flex items-center justify-center">
              {message && (
                <div
                  className={`text-sm font-semibold ${
                    message.kind === "win"
                      ? "text-[#5CDF9A]"
                      : message.kind === "error"
                        ? "text-[#FF6B6B]"
                        : "text-accent"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
        {jackpotModalOpen && <TripleGreenJackpotModal onClose={closeJackpotModal} />}
        {selectedResult && (
          <RouletteResultModal
            result={selectedResult}
            resultIcon={icon(selectedResult.icon, "drop-shadow-[0px_4px_12px_rgba(0,0,0,0.34)] size-12")}
            onClose={closeResultModal}
          />
        )}
      </div>
  );
}
