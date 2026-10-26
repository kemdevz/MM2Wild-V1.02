import { useEffect, useMemo, useState } from "react";
import SquircleLoader from "./SquircleLoader";

const RISK_COLORS = ["rgb(92, 223, 154)", "rgb(223, 138, 92)", "rgb(223, 92, 92)"];
const ITEM_GLOW_COLORS = { Ancient: "#5C17DE", Godly: "#F10AA8", Vintage: "#E3C608", Legendary: "#DD0005", Unique: "#F08C00", Common: "#A6A6A6", Uncommon: "#01FEFF", Rare: "#00C703" };
const caseDetailsCache = new Map();

function Icon({ children, className = "size-5", viewBox = "0 0 24 24", ...props }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className={className} aria-hidden="true" {...props}>{children}</svg>;
}

function RiskBar({ item }) {
  return (
    <div className="relative flex w-full gap-1 shrink-0 h-1.25">
      {RISK_COLORS.map((color, index) => <div key={color} className="flex-1" style={{ backgroundColor: color, opacity: item.risk === index ? 1 : 0.15 }} />)}
      <div className="absolute top-1/2 h-2.5 w-0.75 -translate-1/2 bg-white" style={{ left: `${item.marker}%` }} />
    </div>
  );
}

function CaseDropItem({ item }) {
  const glowColor = ITEM_GLOW_COLORS[item.rarity] || ITEM_GLOW_COLORS.Godly;
  const glowId = `battle-case-drop-${item.itemId}`;
  return (
    <div className="won-item flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 py-5" style={{ background: 'url("/leafs-item.png") center / cover no-repeat, rgb(32, 45, 87)' }}>
      <svg className="absolute inset-0" viewBox="0 0 140 176" fill="none" aria-hidden="true">
        <defs><radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(69.6723) rotate(90) scale(214.372 210.114)"><stop stopColor={glowColor} /><stop offset="1" stopColor="#182A39" stopOpacity="0" /></radialGradient></defs>
        <rect width="140" height="176" fill={`url(#${glowId})`} fillOpacity="0.12" />
      </svg>
      <div className="w-10/12 mx-auto aspect-square relative z-1">
        <img loading="lazy" src={item.itemId != null ? `/items/${item.itemId}.webp` : item.imageUrl} alt={item.fullName || item.name} className="absolute top-1/2 left-1/2 -translate-1/2 size-10/12 object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)]" />
      </div>
      <div className="flex flex-col mt-3 relative items-center z-1">
        <p className="font-medium text-[15px] text-left truncate max-w-full">{item.name}</p>
        <div className="flex items-center gap-1.5"><img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5" /><span className="tabular-nums font-semibold">{Number(item.price || 0).toLocaleString("en-US")}</span></div>
      </div>
      <div className="absolute top-3 right-3 z-2"><div className="chance-indicator"><div className="odds-display font-medium text-sm text-[#7D91CA]">{Number(item.odds || 0).toLocaleString("en-US", { maximumFractionDigits: 3 })}% </div><div className="range-display font-medium text-sm text-[#7D91CA]">{item.range?.[0]}-{item.range?.[1]}</div></div></div>
    </div>
  );
}

export default function BattleCaseDropsModal({ summary, onClose }) {
  const [caseItem, setCaseItem] = useState(() => caseDetailsCache.get(summary.slug) || null);
  const [error, setError] = useState("");

  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  useEffect(() => {
    if (caseItem) return undefined;
    const controller = new AbortController();
    fetch(`/api/cases/${encodeURIComponent(summary.slug)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.case) throw new Error(payload?.error || "Could not load case drops.");
        caseDetailsCache.set(summary.slug, payload.case);
        setCaseItem(payload.case);
      })
      .catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message); });
    return () => controller.abort();
  }, [caseItem, summary.slug]);

  const shownCase = caseItem || summary;
  const sortedItems = useMemo(() => [...(caseItem?.items || [])].sort((left, right) => (left.odds - right.odds) || ((left.range?.[0] || 0) - (right.range?.[0] || 0))), [caseItem]);
  return (
    <>
      <div data-state="open" className="fixed inset-0 z-[10000] bg-[rgba(21,29,62,0.7)] data-[state=open]:animate-in data-[state=open]:fade-in-0" onMouseDown={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Case Drops" className="fixed left-1/2 top-1/2 z-[10001] -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col animate-in fade-in-0 zoom-in-95" style={{ maxWidth: "min(100dvw - 24px, 780px)", maxHeight: "calc(100% - 24px)" }}>
        {!caseItem && !error ? <div className="flex items-center justify-center"><SquircleLoader /></div> : (
          <div className="max-h-[calc(100dvh-48px)] relative shadow-lg bg-[#192243] rounded-2xl overflow-hidden flex flex-col">
            <h2 className="sr-only">Case Drops</h2>
            <div className="p-5 bg-[#1D284E] flex items-center gap-3 shrink-0 relative">
              <div className="size-18 relative"><img src={shownCase.imageUrl} alt={shownCase.name} width="72" height="72" className="size-full object-contain" /></div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="font-medium uppercase truncate pr-8">{shownCase.name}</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-9.5 relative shrink-0"><div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#192963] rounded-lg" /><div className="flex items-center gap-1.5 px-3 py-1.5 h-[calc(100%-3px)] bg-[#2A3868] text-white text-sm rounded-lg relative"><img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5" /><span className="tabular-nums font-semibold">{Number(shownCase.price || 0).toLocaleString("en-US")}</span></div></div>
                  <div className="px-2.75 h-9.5 flex items-center bg-[rgba(17,23,45,0.4)] rounded-md flex-1 max-w-60"><RiskBar item={shownCase} /></div>
                </div>
              </div>
              <button type="button" aria-label="Close case drops" onClick={onClose} className="text-accent cursor-pointer absolute top-5 right-5"><Icon className="size-4.5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" /></Icon></button>
            </div>
            <div className="max-h-120 overflow-y-auto scrollbar-hide p-5 flex flex-col gap-5">
              <div className="flex items-center gap-3"><p className="font-medium">ITEMS DROPS IN THE CASE</p><div className="bg-[#1D284E] rounded-full h-0.5 flex-1" /></div>
              {error ? <p className="py-10 text-center text-sm font-medium text-accent">{error}</p> : <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">{sortedItems.map((item) => <CaseDropItem key={item.itemId} item={item} />)}</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
