import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function Icon({ children, className = "size-5", viewBox = "0 0 24 24", ...props }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className={className} aria-hidden="true" {...props}>{children}</svg>;
}

function ArrowLeftIcon() {
  return <Icon className="size-4.5 mr-1.5 -translate-y-[0.6px]" style={{ strokeWidth: 3.5 }}><path fill="none" stroke="currentColor" d="m12 19-7-7 7-7m7 7H5" /></Icon>;
}

function SwordIcon({ className, offset = 0.5 }) {
  const layoutClass = className || "relative size-3 text-white/50";
  return <Icon fill="none" viewBox="0 0 16 16" className={layoutClass} style={className ? undefined : { top: `${offset}px` }}><path fill="currentColor" d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z" /></Icon>;
}

function SkullIcon({ className = "size-5.5" }) {
  return <Icon viewBox="0 0 15 18" className={className}><path fill="currentColor" d="M14.432 11.227c-.1-.4-.059-1.041.092-1.425 0 0 .477-1.217.476-2.302a7.5 7.5 0 0 0-15 0c-.001 1.085.476 2.302.476 2.302.15.384.192 1.025.092 1.425l-.295 1.181c-.15.6.122 1.408.605 1.795l.499.399c.274.219.811.273 1.194.12l.59-.236c.324-.13.758-.236.964-.236.207 0 .375.168.375.375 0 1.026-.286 1.955-.75 2.626 2.315.961 5 1.035 7.5 0-.464-.671-.75-1.6-.75-2.626 0-.207.168-.375.375-.375.206 0 .64.106.964.236l.589.236c.383.153.92.098 1.194-.12l.5-.399c.482-.387.755-1.195.605-1.794l-.295-1.182ZM6.375 9.458c0 .413-.313.875-.697 1.029l-1.66.664c-.766.307-1.393-.118-1.393-.943V9c0-.83.672-1.5 1.5-1.5H5.25c.622 0 1.125.504 1.125 1.125v.833Zm1.615 4.043h-.98c-.539 0-.783-.365-.542-.813l.594-1.101c.241-.448.635-.448.876 0l.594 1.101c.24.448-.003.813-.542.813Zm4.385-3.293c0 .825-.627 1.25-1.393.943l-1.66-.664c-.383-.154-.697-.616-.697-1.028v-.833c0-.621.503-1.125 1.125-1.125h1.125c.829 0 1.5.67 1.5 1.5v1.207Z" /></Icon>;
}

function PlayerModeIcon({ className = "size-5.5", style }) {
  return <Icon className={className} style={style}><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></Icon>;
}

function InsetShadowFilter() {
  return <svg aria-hidden="true" className="absolute size-0 overflow-hidden"><defs><filter id="battle-count-inset-shadow" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB" filterRes="1024 1024"><feGaussianBlur in="SourceAlpha" stdDeviation="0" result="blur" /><feOffset in="blur" dx="0" dy="1.5" result="offsetBlur" /><feComposite in="offsetBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner" /><feFlood floodColor="#ffffff" floodOpacity="0.66" result="color" /><feComposite in="color" in2="inner" operator="in" result="shadow" /><feComposite in="shadow" in2="SourceGraphic" operator="over" /></filter></defs></svg>;
}

function BattleCountIcon({ cursed, gradientId }) {
  const className = "size-5.5 filter-[url(#battle-count-inset-shadow)]";
  if (!cursed) return <PlayerModeIcon className={className} style={{ color: "rgb(167, 191, 245)" }} />;
  return <Icon fill="none" viewBox="0 0 15 18" className={className} style={{ "--svg-gradient-from": "#E650FF", "--svg-gradient-to": "#C750FF" }}><defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--svg-gradient-from)" /><stop offset="100%" stopColor="var(--svg-gradient-to)" /></linearGradient></defs><path fill={`url(#${gradientId})`} d="M14.432 11.227c-.1-.4-.059-1.041.092-1.425 0 0 .477-1.217.476-2.302a7.5 7.5 0 0 0-15 0c-.001 1.085.476 2.302.476 2.302.15.384.192 1.025.092 1.425l-.295 1.181c-.15.6.122 1.408.605 1.795l.499.399c.274.219.811.273 1.194.12l.59-.236c.324-.13.758-.236.964-.236.207 0 .375.168.375.375 0 1.026-.286 1.955-.75 2.626 2.315.961 5 1.035 7.5 0-.464-.671-.75-1.6-.75-2.626 0-.207.168-.375.375-.375.206 0 .64.106.964.236l.589.236c.383.153.92.098 1.194-.12l.5-.399c.482-.387.755-1.195.605-1.794l-.295-1.182Zm-8.057-1.77c0 .413-.313.875-.697 1.029l-1.66.664c-.766.307-1.393-.118-1.393-.943V9c0-.83.672-1.5 1.5-1.5H5.25c.622 0 1.125.504 1.125 1.125v.833ZM7.99 13.5h-.98c-.539 0-.783-.365-.542-.813l.594-1.101c.241-.448.635-.448.876 0l.594 1.101c.24.448-.003.813-.542.813Zm4.385-3.293c0 .825-.627 1.25-1.393.943l-1.66-.664c-.383-.154-.697-.616-.697-1.028v-.833c0-.621.503-1.125 1.125-1.125h1.125c.829 0 1.5.67 1.5 1.5v1.207Z" /></Icon>;
}

function CheckIcon() {
  return <Icon className="size-6 md:size-8 text-[#5CDF9A] mt-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></Icon>;
}

function AddPlayerIcon() {
  return <Icon className="size-6 md:size-8 text-primary my-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M15 19c0-2.2-2.7-4-6-4s-6 1.8-6 4m6-7a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8-5v6m3-3h-6" /></Icon>;
}

function SoundIcon({ muted }) {
  const path = muted
    ? "m19.8 22.6-3.025-3.025q-.625.4-1.325.688t-1.45.462v-2.05q.35-.125.688-.25t.637-.3L12 14.8V20l-5-5H3V9h3.2L1.4 4.2l1.4-1.4 18.4 18.4zm-.2-5.8-1.45-1.45q.425-.775.638-1.625t.212-1.75q0-2.35-1.375-4.2T14 5.275v-2.05q3.1.7 5.05 3.138T21 11.975q0 1.325-.363 2.55T19.6 16.8m-3.35-3.35L14 11.2V7.95q1.175.55 1.838 1.65T16.5 12q0 .375-.062.738t-.188.712M12 9.2 9.4 6.6 12 4z"
    : "M14 20.725v-2.05q2.25-.65 3.625-2.5t1.375-4.2-1.375-4.2T14 5.275v-2.05q3.1.7 5.05 3.138T21 11.975t-1.95 5.613T14 20.725M3 15V9h4l5-5v16l-5-5zm11 1V7.95q1.175.55 1.838 1.65T16.5 12q0 1.275-.663 2.363T14 16";
  return <Icon className="size-4.5"><path fill="currentColor" d={path} /></Icon>;
}

function ShareIcon() {
  return <Icon className="size-5 mr-1.25"><path fill="currentColor" d="m17.657 14.828-1.415-1.414L17.658 12A4 4 0 1 0 12 6.343l-1.414 1.414L9.17 6.343l1.415-1.414a6 6 0 0 1 8.485 8.485zm-2.829 2.829-1.414 1.414a6 6 0 0 1-8.485-8.485l1.414-1.414 1.414 1.414L6.343 12A4 4 0 0 0 12 17.657l1.414-1.414zm0-9.9 1.415 1.415-7.072 7.07-1.414-1.414z" /></Icon>;
}

function FairnessIcon() {
  return <Icon fill="none" viewBox="0 0 21 20" className="size-5 mr-1.25"><path fill="currentColor" d="M8.912 11.375a.53.53 0 0 0-.53-.53h-.184L6.384 6.753c-.348.091-.698.171-1.05.24l1.706 3.852H3.372l1.684-3.8c-.41.074-.822.133-1.236.177l-1.606 3.623H2.03a.53.53 0 0 0-.529.53c-.008 1.82 1.933 3.04 3.706 3 1.772.041 3.714-1.181 3.706-3ZM18.972 10.845h-.185l-1.605-3.623a17.132 17.132 0 0 1-1.236-.176l1.683 3.8h-3.667l1.707-3.852a17.11 17.11 0 0 1-1.052-.241l-1.813 4.092h-.185a.53.53 0 0 0-.53.53c0 .827.404 1.596 1.136 2.165 1.364 1.106 3.777 1.106 5.142 0 .732-.57 1.135-1.338 1.135-2.165a.53.53 0 0 0-.53-.53ZM2.03 6.257c1.453 0 2.9-.197 4.3-.586a15.584 15.584 0 0 1 8.34 0c1.4.389 2.847.586 4.3.586.6 0 .737-.842.168-1.032a23.547 23.547 0 0 1-3.98-1.75l-.836-.465a7.892 7.892 0 0 0-3.292-.972v-.546c-.026-.701-1.034-.7-1.06 0v.546a7.892 7.892 0 0 0-3.292.972l-.837.465a23.543 23.543 0 0 1-3.979 1.75c-.57.19-.433 1.032.168 1.032ZM12.617 16.916H8.38c-.877 0-1.588.711-1.588 1.588 0 .293.237.53.53.53h6.352a.53.53 0 0 0 .53-.53c0-.877-.711-1.588-1.588-1.588Z" /><path fill="currentColor" d="M9.969 15.857h1.059V6.171a14.236 14.236 0 0 0-1.06 0v9.686Z" /></Icon>;
}

function HeaderModeIcon({ type, color }) {
  const paths = {
    crazy: "M14.432 11.227c-.1-.4-.059-1.041.092-1.425 0 0 .477-1.217.476-2.302a7.5 7.5 0 0 0-15 0c-.001 1.085.476 2.302.476 2.302.15.384.192 1.025.092 1.425l-.295 1.181c-.15.6.122 1.408.605 1.795l.499.399c.274.219.811.273 1.194.12l.59-.236c.324-.13.758-.236.964-.236.207 0 .375.168.375.375 0 1.026-.286 1.955-.75 2.626 2.315.961 5 1.035 7.5 0-.464-.671-.75-1.6-.75-2.626 0-.207.168-.375.375-.375.206 0 .64.106.964.236l.589.236c.383.153.92.098 1.194-.12l.5-.399c.482-.387.755-1.195.605-1.794l-.295-1.182Zm-8.057-1.77c0 .413-.313.875-.697 1.029l-1.66.664c-.766.307-1.393-.118-1.393-.943V9c0-.83.672-1.5 1.5-1.5H5.25c.622 0 1.125.504 1.125 1.125v.833ZM7.99 13.5h-.98c-.539 0-.783-.365-.542-.813l.594-1.101c.241-.448.635-.448.876 0l.594 1.101c.24.448-.003.813-.542.813Zm4.385-3.293c0 .825-.627 1.25-1.393.943l-1.66-.664c-.383-.154-.697-.616-.697-1.028v-.833c0-.621.503-1.125 1.125-1.125h1.125c.829 0 1.5.67 1.5 1.5v1.207Z",
    jackpot: "M5 16 3 5l5.5 5L12 4l3.5 6L21 5l-2 11zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14z",
    fast: "m8 22 1-7H4l9-13h2l-1 8h6L10 22z",
  };
  const gradientId = "battle-header-crazy-gradient";
  const gradient = type === "crazy";
  return <Icon fill={gradient ? "none" : undefined} className="size-5 transition-colors duration-200 filter-[url(#battle-count-inset-shadow)]" viewBox={gradient ? "0 0 15 18" : "0 0 24 24"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ color, ...(gradient ? { "--svg-gradient-from": "#E650FF", "--svg-gradient-to": "#C750FF" } : {}) }}>{gradient && <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--svg-gradient-from)" /><stop offset="100%" stopColor="var(--svg-gradient-to)" /></linearGradient></defs>}<path fill={gradient ? `url(#${gradientId})` : "currentColor"} d={paths[type]} /></Icon>;
}

function RaisedButton({ children, color = "primary", className = "", disabled = false, ...props }) {
  const colors = {
    primary: { face: "#F3B239", shadow: "#D38502", text: "#3A3869" },
    neutral: { face: "#57689A", shadow: "#223364", text: "#FFFFFF" },
    error: { face: "#FC5C5B", shadow: "#7D2828", text: "#FFFFFF" },
  };
  const setup = colors[color] || colors.primary;
  return <button type="button" disabled={disabled} {...props} className={`relative h-9.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-55 outline-none flex select-none group/button ${className}`}><span className="absolute inset-x-0 top-0.75 bottom-0 rounded-lg" style={{ backgroundColor: setup.shadow }} /><span className="relative h-[calc(100%-3px)] rounded-lg px-4 py-2 flex items-center justify-center font-medium transition-transform duration-125 group-hover/button:-translate-y-0.5 group-disabled/button:translate-y-0 group-active/button:translate-y-0" style={{ backgroundColor: setup.face, color: setup.text, filter: `drop-shadow(0 2px 0 ${setup.shadow})` }}>{children}</span></button>;
}

function BattleLayout({ battle }) {
  const teams = battle.playerLayout?.length ? battle.playerLayout : [1, 1];
  const cursed = battle.modes?.crazy;
  const swordClassName = `size-3.25 ${cursed ? "text-[#E650FF]/50" : "text-accent/50"} mx-0.5`;
  return <div className="flex items-center gap-1"><InsetShadowFilter />{teams.map((teamSize, teamIndex) => <div key={teamIndex} className="flex items-center gap-1">{Array.from({ length: teamSize }, (_, index) => <BattleCountIcon key={index} cursed={cursed} gradientId={`battle-count-gradient-${teamIndex}-${index}`} />)}{teamIndex < teams.length - 1 && <SwordIcon className={swordClassName} />}</div>)}</div>;
}

function ModeBadge({ type }) {
  const setup = {
    crazy: { color: "#E650FF", background: "radial-gradient(100% 100% at 50% 100%, rgba(226,80,255,.25), rgba(47,62,108,0)), rgba(47,62,108,.36)" },
    jackpot: { color: "#FAB444", background: "radial-gradient(100% 100% at 50% 100%, rgba(250,180,68,.25), rgba(47,62,108,0)), rgba(47,62,108,.36)" },
    fast: { color: "#A7BFF5", background: "radial-gradient(100% 100% at 50% 100%, rgba(167,191,245,.25), rgba(47,62,108,0)), rgba(47,62,108,.36)" },
  }[type];
  return <span className="rounded-xl p-3 flex" style={{ color: setup.color, background: setup.background }}><HeaderModeIcon type={type} color={setup.color} /></span>;
}

function RoundRail({ battle, rounds }) {
  const current = battle.status === "complete" ? Math.max(0, rounds.length - 1) : Math.max(0, (battle.currentRound || 1) - 1);
  return <div className="battle-detail-rounds absolute left-1/2 -translate-x-1/2 flex items-center h-16 w-100 overflow-hidden" style={{ maskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,.9) 40%, rgba(0,0,0,1) 50%, rgba(0,0,0,.9) 60%, rgba(0,0,0,0) 100%)" }}><div className="bg-[#2F3E6C] rounded-xl size-16 absolute top-1/2 left-1/2 -translate-1/2" /><div className="flex items-center gap-2.25 absolute h-full transition-transform duration-500" style={{ left: "50%", transform: `translateX(${-29 - current * 67}px)` }}>{rounds.map((item, index) => <button type="button" key={`${item.id}-${index}`} className="relative shrink-0 size-14.5" title={item.name}><img src={item.imageUrl} alt={item.name} width="58" height="58" className={`size-full object-cover transition-[transform,filter] duration-300${index === current ? " scale-110" : " scale-95 grayscale"}`} /></button>)}</div></div>;
}

function BattleHeader({ battle, rounds, muted, onMutedChange, onFairness }) {
  const currentIndex = battle.status === "complete" ? Math.max(0, rounds.length - 1) : Math.max(0, (battle.currentRound || 1) - 1);
  const currentCase = rounds[currentIndex] || battle.cases[0];
  const discount = battle.modes.partial ? battle.fundingPercent : battle.modes.borrow ? battle.borrowPercent : 0;
  const currentRound = battle.status === "complete" ? battle.rounds : battle.currentRound;
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); } catch { /* Clipboard may be unavailable outside HTTPS. */ } };
  return <div className="flex flex-col gap-5 px-4 md:px-0"><div className="flex flex-col md:flex-row md:items-center md:justify-between relative gap-2 md:gap-0"><div className="hidden md:flex md:flex-1 md:my-auto"><a href="/games/battles" className="text-accent hover:text-accent-light text-sm flex items-center font-medium transition-colors cursor-pointer"><ArrowLeftIcon /> BACK TO BATTLES</a></div><div className="flex flex-col gap-1 items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-auto"><BattleLayout battle={battle} /><div className="flex items-center gap-2.5"><p className="font-medium">{currentCase?.name || `Battle #${battle.number}`}</p><span className="size-1 rounded-full bg-white" /><span className="flex items-center gap-1"><img src="/coin.webp" alt="" className="size-4.5" /><span className="tabular-nums font-semibold">{Math.round(currentCase?.price || 0).toLocaleString("en-US")}</span></span></div></div><div className="flex items-center justify-center gap-2 md:shrink-0 md:ml-3"><a href="/games/battles" aria-label="Back to battles" className="md:hidden text-accent hover:text-accent-light flex items-center justify-center bg-[#202D57] hover:bg-[#2D3D73] rounded-lg size-10 transition-colors"><Icon className="size-4.5" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="m12 19-7-7 7-7m7 7H5" /></Icon></a><button type="button" aria-label={muted ? "Unmute battle" : "Mute battle"} onClick={() => onMutedChange(!muted)} className="text-accent size-10 flex items-center justify-center rounded-lg bg-[#202D57] hover:bg-[#2D3D73] transition-colors cursor-pointer"><SoundIcon muted={muted} /></button><button type="button" onClick={copyLink} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-3 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"><ShareIcon />SHARE</button><button type="button" onClick={onFairness} className="text-accent bg-[#202D57] hover:bg-[#2D3D73] rounded-lg h-10 px-3 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"><FairnessIcon />FAIRNESS</button></div></div><div className="h-11 flex items-center justify-between relative"><div className="flex flex-col"><p className="text-accent text-sm font-medium">BATTLE PRICE</p><div className="flex items-center gap-1.5"><img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5 -translate-y-[0.5px]" /><span className="font-semibold tabular-nums">{Math.round(battle.cost).toLocaleString("en-US")}</span>{discount > 0 && <span className="text-accent/80 line-through font-semibold tabular-nums">{Math.round(battle.totalCost).toLocaleString("en-US")}</span>}</div></div><RoundRail battle={battle} rounds={rounds} /><div className="flex items-center gap-3.5"><div className="flex flex-col"><p className="text-accent text-sm font-medium">ROUNDS</p><p className="font-semibold text-right tabular-nums">{currentRound}/{battle.rounds}</p></div>{(battle.modes.crazy || battle.modes.jackpot || battle.modes.fastSpin) && <><span className="w-0.5 h-8 rounded-full bg-accent/20" /><div className="flex gap-1.5">{battle.modes.crazy && <ModeBadge type="crazy" />}{battle.modes.jackpot && <ModeBadge type="jackpot" />}{battle.modes.fastSpin && <ModeBadge type="fast" />}</div></>}</div></div></div>;
}

function LegacyBattleArena({ battle, currentUserUuid }) {
  const playerBySlot = useMemo(() => new Map((battle.players || []).map((player, index) => [Number.isInteger(player.slot) ? player.slot : index, player])), [battle.players]);
  const isCreator = currentUserUuid && currentUserUuid === battle.creator.uuid;
  const isParticipant = currentUserUuid && battle.players.some((player) => player.uuid === currentUserUuid);
  let slot = 0;
  const slots = battle.playerLayout.flatMap((teamSize, teamIndex) => Array.from({ length: teamSize }, () => ({ slot: slot++, teamIndex })));
  const isThreeVsThree = slots.length === 6 && battle.playerLayout.length === 2 && battle.playerLayout.every((teamSize) => teamSize === 3);
  const arenaColumns = slots.length > 4 ? 2 : Math.max(slots.length, 1);
  const arenaRows = slots.length > 4 ? Math.ceil(slots.length / 2) : 1;
  const arenaStyle = { gridTemplateColumns: `repeat(${arenaColumns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${arenaRows}, minmax(0, 1fr))` };
  return <div className="battle-detail-spinner relative md:px-3 py-3 bg-[#243157] md:rounded-2xl"><div className="battle-detail-spinner-inner bg-[#1B2540] relative md:rounded-[10px] min-h-100 overflow-hidden"><div className="team-slots absolute inset-0 grid" style={arenaStyle}>{slots.map(({ slot: slotIndex, teamIndex }, index) => { const player = playerBySlot.get(slotIndex); const placement = isThreeVsThree ? { gridColumn: Math.floor(index / 3) + 1, gridRow: (index % 3) + 1 } : undefined; return <div key={slotIndex} data-slot={slotIndex + 1} className={`slot text-center relative min-w-0 min-h-0${battle.playerLayout[teamIndex] > 1 ? ` team--${teamIndex}` : ""}`} style={placement}><div className="slot-inner flex items-center justify-center absolute size-full left-0 top-0"><div className="relative w-max"><div className="flex flex-col items-center justify-center absolute left-1/2 top-1/2 -translate-1/2 w-max">{player ? <><span className="bg-[#5CDF9A] rounded-full size-25 absolute top-1/2 left-1/2 -translate-1/2 blur-3xl opacity-30 pointer-events-none" /><h4 className="text-[#5CDF9A] font-semibold text-xl !leading-none relative">READY</h4><h5 className="font-medium text-sm relative">TO BATTLE</h5><CheckIcon />{isCreator && player.uuid === battle.creator.uuid && <RaisedButton color="error" className="mt-5">Cancel Battle</RaisedButton>}</> : <><span className="bg-primary rounded-full size-25 absolute top-1/2 left-1/2 -translate-1/2 blur-3xl opacity-30 pointer-events-none" /><h4 className="text-primary font-semibold text-xl !leading-none relative">WAITING</h4><h5 className="font-medium text-sm relative">FOR PLAYER</h5><AddPlayerIcon /><div>{!isParticipant && <RaisedButton>Join Battle</RaisedButton>}{isCreator && <RaisedButton>Call Bot</RaisedButton>}</div></>}</div></div></div></div>; })}</div></div></div>;
}

function battleReelRarity(item) {
  const name = String(item?.name || "").toLowerCase();
  const rarity = String(item?.rarity || "").toLowerCase();
  if (name.startsWith("c. ") || name.includes("chroma") || rarity.includes("chroma")) return { label: "CHROMA", color: "94, 224, 167" };
  if (rarity.includes("unique")) return { label: "UNIQUE", color: "250, 180, 68" };
  if (rarity.includes("ancient")) return { label: "ANCIENT", color: "239, 86, 91" };
  if (rarity.includes("vintage")) return { label: "VINTAGE", color: "89, 178, 255" };
  if (rarity.includes("legendary")) return { label: "LEGENDARY", color: "168, 108, 255" };
  return { label: rarity ? rarity.toUpperCase() : "GODLY", color: "230, 80, 255" };
}

function BattleArenaFlow({ battle, currentUserUuid, loadingSlot, loadingAction, actionError, onAction }) {
  const playerBySlot = useMemo(() => new Map((battle.players || []).map((player, index) => [Number.isInteger(player.slot) ? player.slot : index, player])), [battle.players]);
  const isCreator = currentUserUuid && currentUserUuid === battle.creator.uuid;
  const isParticipant = currentUserUuid && battle.players.some((player) => player.uuid === currentUserUuid);
  let nextSlot = 0;
  const slots = battle.playerLayout.flatMap((teamSize, teamIndex) => Array.from({ length: teamSize }, () => ({ slot: nextSlot++, teamIndex })));
  const isThreeVsThree = slots.length === 6 && battle.playerLayout.length === 2 && battle.playerLayout.every((teamSize) => teamSize === 3);
  const rollingAt = battle.rollingAt ? new Date(battle.rollingAt).getTime() : 0;
  const countdown = Math.max(0, Math.ceil((rollingAt - Date.now()) / 1000));
  const roundResult = battle.results?.[Math.max(0, battle.currentRound - 1)];
  const winners = (battle.players || []).filter((player) => player.winner);
  const totalWon = winners.reduce((sum, player) => sum + (Number(player.payout) || 0), 0);
  const stacked = slots.length > 4;
  const slotClass = (teamIndex) => `${battle.playerLayout[teamIndex] > 1 ? ` team--${teamIndex}` : ""}${stacked ? "" : " grow"}`;
  const slotStyle = stacked
    ? isThreeVsThree
      ? { flex: "0 0 33.333333%", width: "50%", maxWidth: "50%", height: "33.333333%" }
      : { flex: "0 0 50%", width: "50%", maxWidth: "50%", height: "33.333333%" }
    : { height: "100%" };
  const slotShell = (content) => <div className={`team-slots absolute inset-0 flex flex-wrap justify-center items-center${isThreeVsThree ? " flex-col" : ""}`}>{slots.map(({ slot, teamIndex }) => <div key={slot} data-slot={slot + 1} className={`slot text-center relative min-w-0 min-h-0${slotClass(teamIndex)}`} style={slotStyle}><div className="slot-inner flex items-center justify-center absolute size-full left-0 top-0">{content(slot, playerBySlot.get(slot))}</div></div>)}{isThreeVsThree && <span className="battle-team-swords absolute left-1/2 top-1/2 -translate-1/2 z-10 flex size-10 items-center justify-center rounded-xl bg-[#2A3964] text-[#A7BFF5]"><SwordIcon className="size-4" /></span>}</div>;

  let content;
  if (battle.status === "complete") {
    const winnerNames = winners.length === battle.maxPlayers ? "ALL PLAYERS" : winners.map((player) => player.username).join(" & ") || "BATTLE";
    const jackpotTotal = battle.players.reduce((sum, player) => sum + player.items.reduce((itemSum, item) => itemSum + Number(item.price || 0), 0), 0);
    const chance = winners[0] && jackpotTotal ? (winners[0].items.reduce((sum, item) => sum + Number(item.price || 0), 0) / jackpotTotal) * 100 : 0;
    const recreateQuery = new URLSearchParams({ recreate: String(battle.number), ...(battle.accessKey ? { key: battle.accessKey } : {}) });
    content = <div className="battle-winners-overlay absolute inset-0 flex items-center justify-center flex-col rounded-[10px] overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(92,223,154,.34),transparent_55%)]" /><video src="/wildspin.webm" autoPlay loop muted playsInline className="absolute size-50 -bottom-24 left-2 -rotate-10 opacity-80" /><video src="/wildspin.webm" autoPlay loop muted playsInline className="absolute size-94 -bottom-40 -left-15 opacity-[.03]" /><video src="/wildspin.webm" autoPlay loop muted playsInline className="absolute size-50 -bottom-24 right-2 rotate-10 -scale-x-100 opacity-80" /><video src="/wildspin.webm" autoPlay loop muted playsInline className="absolute size-94 -bottom-40 -right-15 opacity-[.03] -scale-x-100" /><div className="relative flex flex-col items-center"><h3 className="font-semibold text-2xl"><span className="text-[#5CDF9A]">{winnerNames}</span><span className="ml-2">WON</span></h3><h2 className="flex items-center text-5xl font-bold mt-5"><img src="/coin.webp" className="size-11 mr-3" alt="" />{Math.round(totalWon).toLocaleString("en-US")}</h2>{battle.modes.jackpot && <h4 className="mt-3 text-sm font-semibold text-accent">WITH A CHANCE OF: <span className="text-white">{chance.toFixed(2)}%</span></h4>}<a href={`/games/battles/create?${recreateQuery}`} className="mt-7"><RaisedButton>RECREATE BATTLE <img src="/coin.webp" className="size-4.5 mx-1" alt="" />{Math.round(battle.cost).toLocaleString("en-US")}</RaisedButton></a></div></div>;
  } else if (battle.status === "in_progress" && countdown > 0) {
    content = <div className="flex flex-col items-center justify-center relative h-full"><div className="bg-primary rounded-full w-96 h-24 absolute top-1/2 left-1/2 -translate-1/2 blur-3xl opacity-40" /><p className="text-white/80 font-semibold text-xl relative">STARTING IN</p><p className="bg-linear-to-r from-primary to-[#FFC96D] text-transparent bg-clip-text tabular-nums font-extrabold text-[108px] leading-none relative mt-2 [text-shadow:0_12px_0_rgba(243,178,57,0.19)]">0{countdown}</p><div className="bg-[#243157] px-4.5 py-2.5 rounded-t-xl font-semibold absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap">MINING BLOCK {battle.fairness?.eosBlock ? <span className="text-accent">- EOS BLOCK : #{battle.fairness.eosBlock}</span> : null}</div></div>;
  } else if (battle.status === "in_progress" && battle.phase === "tally") {
    content = slotShell((slot, player) => {
      const total = player?.items?.reduce((sum, item) => sum + Number(item.price || 0), 0) || 0;
      const jackpotTotal = battle.players.reduce((sum, entry) => sum + (entry.items || []).reduce((itemSum, item) => itemSum + Number(item.price || 0), 0), 0);
      const shown = battle.modes.jackpot ? `${jackpotTotal ? ((total / jackpotTotal) * 100).toFixed(2) : "0.00"}%` : Math.round(total).toLocaleString("en-US");
      return <div className="battle-tally flex flex-col items-center"><p className="text-accent text-sm font-semibold">{player?.username || `PLAYER ${slot + 1}`}</p><p className="mt-2 flex items-center text-2xl font-semibold">{!battle.modes.jackpot && <img src="/coin.webp" className="size-6 mr-2" alt="" />}{shown}</p></div>;
    });
  } else if (battle.status === "in_progress") {
    const horizontal = slots.length > 4;
    content = slotShell((slot, player) => {
      const drop = roundResult?.drops?.find((entry) => Number(entry.slot) === slot);
      const reel = Array.isArray(drop?.reel) && drop.reel.length ? drop.reel : drop ? [drop] : [];
      const end = horizontal ? `${Math.max(0, reel.length - 1) * -152}px` : `${Math.max(0, reel.length - 1) * -152 + 124}px`;
      const playerTotal = (player?.items || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      return <div key={`${battle.currentRound}-${slot}`} className={`battle-live-reel ${horizontal ? "is-horizontal" : "is-vertical"}`} style={{ "--battle-reel-end": end, "--battle-reel-duration": battle.modes.fastSpin ? "1.25s" : "4.65s" }}><div className="battle-live-reel-track">{reel.map((item, index) => { const rarity = battleReelRarity(item); return <div key={`${index}-${item.name}`} className={`battle-live-reel-item${index === reel.length - 1 ? " is-result" : ""}`} style={{ "--battle-rarity": rarity.color }}><span className="battle-live-reel-glow absolute rounded-full pointer-events-none" /><img src={item.imageUrl} alt={item.name} className="battle-live-item-image object-contain relative drop-shadow-[0_14px_20px_rgba(0,0,0,.45)]" /><div className="battle-live-reel-caption relative"><p className="battle-live-rarity font-bold" style={{ color: `rgb(${rarity.color})` }}>{rarity.label}</p><p className="font-semibold truncate">{item.name}</p><span className="flex items-center justify-center gap-1 text-sm"><img src="/coin.webp" className="size-4" alt="" />{Math.round(Number(item.price) || 0).toLocaleString("en-US")}</span></div></div>; })}</div>{player && <div className="battle-live-player flex items-center gap-2"><span className="flex items-center gap-1 rounded-lg bg-[#111A31]/80 px-2 py-1 text-sm font-semibold tabular-nums"><img src="/coin.webp" className="size-4" alt="" />{Math.round(playerTotal).toLocaleString("en-US")}</span><span className="flex size-9 items-center justify-center rounded-lg border-2 border-[#3599E8] bg-[#1D294A]"><img src={player.avatar} alt={player.username} className="size-8 object-contain rounded-md" /></span></div>}</div>;
    });
  } else {
    const canCancel = Date.now() - new Date(battle.createdAt).getTime() >= 300_000;
    content = slotShell((slot, player) => <div className="relative w-max"><div className="flex flex-col items-center justify-center absolute left-1/2 top-1/2 -translate-1/2 w-max">{player ? <><span className="bg-[#5CDF9A] rounded-full size-25 absolute top-1/2 left-1/2 -translate-1/2 blur-3xl opacity-30 pointer-events-none" /><h4 className="text-[#5CDF9A] font-semibold text-xl !leading-none relative">READY</h4><h5 className="font-medium text-sm relative">TO BATTLE</h5><CheckIcon />{isCreator && player.uuid === battle.creator.uuid && <RaisedButton color="error" disabled={!canCancel || loadingAction === "cancel"} onClick={() => onAction("cancel", slot)} className="mt-5">{canCancel ? "Cancel Battle" : "Cancel in 5m"}</RaisedButton>}</> : <><span className="bg-primary rounded-full size-25 absolute top-1/2 left-1/2 -translate-1/2 blur-3xl opacity-30 pointer-events-none" /><h4 className="text-primary font-semibold text-xl !leading-none relative">WAITING</h4><h5 className="font-medium text-sm relative">FOR PLAYER</h5><AddPlayerIcon /><div className="flex gap-2">{!isParticipant && <RaisedButton disabled={loadingSlot !== null} onClick={() => onAction("join", slot)}>{loadingSlot === slot && loadingAction === "join" ? "Joining..." : "Join Battle"}</RaisedButton>}{isCreator && <RaisedButton disabled={loadingSlot !== null} onClick={() => onAction("bot", slot)}>{loadingSlot === slot && loadingAction === "bot" ? "Calling..." : "Call Bot"}</RaisedButton>}</div></>}</div></div>);
  }
  const stackedSpinner = stacked && battle.status !== "complete" && battle.status !== "cancelled";
  return <div className={`battle-detail-spinner relative md:px-3 py-3 bg-[#243157] md:rounded-2xl${stackedSpinner ? " is-stacked-spinner" : ""}`}><div className="battle-detail-spinner-inner bg-[#1B2540] relative md:rounded-[10px] overflow-hidden">{content}{actionError && <p className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 rounded-lg bg-[#7D2828] px-3 py-1.5 text-sm font-medium">{actionError}</p>}</div></div>;
}

const PLAYER_TEAM_COLORS = ["255, 107, 107", "78, 205, 196", "69, 183, 209", "150, 206, 180"];
const PLAYER_SLOT_COLORS = ["255, 107, 107", "78, 205, 196", "69, 183, 209", "150, 206, 180", "255, 234, 167", "221, 160, 221"];

function colorChannels(color, fallback) {
  const value = String(color || "").trim();
  const hex = value.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (hex) return `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}`;
  const rgb = value.match(/^rgba?\((\d+)\D+(\d+)\D+(\d+)/i);
  return rgb ? `${rgb[1]}, ${rgb[2]}, ${rgb[3]}` : value || fallback;
}

function levelColor(level) {
  if (level >= 40) return "#ABF339";
  if (level >= 20) return "#F36D39";
  if (level >= 10) return "#F3B239";
  return "#607199";
}

function PlayerAvatar({ player }) {
  const color = levelColor(Number(player.level) || 1);
  const isBot = player.isBot === true || player.bot === true || player.is_bot === true;
  return <><div className="avatar-ctn mr-2"><div className="rounded-[10px] size-9 flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) p-0.5" style={{ "--level-border-start": "#262D4C", "--level-border-end": "#607199" }}><div className="size-full flex items-center justify-center rounded-lg bg-[#232A48]"><img src={player.avatar} alt={player.username} loading="lazy" className="size-9/12 object-contain object-center rounded-[5px] transition-opacity pointer-events-none" /></div></div></div><div className="flex items-center gap-1.5 min-w-0 overflow-hidden">{!isBot && <div className="bg-gradient-to-b from-(--level-border-start) to-(--level-border-end) p-0.5 rounded-md shrink-0" style={{ "--level-border-start": "#2F3C58", "--level-border-end": color }}><div className="rounded-sm size-full flex items-center justify-center px-1.25 py-0.5 text-[10px] font-medium !leading-none bg-[#263457]" style={{ color }}>{Number(player.level) || 1}</div></div>}<p className="text-sm font-medium text-white mr-3 truncate">{player.username}</p></div></>;
}

function playerDrops(battle, player, slotIndex) {
  if (Array.isArray(player?.items)) return battle.status === "in_progress" ? player.items.filter((item) => Number(item.round) <= battle.currentRound) : player.items;
  return (battle.results || []).flatMap((result, roundIndex) => {
    const drops = Array.isArray(result) ? result : Array.isArray(result?.drops) ? result.drops : Array.isArray(result?.results) ? result.results : [result];
    return drops.filter((drop) => Number(drop?.slot ?? drop?.playerSlot ?? drop?.player_slot) === slotIndex).map((drop) => ({ ...drop, round: drop?.round ?? drop?.roundIndex ?? roundIndex + 1 }));
  });
}

function BattleDrop({ drop, round }) {
  if (!drop) return <div className="won-item text-center flex flex-col items-center justify-center border-3 border-[#243157] rounded-[10px]"><span className="text-[#38456B] font-semibold text-sm leading-none">ROUND</span><strong className="text-[#38456B] font-bold text-3xl leading-none tabular-nums">{String(round).padStart(2, "0")}</strong></div>;
  const item = drop.item || drop.prize || drop;
  const name = item.shortName || item.name || item.item_name || "Mystery Item";
  const image = item.imageUrl || item.image_url || item.image || "";
  const value = Math.round(Number(item.price ?? item.value) || 0);
  return <button type="button" className="won-item cursor-pointer flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 bg-[#243157]" style={{ backgroundImage: "url('/leafs-item.png')", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}><div className="w-10/12 mx-auto aspect-square relative">{image && <img loading="lazy" src={image} alt={name} className="absolute top-1/2 left-1/2 -translate-1/2 size-10/12 object-contain pointer-events-none" />}</div><div className="flex flex-col mt-auto relative items-center min-w-0 w-full"><p className="font-medium text-[15px] text-left truncate max-w-full">{name}</p><div className="flex items-center gap-1.5"><img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5" /><span className="tabular-nums font-semibold text-left">{value.toLocaleString("en-US")}</span></div></div><p className="font-medium text-sm absolute top-3 right-3 text-[#7D91CA]">#{round}</p></button>;
}

function PlayerTotal({ battle, player, color, value, winner, className = "" }) {
  const complete = battle.status === "complete";
  const liveJackpot = battle.modes.jackpot && !complete;
  const winChance = Number(player?.winChance ?? player?.win_chance) || 0;
  const shownValue = liveJackpot ? winChance * 100 : value;
  return <h5 className={`total-pill px-3 py-1.5 inline-flex items-center justify-center text-center rounded-[9px] shrink-0${liveJackpot ? " is-jackpot" : ""}${complete ? " is-total" : ""}${winner ? " is-winner" : ""} ${className}`} style={{ "--color": color }}>{!liveJackpot && <img src="/coin.webp" alt="" className="bg-cover bg-center coin-icon size-4.5 mr-1.5" />}<span className="font-medium text-sm whitespace-nowrap tabular-nums">{liveJackpot ? shownValue.toFixed(2) : Math.round(shownValue).toLocaleString("en-US")}{liveJackpot && "%"}</span></h5>;
}

function PlayerChevron({ expanded }) {
  return <Icon className={`size-5 text-[#7D91CA] transition-transform duration-200${expanded ? " rotate-180" : ""}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></Icon>;
}

function EmptyRound({ round, mobile = false }) {
  return <div className={`${mobile ? "mobile-empty-round aspect-[5.6/7]" : "won-item"} text-center flex flex-col items-center justify-center border-3 border-[#243157] rounded-[10px]`}><span className={`text-[#38456B] font-semibold ${mobile ? "text-xs" : "text-sm"} leading-none`}>ROUND</span><strong className={`text-[#38456B] font-bold ${mobile ? "text-2xl" : "text-3xl"} leading-none tabular-nums`}>{String(round).padStart(2, "0")}</strong></div>;
}

function PlayerColumns({ battle }) {
  const [expandedSlots, setExpandedSlots] = useState(() => new Set());
  const playerBySlot = new Map((battle.players || []).map((player, index) => [Number.isInteger(player.slot) ? player.slot : index, player]));
  const slotTeams = battle.playerLayout.flatMap((teamSize, teamIndex) => Array.from({ length: teamSize }, () => teamIndex));
  const teamMode = battle.playerLayout.some((teamSize) => teamSize > 1);
  const playerCount = slotTeams.length || battle.maxPlayers;
  const indexes = Array.from({ length: playerCount }, (_, index) => index);
  const gridStyle = { "--battle-detail-slots": playerCount };
  const sixPlayer = playerCount === 6;
  const dropSets = indexes.map((index) => {
    const drops = playerDrops(battle, playerBySlot.get(index), index);
    const total = drops.reduce((sum, drop) => { const item = drop?.item || drop?.prize || drop; return sum + (Number(item?.price ?? item?.value) || 0); }, 0);
    return { drops, total, byRound: new Map(drops.map((drop, dropIndex) => [Number(drop?.round ?? drop?.roundIndex) || dropIndex + 1, drop])) };
  });
  const teamTotals = slotTeams.reduce((totals, team, index) => { totals[team] = (totals[team] || 0) + dropSets[index].total; return totals; }, []);
  const scoreFor = (index) => teamMode ? teamTotals[slotTeams[index]] : dropSets[index].total;
  const scores = indexes.filter((index) => playerBySlot.has(index)).map(scoreFor);
  const winningScore = scores.length ? (battle.modes.crazy ? Math.min(...scores) : Math.max(...scores)) : null;
  const isWinner = (index, player) => {
    if (battle.status !== "complete" || !player) return false;
    const explicit = player.winner ?? player.isWinner ?? player.is_winner;
    if (explicit !== undefined) return Boolean(explicit);
    const payout = Number(player.payout ?? player.winnings);
    if (Number.isFinite(payout)) return payout > 0;
    return dropSets.some((set) => set.drops.length > 0) && scoreFor(index) === winningScore;
  };
  const toggleSlot = (index) => setExpandedSlots((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; });
  const renderRounds = (index, mobile = false) => Array.from({ length: battle.rounds }, (_, roundIndex) => {
    const round = roundIndex + 1;
    const drop = dropSets[index].byRound.get(round);
    if (mobile) return drop ? <BattleDrop key={round} drop={drop} round={round} /> : <EmptyRound key={round} round={round} mobile />;
    return <div key={round} className="item-wrapper aspect-[5.6/7]">{drop ? <BattleDrop drop={drop} round={round} /> : <EmptyRound round={round} />}</div>;
  });
  return <><div className="battle-detail-player-grid grid gap-5" style={gridStyle}>{indexes.map((index) => { const player = playerBySlot.get(index); const team = slotTeams[index] || 0; const winner = isWinner(index, player); const fallbackColor = teamMode ? PLAYER_TEAM_COLORS[team % PLAYER_TEAM_COLORS.length] : PLAYER_SLOT_COLORS[index % PLAYER_SLOT_COLORS.length]; const baseColor = colorChannels(player?.color, fallbackColor); const color = battle.status === "complete" ? (winner ? "91, 255, 168" : "252, 92, 91") : baseColor; const explicitPayout = Number(player?.payout ?? player?.winnings); const value = battle.status === "complete" ? (Number.isFinite(explicitPayout) ? explicitPayout : winner ? dropSets[index].total : 0) : dropSets[index].total; const expanded = expandedSlots.has(index); return <div key={index} className={`player-card-ctn${teamMode ? ` team--${team}` : ""}`}><div className={`player-header text-center flex flex-col rounded-[10px] shadow-[0px_3px_0px_#18223F]${teamMode && team > 0 ? ` team--${team}` : ""}${winner ? " is-winner" : ""}${battle.modes.jackpot ? " is-jackpot" : ""}`} style={{ "--color": color, background: "radial-gradient(80% 100% at 50% 100%, rgba(var(--color), 0.25) 0%, rgba(36, 49, 87, 0) 100%), #2F3E6B" }}>{player ? <div className="grow flex justify-center items-center h-14 px-2.5"><PlayerAvatar player={player} /><PlayerTotal battle={battle} player={player} color={color} value={value} winner={winner} className={sixPlayer ? "min-[960px]:hidden" : ""} /><button type="button" aria-label={`${expanded ? "Hide" : "Show"} ${player.username}'s items`} aria-expanded={expanded} onClick={() => toggleSlot(index)} className="min-[1024px]:hidden ml-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"><PlayerChevron expanded={expanded} /></button></div> : <div className="text-center grow flex justify-center items-center h-14"><span className="text-accent font-medium text-[15px]">WAITING...</span></div>}{sixPlayer && <div className="hidden min-[960px]:flex justify-center items-center grow-0 rounded-b-[10px] h-11.5 bg-black/20"><PlayerTotal battle={battle} player={player} color={color} value={value} winner={winner} /></div>}</div>{player && expanded && <div className="min-[1024px]:hidden inventory-ctn mt-3"><div className="player-inventory grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">{renderRounds(index, true)}</div></div>}</div>; })}</div><div className="hidden min-[1024px]:block"><div className="inventory-ctn max-h-125 overflow-y-auto scrollbar-hide"><div className="battle-detail-player-grid grid gap-5" style={gridStyle}>{indexes.map((index) => <div key={index} className="overflow-hidden player-inventory grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">{renderRounds(index)}</div>)}</div></div></div></>;
}

function LegacyFairnessModal({ onClose }) {
  return <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4" onMouseDown={onClose}><div className="w-full max-w-lg rounded-2xl bg-[#202D57] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-bold text-xl">BATTLE FAIRNESS</h2><button type="button" onClick={onClose} className="text-accent text-2xl cursor-pointer">×</button></div><p className="text-sm text-accent mt-3">Battle results use the server seed and future EOS block data so every roll can be independently verified after the battle completes.</p><a href="/fairness" className="mt-4 inline-flex h-10 px-3 bg-[#2E3C68] rounded-lg text-accent text-sm font-semibold items-center hover:bg-[#364879] transition-colors">LEARN MORE</a></div></div>;
}

function LegacyBattle({ id }) {
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

  return <div className="site-content"><div className="max-w-[1660px] mx-auto px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]"><div className="page-content battle-page py-6 flex flex-col gap-5">{error && <p role="alert" className="text-error font-medium">{error}</p>}{battle && <><BattleHeader battle={battle} rounds={rounds} muted={muted} onMutedChange={setMuted} onFairness={() => setFairnessOpen(true)} /><div className="relative px-0 battle-spinner-ctn"><BattleArena battle={battle} currentUserUuid={currentUserUuid} /></div><div className="flex flex-col gap-4 px-4 md:px-0"><PlayerColumns battle={battle} /></div></>}</div></div>{fairnessOpen && <FairnessModal onClose={() => setFairnessOpen(false)} />}</div>;
}

function FairnessModal({ battle, onClose }) {
  const rows = [
    ["HASHED SEED", battle.fairness?.serverSeedHash || "Waiting for seed commitment..."],
    ["SERVER SEED", battle.fairness?.serverSeed || "Revealed after the battle is complete"],
    ["EOS BLOCK", battle.fairness?.eosBlock ? `#${battle.fairness.eosBlock}` : "Selected when the battle starts"],
    ["EOS HASH", battle.fairness?.eosHash || "Revealed after the battle is complete"],
  ];
  return <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4" onMouseDown={onClose}><div className="w-full max-w-xl rounded-2xl bg-[#202D57] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-bold text-xl">BATTLE FAIRNESS</h2><button type="button" aria-label="Close fairness" onClick={onClose} className="text-accent text-2xl cursor-pointer">&times;</button></div><p className="text-sm text-accent mt-3">The committed seed and future EOS block determine every item before the animation begins.</p><div className="mt-4 flex flex-col gap-2.5">{rows.map(([label, value]) => <div key={label} className="rounded-xl bg-[#182341] px-3.5 py-3"><p className="text-xs font-semibold text-accent">{label}</p><p className="mt-1 break-all font-mono text-xs text-white/90">{value}</p></div>)}</div><a href="/fairness" className="mt-4 inline-flex h-10 px-3 bg-[#2E3C68] rounded-lg text-accent text-sm font-semibold items-center hover:bg-[#364879] transition-colors">LEARN MORE</a></div></div>;
}

export default function Battle({ id, balanceType = "mm2" }) {
  const [battle, setBattle] = useState(null);
  const [currentUserUuid, setCurrentUserUuid] = useState(null);
  const [muted, setMuted] = useState(false);
  const [fairnessOpen, setFairnessOpen] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loadingSlot, setLoadingSlot] = useState(null);
  const [loadingAction, setLoadingAction] = useState("");
  const previousState = useRef({ status: "", phase: "", round: 0, players: 0 });
  const accessKey = useMemo(() => new URLSearchParams(window.location.search).get("key") || "", [id]);

  const loadBattle = useCallback(async (signal) => {
    const response = await fetch(`/api/battles/${id}${accessKey ? `?key=${encodeURIComponent(accessKey)}` : ""}`, { signal, credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.battle) throw new Error(data.error || "Could not load this battle.");
    setBattle(data.battle);
    setError("");
    return data.battle;
  }, [id, accessKey]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      loadBattle(controller.signal),
      fetch("/api/session", { signal: controller.signal, credentials: "include" }).then((response) => response.ok ? response.json() : null).catch(() => null),
    ]).then(([, session]) => setCurrentUserUuid(session?.user?.uuid || null)).catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message); });
    return () => controller.abort();
  }, [loadBattle]);

  useEffect(() => {
    if (!battle || battle.status === "complete" || battle.status === "cancelled") return undefined;
    const interval = window.setInterval(() => { loadBattle().catch(() => {}); }, battle.status === "in_progress" ? 700 : 2_000);
    return () => window.clearInterval(interval);
  }, [battle?.status, loadBattle]);

  useEffect(() => {
    const refresh = (event) => {
      if (event.detail?.table !== "mm2wild_battles") return;
      window.clearTimeout(refresh.timer);
      refresh.timer = window.setTimeout(() => loadBattle().catch(() => {}), 80);
    };
    window.addEventListener("mm2wild:supabase-change", refresh);
    return () => { window.clearTimeout(refresh.timer); window.removeEventListener("mm2wild:supabase-change", refresh); };
  }, [loadBattle]);

  useEffect(() => {
    if (!battle) return;
    document.title = `Battle #${battle.number} :: MM2Wild`;
    const previous = previousState.current;
    let source = "";
    if (previous.players && battle.players.length > previous.players) source = `/sounds/battles/battle-join-${Math.min(4, battle.players.length)}.mp3`;
    if (battle.status === "in_progress" && previous.status !== "in_progress") source = "/sounds/battles/countdown.mp3";
    if (battle.status === "in_progress" && battle.currentRound > previous.round && battle.currentRound > 0) source = battle.currentRound === battle.rounds ? "/sounds/battles/pull-big-1.mp3" : "/sounds/battles/battle-land-1.mp3";
    if (battle.phase === "tally" && previous.phase !== "tally") source = battle.modes.jackpot ? "/sounds/battles/jackpot-spin.mp3" : "/sounds/battles/total-glow.mp3";
    if (battle.status === "complete" && previous.status && previous.status !== "complete") source = "/sounds/battles/tally-winner.mp3";
    previousState.current = { status: battle.status, phase: battle.phase, round: battle.currentRound, players: battle.players.length };
    if (!muted && source) { const audio = new Audio(source); audio.volume = 0.55; audio.play().catch(() => {}); }
  }, [battle?.status, battle?.phase, battle?.currentRound, battle?.players?.length, muted]);

  const runAction = useCallback(async (action, slot) => {
    if (loadingAction) return;
    setActionError("");
    setLoadingAction(action);
    setLoadingSlot(slot ?? null);
    try {
      const response = await fetch(`/api/battles/${id}/${action}`, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ slot, key: accessKey, balanceType }) });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { window.dispatchEvent(new CustomEvent("mm2wild:open-sign-in")); return; }
      if (!response.ok || !data.battle) throw new Error(data.error || "The battle action could not be completed.");
      window.dispatchEvent(new CustomEvent("mm2wild:balance-updated", { detail: data.balanceType === "crypto" ? { cryptoBalance: data.balance } : { mm2Balance: data.balance } }));
      if (action === "cancel") {
        window.history.pushState({}, "", "/games/battles");
        window.dispatchEvent(new PopStateEvent("popstate"));
        return;
      }
      setBattle(data.battle);
    } catch (actionFailure) {
      setActionError(actionFailure.message || "The battle action could not be completed.");
    } finally {
      setLoadingAction("");
      setLoadingSlot(null);
    }
  }, [accessKey, id, loadingAction]);

  const rounds = useMemo(() => battle ? battle.cases.flatMap((caseItem) => Array.from({ length: Math.max(1, caseItem.quantity) }, () => caseItem)).slice(0, battle.rounds) : [], [battle]);

  return <div className="site-content"><div className="max-w-[1660px] mx-auto px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]"><div className="page-content battle-page py-6 flex flex-col gap-5">{error && <p role="alert" className="text-error font-medium">{error}</p>}{battle && <><BattleHeader battle={battle} rounds={rounds} muted={muted} onMutedChange={setMuted} onFairness={() => setFairnessOpen(true)} /><div className="relative px-0 battle-spinner-ctn"><BattleArenaFlow battle={battle} currentUserUuid={currentUserUuid} loadingSlot={loadingSlot} loadingAction={loadingAction} actionError={actionError} onAction={runAction} /></div><div className="flex flex-col gap-4 px-4 md:px-0"><PlayerColumns battle={battle} /></div></>}</div></div>{fairnessOpen && battle && <FairnessModal battle={battle} onClose={() => setFairnessOpen(false)} />}</div>;
}
