import { useEffect, useMemo, useRef, useState } from "react";

const ITEM_SIZE = 136;
const ITEM_GAP = 20;
const WINNER_INDEX = 42;
const RARITY_COLORS = {
  Unique: "rgba(255, 196, 69, .24)",
  Ancient: "rgba(255, 92, 92, .22)",
  Godly: "rgba(196, 76, 255, .2)",
  Chroma: "rgba(81, 192, 255, .22)",
  Vintage: "rgba(76, 137, 255, .2)",
  Legendary: "rgba(255, 102, 74, .2)",
};

function money(value) {
  return Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function weightedItem(items) {
  const ticket = Math.floor(Math.random() * 10_000_000);
  return items.find((item) => ticket >= item.range[0] && ticket <= item.range[1]) || items.at(-1);
}

function buildReel(items, winner) {
  const reel = Array.from({ length: 50 }, () => weightedItem(items));
  reel[WINNER_INDEX] = winner;
  return reel;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" className="size-4.5" style={{ strokeWidth: 3.5 }}><path fill="none" stroke="currentColor" d="m12 19-7-7 7-7m7 7H5" /></svg>;
}

function LinkIcon() {
  return <svg viewBox="0 0 24 24" className="size-5 mr-1.25"><path fill="currentColor" d="m17.657 14.828-1.415-1.414L17.658 12A4 4 0 1 0 12 6.343l-1.414 1.414L9.17 6.343l1.415-1.414a6 6 0 0 1 8.485 8.485zm-2.829 2.829-1.414 1.414a6 6 0 0 1-8.485-8.485l1.414-1.414 1.414 1.414L6.343 12A4 4 0 0 0 12 17.657l1.414-1.414zm0-9.9 1.415 1.415-7.072 7.07-1.414-1.414z" /></svg>;
}

function ScaleIcon() {
  return <svg fill="none" viewBox="0 0 21 20" className="size-5 mr-1.25"><path fill="currentColor" d="M8.912 11.375a.53.53 0 0 0-.53-.53h-.184L6.384 6.753c-.348.091-.698.171-1.05.24l1.706 3.852H3.372l1.684-3.8c-.41.074-.822.133-1.236.177l-1.606 3.623H2.03a.53.53 0 0 0-.529.53c-.008 1.82 1.933 3.04 3.706 3 1.772.041 3.714-1.181 3.706-3ZM18.972 10.845h-.185l-1.605-3.623a17.132 17.132 0 0 1-1.236-.176l1.683 3.8h-3.667l1.707-3.852a17.11 17.11 0 0 1-1.052-.241l-1.813 4.092h-.185a.53.53 0 0 0-.53.53c0 .827.404 1.596 1.136 2.165 1.364 1.106 3.777 1.106 5.142 0 .732-.57 1.135-1.338 1.135-2.165a.53.53 0 0 0-.53-.53ZM2.03 6.257c1.453 0 2.9-.197 4.3-.586a15.584 15.584 0 0 1 8.34 0c1.4.389 2.847.586 4.3.586.6 0 .737-.842.168-1.032a23.547 23.547 0 0 1-3.98-1.75l-.836-.465a7.892 7.892 0 0 0-3.292-.972v-.546c-.026-.701-1.034-.7-1.06 0v.546a7.892 7.892 0 0 0-3.292.972l-.837.465a23.543 23.543 0 0 1-3.979 1.75c-.57.19-.433 1.032.168 1.032ZM12.617 16.916H8.38c-.877 0-1.588.711-1.588 1.588 0 .293.237.53.53.53h6.352a.53.53 0 0 0 .53-.53c0-.877-.711-1.588-1.588-1.588Z" /><path fill="currentColor" d="M9.969 15.857h1.059V6.171a14.236 14.236 0 0 0-1.06 0v9.686Z" /></svg>;
}

function Reel({ reel, reelRef, spinning, delay = 0 }) {
  return (
    <div ref={reelRef} className="relative h-40 overflow-hidden bg-[#1B2749] border-y border-[#35436D]">
      <div className="absolute inset-y-0 left-1/2 z-10 w-0.75 -translate-x-1/2 bg-[#F3B239] shadow-[0_0_18px_rgba(243,178,57,.65)]" />
      <div className="absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-[#243157] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-[#243157] to-transparent pointer-events-none" />
      <div
        className="case-reel-track absolute left-0 top-3 flex"
        style={{
          gap: ITEM_GAP,
          transform: "translate3d(0,0,0)",
          transition: spinning ? `transform 4.8s cubic-bezier(.12,.75,.08,1) ${delay}ms` : "none",
        }}
      >
        {reel.map((item, index) => (
          <div key={`${item.itemId}-${index}`} className="shrink-0 rounded-lg bg-[#202D57] relative overflow-hidden" style={{ width: ITEM_SIZE, height: ITEM_SIZE, background: `radial-gradient(circle at 50% 0%, ${RARITY_COLORS[item.rarity] || RARITY_COLORS.Godly}, #202D57 72%)` }}>
            <img src={item.imageUrl} alt={item.fullName || item.name} className="size-full object-contain p-3 drop-shadow-[0_10px_8px_rgba(0,0,0,.32)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemCard({ item }) {
  return (
    <div className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 py-5 bg-[#202D57]" style={{ background: `url('/leafs-item.png') center/cover no-repeat, radial-gradient(circle at 50% 0%, ${RARITY_COLORS[item.rarity] || RARITY_COLORS.Godly}, #202D57 68%)` }}>
      <div className="w-10/12 mx-auto aspect-square relative">
        <img loading="lazy" src={item.imageUrl} alt={item.fullName || item.name} className="absolute top-1/2 left-1/2 -translate-1/2 size-10/12 object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)]" />
      </div>
      <div className="flex flex-col mt-3 relative items-center">
        <p className="font-medium text-[15px] text-left truncate max-w-full">{item.name}</p>
        <div className="flex items-center gap-1.5"><img src="/coin.webp" alt="" className="size-4.5" /><span className="tabular-nums font-semibold">{money(item.price)}</span></div>
      </div>
      <div className="absolute top-3 right-3 text-sm text-[#7D91CA] font-medium text-right"><div>{money(item.odds)}%</div><div>{item.range[0]}-{item.range[1]}</div></div>
    </div>
  );
}

export default function CaseOpen({ slug }) {
  const [caseItem, setCaseItem] = useState(null);
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reels, setReels] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [fairnessOpen, setFairnessOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reelRefs = useRef([]);
  const finishTimer = useRef();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    Promise.all([
      fetch(`/api/cases/${encodeURIComponent(slug)}`, { signal: controller.signal }).then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error || "Case not found.");
        return payload.case;
      }),
      fetch("/api/session", { signal: controller.signal }).then(async (response) => response.ok ? (await response.json()).user : null),
    ]).then(([loadedCase, sessionUser]) => {
      setCaseItem(loadedCase);
      setUser(sessionUser);
      setReels([Array.from({ length: 50 }, () => weightedItem(loadedCase.items))]);
      document.title = `${loadedCase.name} :: MM2Wild`;
    }).catch((fetchError) => {
      if (fetchError.name !== "AbortError") setError(fetchError.message || "Could not load this case.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => {
      controller.abort();
      window.clearTimeout(finishTimer.current);
    };
  }, [slug]);

  useEffect(() => {
    if (!caseItem || spinning) return;
    setResult(null);
    setReels(Array.from({ length: quantity }, () => Array.from({ length: 50 }, () => weightedItem(caseItem.items))));
  }, [caseItem, quantity]);

  const sortedItems = useMemo(() => [...(caseItem?.items || [])].sort((left, right) => left.range[0] - right.range[0]), [caseItem]);
  const totalPrice = (caseItem?.price || 0) * quantity;

  const runOpening = async (demo) => {
    if (!caseItem || spinning) return;
    setError("");
    setResult(null);
    try {
      const response = await fetch(`/api/cases/${encodeURIComponent(slug)}/open`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quantity, demo }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "The case could not be opened.");
      const opening = payload.opening;
      const nextReels = opening.results.map((winner) => buildReel(caseItem.items, winner));
      setReels(nextReels);
      setSpinning(false);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      reelRefs.current.forEach((element) => {
        const track = element?.querySelector(".case-reel-track");
        if (track) track.style.transform = "translate3d(0,0,0)";
      });
      setSpinning(true);
      requestAnimationFrame(() => {
        reelRefs.current.forEach((element) => {
          const track = element?.querySelector(".case-reel-track");
          if (!track || !element) return;
          const destination = element.clientWidth / 2 - (WINNER_INDEX * (ITEM_SIZE + ITEM_GAP) + ITEM_SIZE / 2);
          track.style.transform = `translate3d(${destination}px,0,0)`;
        });
      });
      finishTimer.current = window.setTimeout(() => {
        setSpinning(false);
        setResult(opening);
        if (!demo && Number.isFinite(Number(opening.balance))) {
          setUser((current) => current ? { ...current, mm2_balance: opening.balance } : current);
          window.dispatchEvent(new CustomEvent("mm2wild:balance-updated", { detail: { mm2Balance: opening.balance } }));
        }
      }, 5200 + (quantity - 1) * 90);
    } catch (openingError) {
      setError(openingError.message || "The case could not be opened.");
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  if (loading) return <div className="site-content"><div className="max-w-[1296px] mx-auto px-4 md:px-12 py-6"><div className="h-100 rounded-2xl bg-[#202D57] animate-pulse" /></div></div>;
  if (!caseItem) return <div className="site-content"><div className="max-w-[1296px] mx-auto px-4 md:px-12 py-16 text-center text-accent font-medium">{error || "Case not found."}</div></div>;

  return (
    <div className="site-content">
      <div className="max-w-[1296px] mx-auto flex flex-col px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content case-page py-6 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between relative gap-2">
            <div className="hidden md:flex md:flex-1"><a href="/games/cases" className="text-accent hover:text-white text-sm flex items-center font-medium transition-colors"><ArrowIcon /><span className="ml-1.5">BACK TO CASES</span></a></div>
            <div className="flex justify-center items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-1/2"><div className="flex items-center gap-2.5"><p className="font-medium">{caseItem.name}</p><div className="size-1 rounded-full bg-white" /><div className="flex items-center gap-1"><img src="/coin.webp" alt="" className="size-4.5" /><span className="tabular-nums font-semibold">{money(caseItem.price)}</span></div></div></div>
            <div className="flex items-center justify-center gap-2 md:ml-3"><a href="/games/cases" className="md:hidden text-accent bg-[#202D57] rounded-lg size-10 flex items-center justify-center"><ArrowIcon /></a><button type="button" onClick={share} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-3 text-sm font-medium flex items-center transition-colors cursor-pointer"><LinkIcon />SHARE</button><button type="button" onClick={() => setFairnessOpen(true)} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-3 text-sm font-medium flex items-center transition-colors cursor-pointer"><ScaleIcon />FAIRNESS</button></div>
          </div>

          <div className="relative py-3 bg-[#243157] sm:rounded-2xl overflow-hidden flex flex-col gap-2">
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #8295CC 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
            {reels.map((reel, index) => <Reel key={index} reel={reel} reelRef={(element) => { reelRefs.current[index] = element; }} spinning={spinning} delay={index * 90} />)}
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex items-center gap-1.5 lg:justify-self-start">{[1, 2, 3, 4].map((count) => <button key={count} type="button" disabled={spinning} onClick={() => setQuantity(count)} className={`size-11 rounded-xl font-bold cursor-pointer transition-colors ${quantity === count ? "bg-[#57689A] text-white shadow-[0_2px_0_#223364]" : "bg-[#232E50] text-accent shadow-[0_2px_0_#232C47] hover:bg-[#2F3E6C]"}`}>{count}</button>)}</div>
            <div className="flex flex-col items-center gap-1">
              <button type="button" disabled={!user || spinning} onClick={() => runOpening(false)} className="relative h-11 min-w-54 disabled:opacity-40 disabled:cursor-not-allowed group"><span className="absolute inset-x-0 top-1/2 bottom-0 rounded-lg bg-[#D38502]" /><span className="relative h-[calc(100%-3px)] px-5 rounded-lg bg-[#F3B239] text-[#3A3869] font-bold flex items-center justify-center group-enabled:hover:-translate-y-0.5 transition-transform">OPEN {quantity} FOR <img src="/coin.webp" alt="" className="size-4 mx-1.5" />{money(totalPrice)}</span></button>
              {!user && <span className="text-xs text-accent">Sign in to open with your balance</span>}
            </div>
            <div className="lg:justify-self-end"><button type="button" disabled={spinning} onClick={() => runOpening(true)} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] disabled:opacity-40 rounded-lg h-11 px-4 text-sm font-medium transition-colors cursor-pointer">DEMO SPIN</button></div>
          </div>

          {error && <div className="rounded-lg bg-[#6B2D43]/55 border border-[#E55D87]/30 px-4 py-3 text-sm text-[#FFADC5] text-center">{error}</div>}
          {result && <div className="rounded-xl bg-[#202D57] p-4 flex flex-wrap items-center justify-center gap-4"><span className="font-bold text-[#F3B239]">YOU WON</span>{result.results.map((item, index) => <div key={`${item.itemId}-${index}`} className="flex items-center gap-2"><img src={item.imageUrl} alt="" className="size-10 object-contain" /><span className="font-medium">{item.name}</span><img src="/coin.webp" alt="" className="size-4" /><span className="font-semibold">{money(item.price)}</span></div>)}</div>}

          <div className="flex flex-col gap-3 px-1 sm:px-0"><div className="flex items-center gap-3"><p className="text-lg font-semibold">ITEMS FOUND IN THIS CASE</p><div className="bg-linear-to-r from-[#E5AD4E] to-transparent h-0.5 flex-1" /></div><div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">{sortedItems.map((item) => <ItemCard key={item.itemId} item={item} />)}</div></div>
        </div>
      </div>

      {fairnessOpen && <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4" onMouseDown={() => setFairnessOpen(false)}><div className="w-full max-w-lg rounded-2xl bg-[#202D57] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex justify-between items-center"><h2 className="font-bold text-xl">CASE FAIRNESS</h2><button type="button" onClick={() => setFairnessOpen(false)} className="text-accent text-2xl cursor-pointer">×</button></div><p className="text-sm text-accent mt-3">Each opening uses a cryptographically secure ticket from 0 to 9,999,999. The ticket is matched against the ranges shown on every item.</p>{result ? <div className="mt-4 space-y-3 text-xs break-all"><div><p className="text-accent mb-1">SERVER SEED HASH</p><p>{result.fairness.serverSeedHash}</p></div><div><p className="text-accent mb-1">SERVER SEED</p><p>{result.fairness.serverSeed}</p></div>{result.results.map((item, index) => <div key={index}><span className="text-accent">REEL {index + 1} TICKET:</span> {item.ticket}</div>)}</div> : <p className="mt-4 text-sm text-accent">Complete a spin to reveal its seed and ticket numbers.</p>}</div></div>}
    </div>
  );
}
