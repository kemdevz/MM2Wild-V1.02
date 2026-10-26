import { Fragment, useEffect, useState } from "react";
import BattleCasePickerModal from "../components/BattleCasePickerModal";

const RISK_COLORS = ["rgb(92, 223, 154)", "rgb(223, 138, 92)", "rgb(223, 92, 92)"];
const PLAYER_LAYOUTS = [
  [1, 1],
  [1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [2, 2],
  [2, 2, 2],
  [3, 3],
];

function Icon({ children, className = "size-5", viewBox = "0 0 24 24", ...props }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className={className} aria-hidden="true" {...props}>{children}</svg>;
}

function ArrowLeftIcon() {
  return <Icon className="size-4.5 mr-1.5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path fill="none" stroke="currentColor" d="m12 19-7-7 7-7m7 7H5" /></Icon>;
}

function PlusIcon({ className = "size-4.5 mr-1.5", strokeWidth = "3.5" }) {
  return <Icon className={className} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path fill="none" stroke="currentColor" d="M5 12h14m-7-7v14" /></Icon>;
}

function ChevronIcon({ open = false, pushRight = false }) {
  return <Icon className={`size-4 shrink-0 transition-transform ${pushRight ? "ml-auto" : "ml-2"}${open ? " rotate-180" : ""}`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" /></Icon>;
}

function UserIcon({ className = "size-5.5", offset = 0 }) {
  return <Icon className={`${offset ? "relative " : ""}${className}`} style={offset ? { top: `${offset}px` } : undefined}><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></Icon>;
}

function UsersIcon() {
  return <Icon><path fill="currentColor" d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.4 3.4 0 0 0-1.93.59 5 5 0 0 1 0 5.82A3.4 3.4 0 0 0 15 11a3.5 3.5 0 0 0 0-7" /></Icon>;
}

function SwordIcon({ offset = 0.5 }) {
  return <Icon fill="none" viewBox="0 0 16 16" className="relative size-3 text-white/50" style={{ top: `${offset}px` }}><path fill="currentColor" d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z" /></Icon>;
}

function PlayerLayout({ layout, trigger = false }) {
  const icons = [];
  const isMiddleTeamLayout = layout.every((team) => team === 2);
  const swordOffset = trigger || isMiddleTeamLayout ? 0 : 0.5;
  const userOffset = trigger ? 0 : isMiddleTeamLayout ? 0.5 : 0;
  layout.forEach((team, teamIndex) => {
    if (teamIndex) icons.push(<SwordIcon key={`s-${teamIndex}`} offset={swordOffset} />);
    for (let index = 0; index < team; index += 1) icons.push(<UserIcon key={`u-${teamIndex}-${index}`} offset={userOffset} />);
  });
  return <div className="flex items-center gap-1">{icons}</div>;
}

function RaisedButton({ children, tone = "yellow", className = "", innerClassName = "", disabled = false, onClick, href }) {
  const yellow = tone === "yellow";
  const Tag = href ? "a" : "button";
  return (
    <Tag
      {...(href ? { href } : { type: "button" })}
      onClick={onClick}
      className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 ${disabled ? "opacity-40 pointer-events-none" : ""} ${className}`}
    >
      <div className={`absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none ${yellow ? "bg-[#D38502]" : "bg-[#223364]"}`} style={{ top: "var(--sb-shadow-size,3px)" }} />
      <div className={`font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3 rounded-lg ${yellow ? "bg-primary text-[#3A3869]" : "bg-[#57689A] text-white"} ${innerClassName}`} style={{ height: "calc(100% - var(--sb-shadow-size,3px))" }}>
        <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: `drop-shadow(0 2px 0 ${yellow ? "#D38502" : "#223364"})` }}>{children}</div>
      </div>
    </Tag>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      className={`relative -top-px cursor-pointer inline-flex h-3.5 w-8.5 shrink-0 rounded-full border border-transparent shadow-xs outline-none transition-all ${checked ? "bg-[#E5AD4E]" : "bg-[#3E4E78]"}`}
      style={{ borderWidth: "1px", borderColor: "transparent" }}
    >
      <span className={`absolute top-1/2 left-0 block size-5 -translate-y-1/2 rounded-full bg-white transition-transform ${checked ? "translate-x-3.5" : ""}`} />
    </button>
  );
}

function CoinValue({ value, size = "size-4.5", className = "font-medium", iconStyle }) {
  return <div className="flex items-center gap-1.5"><img src="/coin.webp" alt="" className={`bg-cover bg-center ${size}`} style={iconStyle} /><span className={`tabular-nums ${className}`}>{Math.round(value).toLocaleString("en-US")}</span></div>;
}

function RiskBar({ item, thick = false }) {
  return (
    <div className={`relative flex w-full gap-1 shrink-0 ${thick ? "h-1.25" : "h-1"}`}>
      {RISK_COLORS.map((color, index) => <div key={color} className="flex-1" style={{ backgroundColor: color, opacity: item.risk === index ? 1 : 0.15 }} />)}
      <div className="absolute top-1/2 h-2.5 w-0.75 -translate-1/2 bg-white" style={{ left: `${item.marker}%` }} />
    </div>
  );
}

function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="19" r="1" />
      </g>
    </svg>
  );
}

function CaseQuantityControl({ quantity, compact = false, onDecrease, onIncrease, onQuantityChange }) {
  const buttonClass = compact
    ? "size-6.5 bg-[#364677] hover:bg-[#4A5A8A] rounded-lg text-sm font-semibold shrink-0 transition-colors cursor-pointer outline-none flex items-center justify-center"
    : "size-7.5 bg-[#364677] hover:bg-[#4A5A8A] rounded-lg text-sm font-semibold shrink-0 transition-colors";
  return (
    <div className="w-full flex bg-[rgba(24,31,52,0.5)] rounded-lg text-sm font-semibold shrink-0 p-1 gap-0.5">
      <button type="button" onClick={onDecrease} className={buttonClass}><p className="drop-shadow-[0_2px_0_#293A6C]">-</p></button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={quantity}
        min="1"
        max="25"
        onChange={(event) => onQuantityChange(event.target.value)}
        className="flex-1 min-w-0 bg-transparent text-center text-white font-semibold text-sm outline-none border-none"
        aria-label="Case quantity"
      />
      <button type="button" onClick={onIncrease} className={buttonClass}><p className="drop-shadow-[0_2px_0_#293A6C]">+</p></button>
    </div>
  );
}

function BattleCaseCard({ item, quantity, onDecrease, onIncrease, onQuantityChange }) {
  return (
    <div className="relative">
      <div className="flex flex-col bg-[#202D57] p-4 pt-5 max-w-full relative group/case rounded-xl cursor-pointer outline-none overflow-hidden h-60">
        <img src="/leafs.png" alt="Blades" className="object-contain size-[145%] absolute left-1/2 -translate-x-7/12 -top-[14%] pointer-events-none max-w-none select-none" />
        <div className="h-full mx-auto aspect-square relative">
          <div className="absolute -translate-1/2 left-1/2 top-1/2 size-43 mt-3">
            <img src={item.imageUrl} alt="" className="absolute inset-0 size-full object-contain opacity-60 transition-opacity duration-300 group-hover/case:opacity-90 blur-[32px] pointer-events-none" />
            <img src={item.imageUrl} alt={item.name} className="absolute inset-0 size-full object-contain opacity-100 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-8 relative w-max">
            <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#293A6C] rounded-lg" />
            <div className="w-full h-[calc(100%-3px)] bg-[#364677] px-3.75 flex justify-center items-center gap-1.5 [&>*]:drop-shadow-[0_2px_0_#293A6C] rounded-lg relative">
              <img src="/coin.webp" alt="" className="bg-cover bg-center size-4" />
              <span className="tabular-nums font-semibold text-[15px]">{Math.round(item.price).toLocaleString("en-US")}</span>
            </div>
          </div>
          <p className="font-medium truncate text-center leading-none max-w-full">{item.name}</p>
          <RiskBar item={item} />
          <CaseQuantityControl quantity={quantity} onDecrease={onDecrease} onIncrease={onIncrease} onQuantityChange={onQuantityChange} />
        </div>
      </div>
      <div className="absolute top-2 left-1.25 p-1 z-10 text-accent cursor-grab active:cursor-grabbing">
        <GripIcon />
      </div>
    </div>
  );
}

function SelectButton({ children, open, onClick, containerRef, chevronRight = false }) {
  return (
    <div ref={containerRef} className="h-11 relative group/button">
      <div className="absolute top-1/2 inset-x-0 bottom-0 bg-[#223364] rounded-lg" />
      <button type="button" role="combobox" aria-expanded={open} data-state={open ? "open" : "closed"} onClick={onClick} className="w-full h-[calc(100%-3px)] bg-[#57689A] group-hover/button:-translate-y-0.5 data-[state=open]:translate-y-0 transition-transform duration-125 text-white [&>*]:drop-shadow-[0_2px_0_#223364] rounded-lg px-4 flex items-center outline-none cursor-pointer group relative">
        {children}<ChevronIcon open={open} pushRight={chevronRight} />
      </button>
    </div>
  );
}

function ModeIcon({ type, color }) {
  const paths = {
    share: [
      "M18 6.588v-4.92l-2.853.53a.418.418 0 0 1-.316-.069L12.332.414A2.376 2.376 0 0 0 9.37.64L5.848 3.967a.144.144 0 0 0 .006.217l.308.258a1.69 1.69 0 0 0 2.233-.056l2.116-1.965a.415.415 0 0 1 .436-.087.416.416 0 0 1 .267.35c.13 1.4.804 3.383 2.273 4.46L18 6.588Z",
      "M12.37 8.293c.23-.12.402-.308.515-.564-1.359-1.046-2.095-2.704-2.386-4.163l-1.53 1.422a2.531 2.531 0 0 1-3.351.083l-.306-.259A.965.965 0 0 1 5.27 3.37L8.502.317C6.838.127 5.24.715 3.644 2.1a.413.413 0 0 1-.345.098L0 1.658v5.035l2.932.556a.437.437 0 0 1 .222.118l1.93 1.964c.285.29.636.49 1.02.58.937.22 1.29.01 1.556-.398a.423.423 0 0 1 .536-.147c.97.467 1.924.134 2.434-.848a.418.418 0 0 1 .52-.198c.424.157.88.149 1.22-.027Z",
    ],
    crazy: ["M14.432 11.227c-.1-.4-.059-1.041.092-1.425 0 0 .477-1.217.476-2.302a7.5 7.5 0 0 0-15 0c-.001 1.085.476 2.302.476 2.302.15.384.192 1.025.092 1.425l-.295 1.181c-.15.6.122 1.408.605 1.795l.499.399c.274.219.811.273 1.194.12l.59-.236c.324-.13.758-.236.964-.236.207 0 .375.168.375.375 0 1.026-.286 1.955-.75 2.626 2.315.961 5 1.035 7.5 0-.464-.671-.75-1.6-.75-2.626 0-.207.168-.375.375-.375.206 0 .64.106.964.236l.589.236c.383.153.92.098 1.194-.12l.5-.399c.482-.387.755-1.195.605-1.794l-.295-1.182Zm-8.057-1.77c0 .413-.313.875-.697 1.029l-1.66.664c-.766.307-1.393-.118-1.393-.943V9c0-.83.672-1.5 1.5-1.5H5.25c.622 0 1.125.504 1.125 1.125v.833ZM7.99 13.5h-.98c-.539 0-.783-.365-.542-.813l.594-1.101c.241-.448.635-.448.876 0l.594 1.101c.24.448-.003.813-.542.813Zm4.385-3.293c0 .825-.627 1.25-1.393.943l-1.66-.664c-.383-.154-.697-.616-.697-1.028v-.833c0-.621.503-1.125 1.125-1.125h1.125c.829 0 1.5.67 1.5 1.5v1.207Z"],
    jackpot: "M5 16 3 5l5.5 5L12 4l3.5 6L21 5l-2 11zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14z",
    partial: "M11.925 22q-2.075 0-3.9-.788T4.85 19.075 2.713 15.9 1.925 12t.788-3.9T4.85 4.925t3.175-2.137 3.9-.788 3.9.788T19 4.925 21.138 8.1t.787 3.9-.788 3.9T19 19.075t-3.175 2.138-3.9.787m6.95-6H9.3l-1 1h9.9q.2-.25.363-.488t.312-.512m1-3h-7.55l-1 1h8.35q.05-.25.1-.488t.1-.512m-.2-3h-4.35l-1 1h5.55q-.05-.275-.1-.513t-.1-.487M18.25 7.1l-.9.9h1.525q-.125-.25-.288-.462T18.25 7.1M5.6 16.9 16.875 5.675q-1.025-.8-2.275-1.237T11.925 4Q8.575 4 6.25 6.325T3.925 12q0 1.4.438 2.638T5.6 16.9m6.325 3.1q1.075 0 2.05-.25t1.85-.75h-7.8q.875.5 1.85.75t2.05.25",
    borrow: "M12 16q-.825 0-1.412-.587T10 14t.588-1.412T12 12t1.413.588T14 14t-.587 1.413T12 16M7.375 7h9.25l2-4H5.375zM8.4 21h7.2q2.25 0 3.825-1.562T21 15.6q0-.95-.325-1.85t-.925-1.625L17.15 9H6.85l-2.6 3.125q-.6.725-.925 1.625T3 15.6q0 2.275 1.563 3.838T8.4 21",
  };
  const iconPaths = Array.isArray(paths[type]) ? paths[type] : [paths[type]];
  const gradient = type === "share"
    ? { id: "battle-share-gradient", from: "#50DFFF", to: "#2FC1FF" }
    : type === "crazy"
      ? { id: "battle-crazy-gradient", from: "#E650FF", to: "#C750FF" }
      : null;
  return (
    <Icon
      fill={gradient ? "none" : undefined}
      className="size-5 transition-colors duration-200 filter-[url(#inset-shadow-effect)]"
      viewBox={type === "crazy" ? "0 0 15 18" : type === "share" ? "0 0 18 10" : "0 0 24 24"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      style={{
        color,
        ...(gradient ? { "--svg-gradient-from": gradient.from, "--svg-gradient-to": gradient.to } : {}),
      }}
    >
      {gradient && (
        <defs>
          <linearGradient id={gradient.id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--svg-gradient-from)" />
            <stop offset="100%" stopColor="var(--svg-gradient-to)" />
          </linearGradient>
        </defs>
      )}
      {iconPaths.map((path, index) => <path key={index} fill={gradient ? `url(#${gradient.id})` : "currentColor"} d={path} />)}
    </Icon>
  );
}

function InsetShadowFilter() {
  return (
    <svg aria-hidden="true" className="absolute size-0 overflow-hidden">
      <defs>
        <filter id="inset-shadow-effect" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB" filterRes="1024 1024">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0" result="blur" />
          <feOffset in="blur" dx="0" dy="1.5" result="offsetBlur" />
          <feComposite in="offsetBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner" />
          <feFlood floodColor="#ffffff" floodOpacity="0.66" result="color" />
          <feComposite in="color" in2="inner" operator="in" result="shadow" />
          <feComposite in="shadow" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

function ModeRow({ type, title, description, color, checked, onChange, children }) {
  return (
    <div>
      <div onClick={() => onChange(!checked)} className={`flex gap-4 p-4 items-center justify-between relative overflow-hidden transition-[opacity,background] cursor-pointer ${checked && children ? "bg-[#3E4E78]" : ""}`}>
        <div className="size-8 absolute -left-3 rounded-full blur-[36px]" style={{ background: color }} />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.75"><ModeIcon type={type} color={color} /><p className="font-semibold text-sm">{title}</p></div>
          <p className="text-[13px] text-accent font-medium">{description}</p>
        </div>
        <Toggle checked={checked} onChange={onChange} label={title} />
      </div>
      {checked && children}
    </div>
  );
}

function FundingDetails({ total, players, percent, setPercent, minimumLevel, setMinimumLevel }) {
  const forOthers = Math.round(total * ((players - 1) * percent / 100));
  return (
    <div className="p-4"><div className="flex flex-col gap-4">
      <PercentageControl label="FUNDING AMOUNT" value={percent} setValue={setPercent} min={1} max={100} />
      <div className="grid grid-cols-2 gap-3">
        <CostBox label="COST FOR YOU" value={total + forOthers} />
        <CostBox label="COST FOR OTHERS" value={Math.max(0, total * players - total - forOthers)} green right />
      </div>
      <div className="w-full h-0.5 bg-accent/25" />
      <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">MINIMUM LEVEL</p><p className="text-[13px] text-accent font-medium">Set a minimum level required to join</p></div><Toggle label="Minimum level" checked={minimumLevel} onChange={setMinimumLevel} /></div>
    </div></div>
  );
}

function BorrowDetails({ total, percent, setPercent }) {
  return <div className="p-4"><div className="flex flex-col gap-4"><PercentageControl label="BORROW AMOUNT" value={percent} setValue={setPercent} min={20} max={80} /><div className="grid grid-cols-2 gap-3"><CostBox label="ORIGINAL COST" value={total} /><CostBox label="NEW COST" value={total * (1 - percent / 100)} green right /></div></div></div>;
}

function PercentageControl({ label, value, setValue, min, max }) {
  const progress = ((value - min) / (max - min)) * 100;
  return <><div><label className="text-sm font-semibold text-accent mb-1.75 block">{label}</label><div className="w-full flex items-center bg-[#131A31]/75 rounded-lg py-3 px-3.5"><input type="number" value={value} min={min} max={max} onChange={(event) => setValue(Math.min(max, Math.max(min, Number(event.target.value) || min)))} className="bg-transparent outline-none size-full font-medium text-[15px]" /><p className="text-accent font-semibold text-sm leading-none">%</p></div></div><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(event) => setValue(Number(event.target.value))} className="battle-range" style={{ "--battle-range-progress": `${progress}%` }} /></>;
}

function CostBox({ label, value, green, right }) {
  return <div className={`flex flex-col bg-[#3E4E78] p-2.5 rounded-[11px] ${right ? "items-end" : ""}`}><p className="text-[13px] text-accent font-medium">{label}</p><CoinValue value={value} size="size-5" className={`font-semibold ${green ? "text-[#5CDF9A]" : ""}`} /></div>;
}

export default function BattleCreate() {
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(() => new Map());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [playersOpen, setPlayersOpen] = useState(false);
  const [playerLayout, setPlayerLayout] = useState(0);
  const [share, setShare] = useState(false);
  const [crazy, setCrazy] = useState(false);
  const [jackpot, setJackpot] = useState(false);
  const [partial, setPartial] = useState(false);
  const [borrow, setBorrow] = useState(false);
  const [privateBattle, setPrivateBattle] = useState(false);
  const [fastSpin, setFastSpin] = useState(false);
  const [fundingPercent, setFundingPercent] = useState(50);
  const [borrowPercent, setBorrowPercent] = useState(20);
  const [minimumLevel, setMinimumLevel] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    document.title = "Create Battle - Case Opening Battles";
    const controller = new AbortController();
    fetch("/api/cases", { signal: controller.signal }).then((response) => response.json()).then((payload) => setCases(Array.isArray(payload?.cases) ? payload.cases : [])).catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    document.body.style.overflow = pickerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [pickerOpen]);

  const entries = [...selected.values()];
  const rounds = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const total = entries.reduce((sum, entry) => sum + entry.caseItem.price * entry.quantity, 0);
  const players = PLAYER_LAYOUTS[playerLayout].reduce((sum, count) => sum + count, 0);
  const updateQuantity = (slug, difference) => setSelected((current) => {
    const next = new Map(current);
    const entry = next.get(slug);
    if (!entry) return next;
    const quantity = entry.quantity + difference;
    if (quantity <= 0) next.delete(slug);
    else next.set(slug, { ...entry, quantity: Math.min(25, quantity) });
    return next;
  });
  const setCaseQuantity = (slug, value) => setSelected((current) => {
    const next = new Map(current);
    const entry = next.get(slug);
    if (!entry) return next;
    const quantity = Math.min(25, Math.max(1, Number.parseInt(String(value).replace(/\D/g, ""), 10) || 1));
    next.set(slug, { ...entry, quantity });
    return next;
  });
  const createBattle = async () => {
    if (!rounds || creating) return;
    setCreating(true);
    setCreateError("");
    try {
      const response = await fetch("/api/battles", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cases: entries.map(({ caseItem, quantity }) => ({ caseId: caseItem.id, quantity })),
          playerLayout: PLAYER_LAYOUTS[playerLayout],
          share, crazy, jackpot, partial, borrow, private: privateBattle, fastSpin,
          fundingPercent, borrowPercent, minimumLevel,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent("mm2wild:open-sign-in"));
        return;
      }
      if (!response.ok || !data.battle) throw new Error(data.error || "The battle could not be created.");
      window.dispatchEvent(new CustomEvent("mm2wild:balance-updated", { detail: { mm2Balance: data.balance } }));
      const key = data.battle.accessKey ? `?key=${encodeURIComponent(data.battle.accessKey)}` : "";
      window.history.pushState({}, "", `/games/battles/${data.battle.number}${key}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      setCreateError(error.message || "The battle could not be created.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="site-content">
      <InsetShadowFilter />
      <div className="max-w-[1660px] mx-auto flex flex-col @container/content px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content battle-create-page py-6 flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <RaisedButton href="/games/battles" tone="blue" className="w-max"><ArrowLeftIcon />BACK TO BATTLES</RaisedButton>
            <div className="flex flex-col @xl/content:flex-row justify-between @xl/content:items-center gap-3">
              <h1 className="text-2xl font-bold">CASE BATTLES</h1>
              <div className="flex @sm/content:items-center gap-3 @sm/content:gap-6 justify-between flex-col @sm/content:flex-row">
                <div className="relative flex items-center gap-6" style={{ top: "-0.5px" }}><div className="flex flex-col"><p className="text-xs font-medium text-accent">BATTLE COST</p><CoinValue value={total} iconStyle={{ position: "relative", top: "0.3px" }} /></div><div className="flex flex-col"><p className="text-xs font-medium text-accent">ROUNDS</p><p className="font-medium">{rounds}</p></div></div>
                <RaisedButton disabled={!rounds || creating} onClick={createBattle}><PlusIcon />CREATE BATTLE</RaisedButton>
              </div>
            </div>
            {createError && <p role="alert" className="text-error text-sm font-medium text-right">{createError}</p>}
          </div>
          <div className="flex gap-8 flex-col @4xl/content:flex-row items-start">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 w-full @4xl/content:w-auto @4xl/content:flex-1">
              <button type="button" onClick={() => setPickerOpen(true)} className="bg-[#202D56] rounded-xl flex items-center justify-center flex-col gap-3 h-60 cursor-pointer outline-none">
                <div className="w-9.25 h-10 relative"><div className="absolute top-1/2 inset-x-0 bottom-0 bg-[#344986] rounded-[7px]" /><div className="h-[calc(100%-3px)] bg-[#57689A] rounded-[7px] flex items-center justify-center relative"><PlusIcon className="size-6" strokeWidth="2.5" /></div></div><p className="font-medium">ADD CASE</p>
              </button>
              {entries.map(({ caseItem, quantity }) => <BattleCaseCard key={caseItem.slug} item={caseItem} quantity={quantity} onDecrease={() => updateQuantity(caseItem.slug, -1)} onIncrease={() => updateQuantity(caseItem.slug, 1)} onQuantityChange={(value) => setCaseQuantity(caseItem.slug, value)} />)}
            </div>
            <div className="w-full @4xl/content:w-[400px] shrink-0 flex flex-col gap-6">
              <div className="bg-[#202D57]/45 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-1"><UsersIcon /><p className="font-bold">ADD PLAYERS</p></div>
                <div className="relative">
                  <SelectButton open={playersOpen} onClick={() => setPlayersOpen(!playersOpen)} chevronRight><PlayerLayout layout={PLAYER_LAYOUTS[playerLayout]} trigger /></SelectButton>
                  {playersOpen && (
                    <div
                      role="listbox"
                      aria-label="Battle players"
                      className="absolute left-0 right-0 z-[100] max-h-[300px] overflow-y-auto scrollbar-hide bg-[#263457] rounded-lg p-2 shadow-md outline-none animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
                      style={{ top: "calc(100% + 9.333px)" }}
                    >
                      {PLAYER_LAYOUTS.map((layout, index) => {
                        const selected = playerLayout === index;
                        return (
                          <Fragment key={index}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              data-state={selected ? "checked" : "unchecked"}
                              onClick={() => { setPlayerLayout(index); setPlayersOpen(false); }}
                              className="group/dropdown-item h-9.5 w-full relative flex items-center cursor-pointer outline-none"
                            >
                              <span className="absolute left-2 flex size-3.5 items-center justify-center">
                                {selected && <Icon className="size-4"><path fill="none" stroke="currentColor" d="M20 6 9 17l-5-5" /></Icon>}
                              </span>
                              <div className={`absolute top-1/3 left-0 right-0 bottom-0 rounded-lg transition-colors duration-100 ${selected ? "bg-[#344986]" : "group-hover/dropdown-item:bg-[#344986]"}`} />
                              <div className={`justify-center h-[calc(100%-3px)] w-full relative flex items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-colors duration-100 [&>*]:drop-shadow-[0_2px_0_#223364] ${selected ? "bg-[#57689A] text-white" : "text-accent group-hover/dropdown-item:bg-[#57689A] group-hover/dropdown-item:text-white"}`}>
                                <PlayerLayout layout={layout} />
                              </div>
                            </button>
                            {(index === 3 || index === 5) && (
                              <div className="relative h-px mx-2 my-1">
                                <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 bg-accent/25 ${index === 3 ? "h-[1.5px]" : "h-[0.5px]"}`} />
                              </div>
                            )}
                          </Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-[#202D57]/45 p-4 rounded-xl flex flex-col gap-3">
                <div className="bg-[#263457] flex flex-col rounded-xl overflow-hidden">
                  <ModeRow type="share" title="SHARE MODE" description="Winnings are split equally among players" color="#37C8FF" checked={share} onChange={setShare} />
                  <ModeRow type="crazy" title="CRAZY MODE" description="Unbox the least to win" color="#E44FFF" checked={crazy} onChange={setCrazy} />
                  <ModeRow type="jackpot" title="JACKPOT MODE" description="All pulls go into the Jackpot" color="#FAB444" checked={jackpot} onChange={setJackpot} />
                  <ModeRow type="partial" title="PARTIAL FUNDING" description="Fund the battle on behalf of others" color="#31EB75" checked={partial} onChange={(value) => { setPartial(value); if (value) setBorrow(false); }}><FundingDetails total={total} players={players} percent={fundingPercent} setPercent={setFundingPercent} minimumLevel={minimumLevel} setMinimumLevel={setMinimumLevel} /></ModeRow>
                  <ModeRow type="borrow" title="BORROW" description="Pay only a portion of the battle" color="#FF731C" checked={borrow} onChange={(value) => { setBorrow(value); if (value) setPartial(false); }}><BorrowDetails total={total} percent={borrowPercent} setPercent={setBorrowPercent} /></ModeRow>
                </div>
                <div className="w-full h-0.5 bg-accent/25" />
                <div className="flex flex-col @sm/content:flex-row gap-3">
                  <div onClick={() => setPrivateBattle(!privateBattle)} className="flex gap-4 bg-[#263457] rounded-[9px] p-3 items-center justify-between flex-1 cursor-pointer"><p className="font-semibold">Private</p><Toggle label="Private" checked={privateBattle} onChange={setPrivateBattle} /></div>
                  <div onClick={() => setFastSpin(!fastSpin)} className="flex gap-4 bg-[#263457] rounded-[9px] p-3 items-center justify-between flex-1 cursor-pointer"><p className="font-semibold">Fast Spin</p><Toggle label="Fast Spin" checked={fastSpin} onChange={setFastSpin} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {pickerOpen && <BattleCasePickerModal cases={cases} selected={selected} setSelected={setSelected} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}
