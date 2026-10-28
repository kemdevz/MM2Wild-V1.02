import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

const ITEM_SIZE = 136;
const ITEM_GAP = 20;
const NORMAL_SPIN_DURATION = 3000;
const FAST_SPIN_DURATION = 1000;
const CENTERING_DURATION = 600;
const REEL_STAGGER = 200;
const ITEM_GLOW_COLORS = { Ancient: "#5C17DE", Godly: "#F10AA8", Vintage: "#E3C608", Legendary: "#DD0005", Unique: "#F08C00", Common: "#A6A6A6", Uncommon: "#01FEFF", Rare: "#00C703" };
const CHROMA_COLORS = ["#FF0000", "#FF8C00", "#FFFF00", "#32CD32", "#0E6FFF", "#8A2BE2", "#FF00FF", "#FF0000"];
const CASE_SOUNDS = {
  spin: { src: "/sounds/battles/spin.mp3", volume: 0.9 },
  land1: { src: "/sounds/battles/battle-land-1.mp3", volume: 1 },
  land2: { src: "/sounds/battles/battle-land-2.mp3", volume: 1 },
  ripples: { src: "/sounds/battles/pull-1.mp3", volume: 0.2 },
  borderRipples: { src: "/sounds/battles/pull-big-1.mp3", volume: 0.3 },
};

function money(value) {
  return Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function itemImage(item) {
  if (!item) return "";
  if (item.itemId != null) return `/items/${item.itemId}.webp`;
  return item.imageUrl;
}

function landingColor(item) {
  return ITEM_GLOW_COLORS[item?.rarity] || ITEM_GLOW_COLORS.Godly;
}

function isChromaItem(item) {
  return item?.rarity === "Chroma" || item?.fullName?.includes("Chroma") || item?.name?.includes("Chroma");
}

function chromaColor(progress) {
  const position = Math.max(0, Math.min(1, progress)) * (CHROMA_COLORS.length - 1);
  const startIndex = Math.floor(position);
  const endIndex = Math.min(startIndex + 1, CHROMA_COLORS.length - 1);
  const mix = position - startIndex;
  const channels = [1, 3, 5].map((offset) => {
    const start = Number.parseInt(CHROMA_COLORS[startIndex].slice(offset, offset + 2), 16);
    const end = Number.parseInt(CHROMA_COLORS[endIndex].slice(offset, offset + 2), 16);
    return Math.round(start + ((end - start) * mix));
  });
  return `rgb(${channels.join(", ")})`;
}

function weightedItem(items) {
  const ticket = Math.floor(Math.random() * 10_000_000);
  return items.find((item) => ticket >= item.range[0] && ticket <= item.range[1]) || items.at(-1);
}

function reelConfig(quantity, fastSpin) {
  const multi = quantity > 1;
  const winnerIndex = multi ? (fastSpin ? 8 : 20) : (fastSpin ? 20 : 32);
  return { multi, winnerIndex, reelCount: winnerIndex + (multi ? 3 : 10) };
}

function buildAmbientReel(items, quantity = 1, fastSpin = false) {
  const { reelCount } = reelConfig(quantity, fastSpin);
  return Array.from({ length: reelCount }, () => weightedItem(items));
}

function buildWinningReel(items, winner, quantity, fastSpin) {
  const { winnerIndex } = reelConfig(quantity, fastSpin);
  const reel = buildAmbientReel(items, quantity, fastSpin);
  reel[winnerIndex] = winner;
  return reel;
}

const easeOutCirc = (progress) => Math.sqrt(1 - ((progress - 1) ** 2));
const easeOutBack = (progress) => {
  const overshoot = 1.70158;
  return 1 + (overshoot + 1) * ((progress - 1) ** 3) + overshoot * ((progress - 1) ** 2);
};

function animateTrack(track, axis, from, to, duration, easing, animations) {
  const frameCount = Math.max(60, Math.ceil(duration / (1000 / 60)));
  const frames = Array.from({ length: frameCount + 1 }, (_, index) => {
    const progress = index / frameCount;
    const value = from + (to - from) * easing(progress);
    return { transform: axis === "x" ? `translate3d(${value}px,0,0)` : `translate3d(0,${value}px,0)`, offset: progress };
  });
  const animation = track.animate(frames, { duration, easing: "linear", fill: "forwards" });
  animations.add(animation);
  return animation.finished.then(() => {
    track.style.transform = frames.at(-1).transform;
    animations.delete(animation);
    animation.cancel();
  });
}

function ArrowIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5 mr-1.5 -translate-y-px" style={{ strokeWidth: 3.5 }}><path fill="none" stroke="currentColor" d="m12 19-7-7 7-7m7 7H5" /></svg>;
}

function LinkIcon() {
  return <svg viewBox="0 0 24 24" className="size-5 mr-1.25"><path fill="currentColor" d="m17.657 14.828-1.415-1.414L17.658 12A4 4 0 1 0 12 6.343l-1.414 1.414L9.17 6.343l1.415-1.414a6 6 0 0 1 8.485 8.485zm-2.829 2.829-1.414 1.414a6 6 0 0 1-8.485-8.485l1.414-1.414 1.414 1.414L6.343 12A4 4 0 0 0 12 17.657l1.414-1.414zm0-9.9 1.415 1.415-7.072 7.07-1.414-1.414z" /></svg>;
}

function ScaleIcon() {
  return <svg fill="none" viewBox="0 0 21 20" className="size-5 mr-1.25"><path fill="currentColor" d="M8.912 11.375a.53.53 0 0 0-.53-.53h-.184L6.384 6.753c-.348.091-.698.171-1.05.24l1.706 3.852H3.372l1.684-3.8c-.41.074-.822.133-1.236.177l-1.606 3.623H2.03a.53.53 0 0 0-.529.53c-.008 1.82 1.933 3.04 3.706 3 1.772.041 3.714-1.181 3.706-3ZM18.972 10.845h-.185l-1.605-3.623a17.132 17.132 0 0 1-1.236-.176l1.683 3.8h-3.667l1.707-3.852a17.11 17.11 0 0 1-1.052-.241l-1.813 4.092h-.185a.53.53 0 0 0-.53.53c0 .827.404 1.596 1.136 2.165 1.364 1.106 3.777 1.106 5.142 0 .732-.57 1.135-1.338 1.135-2.165a.53.53 0 0 0-.53-.53ZM2.03 6.257c1.453 0 2.9-.197 4.3-.586a15.584 15.584 0 0 1 8.34 0c1.4.389 2.847.586 4.3.586.6 0 .737-.842.168-1.032a23.547 23.547 0 0 1-3.98-1.75l-.836-.465a7.892 7.892 0 0 0-3.292-.972v-.546c-.026-.701-1.034-.7-1.06 0v.546a7.892 7.892 0 0 0-3.292.972l-.837.465a23.543 23.543 0 0 1-3.979 1.75c-.57.19-.433 1.032.168 1.032ZM12.617 16.916H8.38c-.877 0-1.588.711-1.588 1.588 0 .293.237.53.53.53h6.352a.53.53 0 0 0 .53-.53c0-.877-.711-1.588-1.588-1.588Z" /><path fill="currentColor" d="M9.969 15.857h1.059V6.171a14.236 14.236 0 0 0-1.06 0v9.686Z" /></svg>;
}

function SoundIcon({ muted }) {
  return <svg viewBox="0 0 24 24" className="size-5"><path fill="currentColor" d={muted ? "m19.8 22.6-3.025-3.025q-.625.4-1.325.688t-1.45.462v-2.05q.35-.125.688-.25t.637-.3L12 14.8V20l-5-5H3V9h3.2L1.4 4.2l1.4-1.4 18.4 18.4zm-.2-5.8-1.45-1.45q.425-.775.638-1.625t.212-1.75q0-2.35-1.375-4.2T14 5.275v-2.05q3.1.7 5.05 3.138T21 11.975q0 1.325-.363 2.55T19.6 16.8m-3.35-3.35L14 11.2V7.95q1.175.55 1.838 1.65T16.5 12q0 .375-.062.738t-.188.712M12 9.2 9.4 6.6 12 4z" : "M14 20.725v-2.05q2.25-.65 3.625-2.5t1.375-4.2-1.375-4.2T14 5.275v-2.05q3.1.7 5.05 3.138T21 11.975t-1.95 5.613T14 20.725M3 15V9h4l5-5v16l-5-5zm11 1V7.95q1.175.55 1.838 1.65T16.5 12q0 1.275-.663 2.363T14 16"} /></svg>;
}

function AnimatedPrice({ value, active }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplayValue(0);
      return undefined;
    }
    let frame;
    let startedAt;
    const timer = window.setTimeout(() => {
      const update = (time) => {
        startedAt ??= time;
        const progress = Math.min((time - startedAt) / 600, 1);
        setDisplayValue(Number(value || 0) * easeOutCirc(progress));
        if (progress < 1) frame = window.requestAnimationFrame(update);
      };
      frame = window.requestAnimationFrame(update);
    }, 300);
    return () => {
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [active, value]);

  return money(displayValue);
}

function RippleGrid({ size, active, border = false, chroma = false }) {
  const center = (size - 1) / 2;
  return (
    <div className={`case-ripple-grid${border ? " is-border" : ""}${active ? " is-active" : ""}`} style={{ "--ripple-size": size }}>
      {Array.from({ length: size * size }, (_, index) => {
        const row = Math.floor(index / size);
        const column = index % size;
        const distance = Math.sqrt(((row - center) ** 2) + ((column - center) ** 2));
        const visible = border || distance <= size / 2;
        return <span key={index} className={visible ? "" : "is-hidden"} style={{ "--ripple-delay": `${Math.round(distance * 80)}ms`, "--ripple-opacity": Math.min(1, (((index * 7) % 15) + 1) * (border ? 0.1 : 0.125)), ...(chroma ? { "--ripple-cell-color": chromaColor(column / (size - 1)) } : {}) }} />;
      })}
    </div>
  );
}

function WinningInfo({ item, landed, revealed, casePrice }) {
  if (!item) return <div className="case-hit-info-slot" />;
  const isChroma = isChromaItem(item);
  const hitColor = landingColor(item);
  const showRipple = Number(item.price) >= Number(casePrice) * 2;
  return (
    <div className={`case-hit-info-slot${isChroma ? " is-chroma" : ""}${revealed ? " is-revealed" : ""}`} style={{ "--hit-color": hitColor }}>
      <div className={`case-item-glow-bg${isChroma ? " is-chroma" : ""}`}>
        <div className="case-circle-ripple">
          <div className="case-circle-ripple-big" />
          <div className="case-circle-ripple-middle" />
          <div className="case-circle-ripple-inner"><div /></div>
        </div>
      </div>
      <RippleGrid size={9} active={landed && showRipple} chroma={isChroma} />
      <div className="case-hit-copy">
        <div className="case-hit-copy-bg" />
        <p className={`case-hit-rarity${isChroma ? " is-chroma" : ""}`}>{isChroma ? "Chroma" : item.rarity}</p>
        <p className="case-hit-name">{item.name}</p>
        <div className="case-hit-price"><img src="/coin.webp" alt="" /><span><AnimatedPrice value={item.price} active={revealed} /></span></div>
      </div>
    </div>
  );
}

function Spinner({ caseItem, reels, quantity, spinning, result, landed, revealed, reelRefs, winnerIndex }) {
  const multi = quantity > 1;
  return (
    <div className={`cases-spinner case-opening-spinner relative sm:px-3 py-3 bg-[#243157] sm:rounded-2xl${multi ? " is-multi-reel" : ""}${quantity === 4 ? " is-four-reel" : ""}${!spinning && !result ? " is-pre-spin" : ""}`} style={{ "--item-gap": `${ITEM_GAP}px`, "--reels": quantity }}>
      <div className="case-stage-border" />
      <div className="case-border-reels">
        {Array.from({ length: quantity }, (_, index) => {
          const item = result?.results[index];
          const active = landed[index] && Number(item?.price) >= Number(caseItem.price) * 2.25;
          return <div key={index} className="case-border-reel" style={{ "--hit-color": landingColor(item) }}><RippleGrid size={8} active={active} border /></div>;
        })}
      </div>
      <div className="spinner-inner bg-[#1B2540] relative sm:rounded-[10px]">
        {!spinning && !result && <div className="prespin-overlay"><div className="relative max-w-[250px]"><img src={caseItem.imageUrl} alt={caseItem.name} className="relative w-full h-auto drop-shadow-[0_18px_18px_rgba(0,0,0,.3)]" /></div></div>}
        {result && <div className="case-hit-info">{result.results.map((item, index) => <WinningInfo key={`${item.itemId}-${index}`} item={item} landed={landed[index]} revealed={revealed[index]} casePrice={caseItem.price} />)}</div>}
        <div className="case-reels">
          {reels.map((reel, reelIndex) => <div key={`${quantity}-${reel.length}-${reelIndex}`} ref={(element) => { reelRefs.current[reelIndex] = element; }} className="case-reel-track">{reel.map((item, itemIndex) => <img key={`${item.itemId}-${itemIndex}`} src={itemImage(item)} alt="" className={`reel-item rounded-lg${itemIndex === winnerIndex && landed[reelIndex] ? " is-winning-item" : ""}`} />)}</div>)}
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item }) {
  const isChroma = isChromaItem(item);
  const glowColor = ITEM_GLOW_COLORS[item.rarity] || ITEM_GLOW_COLORS.Godly;
  const glowId = `case-item-glow-${item.itemId}`;
  return (
    <div className={`won-item case-item-card flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 py-5 bg-[#202D57]${isChroma ? " is-chroma" : ""}`}>
      {!isChroma && <svg className="absolute inset-0" viewBox="0 0 140 176" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(69.6723) rotate(90) scale(214.372 210.114)"><stop stopColor={glowColor} /><stop offset="1" stopColor="#182A39" stopOpacity="0" /></radialGradient></defs><rect width="140" height="176" fill={`url(#${glowId})`} fillOpacity="0.12" /></svg>}
      <div className="absolute top-3 right-3 z-2"><div className="chance-indicator"><div className="odds-display font-medium text-sm text-[#7D91CA]">{money(item.odds)}% </div><div className="range-display font-medium text-sm text-[#7D91CA]">{item.range[0]}-{item.range[1]}</div></div></div>
      <div className="w-10/12 mx-auto aspect-square relative z-1"><img loading="lazy" src={itemImage(item)} alt={item.fullName || item.name} className="absolute top-1/2 left-1/2 -translate-1/2 size-10/12 object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)]" /></div>
      <div className="flex flex-col mt-3 relative items-center z-1"><p className="font-medium text-[15px] text-left truncate max-w-full">{item.name}</p><div className="flex items-center gap-1.5"><img src="/coin.webp" alt="" className="size-4.5" /><span className="tabular-nums font-semibold">{money(item.price)}</span></div></div>
    </div>
  );
}

export default function CaseOpen({ slug, balanceType = "mm2" }) {
  const [caseItem, setCaseItem] = useState(null);
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reels, setReels] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [landed, setLanded] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [fairnessOpen, setFairnessOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fastSpin, setFastSpin] = useState(false);
  const [openingPending, setOpeningPending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reelRefs = useRef([]);
  const finishTimer = useRef();
  const revealTimers = useRef([]);
  const trackAnimations = useRef(new Set());
  const audioContext = useRef(null);
  const audioOutput = useRef(null);
  const audioReady = useRef(Promise.resolve());
  const soundBuffers = useRef({});
  const activeSounds = useRef(new Set());
  const mutedRef = useRef(muted);
  const spinDuration = fastSpin ? FAST_SPIN_DURATION : NORMAL_SPIN_DURATION;
  const { winnerIndex } = reelConfig(quantity, fastSpin);

  const stopCaseSounds = () => {
    activeSounds.current.forEach((source) => {
      try { source.stop(); } catch {}
    });
    activeSounds.current.clear();
  };

  const prepareCaseAudio = async () => {
    const context = audioContext.current;
    if (!context) return false;
    if (context.state === "suspended") await context.resume();
    await audioReady.current;
    return true;
  };

  const scheduleCaseSound = (name, startTime, delay = 0) => {
    if (mutedRef.current) return;
    const context = audioContext.current;
    const output = audioOutput.current;
    const buffer = soundBuffers.current[name];
    if (!context || !output || !buffer) return;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = CASE_SOUNDS[name].volume;
    source.connect(gain);
    gain.connect(output);
    activeSounds.current.add(source);
    source.addEventListener("ended", () => activeSounds.current.delete(source), { once: true });
    source.start(startTime + (delay / 1000));
  };

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return undefined;
    const context = new AudioContextClass();
    const output = context.createGain();
    output.gain.value = mutedRef.current ? 0 : 1;
    output.connect(context.destination);
    audioContext.current = context;
    audioOutput.current = output;
    audioReady.current = Promise.all(Object.entries(CASE_SOUNDS).map(async ([name, config]) => {
      const response = await fetch(config.src);
      if (!response.ok) throw new Error(`Could not load ${config.src}`);
      soundBuffers.current[name] = await context.decodeAudioData(await response.arrayBuffer());
    })).catch((audioError) => { console.error("Could not load case sounds.", audioError); });
    return () => {
      stopCaseSounds();
      soundBuffers.current = {};
      audioContext.current = null;
      audioOutput.current = null;
      context.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
    if (audioOutput.current) audioOutput.current.gain.value = muted ? 0 : 1;
  }, [muted]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    Promise.all([
      fetch(`/api/cases/${encodeURIComponent(slug)}`, { signal: controller.signal }).then(async (response) => { const payload = await response.json().catch(() => null); if (!response.ok) throw new Error(payload?.error || "Case not found."); return payload.case; }),
      fetch("/api/session", { signal: controller.signal }).then(async (response) => response.ok ? (await response.json()).user : null),
    ]).then(([loadedCase, sessionUser]) => {
      setCaseItem(loadedCase);
      setUser(sessionUser);
      setQuantity(1);
      setFastSpin(false);
      setOpeningPending(false);
      reelRefs.current = [];
      setReels([buildAmbientReel(loadedCase.items)]);
      document.title = `${loadedCase.name} :: MM2Wild`;
    }).catch((fetchError) => { if (fetchError.name !== "AbortError") setError(fetchError.message || "Could not load this case."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => {
      controller.abort();
      window.clearTimeout(finishTimer.current);
      revealTimers.current.forEach((timer) => window.clearTimeout(timer));
      trackAnimations.current.forEach((animation) => animation.cancel());
    };
  }, [slug]);

  const resetAmbientReels = (nextQuantity, nextFastSpin) => {
    if (!caseItem || spinning || openingPending) return;
    reelRefs.current = [];
    setResult(null);
    setLanded([]);
    setRevealed([]);
    setReels(Array.from({ length: nextQuantity }, () => buildAmbientReel(caseItem.items, nextQuantity, nextFastSpin)));
  };

  const selectQuantity = (nextQuantity) => {
    if (!caseItem || spinning || openingPending || nextQuantity === quantity) return;
    setQuantity(nextQuantity);
    resetAmbientReels(nextQuantity, fastSpin);
  };

  const toggleFastSpin = () => {
    if (!caseItem || spinning || openingPending) return;
    setFastSpin((current) => !current);
  };

  const sortedItems = useMemo(() => [...(caseItem?.items || [])].sort((left, right) => (left.odds - right.odds) || (left.range[0] - right.range[0])), [caseItem]);
  const totalPrice = (caseItem?.price || 0) * quantity;

  const runOpening = async (demo) => {
    if (!caseItem || spinning || openingPending) return;
    setError("");
    setOpeningPending(true);
    stopCaseSounds();
    const audioPreparation = prepareCaseAudio();
    try {
      const response = await fetch(`/api/cases/${encodeURIComponent(slug)}/open`, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ quantity, demo, balanceType }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "The case could not be opened.");
      const opening = payload.opening;
      const { multi, winnerIndex: landingIndex } = reelConfig(quantity, fastSpin);
      flushSync(() => {
        setReels(opening.results.map((winner) => buildWinningReel(caseItem.items, winner, quantity, fastSpin)));
        setResult(opening);
        setLanded([]);
        setRevealed([]);
        setSpinning(true);
        setOpeningPending(false);
      });
      reelRefs.current.forEach((track) => { if (track) track.style.transform = "translate3d(0,0,0)"; });
      const animationStartedAt = performance.now();
      const scheduleOpeningSounds = () => {
        const context = audioContext.current;
        if (!context || mutedRef.current) return;
        const elapsed = performance.now() - animationStartedAt;
        const soundStart = context.currentTime;
        const scheduleRemaining = (name, delay) => {
          const remaining = delay - elapsed;
          if (remaining >= 0) scheduleCaseSound(name, soundStart, remaining);
        };
        if (elapsed < 100) scheduleCaseSound("spin", soundStart);
        opening.results.forEach((winner, index) => {
          const landingDelay = spinDuration + (index * REEL_STAGGER);
          scheduleRemaining(index === 0 ? "land1" : "land2", landingDelay);
          if (Number(winner?.price) >= Number(caseItem.price) * 2) {
            scheduleRemaining("ripples", landingDelay + 150);
          }
          if (Number(winner?.price) >= Number(caseItem.price) * 2.25) {
            scheduleRemaining("borderRipples", landingDelay + 250);
          }
        });
      };
      const soundsLoaded = Object.keys(soundBuffers.current).length === Object.keys(CASE_SOUNDS).length && audioContext.current?.state === "running";
      if (soundsLoaded) scheduleOpeningSounds();
      else audioPreparation.then(scheduleOpeningSounds).catch(() => {});
      const motions = reelRefs.current.slice(0, quantity).map(async (track, index) => {
        if (!track) return;
        const renderedItemSize = track.querySelector(".reel-item")?.getBoundingClientRect().width || ITEM_SIZE;
        const halfItem = renderedItemSize / 2;
        const centerDestination = -(landingIndex * (renderedItemSize + ITEM_GAP) + halfItem);
        const randomOffset = Math.random() * ((halfItem - 1) * -2) + (halfItem - 1);
        const firstDestination = multi ? centerDestination - halfItem / 2 : centerDestination - randomOffset;
        const mainDuration = spinDuration + index * REEL_STAGGER;
        await animateTrack(track, multi ? "y" : "x", 0, firstDestination, mainDuration, easeOutCirc, trackAnimations.current);
        setLanded((current) => {
          const next = [...current];
          next[index] = true;
          return next;
        });
        revealTimers.current[index] = window.setTimeout(() => {
          setRevealed((current) => {
            const next = [...current];
            next[index] = true;
            return next;
          });
        }, REEL_STAGGER);
        await animateTrack(track, multi ? "y" : "x", firstDestination, centerDestination, CENTERING_DURATION, easeOutBack, trackAnimations.current);
      });
      await Promise.all(motions);
      finishTimer.current = window.setTimeout(() => {
        setSpinning(false);
        if (!demo && Number.isFinite(Number(opening.balance))) {
          const balanceField = balanceType === "crypto" ? "crypto_balance" : "mm2_balance";
          setUser((current) => current ? { ...current, [balanceField]: opening.balance } : current);
          window.dispatchEvent(new CustomEvent("mm2wild:balance-updated", { detail: balanceType === "crypto" ? { cryptoBalance: opening.balance } : { mm2Balance: opening.balance } }));
        }
      }, 0);
    } catch (openingError) {
      setOpeningPending(false);
      setError(openingError.message || "The case could not be opened.");
    }
  };

  const share = async () => { try { await navigator.clipboard.writeText(window.location.href); } catch {} };

  if (loading) return <div className="site-content"><div className="max-w-[1660px] mx-auto px-0 sm:px-4 md:px-12 py-6"><div className="h-100 rounded-2xl bg-[#202D57] animate-pulse" /></div></div>;
  if (!caseItem) return <div className="site-content"><div className="max-w-[1660px] mx-auto px-0 sm:px-4 md:px-12 py-16 text-center text-accent font-medium">{error || "Case not found."}</div></div>;

  return (
    <div className="site-content">
      <div className="max-w-[1660px] mx-auto flex flex-col @container/content px-0 sm:px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content case-page py-6 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between relative gap-2 md:gap-0">
            <div className="hidden md:flex md:flex-1 md:my-auto"><a href="/games/cases" className="text-accent hover:text-accent-light text-sm flex items-center font-medium transition-colors cursor-pointer"><ArrowIcon />BACK TO CASES</a></div>
            <div className="flex justify-center items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-auto"><div className="flex items-center gap-2.5"><p className="font-medium">{caseItem.name}</p><div className="size-1 rounded-full bg-white" /><div className="flex items-center gap-1"><img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5" /><span className="tabular-nums font-semibold">{money(caseItem.price)}</span></div></div></div>
            <div className="flex items-center justify-center gap-2 md:shrink-0 md:ml-3"><a href="/games/cases" className="md:hidden text-accent hover:text-accent-light text-sm flex items-center font-medium transition-colors cursor-pointer bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-3"><ArrowIcon /></a><button type="button" onClick={share} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-3 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"><LinkIcon />SHARE</button><button type="button" onClick={() => setFairnessOpen(true)} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-3 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"><ScaleIcon />FAIRNESS</button></div>
          </div>

          <Spinner caseItem={caseItem} reels={reels} quantity={quantity} spinning={spinning} result={result} landed={landed} revealed={revealed} reelRefs={reelRefs} winnerIndex={winnerIndex} />

          <div className="controls-container">
            <div className="controls-left flex items-center gap-1.5">{[1, 2, 3, 4].map((count) => <button key={count} type="button" disabled={spinning || openingPending} onClick={() => selectQuantity(count)} className={`size-11 rounded-xl overflow-hidden relative transition-colors cursor-pointer sm:size-11 disabled:opacity-50 disabled:pointer-events-none ${quantity === count ? "bg-[#57689A] shadow-[0_2px_0_#223364]" : "bg-[#232E50] shadow-[0_2px_0_#232C47] hover:bg-[#2F3E6C]/50"}`}>{quantity === count && <span className="size-5 absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent blur-xl" />}<span className={`relative font-bold drop-shadow-[0_2px_0_rgba(34,51,100,0.4)] ${quantity === count ? "text-white" : "text-accent"}`}>{count}</span></button>)}</div>
            <div className="controls-center"><button type="button" disabled={!user || spinning || openingPending} onClick={() => runOpening(false)} className="relative cursor-pointer outline-none flex select-none transition-opacity disabled:opacity-40 disabled:pointer-events-none group/button h-11"><span className="absolute left-0 right-0 bottom-0 top-0.75 rounded-lg bg-[#D38502] pointer-events-none" /><span className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-4 hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed h-[calc(100%-3px)] bg-[#F3B239] text-[#3A3869]"><span className="transition-opacity flex items-center justify-center size-full drop-shadow-[0_2px_0_#D38502]"><span className="font-bold">OPEN {quantity} FOR</span><img src="/coin.webp" alt="" className="bg-cover bg-center size-4 shrink-0 mx-1.5" /><span className="tabular-nums font-medium">{money(totalPrice)}</span></span></span></button></div>
            <div className="controls-right flex items-center gap-1.5"><button type="button" disabled={spinning || openingPending} onClick={() => runOpening(true)} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-11 px-3 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none">DEMO SPIN</button><button type="button" aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((value) => !value)} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg size-11 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"><SoundIcon muted={muted} /></button><button type="button" aria-label="Toggle fast spin" disabled={spinning || openingPending} onClick={toggleFastSpin} className={`text-accent rounded-lg size-11 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer relative overflow-hidden disabled:opacity-50 disabled:pointer-events-none ${fastSpin ? "bg-[#3D3270] hover:bg-[#4F428B]" : "bg-[#202D57] hover:bg-[#2D3D73]"}`}>{fastSpin && <span className="w-3 h-8 absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#E250FF] blur-lg" />}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`size-5${fastSpin ? " text-[#E250FF]" : ""}`}><path fill="currentColor" d="m8 22 1-7H4l9-13h2l-1 8h6L10 22z" /></svg></button></div>
          </div>

          {error && <div className="rounded-lg bg-[#6B2D43]/55 border border-[#E55D87]/30 px-4 py-3 text-sm text-[#FFADC5] text-center">{error}</div>}
          <div className="flex flex-col gap-3 px-1 sm:px-0"><div className="flex items-center gap-3"><p className="text-lg font-semibold">ITEMS FOUND IN THIS CASE</p><div className="bg-linear-to-r from-[#E5AD4E] to-transparent h-0.5 flex-1" /></div><div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">{sortedItems.map((item) => <ItemCard key={item.itemId} item={item} />)}</div></div>
        </div>
      </div>

      {fairnessOpen && <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4" onMouseDown={() => setFairnessOpen(false)}><div className="w-full max-w-lg rounded-2xl bg-[#202D57] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex justify-between items-center"><h2 className="font-bold text-xl">CASE FAIRNESS</h2><button type="button" onClick={() => setFairnessOpen(false)} className="text-accent text-2xl cursor-pointer">×</button></div><p className="text-sm text-accent mt-3">Each opening uses a cryptographically secure ticket from 0 to 9,999,999. The ticket is matched against the ranges shown on every item.</p>{result ? <div className="mt-4 space-y-3 text-xs break-all"><div><p className="text-accent mb-1">SERVER SEED HASH</p><p>{result.fairness.serverSeedHash}</p></div><div><p className="text-accent mb-1">SERVER SEED</p><p>{result.fairness.serverSeed}</p></div>{result.results.map((item, index) => <div key={index}><span className="text-accent">REEL {index + 1} TICKET:</span> {item.ticket}</div>)}</div> : <p className="mt-4 text-sm text-accent">Complete a spin to reveal its seed and ticket numbers.</p>}</div></div>}
    </div>
  );
}
