import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BattleCaseDropsModal from "./BattleCaseDropsModal";
import SquircleLoader from "./SquircleLoader";

const RISK_COLORS = ["rgb(92, 223, 154)", "rgb(223, 138, 92)", "rgb(223, 92, 92)"];

function Icon({ children, className = "size-5", viewBox = "0 0 24 24", ...props }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className={className} aria-hidden="true" {...props}>{children}</svg>;
}

function CoinValue({ value, size = "size-4.5", className = "font-medium" }) {
  return <div className="flex items-center gap-1.5"><img src="/coin.webp" alt="" className={`bg-cover bg-center ${size}`} /><span className={`tabular-nums ${className}`}>{Math.round(value).toLocaleString("en-US")}</span></div>;
}

function RiskBar({ item }) {
  return (
    <div className="relative flex w-full gap-1 shrink-0 h-1">
      {RISK_COLORS.map((color, index) => <div key={color} className="flex-1" style={{ backgroundColor: color, opacity: item.risk === index ? 1 : 0.15 }} />)}
      <div className="absolute top-1/2 h-2.5 w-0.75 -translate-1/2 bg-white" style={{ left: `${item.marker}%` }} />
    </div>
  );
}

function CaseQuantityControl({ quantity, onDecrease, onIncrease, onQuantityChange }) {
  const buttonClass = "size-6.5 bg-[#364677] hover:bg-[#4A5A8A] rounded-lg text-sm font-semibold shrink-0 transition-colors cursor-pointer outline-none flex items-center justify-center";
  return (
    <div className="w-full flex bg-[rgba(24,31,52,0.5)] rounded-lg text-sm font-semibold shrink-0 p-1 gap-0.5">
      <button type="button" onClick={onDecrease} className={buttonClass}><p className="drop-shadow-[0_2px_0_#293A6C]">-</p></button>
      <input type="text" inputMode="numeric" pattern="[0-9]*" value={quantity} min="1" max="25" onChange={(event) => onQuantityChange(event.target.value)} className="flex-1 min-w-0 bg-transparent text-center text-white font-semibold text-sm outline-none border-none" aria-label="Case quantity" />
      <button type="button" onClick={onIncrease} className={buttonClass}><p className="drop-shadow-[0_2px_0_#293A6C]">+</p></button>
    </div>
  );
}

function PickerCaseCard({ item, quantity, add, remove, setQuantity, onInspect }) {
  return (
    <div className="relative group" onContextMenu={(event) => { event.preventDefault(); onInspect(item); }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all delay-200">
        <div className="bg-[#57689A] p-2 rounded-lg shadow-lg whitespace-nowrap"><p className="text-sm font-medium text-white uppercase">Right-click to inspect</p></div>
      </div>
      <div className="flex flex-col bg-[#202D57] p-4 pt-5 max-w-full relative rounded-xl overflow-hidden h-56">
        <img src="/leafs.png" alt="" className="object-contain size-[145%] absolute left-1/2 -translate-x-7/12 -top-[14%] pointer-events-none max-w-none select-none" />
        <div className="h-full mx-auto aspect-square relative"><div className="absolute -translate-1/2 left-1/2 top-1/2 size-31 mt-2"><img src={item.imageUrl} alt="" className="absolute inset-0 size-full object-contain blur-[32px] opacity-60" /><img src={item.imageUrl} alt={item.name} className="absolute inset-0 size-full object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)]" /></div></div>
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-8 relative w-max"><div className="absolute top-1/2 inset-x-0 bottom-0 bg-[#293A6C] rounded-lg" /><div className="h-[calc(100%-3px)] bg-[#364677] px-3 flex items-center rounded-lg relative"><CoinValue value={item.price} size="size-4" className="font-medium text-sm" /></div></div>
          <p className="font-medium text-[15px] truncate text-center leading-none">{item.name}</p>
          <RiskBar item={item} />
          {quantity ? <CaseQuantityControl quantity={quantity} onDecrease={remove} onIncrease={add} onQuantityChange={setQuantity} /> : <button type="button" onClick={add} className="w-full h-8.5 bg-[#364677] hover:bg-[#4A5A8A] px-3.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer">ADD CASE</button>}
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ open = false }) {
  return <Icon className={`size-4 shrink-0 transition-transform ml-2${open ? " rotate-180" : ""}`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" /></Icon>;
}

function SelectButton({ children, open, onClick, containerRef }) {
  return (
    <div ref={containerRef} className="h-11 relative group/button">
      <div className="absolute top-1/2 inset-x-0 bottom-0 bg-[#223364] rounded-lg" />
      <button type="button" role="combobox" aria-expanded={open} data-state={open ? "open" : "closed"} onClick={onClick} className="w-full h-[calc(100%-3px)] bg-[#57689A] group-hover/button:-translate-y-0.5 data-[state=open]:translate-y-0 transition-transform duration-125 text-white [&>*]:drop-shadow-[0_2px_0_#223364] rounded-lg px-4 flex items-center outline-none cursor-pointer group relative">
        {children}<ChevronIcon open={open} />
      </button>
    </div>
  );
}

function Dropdown({ children, anchorRef, className = "" }) {
  const [position, setPosition] = useState(null);
  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      setPosition({ left: Math.round(rect.left * pixelRatio) / pixelRatio, top: rect.bottom + (16 / 3), width: rect.width });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef]);
  if (!position) return null;
  return createPortal(
    <div role="listbox" className={`fixed z-[9999] bg-[#263457] flex flex-col gap-1.5 rounded-lg p-2 shadow-md outline-none animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150 ${className}`} style={{ left: `${position.left}px`, top: `${position.top}px`, width: `${position.width}px` }}><div role="presentation">{children}</div></div>,
    document.body,
  );
}

function DropdownOption({ selected, children, onClick }) {
  return (
    <button type="button" role="option" aria-selected={selected} data-state={selected ? "checked" : "unchecked"} onClick={onClick} className="group/dropdown-item flex h-9.5 w-full relative items-center cursor-default select-none outline-none">
      <span className="absolute left-2 flex size-3.5 items-center justify-center">{selected && <span aria-hidden="true"><Icon className="size-4"><path fill="none" stroke="currentColor" d="M20 6 9 17l-5-5" /></Icon></span>}</span>
      <div className={`absolute top-1/3 left-0 right-0 bottom-0 rounded-lg transition-colors duration-100 ${selected ? "bg-[#344986]" : "group-hover/dropdown-item:bg-[#344986]"}`} />
      <div className={`h-[calc(100%-3px)] flex items-center gap-2 select-none rounded-lg px-2.5 text-sm font-medium transition-colors duration-100 outline-none cursor-pointer w-full relative [&>*]:drop-shadow-[0_2px_0_#223364] ${selected ? "bg-[#57689A]" : "group-hover/dropdown-item:bg-[#57689A]"}`}><span className={`font-semibold transition-colors duration-100 ${selected ? "text-white" : "text-accent group-hover/dropdown-item:text-white"}`}>{children}</span></div>
    </button>
  );
}

function RaisedButton({ children, className = "", innerClassName = "", onClick }) {
  return (
    <button type="button" onClick={onClick} className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 ${className}`}>
      <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none bg-[#D38502]" style={{ top: "var(--sb-shadow-size,3px)" }} />
      <div className={`font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3 rounded-lg bg-primary text-[#3A3869] ${innerClassName}`} style={{ height: "calc(100% - var(--sb-shadow-size,3px))" }}><div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(0 2px 0 #D38502)" }}>{children}</div></div>
    </button>
  );
}

export default function BattleCasePickerModal({ cases, selected, setSelected, onClose }) {
  const [loading, setLoading] = useState(true);
  const [inspectedCase, setInspectedCase] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("highest");
  const [sortOpen, setSortOpen] = useState(false);
  const [range, setRange] = useState("all");
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeTriggerRef = useRef(null);
  const sortTriggerRef = useRef(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = cases.filter((item) => !query || item.name.toLowerCase().includes(query));
    if (range !== "all") {
      const [min, max] = range.split("-").map(Number);
      result = result.filter((item) => item.price >= min && (!max || item.price <= max));
    }
    return [...result].sort((a, b) => sort === "lowest" ? a.price - b.price : b.price - a.price);
  }, [cases, range, search, sort]);
  const cost = [...selected.values()].reduce((sum, entry) => sum + entry.caseItem.price * entry.quantity, 0);
  const rounds = [...selected.values()].reduce((sum, entry) => sum + entry.quantity, 0);
  const change = (item, difference) => setSelected((current) => {
    const next = new Map(current);
    const quantity = (next.get(item.slug)?.quantity || 0) + difference;
    if (quantity <= 0) next.delete(item.slug);
    else next.set(item.slug, { caseItem: item, quantity: Math.min(25, quantity) });
    return next;
  });
  const setQuantity = (item, value) => setSelected((current) => {
    const next = new Map(current);
    const quantity = Math.min(25, Math.max(1, Number.parseInt(String(value).replace(/\D/g, ""), 10) || 1));
    next.set(item.slug, { caseItem: item, quantity });
    return next;
  });
  return (
    <div data-state="open" className="fixed inset-0 z-[9998] bg-[rgba(21,29,62,0.7)] flex items-center justify-center p-3 data-[state=open]:animate-in data-[state=open]:fade-in-0" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      {loading ? <div role="dialog" aria-modal="true" aria-label="Loading cases" className="flex items-center justify-center"><SquircleLoader /></div> : <div role="dialog" aria-modal="true" aria-label="Add cases" className="relative w-full max-w-[960px] max-h-[min(calc(100vh-24px),760px)] bg-[#1D284E] rounded-2xl shadow-lg flex flex-col overflow-hidden">
        <div className="flex flex-col gap-5.5 overflow-y-auto p-4.5 sm:p-6 mb-21 scrollbar-hide">
          <div className="flex items-center justify-between gap-2"><h2 className="text-xl font-bold flex items-center gap-2"><Icon viewBox="0 0 16 14" className="size-5 text-[#E5AD4E]"><path fill="currentColor" d="m.456 3.777 1.768-2.273a.364.364 0 0 1 .287-.14h1.871c.277 0 .453.298.318.54L3.437 4.177a.364.364 0 0 1-.318.187H.744a.364.364 0 0 1-.288-.587ZM2.057 13.094.122 5.82a.364.364 0 0 1 .351-.457h3.118c.165 0 .31.11.352.27l1.935 7.272a.364.364 0 0 1-.351.458H2.409a.364.364 0 0 1-.352-.27ZM13.943 13.094l1.935-7.273a.364.364 0 0 0-.351-.457h-3.118c-.165 0-.31.11-.352.27l-1.935 7.272a.364.364 0 0 0 .351.458h3.118c.165 0 .31-.111.352-.27ZM15.543 3.777l-1.767-2.273a.364.364 0 0 0-.287-.14h-1.871a.364.364 0 0 0-.318.54l1.263 2.273a.364.364 0 0 0 .318.187h2.376a.364.364 0 0 0 .287-.587ZM8 1.54l-.467 1.13A2.741 2.741 0 0 1 5 4.363L6.014.887a.727.727 0 0 1 .698-.523h2.576c.323 0 .608.213.698.523L11 4.364a2.83 2.83 0 0 1-2.668-1.886L8 1.54ZM7.752 7.932 5.419 5.755a.182.182 0 0 0-.302.17l1.43 6.86c.07.337.367.579.711.579h1.484a.727.727 0 0 0 .712-.58l1.43-6.86a.182.182 0 0 0-.303-.17L8.248 7.933a.364.364 0 0 1-.496 0Z" /><path fill="currentColor" d="M9.419 4.61 11 4.894l-1.671.452c-.42.114-.766.409-.945.805L8 7l-.384-.848a1.455 1.455 0 0 0-.945-.805L5 4.895l1.581-.286c.471-.085.87-.396 1.067-.832L8 3l.352.777c.197.436.596.747 1.067.832Z" /></Icon> ADD CASES</h2><button type="button" onClick={onClose} className="text-accent cursor-pointer"><Icon className="size-4.5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" /></Icon></button></div>
          <div className="w-full h-0.5 bg-[#2F3C68] rounded-full shrink-0" />
          <div className="flex gap-3 flex-col min-[780px]:flex-row">
            <div className="flex-1"><div className="w-full relative flex group rounded-lg items-center justify-center bg-[rgba(15,18,34,0.55)] h-11 px-3.5"><div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" /><Icon className="size-4 shrink-0 my-auto text-accent" strokeWidth="2.5"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607" /></Icon><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for cases..." className="bg-transparent outline-none size-full peer placeholder:text-accent px-2 font-medium text-sm" /></div></div>
            <div className="flex gap-3 flex-col min-[530px]:flex-row min-[780px]:ml-auto min-[780px]:min-w-0 min-[780px]:shrink">
              <div className="flex flex-col flex-1 max-[779px]:min-w-0 min-[780px]:flex-initial min-[780px]:min-w-0"><SelectButton containerRef={rangeTriggerRef} open={rangeOpen} onClick={() => { setRangeOpen(!rangeOpen); setSortOpen(false); }}><img src="/coin.webp" alt="" className="bg-cover bg-center size-5 shrink-0 mr-2" /><span className="text-left truncate flex-1 min-w-0 font-semibold uppercase">Price Range: {range === "all" ? "All" : range === "250-0" ? "250+" : range.replace("-", " - ")}</span></SelectButton>{rangeOpen && <Dropdown anchorRef={rangeTriggerRef}>{[["all","Price Range: All"],["0-10","0 - 10"],["10-100","10 - 100"],["250-0","250+"]].map(([id,label]) => <DropdownOption key={id} selected={range === id} onClick={() => { setRange(id); setRangeOpen(false); }}>{label}</DropdownOption>)}</Dropdown>}</div>
              <div className="flex flex-col flex-1 max-[779px]:min-w-0 min-[780px]:flex-initial min-[780px]:min-w-0"><SelectButton containerRef={sortTriggerRef} open={sortOpen} onClick={() => { setSortOpen(!sortOpen); setRangeOpen(false); }}><Icon className="size-5.25 mr-2 shrink-0" strokeWidth="2"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M2 5h20M6 12h12m-9 7h6" /></Icon><span className="text-left truncate flex-1 min-w-0 font-semibold uppercase"> SORT BY: {sort === "highest" ? "Highest Price" : "Lowest Price"}</span></SelectButton>{sortOpen && <Dropdown anchorRef={sortTriggerRef}>{[["highest","Highest Price"],["lowest","Lowest Price"]].map(([id,label]) => <DropdownOption key={id} selected={sort === id} onClick={() => { setSort(id); setSortOpen(false); }}>{label}</DropdownOption>)}</Dropdown>}</div>
            </div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 pb-4 min-h-[488px]">{visible.map((item) => <PickerCaseCard key={item.slug} item={item} quantity={selected.get(item.slug)?.quantity || 0} add={() => change(item, 1)} remove={() => change(item, -1)} setQuantity={(value) => setQuantity(item, value)} onInspect={setInspectedCase} />)}</div>
        </div>
        <div className="flex items-center gap-6 absolute left-0 bottom-0 right-0 px-6 py-5 bg-[#263564]"><div className="flex flex-col"><p className="text-[13px] text-accent font-medium">COST</p><CoinValue value={cost} size="size-5" /></div><div className="flex flex-col"><p className="text-[13px] text-accent font-medium">ROUNDS</p><p className="font-semibold">{rounds}</p></div><RaisedButton className="ml-auto" innerClassName="px-4.5" onClick={onClose}>DONE</RaisedButton></div>
      </div>}
      {inspectedCase && <BattleCaseDropsModal summary={inspectedCase} onClose={() => setInspectedCase(null)} />}
    </div>
  );
}
