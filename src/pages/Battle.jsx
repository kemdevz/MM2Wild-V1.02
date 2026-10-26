import { useEffect, useMemo, useState } from "react";

function Icon({ children, className = "size-5", viewBox = "0 0 24 24", ...props }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className={className} aria-hidden="true" {...props}>{children}</svg>;
}

function ArrowLeftIcon() {
  return <Icon className="size-4.5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7m7 7H5" /></Icon>;
}

function SwordIcon({ className = "size-3.25 text-accent/50 mx-0.5" }) {
  return <Icon fill="none" viewBox="0 0 16 16" className={className}><path fill="currentColor" d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16Z" /></Icon>;
}

function SkullIcon({ className = "size-5.5" }) {
  return <Icon viewBox="0 0 15 18" className={className}><path fill="currentColor" d="M14.432 11.227c-.1-.4-.059-1.041.092-1.425 0 0 .477-1.217.476-2.302a7.5 7.5 0 0 0-15 0c-.001 1.085.476 2.302.476 2.302.15.384.192 1.025.092 1.425l-.295 1.181c-.15.6.122 1.408.605 1.795l.499.399c.274.219.811.273 1.194.12l.59-.236c.324-.13.758-.236.964-.236.207 0 .375.168.375.375 0 1.026-.286 1.955-.75 2.626 2.315.961 5 1.035 7.5 0-.464-.671-.75-1.6-.75-2.626 0-.207.168-.375.375-.375.206 0 .64.106.964.236l.589.236c.383.153.92.098 1.194-.12l.5-.399c.482-.387.755-1.195.605-1.794l-.295-1.182ZM6.375 9.458c0 .413-.313.875-.697 1.029l-1.66.664c-.766.307-1.393-.118-1.393-.943V9c0-.83.672-1.5 1.5-1.5H5.25c.622 0 1.125.504 1.125 1.125v.833Zm1.615 4.043h-.98c-.539 0-.783-.365-.542-.813l.594-1.101c.241-.448.635-.448.876 0l.594 1.101c.24.448-.003.813-.542.813Zm4.385-3.293c0 .825-.627 1.25-1.393.943l-1.66-.664c-.383-.154-.697-.616-.697-1.028v-.833c0-.621.503-1.125 1.125-1.125h1.125c.829 0 1.5.67 1.5 1.5v1.207Z" /></Icon>;
}

function PlayerModeIcon({ className = "size-5.5" }) {
  return <Icon className={className}><path fill="currentColor" d="M12 3.25a4.25 4.25 0 1 1 0 8.5 4.25 4.25 0 0 1 0-8.5m0 10.25c4.7 0 8.5 2.12 8.5 4.75V21h-17v-2.75c0-2.63 3.8-4.75 8.5-4.75" /></Icon>;
}

function CheckIcon() {
  return <Icon className="size-6 md:size-8 text-[#5CDF9A] mt-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></Icon>;
}

function AddPlayerIcon() {
  return <Icon className="size-6 md:size-8 text-primary my-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M15 19c0-2.2-2.7-4-6-4s-6 1.8-6 4m6-7a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8-5v6m3-3h-6" /></Icon>;
}

function SoundIcon({ muted }) {
  return <Icon className="size-4.5"><path fill="currentColor" d="M3 15V9h4l5-5v16l-5-5H3Zm11 1V7.95c1.67.78 2.5 2.13 2.5 4.05 0 1.9-.83 3.23-2.5 4Z" />{muted ? <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" d="m17 9 5 5m0-5-5 5" /> : <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M18 5.7a8.5 8.5 0 0 1 0 12.6" />}</Icon>;
}

function ShareIcon() {
  return <Icon className="size-5 mr-1.25"><path fill="currentColor" d="M18 16a3 3 0 0 0-2.39 1.19L8.91 13.3A3.2 3.2 0 0 0 9 12c0-.45-.09-.88-.26-1.27l6.82-3.98A3 3 0 1 0 15 5c0 .22.02.43.07.64L8.24 9.62a3 3 0 1 0 .07 4.72l6.79 3.94A3 3 0 1 0 18 16" /></Icon>;
}

function FairnessIcon() {
  return <Icon className="size-5 mr-1.25"><path fill="currentColor" d="M11 3H5V1h14v2h-6v2.15l5.1 2.55L22 14h-8l3.1-5.15L13 6.8V20h4v2H7v-2h4V6.8L6.9 8.85 10 14H2l3.9-6.3L11 5.15V3ZM4.7 12h2.6L6 9.9 4.7 12Zm12 0h2.6L18 9.9 16.7 12Z" /></Icon>;
}

function CrownIcon() {
  return <Icon className="size-5"><path fill="currentColor" d="M5 16 3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5Zm0 2h14v2H5v-2Z" /></Icon>;
}

function LightningIcon() {
  return <Icon className="size-5"><path fill="currentColor" d="m8 22 1-7H4l9-13h2l-1 8h6L10 22Z" /></Icon>;
}

function RaisedButton({ children, color = "primary", className = "" }) {
  const primary = color === "primary";
  const face = primary ? "#F3B239" : "#57689A";
  const shadow = primary ? "#D38502" : "#223364";
  return <button type="button" className={`relative h-9.5 cursor-pointer outline-none flex select-none group/button ${className}`}><span className="absolute inset-x-0 top-0.75 bottom-0 rounded-lg" style={{ backgroundColor: shadow }} /><span className="relative h-[calc(100%-3px)] rounded-lg px-4 flex items-center justify-center font-medium transition-transform duration-125 group-hover/button:-translate-y-0.5 group-active/button:translate-y-0" style={{ backgroundColor: face, color: primary ? "#3A3869" : "#FFFFFF", filter: `drop-shadow(0 2px 0 ${shadow})` }}>{children}</span></button>;
}

function BattleLayout({ battle }) {
  const teams = battle.playerLayout?.length ? battle.playerLayout : [1, 1];
  const cursed = battle.modes?.crazy;
  return <div className="flex items-center gap-1" style={{ color: cursed ? "#E650FF" : "#A7BFF5" }}>{teams.map((teamSize, teamIndex) => <div key={teamIndex} className="contents">{teamIndex > 0 && <SwordIcon className={`size-3.25 ${cursed ? "text-[#E650FF]/50" : "text-accent/50"} mx-0.5`} />}<span className="flex items-center gap-1">{Array.from({ length: teamSize }, (_, index) => cursed ? <SkullIcon key={index} /> : <PlayerModeIcon key={index} />)}</span></div>)}</div>;
}

function ModeBadge({ type }) {
  const setup = {
    crazy: { color: "#E650FF", background: "radial-gradient(100% 100% at 50% 100%, rgba(226,80,255,.25), rgba(47,62,108,0)), rgba(47,62,108,.36)", icon: <SkullIcon className="size-5" /> },
    jackpot: { color: "#FAB444", background: "radial-gradient(100% 100% at 50% 100%, rgba(250,180,68,.25), rgba(47,62,108,0)), rgba(47,62,108,.36)", icon: <CrownIcon /> },
    fast: { color: "#A7BFF5", background: "radial-gradient(100% 100% at 50% 100%, rgba(167,191,245,.25), rgba(47,62,108,0)), rgba(47,62,108,.36)", icon: <LightningIcon /> },
  }[type];
  return <span className="rounded-xl p-3 flex" style={{ color: setup.color, background: setup.background }}>{setup.icon}</span>;
}

function RoundRail({ battle, rounds }) {
  const current = battle.status === "complete" ? Math.max(0, rounds.length - 1) : Math.max(0, (battle.currentRound || 1) - 1);
  return <div className="battle-detail-rounds absolute left-1/2 -translate-x-1/2 flex items-center h-16 w-100 overflow-hidden"><div className="bg-[#2F3E6C] rounded-xl size-16 absolute top-1/2 left-1/2 -translate-1/2" /><div className="flex items-center gap-2.25 absolute h-full transition-transform duration-500" style={{ left: "50%", transform: `translateX(${-29 - current * 67}px)` }}>{rounds.map((item, index) => <button type="button" key={`${item.id}-${index}`} className={`relative shrink-0 size-14.5 transition-opacity${index === current ? "" : " opacity-35"}`} title={item.name}><img src={item.imageUrl} alt={item.name} className="size-full object-cover opacity-0 transition-opacity duration-300" onLoad={(event) => { event.currentTarget.style.opacity = "1"; }} /></button>)}</div></div>;
}

function BattleHeader({ battle, rounds, muted, onMutedChange, onFairness }) {
  const currentIndex = battle.status === "complete" ? Math.max(0, rounds.length - 1) : Math.max(0, (battle.currentRound || 1) - 1);
  const currentCase = rounds[currentIndex] || battle.cases[0];
  const discount = battle.modes.partial ? battle.fundingPercent : battle.modes.borrow ? battle.borrowPercent : 0;
  const currentRound = battle.status === "complete" ? battle.rounds : battle.currentRound;
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); } catch { /* Clipboard may be unavailable outside HTTPS. */ } };
  return <div className="flex flex-col gap-5 px-4 md:px-0"><div className="flex flex-col md:flex-row md:items-center md:justify-between relative gap-2 md:gap-0"><div className="hidden md:flex md:flex-1 md:my-auto"><a href="/games/battles" className="text-accent hover:text-accent-light text-sm flex items-center font-medium transition-colors cursor-pointer"><ArrowLeftIcon /> BACK TO BATTLES</a></div><div className="flex flex-col gap-1 items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-auto"><BattleLayout battle={battle} /><div className="flex items-center gap-2.5"><p className="font-medium">{currentCase?.name || `Battle #${battle.number}`}</p><span className="size-1 rounded-full bg-white" /><span className="flex items-center gap-1"><img src="/coin.webp" alt="" className="size-4.5" /><span className="tabular-nums font-semibold">{Math.round(currentCase?.price || 0).toLocaleString("en-US")}</span></span></div></div><div className="flex items-center justify-center gap-2 md:shrink-0 md:ml-3"><a href="/games/battles" aria-label="Back to battles" className="md:hidden text-accent hover:text-accent-light flex items-center justify-center bg-[#202D57] hover:bg-[#2D3D73] rounded-lg size-10 transition-colors"><Icon className="size-4.5" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="m12 19-7-7 7-7m7 7H5" /></Icon></a><button type="button" aria-label={muted ? "Unmute battle" : "Mute battle"} onClick={() => onMutedChange(!muted)} className="text-accent size-10 flex items-center justify-center rounded-lg bg-[#202D57] hover:bg-[#2D3D73] transition-colors cursor-pointer"><SoundIcon muted={muted} /></button><button type="button" onClick={copyLink} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-3 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"><ShareIcon />SHARE</button><button type="button" onClick={onFairness} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-3 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"><FairnessIcon />FAIRNESS</button></div></div><div className="h-11 flex items-center justify-between relative"><div className="flex flex-col"><p className="text-accent text-sm font-medium">BATTLE PRICE</p><div className="flex items-center gap-1.5"><img src="/coin.webp" alt="" className="size-4.5" /><span className="font-semibold tabular-nums">{Math.round(battle.cost).toLocaleString("en-US")}</span>{discount > 0 && <span className="text-accent/80 line-through font-semibold tabular-nums">{Math.round(battle.totalCost).toLocaleString("en-US")}</span>}</div></div><RoundRail battle={battle} rounds={rounds} /><div className="flex items-center gap-3.5"><div className="flex flex-col"><p className="text-accent text-sm font-medium">ROUNDS</p><p className="font-semibold text-right tabular-nums">{currentRound}/{battle.rounds}</p></div>{(battle.modes.crazy || battle.modes.jackpot || battle.modes.fastSpin) && <><span className="w-0.5 h-8 rounded-full bg-accent/20" /><div className="flex gap-1.5">{battle.modes.crazy && <ModeBadge type="crazy" />}{battle.modes.jackpot && <ModeBadge type="jackpot" />}{battle.modes.fastSpin && <ModeBadge type="fast" />}</div></>}</div></div></div>;
}

function BattleArena({ battle, currentUserUuid }) {
  const playerBySlot = useMemo(() => new Map((battle.players || []).map((player, index) => [Number.isInteger(player.slot) ? player.slot : index, player])), [battle.players]);
  const isCreator = currentUserUuid && currentUserUuid === battle.creator.uuid;
  const isParticipant = currentUserUuid && battle.players.some((player) => player.uuid === currentUserUuid);
  let slot = 0;
  const slots = battle.playerLayout.flatMap((teamSize, teamIndex) => Array.from({ length: teamSize }, () => ({ slot: slot++, teamIndex })));
  return <div className="battle-detail-spinner relative md:px-3 py-3 bg-[#243157] md:rounded-2xl"><div className="battle-detail-spinner-inner bg-[#1B2540] relative md:rounded-[10px] min-h-100 overflow-hidden"><div className="absolute inset-0 flex">{slots.map(({ slot: slotIndex, teamIndex }, index) => { const player = playerBySlot.get(slotIndex); const boundary = index > 0 && teamIndex !== slots[index - 1].teamIndex; return <div key={slotIndex} className="relative flex-1 min-w-0"><div className="absolute inset-0 flex items-center justify-center text-center"><div className="relative flex flex-col items-center justify-center w-max">{player ? <><span className="bg-[#5CDF9A] rounded-full size-25 absolute top-1/2 left-1/2 -translate-1/2 blur-3xl opacity-30" /><h4 className="text-[#5CDF9A] font-semibold text-xl leading-none relative">READY</h4><h5 className="font-medium text-sm relative">TO BATTLE</h5><CheckIcon />{isCreator && player.uuid === battle.creator.uuid && <RaisedButton color="neutral" className="mt-5">Cancel Battle</RaisedButton>}</> : <><span className="bg-primary rounded-full size-25 absolute top-1/2 left-1/2 -translate-1/2 blur-3xl opacity-30" /><h4 className="text-primary font-semibold text-xl leading-none relative">WAITING</h4><h5 className="font-medium text-sm relative">FOR PLAYER</h5><AddPlayerIcon /><div className="relative flex gap-2">{!isParticipant && <RaisedButton>Join Battle</RaisedButton>}{isCreator && <RaisedButton>Call Bot</RaisedButton>}</div></>}</div></div>{index > 0 && <span className="absolute left-0 top-0 h-full w-0.5 -translate-x-1/2 bg-[#243157]" />}{boundary && <span className="absolute z-2 left-0 top-1/2 -translate-1/2 bg-[#243157] rounded-md size-7.5 rotate-45" />}{boundary && <SwordIcon className="absolute z-3 left-0 top-1/2 -translate-1/2 size-3.5 text-accent" />}</div>; })}</div></div></div>;
}

function PlayerColumns({ battle }) {
  const playerBySlot = new Map((battle.players || []).map((player, index) => [Number.isInteger(player.slot) ? player.slot : index, player]));
  const teamColors = ["255,107,107", "78,205,196", "69,183,209", "150,206,180"];
  const slotTeams = battle.playerLayout.flatMap((teamSize, teamIndex) => Array.from({ length: teamSize }, () => teamIndex));
  return <div className="battle-detail-player-grid grid gap-5 mt-5" style={{ "--battle-detail-slots": battle.maxPlayers }}>{Array.from({ length: battle.maxPlayers }, (_, index) => { const player = playerBySlot.get(index); const color = teamColors[slotTeams[index] % teamColors.length]; return <div key={index} className="min-w-0"><div className="h-25.5 text-center flex flex-col rounded-[10px] shadow-[0_3px_0_#18223F] overflow-hidden" style={{ background: `radial-gradient(80% 100% at 50% 100%, rgba(${color},.25) 0%, rgba(36,49,87,0) 100%), #2F3E6B` }}><div className="grow flex justify-center items-center h-14 px-2.5">{player ? <><span className="size-9 rounded-lg bg-[#232A48] p-0.5 mr-2 shrink-0"><img src={player.avatar} alt={player.username} className="size-full object-contain rounded-[6px] opacity-0 transition-opacity" onLoad={(event) => { event.currentTarget.style.opacity = "1"; }} /></span><p className="text-sm font-medium text-white truncate">{player.username}</p></> : <span className="text-accent font-medium text-[15px]">WAITING...</span>}</div><div className="h-11.5 bg-black/20 flex items-center justify-center"><img src="/coin.webp" alt="" className="size-4.5 mr-1.5" /><span className="font-semibold tabular-nums">0</span></div></div><div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">{Array.from({ length: battle.rounds }, (_, roundIndex) => <div key={roundIndex} className="aspect-[5.6/7] min-h-24 text-center flex flex-col items-center justify-center border-3 border-[#243157] rounded-[10px]"><span className="text-[#38456B] font-semibold text-sm leading-none">ROUND</span><strong className="text-[#38456B] font-bold text-3xl leading-none tabular-nums">{String(roundIndex + 1).padStart(2, "0")}</strong></div>)}</div></div>; })}</div>;
}

function FairnessModal({ onClose }) {
  return <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4" onMouseDown={onClose}><div className="w-full max-w-lg rounded-2xl bg-[#202D57] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-bold text-xl">BATTLE FAIRNESS</h2><button type="button" onClick={onClose} className="text-accent text-2xl cursor-pointer">×</button></div><p className="text-sm text-accent mt-3">Battle results use the server seed and future EOS block data so every roll can be independently verified after the battle completes.</p><a href="/fairness" className="mt-4 inline-flex h-10 px-3 bg-[#2E3C68] rounded-lg text-accent text-sm font-semibold items-center hover:bg-[#364879] transition-colors">LEARN MORE</a></div></div>;
}

export default function Battle({ id }) {
  const [battle, setBattle] = useState(null);
  const [currentUserUuid, setCurrentUserUuid] = useState(null);
  const [muted, setMuted] = useState(false);
  const [fairnessOpen, setFairnessOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const key = new URLSearchParams(window.location.search).get("key");
    Promise.all([
      fetch(`/api/battles/${id}${key ? `?key=${encodeURIComponent(key)}` : ""}`, { signal: controller.signal, credentials: "include" }).then(async (response) => { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Could not load this battle."); return data.battle; }),
      fetch("/api/session", { signal: controller.signal, credentials: "include" }).then((response) => response.ok ? response.json() : null).catch(() => null),
    ]).then(([loadedBattle, session]) => { setBattle(loadedBattle); setCurrentUserUuid(session?.user?.uuid || null); }).catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message); });
    return () => controller.abort();
  }, [id]);

  useEffect(() => { document.title = battle ? `Battle #${battle.number} :: MM2Wild` : "Battle :: MM2Wild"; }, [battle]);

  const rounds = useMemo(() => battle ? battle.cases.flatMap((caseItem) => Array.from({ length: Math.max(1, caseItem.quantity) }, () => caseItem)).slice(0, battle.rounds) : [], [battle]);

  return <div className="site-content"><div className="max-w-[1660px] mx-auto px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]"><div className="page-content battle-page py-6 flex flex-col gap-5">{error && <p role="alert" className="text-error font-medium">{error}</p>}{battle && <><BattleHeader battle={battle} rounds={rounds} muted={muted} onMutedChange={setMuted} onFairness={() => setFairnessOpen(true)} /><div className="px-0 md:px-0"><BattleArena battle={battle} currentUserUuid={currentUserUuid} /><PlayerColumns battle={battle} /></div></>}</div></div>{fairnessOpen && <FairnessModal onClose={() => setFairnessOpen(false)} />}</div>;
}
