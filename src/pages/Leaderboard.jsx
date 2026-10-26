import { useEffect, useRef, useState } from "react";
import { footerLogoInnerMarkup } from "./Home";
import LeaderboardRulesModal from "../components/LeaderboardRulesModal";
import LineWobbleLoader from "../components/LineWobbleLoader";

const winnersByPeriod = {
  daily: [
    [1, 64, "calicoyoyo", "341,877", "30,000", "CD06C6F40B1ECBDA8AC0CDF0C3F593AA", "#222c3b", "#ABF339", "254,182,66"],
    [2, 45, "EerieStorage", "500,000", "15,000", "B16EBC87941553353AB19C5AA8243D50", "#27273a", "#F36D39", "109,95,245"],
    [3, 54, "uKnot", "264,449", "8,500", "1F6DF699A1A040FB989D52641FA22C97", "#212b41", "#AFEEEE", "221,115,32"],
  ],
  weekly: [
    [1, 45, "EerieStorage", "168,617", "2,250", "CD06C6F40B1ECBDA8AC0CDF0C3F593AA", "#222c3b", "#ABF339", "254,182,66"],
    [2, 28, "Robber032021alt16", "56,486", "1,125", "B16EBC87941553353AB19C5AA8243D50", "#27273a", "#F36D39", "109,95,245"],
    [3, 53, "kutieuzi", "31,210", "625", "1F6DF699A1A040FB989D52641FA22C97", "#212b41", "#AFEEEE", "221,115,32"],
  ],
};

const trailingPlayers = [
  [4, 18, "GlowingXBrayden", "22,633", "300", "5245604E58213FF2694AC5498D37F653", "#26293a", "#F3B239"],
  [5, 68, "Comp_Zeke", "21,314", "225", "3901CACE00B4A39315F35ECD4023E535", "#252b3f", "#FFE4B5"],
  [6, 33, "kwizylovesglizzy", "20,228", "175", "BBBDED6CAB0AFE96D9E50AFE1EE509F7", "#26293a", "#F3B239"],
  [7, 71, "graveyardsrs", "18,011", "150", "C81083180312A537A31103BFCF6A376C", "#222642", "#BD56FF"],
  [8, 40, "LazyOffDaGas", "9,601", "150", "F8D9EC28F7730F9A96943A0187047222", "#222c3b", "#ABF339"],
];

function playerFrom(values, includeColor = false) {
  const [rank, level, name, points, prize, avatarId, borderStart, borderEnd, color] = values;
  return {
    rank, level, name, points, prize, borderStart, borderEnd,
    color: includeColor ? color : undefined,
    avatar: `https://tr.rbxcdn.com/30DAY-AvatarHeadshot-${avatarId}-Png/180/180/AvatarHeadshot/Webp/noFilter`,
  };
}

const winnerData = Object.fromEntries(
  Object.entries(winnersByPeriod).map(([key, values]) => [key, values.map((value) => playerFrom(value, true))]),
);
const tableData = trailingPlayers.map((value) => playerFrom(value));

const previousWinners = [
  [45, "iampatricaa", "2,250", "B5C725BED133937107A366C959B22F32", "#222c3b", "#ABF339", "AUG 27 - AUG 28"],
  [36, "ultrxt", "2,250", "56DEF1B2263E6F4AFFD939C5EA5A8BCA", "#272539", "#F33939", "AUG 26 - AUG 27"],
  [99, "cairosync", "2,250", "784E5A3BAD3DB2D0FE95825CADF51C55", "#272b3a", "#FFE712", "AUG 25 - AUG 26"],
  [62, "pleadformoney1", "2,250", "AE4D3210A421144A7C72E76D2B0E5861", "#252b3f", "#FFE4B5", "AUG 24 - AUG 25"],
  [25, "SnowK_FD8", "2,250", "5FE0D780A0B2E9BC5F99263A5E70BB0E", "#27273a", "#F36D39", "AUG 23 - AUG 24"],
].map(([level, name, prize, avatarId, borderStart, borderEnd, dateRange]) => ({
  level, name, prize, dateRange, borderStart, borderEnd,
  avatar: `https://tr.rbxcdn.com/30DAY-AvatarHeadshot-${avatarId}-Png/180/180/AvatarHeadshot/Webp/noFilter`,
}));

const leaderboardAssets = [
  "/coin.webp",
  "/items/chroma-evergreen.webp",
  "/items/chroma-evergun.webp",
  "/coins/mbx-1.webp",
  "/coins/mbx-2.webp",
  ...[1, 2, 3, 4].map((rank) => `/leaderboard/character-${rank}.webp`),
  ...[1, 2, 3].map((rank) => `/leaderboard/indicator-${rank}.webp`),
  ...Object.values(winnerData).flat().map((player) => player.avatar),
  ...tableData.map((player) => player.avatar),
  ...previousWinners.map((winner) => winner.avatar),
];

const londonClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
  weekday: "short",
});

function londonParts(date) {
  return Object.fromEntries(londonClock.formatToParts(date).map(({ type, value }) => [type, value]));
}

function londonOffset(date) {
  const parts = londonParts(date);
  return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second) - date.getTime();
}

function leaderboardDeadline(period, now = new Date()) {
  const parts = londonParts(now);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  const daysAhead = period === "daily" ? 1 : ((8 - weekday) % 7 || 7);
  const localMidnight = Date.UTC(+parts.year, +parts.month - 1, +parts.day + daysAhead);
  const estimate = new Date(localMidnight);
  return localMidnight - londonOffset(estimate);
}

function countdownParts(period) {
  const remaining = Math.max(0, leaderboardDeadline(period) - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: String(Math.floor(totalSeconds / 86400)).padStart(2, "0"),
    hours: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(totalSeconds % 60).padStart(2, "0"),
  };
}

function loadLeaderboardAsset(src) {
  return new Promise((resolve) => {
    const asset = new Image();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve();
    };
    const timeout = window.setTimeout(finish, 4000);
    asset.onload = finish;
    asset.onerror = finish;
    asset.src = src;
    if (asset.complete) finish();
  });
}

function Coin({ className = "size-4" }) {
  return <img src="/coin.webp" alt="" className={`bg-cover bg-center ${className}`} />;
}

function LevelAvatar({ player, size = "size-14", radius = "rounded-[15px]", innerRadius = "rounded-[13px]" }) {
  return (
    <div
      className={`${size} ${radius} flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) p-0.5 shrink-0`}
      style={{ "--level-border-start": player.borderStart, "--level-border-end": player.borderEnd }}
    >
      <div className={`size-full flex items-center justify-center ${innerRadius} bg-[#1A2339]`}>
        <img src={player.avatar} alt={player.name} loading="lazy" className="size-9/12 object-contain object-center rounded-[5px] leaderboard-loaded-image no-interaction" />
      </div>
    </div>
  );
}

function LevelBadge({ player, small = false }) {
  return (
    <div className="bg-gradient-to-b from-(--level-border-start) to-(--level-border-end) p-0.5 rounded-[5px] shrink-0" style={{ "--level-border-start": player.borderStart, "--level-border-end": player.borderEnd, "--level-text": player.borderEnd }}>
      <div className={`size-full flex items-center justify-center font-medium !leading-none px-1.25 py-0.25 rounded-[3px] bg-[#1A2339] ${small ? "text-[10px]" : "text-[11px]"}`} style={{ color: player.borderEnd }}>{player.level}</div>
    </div>
  );
}

function PlayerDetails({ player, compact = false }) {
  return (
    <div className={`flex flex-col ${compact ? "gap-0.5" : "gap-1.25"} text-sm leading-none py-0.75 min-w-0`}>
      <div className="flex items-center gap-1.5"><LevelBadge player={player} /><span className="font-semibold text-base min-w-0 truncate">{player.name}</span></div>
      <div className="flex items-center gap-1.25"><Coin className="size-4" /><span className="font-semibold"><span className="text-accent">{player.points}</span> <span className="text-accent/65">POINTS</span></span></div>
    </div>
  );
}

function PodiumCard({ player }) {
  return (
    <div className="flex flex-col backdrop-blur-md bg-[#243157]/85 rounded-xl relative z-10">
      <div className="flex items-center gap-3 p-3.5"><LevelAvatar player={player} /><PlayerDetails player={player} /></div>
      <div className="flex items-center justify-center gap-1.25 rounded-b-xl px-3.5 py-1.5" style={{ background: `radial-gradient(103.24% 144.69% at 50.25% 100%,rgba(${player.color},.25),rgba(44,60,108,0) 100%),rgb(44,60,108)` }}>
        <Coin className="size-4.5" /><span className="tabular-nums font-semibold">{player.prize}</span>
      </div>
    </div>
  );
}

function CharacterArtwork({ rank }) {
  return (
    <div className="absolute top-0 w-full left-1/2 -translate-x-1/2 bottom-10 pointer-events-none">
      <img src={`/leaderboard/indicator-${rank}.webp`} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} className={`absolute h-full w-auto bottom-0 z-0 ${rank === 2 ? "left-1/12" : "right-1/12"}`} />
      <div className="size-46 blur-[48px] absolute left-1/2 top-7/12 -translate-1/2" style={{ background: rank === 1 ? "rgb(254,182,66)" : rank === 2 ? "rgb(109,95,245)" : "rgb(221,115,32)" }} />
      <div className="relative w-full" style={{ maskImage: "linear-gradient(black 85%,transparent 100%)" }}><img src={`/leaderboard/character-${rank}.webp`} alt="Character" className="w-full object-contain" /></div>
    </div>
  );
}

function MobileWinner({ player }) {
  return (
    <div className="flex flex-col rounded-xl relative overflow-hidden bg-[#243157]/85">
      <div className="p-3.5 flex items-center gap-3 relative z-10"><LevelAvatar player={player} /><PlayerDetails player={player} compact /></div>
      <div className="flex items-center gap-1.25 rounded-b-xl px-3.5 py-2 relative z-10" style={{ background: `linear-gradient(90deg,rgba(${player.color},.45),rgba(44,60,108,0) 69.57%)` }}><span className="text-sm font-semibold">PRIZE:</span><Coin className="size-3.5" /><span className="font-semibold text-sm">{player.prize}</span></div>
      <img src={`/leaderboard/character-${player.rank}.webp`} alt="Character" className="absolute size-58 -right-13 top-1/2 -translate-y-1/2 blur-[1px] opacity-12" />
      <img src={`/leaderboard/indicator-${player.rank}.webp`} alt="Indicator" className="absolute size-20 right-4 bottom-0 object-contain object-bottom" style={{ filter: `drop-shadow(rgb(${player.color}) 0 4px 61px)` }} />
    </div>
  );
}

function MobileTrailingCard({ player }) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-[#243157]">
      <div className="p-3.5 flex items-center justify-between"><div className="flex items-center gap-1.5 min-w-0"><LevelAvatar player={player} size="size-8" radius="rounded-[8px]" innerRadius="rounded-[6px]" /><LevelBadge player={player} small /><span className="font-medium truncate">{player.name}</span></div><span className="text-accent font-semibold text-sm">#{player.rank}</span></div>
      <div className="flex items-center justify-between gap-4 rounded-b-xl px-3.5 py-2 text-sm font-semibold" style={{ background: "linear-gradient(270deg,rgba(92,223,154,.25),rgba(45,59,98,0) 36.29%),#2D3B62" }}><div className="flex items-center gap-1 text-accent"><span>POINTS:</span><span>{player.points}</span></div><div className="flex items-center gap-1"><Coin className="size-3.5" /><span>{player.prize}</span></div></div>
    </div>
  );
}

function PreviousWinnerCard({ winner }) {
  return (
    <button type="button" className="rounded-xl pt-7 px-4 flex flex-col items-center gap-8 backdrop-blur-sm bg-[#243157]/25 hover:bg-[#2F4277]/21 transition-colors relative overflow-hidden cursor-pointer">
      <div className="absolute size-30 left-1/2 -translate-x-1/2 -top-16 bg-primary rounded-full blur-3xl" />
      <div className="flex flex-col items-center gap-3 relative">
        <div className="size-20 rounded-[18px] flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) p-0.5" style={{ "--level-border-start": winner.borderStart, "--level-border-end": winner.borderEnd, "--level-text": winner.borderEnd }}>
          <div className="size-full flex items-center justify-center rounded-[16px] bg-[#1A2339]">
            <img src={winner.avatar} alt={winner.name} loading="lazy" className="size-9/12 object-contain object-center rounded-[5px] leaderboard-loaded-image no-interaction" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <div className="bg-gradient-to-b from-(--level-border-start) to-(--level-border-end) p-0.5 rounded-[5px]" style={{ "--level-border-start": winner.borderStart, "--level-border-end": winner.borderEnd, "--level-text": winner.borderEnd }}>
              <div className="size-full flex items-center justify-center font-medium !leading-none text-(--level-text) px-1.5 py-0.5 text-xs rounded bg-[#1A2339]">{winner.level}</div>
            </div>
            <p className="font-semibold text-base min-w-0 truncate">{winner.name}</p>
          </div>
          <span className="text-sm font-medium text-accent">DAILY WINNER</span>
        </div>
        <div className="px-3.5 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: "radial-gradient(127.85% 125.64% at 50% 100.88%,rgba(243,178,57,.1),rgba(36,49,87,0) 100%),rgba(51,63,103,.48)" }}>
          <Coin className="size-4.5" />
          <span className="tabular-nums font-medium">{winner.prize}</span>
        </div>
      </div>
      <div className="bg-[#26325A]/65 rounded-t-xl flex items-center gap-1.5 px-2.5 py-1.75 text-accent font-medium text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m4.2 14.2L11 13V7h1.5v5.2l4.5 2.7z" /></svg>
        <span>{winner.dateRange}</span>
      </div>
    </button>
  );
}

export default function Leaderboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("daily");
  const [displayedPeriod, setDisplayedPeriod] = useState("daily");
  const [visible, setVisible] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [countdown, setCountdown] = useState(() => countdownParts("daily"));
  const timerRef = useRef();
  const winners = winnerData[displayedPeriod];

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    const updateCountdown = () => setCountdown(countdownParts(period));
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [period]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(leaderboardAssets.map(loadLeaderboardAsset)).then(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function changePeriod(nextPeriod) {
    if (nextPeriod === period) return;
    clearTimeout(timerRef.current);
    setPeriod(nextPeriod);
    setVisible(false);
    timerRef.current = setTimeout(() => {
      setDisplayedPeriod(nextPeriod);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 300);
  }

  if (isLoading) {
    return (
      <div className="site-content flex items-center justify-center min-h-[calc(100dvh-var(--layout-top))]">
        <LineWobbleLoader />
      </div>
    );
  }

  return (
    <div className="site-content leaderboard-page">
      <div className="leaderboard-backdrop" aria-hidden="true">
        <div className="h-140 bg-linear-to-b from-[#2551FF]/56 to-[#163199]/56 blur-[150px] absolute top-0 -translate-y-1/2 left-2/12 right-2/12 z-0 rounded-full" />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-auto">
          <g opacity=".45">
            <path fill="url(#lb-bg-a)" d="M50 0C22.386 0 0 22.386 0 50s22.386 50 50 50 50-22.386 50-50S77.614 0 50 0Z" />
            <path fill="url(#lb-bg-b)" d="M49.997 10.294C28.07 10.294 10.292 28.071 10.292 50c0 21.929 17.776 39.706 39.705 39.706 21.93 0 39.706-17.777 39.706-39.706 0-21.929-17.777-39.706-39.706-39.706Z" />
            <path fill="url(#lb-bg-c)" d="M50 18.382c-17.462 0-31.618 14.156-31.618 31.618 0 17.462 14.156 31.618 31.617 31.618 17.462 0 31.618-14.156 31.618-31.618 0-17.462-14.156-31.618-31.618-31.618Z" />
          </g>
          <defs>
            <linearGradient id="lb-bg-a" x1="50" x2="50" y1="69.864" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0D1941" stopOpacity=".34" />
              <stop offset="1" stopColor="#0A1026" stopOpacity=".66" />
            </linearGradient>
            <linearGradient id="lb-bg-b" x1="49.997" x2="49.997" y1="70.28" y2="89.706" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E3595" stopOpacity=".41" />
              <stop offset="1" stopColor="#21347C" stopOpacity=".52" />
            </linearGradient>
            <linearGradient id="lb-bg-c" x1="49.999" x2="49.999" y1="69.953" y2="81.618" gradientUnits="userSpaceOnUse">
              <stop stopColor="#566ED0" stopOpacity=".31" />
              <stop offset="1" stopColor="#415FD4" stopOpacity=".43" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="max-w-[1296px] mx-auto flex flex-col @container/content px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))] relative">
        <div className="page-content pt-6 sm:pt-18 pb-6 flex flex-col gap-8 relative z-10">
          <div className="flex bg-[#2F3F71]/75 p-1.5 rounded-[10px] relative mx-auto sm:absolute sm:top-8 sm:-right-4 w-44 z-20">
            <div className="absolute top-1.5 bottom-1.5 bg-[#D38502] rounded-lg transition-all duration-300 ease-out will-change-transform" style={{ width: "calc(50% - 6px)", left: period === "daily" ? "calc(0% + 6px)" : "50%" }}><div className="absolute inset-0 bottom-0.5 bg-primary rounded-lg" /></div>
            {["daily", "weekly"].map((item) => <button key={item} type="button" data-active={period === item} onClick={() => changePeriod(item)} className="relative z-10 flex-1 py-2 text-sm font-semibold transition-all duration-275 cursor-pointer text-white drop-shadow-[0_2px_0_#18213E] data-[active=true]:text-[#3A3869] data-[active=true]:drop-shadow-[0_2px_0_#D38502]">{item.toUpperCase()}</button>)}
          </div>

          <div className="relative w-max mx-auto leaderboard-title-group">
            <div className="absolute -left-1/2 top-8 hidden md:block leaderboard-float-slow"><img src="/items/chroma-evergreen.webp" alt="Chroma Evergreen" width="130" height="120" className="drop-shadow-[0_12px_20px_rgba(0,0,0,.25)] rotate-83 object-contain" /></div>
            <div className="absolute -right-1/2 -top-2 hidden md:block leaderboard-float-slow-reverse"><img src="/items/chroma-evergun.webp" alt="Chroma Evergun" width="130" height="120" className="drop-shadow-[0_12px_20px_rgba(0,0,0,.25)] object-contain" /></div>
            <div className="absolute -left-1/2 top-[120%] hidden md:block leaderboard-float-coin"><img src="/coins/mbx-1.webp" alt="MBX" width="40" height="40" className="drop-shadow-[0_12px_20px_rgba(0,0,0,.25)] rotate-18 object-contain" /></div>
            <div className="absolute -left-2/12 top-[160%] hidden md:block leaderboard-float-coin-reverse"><img src="/coins/mbx-1.webp" alt="MBX" width="30" height="30" className="drop-shadow-[0_12px_20px_rgba(0,0,0,.25)] -rotate-18 object-contain" /></div>
            <div className="absolute -right-1/2 top-[120%] hidden md:block leaderboard-float-coin-delay"><img src="/coins/mbx-2.webp" alt="MBX" width="40" height="40" className="drop-shadow-[0_12px_20px_rgba(0,0,0,.25)] rotate-109 object-contain" /></div>
            <div className="absolute -right-2/12 top-[160%] hidden md:block leaderboard-float-coin-delay-reverse"><img src="/coins/mbx-2.webp" alt="MBX" width="30" height="30" className="drop-shadow-[0_12px_20px_rgba(0,0,0,.25)] rotate-140 object-contain" /></div>
            <div className="flex flex-col items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 983 185" className="w-[168px] h-[32px] drop-shadow-[0_4px_0_rgba(0,0,0,.37)]" dangerouslySetInnerHTML={{ __html: footerLogoInnerMarkup }} />
              <h3 className="text-3xl sm:text-[54px] font-extrabold drop-shadow-[0_9px_0_rgba(0,0,0,.37)]">LEADERBOARD</h3>
              <div className="flex items-center gap-2 bg-linear-to-br from-white/25 via-white/12 to-white/25 px-3.5 py-2 rounded-xl shadow-[0_8px_0_rgba(0,0,0,.37)] -rotate-2"><div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold text-white drop-shadow-[0_3px_0_rgba(0,0,0,.4)]"><div className="flex items-center"><span className="text-white tabular-nums">{countdown.days}</span><span className="text-white">D :</span></div><div className="flex items-center"><span className="text-white tabular-nums">{countdown.hours}</span><span className="text-white">H :</span></div><div className="flex items-center"><span className="text-white tabular-nums">{countdown.minutes}</span><span className="text-white">M :</span></div><div className="flex items-center"><span className="text-white tabular-nums">{countdown.seconds}</span><span className="text-white">S</span></div></div><div className="bg-[#111F55]/45 rounded-lg px-2 py-1.5 flex items-center gap-1.25 inset-shadow-[0_0_12px_rgba(18,26,56,.4)]"><Coin className="size-4.5" /><span className="tabular-nums font-semibold text-sm sm:text-base">{period === "daily" ? "5,000" : "75,000"}</span></div></div>
            </div>
          </div>

          <div className={`flex flex-col gap-4 md:hidden leaderboard-period-content ${visible ? "is-visible" : ""}`}>{winners.map((player) => <MobileWinner key={player.rank} player={player} />)}</div>
          <div className="hidden md:flex justify-between mt-24">{[winners[1], winners[0], winners[2]].map((player) => <div key={player.rank} className={`relative flex flex-1 justify-center items-end aspect-square h-auto ${player.rank === 1 ? "-translate-y-10" : ""}`}><CharacterArtwork rank={player.rank} /><div className={`relative z-10 leaderboard-period-content ${visible ? "is-visible" : ""}`}><PodiumCard player={player} /></div></div>)}</div>

          <div className="flex flex-col gap-4">
            <div className="md:hidden mt-6 flex flex-col gap-3"><div className="flex items-center justify-between px-4 font-medium text-sm text-accent"><span>USER</span><span>#</span></div>{tableData.map((player) => <MobileTrailingCard key={player.rank} player={player} />)}</div>
            <div className="hidden md:block"><table className="border-separate w-full border-spacing-y-3 mt-6"><thead><tr className="align-middle outline-none text-left text-sm text-accent border-none"><th className="pl-4 w-[136px]">#</th><th>USER</th><th className="w-[136px] text-right">WAGERED</th><th className="w-[220px] pr-4 text-right">PRIZE</th></tr></thead><tbody>{tableData.map((player) => <tr key={player.rank} className="text-left text-sm [&_td]:py-2.5 h-[56px] relative [&_td]:bg-[#243157]"><td className="text-white w-[136px] text-sm pl-4 rounded-l-xl font-medium">#{player.rank}</td><td className="text-white"><div className="flex items-center gap-1.5"><LevelAvatar player={player} size="size-8" radius="rounded-[8px]" innerRadius="rounded-[6px]" /><LevelBadge player={player} small /><p className="font-medium">{player.name}</p></div></td><td className="text-white w-[136px] text-right"><div className="flex items-center justify-end gap-1.5"><Coin className="size-4.5" /><span className="tabular-nums font-medium">{player.points}</span></div></td><td className="text-[#E5AD4E] w-[220px] rounded-r-xl text-right pr-4"><div className="flex items-center justify-end gap-1.5"><Coin className="size-4.5" /><span className="tabular-nums font-medium">{player.prize}</span></div></td></tr>)}</tbody></table></div>
          </div>

          <div className="rounded-2xl relative flex" style={{ background: "radial-gradient(55.98% 233.26% at 100% 100%,rgba(20,117,225,.45),rgba(36,49,87,0) 100%),rgba(36,49,87,.25)" }}>
            <div className="flex flex-col items-start gap-3 p-6 md:pr-0 relative z-10"><div className="flex md:items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5.5 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#FFFFFF" /><circle cx="12" cy="7.75" r="1.15" fill="#2F3F71" /><rect x="10.85" y="10.25" width="2.3" height="6.5" rx="1.15" fill="#2F3F71" /></svg><h4 className="text-xl font-semibold uppercase leading-none">How do I earn leaderboard points?</h4></div><p className="text-sm text-accent font-medium">Games contribute to Leaderboard points at different rates depending on the game type, multiplier, and format. Some modes require higher multipliers to earn full credit, and group games contribute less based on team size. To keep Leaderboards fair, non-genuine or low-risk point-farming play may result in reduced or removed Leaderboards contributions. Click to view full Race rules.</p><button type="button" onClick={() => setRulesOpen(true)} className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5"><div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none bg-[#223364]" style={{ top: "var(--sb-shadow-size,3px)" }} /><div className="font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-6 rounded-lg bg-[#57689A] text-white" style={{ height: "calc(100% - var(--sb-shadow-size,3px))" }}><div className="flex items-center justify-center size-full drop-shadow-[0_2px_0_#223364]">LEADERBOARD RULES</div></div></button></div>
            <div className="w-80 shrink-0 relative hidden md:block"><div className="absolute w-88 h-80 overflow-hidden bottom-0"><img src="/leaderboard/character-4.webp" alt="Character" className="size-100 object-contain max-w-none rotate-7 absolute right-0" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div></div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <h5 className="text-lg font-semibold">PREVIOUS LEADERBOARDS</h5>
              <div className="h-0.5 flex-1 bg-linear-to-r from-accent/25 to-[#E5AD4E]/0" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {previousWinners.map((winner) => <PreviousWinnerCard key={winner.dateRange} winner={winner} />)}
            </div>
          </div>
        </div>
      </div>
      {rulesOpen && <LeaderboardRulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  );
}
