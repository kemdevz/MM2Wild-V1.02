import { useCallback, useEffect, useMemo, useState } from "react";

function Icon({ children, className = "size-4.5", viewBox = "0 0 24 24", ...props }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className={className} aria-hidden="true" {...props}>{children}</svg>;
}

function ChevronIcon({ reversed }) {
  return <Icon className={`size-4.5 ml-1.5 transition-transform${reversed ? " rotate-180" : ""}`} strokeWidth="2.5"><path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" /></Icon>;
}

function PlusIcon() {
  return <Icon className="size-4.5 mr-1.5" strokeWidth="3.5"><path fill="none" stroke="currentColor" d="M5 12h14m-7-7v14" /></Icon>;
}

function SwordIcon() {
  return <Icon fill="none" viewBox="0 0 16 16" className="size-2.5 text-white/50"><path fill="currentColor" d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z" /></Icon>;
}

function UserIcon() {
  return <Icon className="size-5 text-accent"><path fill="currentColor" d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></Icon>;
}

function ModeIcon({ type, color }) {
  const paths = {
    crazy: "M14.432 11.227c-.1-.4-.059-1.041.092-1.425 0 0 .477-1.217.476-2.302a7.5 7.5 0 0 0-15 0c-.001 1.085.476 2.302.476 2.302.15.384.192 1.025.092 1.425l-.295 1.181c-.15.6.122 1.408.605 1.795l.499.399c.274.219.811.273 1.194.12l.59-.236c.324-.13.758-.236.964-.236.207 0 .375.168.375.375 0 1.026-.286 1.955-.75 2.626 2.315.961 5 1.035 7.5 0-.464-.671-.75-1.6-.75-2.626 0-.207.168-.375.375-.375.206 0 .64.106.964.236l.589.236c.383.153.92.098 1.194-.12l.5-.399c.482-.387.755-1.195.605-1.794l-.295-1.182Zm-8.057-1.77c0 .413-.313.875-.697 1.029l-1.66.664c-.766.307-1.393-.118-1.393-.943V9c0-.83.672-1.5 1.5-1.5H5.25c.622 0 1.125.504 1.125 1.125v.833ZM7.99 13.5h-.98c-.539 0-.783-.365-.542-.813l.594-1.101c.241-.448.635-.448.876 0l.594 1.101c.24.448-.003.813-.542.813Zm4.385-3.293c0 .825-.627 1.25-1.393.943l-1.66-.664c-.383-.154-.697-.616-.697-1.028v-.833c0-.621.503-1.125 1.125-1.125h1.125c.829 0 1.5.67 1.5 1.5v1.207Z",
    jackpot: "M5 16 3 5l5.5 5L12 4l3.5 6L21 5l-2 11zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14z",
  };
  return <Icon className="size-3.5 filter-[url(#inset-shadow-effect)]" viewBox={type === "crazy" ? "0 0 15 18" : "0 0 24 24"} style={{ color }}><path fill="currentColor" d={paths[type]} /></Icon>;
}

function RoundsIcon() {
  return <Icon fill="none" viewBox="0 0 16 16" className="size-3.5"><path fill="currentColor" d="M15.644 3.958v-.034c-.017-.034-.017-.068-.034-.102v-.017a.372.372 0 0 0-.068-.084l-.017-.017c-.017-.017-.05-.034-.067-.05l-.017-.018h-.017l-.017-.017L8.219.051a.539.539 0 0 0-.456 0l-2.419 1.2 7.222 3.704.017.017c.017 0 .017.017.033.017.017.017.017.034.034.051v3.974a.178.178 0 0 1-.084.153l-1.455.76c-.084.051-.186.018-.237-.067-.017-.017-.017-.05-.017-.085V5.936L3.551 2.165l-.017-.017L.608 3.602l-.016.017H.575l-.017.017c-.017.017-.051.034-.068.05l-.017.018c-.034.034-.05.068-.084.101v.017c-.017.034-.034.068-.034.102v.034c0 .033-.017.05-.017.084V11.94c0 .186.101.372.287.457l7.12 3.552c.102.05.22.067.339.033l.034-.016c.034 0 .05-.017.084-.034l7.171-3.552a.51.51 0 0 0 .288-.457V4.042c-.017-.034-.017-.05-.017-.084Z" /></Icon>;
}

function LightningIcon() {
  return <Icon className="size-3.5 filter-[url(#inset-shadow-effect)]" style={{ color: "rgb(167, 191, 245)" }}><path fill="currentColor" d="m8 22 1-7H4l9-13h2l-1 8h6L10 22z" /></Icon>;
}

function InsetShadowFilter() {
  return <svg aria-hidden="true" className="absolute size-0 overflow-hidden"><defs><filter id="inset-shadow-effect" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB" filterRes="1024 1024"><feGaussianBlur in="SourceAlpha" stdDeviation="0" result="blur" /><feOffset in="blur" dx="0" dy="1.5" result="offsetBlur" /><feComposite in="offsetBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner" /><feFlood floodColor="#ffffff" floodOpacity="0.66" result="color" /><feComposite in="color" in2="inner" operator="in" result="shadow" /><feComposite in="shadow" in2="SourceGraphic" operator="over" /></filter></defs></svg>;
}

function RaisedAction({ children, primary = false, discount = 0, discountColor }) {
  const shadowColor = primary ? "#D38502" : "#223364";
  const faceColor = primary ? "#F3B239" : "#57689A";
  return <button type="button" className="cursor-pointer outline-none flex select-none transition-opacity group/button w-35 h-10.5 relative z-10"><div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: shadowColor }} /><div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: faceColor, color: primary ? "#3A3869" : "#FFFFFF" }}><div className="transition-opacity flex items-center justify-center size-full font-bold" style={{ filter: `drop-shadow(0 2px 0 ${shadowColor})` }}><span className="relative">{children}</span>{discount > 0 && <span className="absolute rotate-5 z-11 -top-2 -right-2 drop-shadow-none text-stroke-3 text-stroke-[#243157] [paint-order:stroke_fill] text-shadow-[0_3px_0_#243157] text-sm font-bold whitespace-nowrap pointer-events-none" style={{ color: discountColor }}> -{discount}% </span>}</div></div></button>;
}

function battlePresentation(battle) {
  if (battle.modes.crazy && battle.modes.jackpot) return { label: "CURSED JACKPOT", titleColor: "#E650FF", glowColor: "#E650FF" };
  if (battle.modes.jackpot) return { label: "JACKPOT MODE", titleColor: "#FAB444", glowColor: "#FAB444" };
  if (battle.modes.crazy) return { label: "CURSED BATTLE", titleColor: "#E650FF", glowColor: "#E650FF" };
  if (battle.modes.share) return { label: "GROUP UNBOX", titleColor: "#50FF6C", glowColor: "#50FF6C" };
  if (battle.playerLayout.some((team) => team > 1)) return { label: "TEAM BATTLE", titleColor: "#50DFFF", glowColor: "#41D2FF" };
  return { label: "CASE BATTLE", titleColor: "#FFFFFF", glowColor: null };
}

function BattlePlayers({ battle, titleColor, label }) {
  let slot = 0;
  return <div className="w-73 sm:w-full md:w-73 flex flex-col sm:flex-row md:flex-col gap-1.5 items-center justify-center sm:justify-between md:justify-center relative z-10"><div className="flex items-center gap-2"><span className="font-medium text-[15px]"><span style={{ color: titleColor }}>{label}</span></span></div><div className="flex items-center gap-1.25">{battle.playerLayout.map((teamSize, teamIndex) => {
    const team = [];
    for (let index = 0; index < teamSize; index += 1) {
      const player = battle.players[slot]; slot += 1;
      team.push(<div key={slot} className={`size-8 flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) rounded-lg p-0.5${player ? "" : " opacity-40"}`} style={{ "--level-border-start": "#19233d", "--level-border-end": "#36487F", "--level-text": "#36487F" }}><div className="rounded-[6px] size-full flex items-center justify-center bg-[#18213A]">{player ? <img src={player.avatar} alt={player.username || "Battle player"} className="size-9/12 object-contain object-center rounded-[5px] opacity-0 transition-opacity duration-150" onLoad={(event) => { event.currentTarget.style.opacity = "1"; }} /> : <UserIcon />}</div></div>);
    }
    return <span key={teamIndex} className="contents">{teamIndex > 0 && <SwordIcon />}{team}</span>;
  })}</div></div>;
}

function BattleCases({ battle }) {
  const inProgress = battle.status === "in_progress";
  const displayedCases = inProgress ? battle.cases.flatMap((caseItem) => Array.from({ length: caseItem.quantity }, (_, index) => ({ ...caseItem, instance: index }))) : battle.cases;
  const roundOffset = 16 + Math.max(0, battle.currentRound - 1) * 88;
  return <div className="flex-1 w-full md:w-auto h-22 bg-[#18213A] rounded-xl relative min-w-0"><div className="flex items-center gap-1.5 absolute top-1.5 right-1.5 z-10">{battle.modes.crazy && <span className="px-2 h-6 flex items-center bg-[#37497B] rounded-[10px]"><ModeIcon type="crazy" color="#E650FF" /></span>}{battle.modes.jackpot && <span className="px-2 h-6 flex items-center bg-[#37497B] rounded-[10px]"><ModeIcon type="jackpot" color="#FAB444" /></span>}{battle.modes.fastSpin && <span className="px-2 h-6 flex items-center bg-[#37497B] rounded-[10px]"><LightningIcon /></span>}<span className="px-2 py-0.5 bg-[#37497B] rounded-[10px] text-accent flex items-center gap-1">{!inProgress && <RoundsIcon />}<p className="text-sm font-medium">{inProgress ? `${battle.currentRound}/${battle.rounds}` : battle.rounds}</p></span></div><div className="battle-caselist relative rounded-xl overflow-hidden h-full"><div className="flex gap-4 px-4 py-2 h-full items-center transition-transform duration-500 ease-in-out">{inProgress && <div className="battle-round-highlight rounded-lg" style={{ "--battle-round-offset": `${roundOffset}px` }} />}{displayedCases.map((caseItem) => <div key={`${caseItem.id}-${caseItem.slug}-${caseItem.instance ?? "group"}`} className="relative z-2 shrink-0 size-18"><img src={caseItem.imageUrl} alt={caseItem.name} className="size-18 absolute left-1/2 top-1/2 -translate-1/2 object-cover opacity-0 transition-opacity duration-300" onLoad={(event) => { event.currentTarget.style.opacity = "1"; }} />{!inProgress && <div className="px-2.5 bg-[#37497B] rounded-[6px] absolute bottom-0 left-1/2 -translate-x-1/2 text-accent flex items-center gap-1"><p className="text-sm font-medium">x{caseItem.quantity}</p></div>}</div>)}</div></div></div>;
}

function BattleRow({ battle, currentUserUuid }) {
  const presentation = battlePresentation(battle);
  const isComplete = battle.status === "complete";
  const joinable = battle.status === "open" && currentUserUuid && currentUserUuid !== battle.creator.uuid;
  const discount = battle.modes.partial ? battle.fundingPercent : battle.modes.borrow ? battle.borrowPercent : 0;
  const key = battle.accessKey ? `?key=${encodeURIComponent(battle.accessKey)}` : "";
  const discountColor = battle.modes.partial ? "#00FF79" : "#FF8410";
  return <a href={`/games/battles/${battle.number}${key}`} className={`battle-card rounded-xl py-5 md:h-26 flex flex-col md:flex-row gap-4 md:gap-7 items-center px-7 relative overflow-hidden transition-[background-color] duration-300 ease-in-out bg-[#243157] hover:bg-[#273764]${isComplete ? " opacity-40" : ""}`}>{presentation.glowColor && <div className="absolute w-90 h-27 -left-17 top-0 rotate-15 blur-3xl transition-opacity duration-300 ease-in-out" style={{ background: `${presentation.glowColor}2D` }} />}<BattlePlayers battle={battle} {...presentation} /><BattleCases battle={battle} /><div className="flex items-center gap-7"><div className="flex flex-col items-center gap-0.5 relative z-10 w-26"><div className="flex items-center gap-1"><img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5" /><span className="tabular-nums font-semibold">{Math.round(battle.cost).toLocaleString("en-US")}</span></div>{discount ? <div className="flex items-center gap-1 relative"><img src="/coin.webp" alt="" className="bg-cover bg-center size-4 opacity-60 grayscale" /><span className="tabular-nums text-sm font-semibold text-accent/80">{Math.round(battle.totalCost).toLocaleString("en-US")}</span><span className="absolute inset-0 flex items-center pointer-events-none"><span className="w-full h-0.5 bg-accent/80" /></span></div> : <p className="text-sm font-medium text-accent">BATTLE PRICE</p>}</div><RaisedAction primary={Boolean(joinable)} discount={discount} discountColor={discountColor}>{joinable ? "JOIN BATTLE" : "VIEW BATTLE"}</RaisedAction></div></a>;
}

export default function Battles() {
  const [priceReversed, setPriceReversed] = useState(false);
  const [battles, setBattles] = useState([]);
  const [currentUserUuid, setCurrentUserUuid] = useState(null);
  const [visible, setVisible] = useState(15);
  const loadBattles = useCallback(async () => { const response = await fetch("/api/battles?limit=100", { credentials: "include" }); const data = await response.json().catch(() => ({})); if (response.ok) setBattles(Array.isArray(data.battles) ? data.battles : []); }, []);

  useEffect(() => {
    document.title = "Battles :: MM2Wild";
    loadBattles();
    fetch("/api/session", { credentials: "include" }).then((response) => response.ok ? response.json() : null).then((data) => setCurrentUserUuid(data?.user?.uuid || null)).catch(() => {});
    const interval = window.setInterval(loadBattles, 4000);
    return () => window.clearInterval(interval);
  }, [loadBattles]);

  const sortedBattles = useMemo(() => {
    const order = priceReversed ? 1 : -1;
    const byPrice = (left, right) => (left.totalCost - right.totalCost) * order;
    return ["open", "in_progress", "complete"].flatMap((status) => battles.filter((battle) => battle.status === status).sort(byPrice)).slice(0, visible);
  }, [battles, priceReversed, visible]);

  return <div className="site-content"><InsetShadowFilter /><div className="max-w-[1660px] mx-auto flex flex-col @container/content px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]"><div className="page-content battle-list-page py-6 flex flex-col gap-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><h1 className="text-2xl font-bold">BATTLES</h1><div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4"><div className="w-full sm:w-auto h-10.5 relative"><div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#171F37] rounded-lg" /><button type="button" className="w-full sm:w-auto px-3.5 h-[calc(100%-3px)] bg-[#222D4E] rounded-lg flex items-center relative cursor-pointer outline-none font-medium" onClick={() => setPriceReversed((current) => !current)}>PRICE<ChevronIcon reversed={priceReversed} /></button></div><a href="/games/battles/create" className="relative cursor-pointer outline-none flex select-none group/button w-full sm:w-auto h-10.5"><div className="absolute left-0 right-0 bottom-0 rounded-lg bg-[#D38502]" style={{ top: "3px" }} /><div className="font-bold size-full flex items-center relative transition-transform duration-125 group-hover/button:-translate-y-0.5 px-3 rounded-lg bg-primary text-[#3A3869]" style={{ height: "calc(100% - 3px)" }}><div className="flex items-center justify-center size-full drop-shadow-[0_2px_0_#D38502]"><PlusIcon /><p>CREATE BATTLE</p></div></div></a></div></div><div className="battles-list" aria-label="Battles list">{sortedBattles.map((battle) => <BattleRow key={battle.id} battle={battle} currentUserUuid={currentUserUuid} />)}</div>{battles.length > visible && <div className="flex justify-center"><button type="button" onClick={() => setVisible((count) => count + 10)} className="h-10.5 px-6 rounded-lg bg-[#57689A] shadow-[0_3px_0_#223364] font-bold cursor-pointer">LOAD MORE</button></div>}</div></div></div>;
}
