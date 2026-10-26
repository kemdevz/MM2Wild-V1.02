import { useEffect, useState } from "react";
import { footerLogoInnerMarkup } from "./Home";
import LineWobbleLoader from "../components/LineWobbleLoader";

const bonusCards = [
  {
    label: "DAILY",
    image: "/rewards/daily-bonus-coins.png",
    accent: "rgba(225,146,20,0.35)",
    gradient: "linear-gradient(rgb(250,181,116) 0%, rgb(243,161,80) 33.06%, rgb(239,144,58) 53.89%, rgb(240,155,81) 74.72%, rgb(241,158,91) 100%)",
    glow: "rgba(239,144,60,0.05)",
    glow2: "rgba(239,144,60,0.04)",
    claimable: true,
    countdown: null,
    shadow: "rgb(211,133,2)",
    bg: "rgb(243,178,57)",
    color: "rgb(58,56,105)",
  },
  {
    label: "WEEKLY",
    image: "/rewards/weekly-bonus-coins.png",
    accent: "rgba(20,117,225,0.35)",
    gradient: "linear-gradient(rgb(116,179,250) 0%, rgb(80,162,243) 33.06%, rgb(58,142,239) 53.89%, rgb(81,161,240) 74.72%, rgb(91,159,241) 100%)",
    glow: "rgba(67,182,239,0.05)",
    glow2: "rgba(67,182,239,0.04)",
    claimable: false,
    countdown: "5D 10H 41M 53S",
    shadow: "rgb(34,51,100)",
    bg: "rgb(87,104,154)",
    color: "rgb(255,255,255)",
  },
  {
    label: "MONTHLY",
    image: "/rewards/monthly-bonus-coins.png",
    accent: "rgba(20,225,34,0.35)",
    gradient: "linear-gradient(rgb(116,250,163) 0%, rgb(80,243,113) 33.06%, rgb(58,239,85) 53.89%, rgb(81,240,137) 74.72%, rgb(91,241,159) 100%)",
    glow: "rgba(63,238,99,0.05)",
    glow2: "rgba(63,238,99,0.04)",
    claimable: false,
    countdown: "12D 01H 37M 07S",
    shadow: "rgb(34,51,100)",
    bg: "rgb(87,104,154)",
    color: "rgb(255,255,255)",
  },
];

const dailyCases = [
  { level: 10, color: "rgba(190,190,190,0.15)" },
  { level: 20, color: "rgba(243,178,57,0.15)" },
  { level: 30, color: "rgba(243,109,57,0.15)" },
  { level: 40, color: "rgba(243,57,57,0.15)" },
  { level: 50, color: "rgba(171,243,57,0.15)" },
  { level: 60, color: "rgba(175,238,238,0.15)" },
  { level: 70, color: "rgba(255,228,181,0.15)" },
  { level: 80, color: "rgba(189,86,255,0.15)" },
  { level: 90, color: "rgba(243,57,178,0.15)" },
  { level: 100, color: "rgba(255,231,18,0.15)" },
];

const rewardsAssets = [
  ...bonusCards.map((card) => card.image),
  ...dailyCases.map((caseData) => `/level-cases/level-${caseData.level}.png`),
  "/coins/mbx-1.webp",
  "/coins/mbx-2.webp",
  "/falling-coins.webp",
  "/simple-leafs.webp",
  "/coin.webp",
  "/leaderboard/character-1.webp",
  "/items/chroma-evergun.webp",
  "/items/chroma-evergreen.webp",
  "/nand-ilustration.png",
];

function loadRewardAsset(src) {
  return new Promise((resolve) => {
    const asset = new Image();
    asset.onload = resolve;
    asset.onerror = resolve;
    asset.src = src;
    if (asset.complete) resolve();
  });
}

function BonusCard({ card }) {
  return (
    <div
      className="flex flex-col gap-4 sm:gap-5 p-7 rounded-2xl overflow-hidden relative cursor-pointer"
      style={{
        background: `radial-gradient(131.88% 100.12% at 50% 0%, ${card.accent} 0%, rgba(36,49,87,0) 79.23%), rgba(31,42,75,0.8)`,
      }}
    >
      <div className="flex flex-row items-start justify-between gap-4 md:flex-col md:justify-center md:items-center md:gap-0">
        <div className="flex flex-col items-start md:items-center">
          <span className="font-bold">{card.label}</span>
          <div className="relative">
            <span aria-hidden="true" className="text-[32px] sm:text-4xl font-extrabold absolute inset-0 text-black/20 leading-none top-1.5 no-interaction">BONUS</span>
            <span
              className="text-[32px] sm:text-4xl font-extrabold bg-clip-text text-transparent relative leading-none no-interaction"
              style={{
                backgroundImage: card.gradient,
                filter: "drop-shadow(rgba(255,255,255,0.7) 0px -0.5px 0px) drop-shadow(rgba(255,183,59,0.5) 0px 0px 64px)",
              }}
            >BONUS</span>
          </div>
        </div>
        <div className="h-25 w-25 sm:h-32 sm:w-32 shrink-0 relative no-interaction md:h-46 md:w-full md:mt-5">
          <img src={card.image} alt={card.label} className="size-full object-contain absolute inset-0 blur-3xl opacity-67" />
          <img src={card.image} alt={card.label} className="size-full object-contain absolute inset-0" />
        </div>
      </div>
      <button
        type="button"
        className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button w-full h-10 ${card.claimable ? "" : "opacity-40 pointer-events-none"}`}
      >
        <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: card.shadow }} />
        <div
          className="rounded-lg size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 font-bold tabular-nums"
          style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: card.bg, color: card.color }}
        >
          <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: `drop-shadow(${card.shadow} 0px 2px 0px)` }}>
            {card.claimable ? "CLAIM" : card.countdown}
          </div>
        </div>
      </button>
      <div className="size-106 rounded-full absolute -bottom-62 left-1/2 -translate-x-1/2 no-interaction" style={{ background: card.glow }} />
      <div className="size-88 rounded-full absolute -bottom-60 left-1/2 -translate-x-1/2 no-interaction" style={{ background: card.glow2 }} />
    </div>
  );
}

function DailyCaseCard({ caseData }) {
  return (
    <div
      className="flex flex-col justify-center items-center rounded-xl cursor-pointer pt-8 pb-4.5 px-4 gap-4.5 drop-shadow-[0_15px_22px_rgba(17,23,44,0.3)]"
      style={{
        background: `radial-gradient(234.14% 100% at 50% 0%, ${caseData.color} 0%, rgba(28,36,69,0) 92.66%), rgb(34,47,89)`,
      }}
    >
      <div className="relative size-30 flex items-center justify-center">
        <img src={`/level-cases/level-${caseData.level}.png`} alt="" className="absolute size-30 object-contain blur-2xl opacity-20 select-none pointer-events-none" />
        <img src={`/level-cases/level-${caseData.level}.png`} alt="" className="relative size-30 object-contain opacity-0 transition-opacity duration-300 select-none pointer-events-none" style={{ opacity: 1 }} />
      </div>
      <div className="flex flex-col gap-2.5 w-full">
        <span className="font-medium text-center">LEVEL {caseData.level}</span>
        <div className="flex gap-2">
          <button type="button" className="relative cursor-pointer outline-none flex select-none transition-opacity group/button w-full h-9">
            <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(211,133,2)" }} />
            <div className="rounded-lg size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 font-bold" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(243,178,57)", color: "rgb(58,56,105)" }}>
              <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(211,133,2) 0px 2px 0px)" }}>OPEN</div>
            </div>
          </button>
          <button type="button" className="relative cursor-pointer outline-none flex select-none transition-opacity group/button w-8.25 h-9 shrink-0">
            <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none bg-[#1F2B47]" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(31,43,71)" }} />
            <div className="font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 w-full bg-[#354774] rounded-lg" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(53,71,116)", color: "rgb(255,255,255)" }}>
              <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(31,43,71) 0px 2px 0px)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4"><g fill="currentColor"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.76 1.76 0 0 1 0-1.113M17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0" clipRule="evenodd" /></g></svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Rewards() {
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [rainProgress] = useState(32);
  const [rainTime] = useState("09:23");

  useEffect(() => {
    let cancelled = false;
    Promise.all(rewardsAssets.map(loadRewardAsset)).then(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="site-content flex items-center justify-center min-h-[calc(100dvh-var(--layout-top))]">
        <LineWobbleLoader />
      </div>
    );
  }

  return (
    <div className="site-content">
      <div className="relative min-h-[calc(100dvh-var(--layout-top))]">
        <div className="h-140 bg-linear-to-b from-[#FFBB00]/56 via-[#FFAF02]/56 via-5% to-[#FFB700]/56 blur-[150px] absolute top-0 -translate-y-1/2 left-2/12 right-2/12 z-0 rounded-full" />
        <div className="absolute left-0 right-0 top-0 h-60 md:h-110">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-auto">
            <g opacity=".45">
              <path fill="url(#rw-bg-a)" d="M50 0C22.386 0 0 22.386 0 50s22.386 50 50 50 50-22.386 50-50S77.614 0 50 0Z" />
              <path fill="url(#rw-bg-b)" d="M49.997 10.294C28.07 10.294 10.292 28.071 10.292 50c0 21.929 17.776 39.706 39.705 39.706 21.93 0 39.706-17.777 39.706-39.706 0-21.929-17.777-39.706-39.706-39.706Z" opacity=".24" />
              <path fill="url(#rw-bg-c)" d="M50 18.382c-17.462 0-31.618 14.156-31.618 31.618 0 17.462 14.156 31.618 31.617 31.618 17.462 0 31.618-14.156 31.618-31.618 0-17.462-14.156-31.618-31.618-31.618Z" />
            </g>
            <defs>
              <linearGradient id="rw-bg-a" x1="50" x2="50" y1="69.864" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#41260D" stopOpacity=".34" />
                <stop offset="1" stopColor="#26140A" stopOpacity=".06" />
              </linearGradient>
              <linearGradient id="rw-bg-b" x1="49.997" x2="49.997" y1="70.28" y2="89.706" gradientUnits="userSpaceOnUse">
                <stop stopColor="#95561E" stopOpacity=".41" />
                <stop offset="1" stopColor="#AE9AD8" stopOpacity=".54" />
              </linearGradient>
              <linearGradient id="rw-bg-c" x1="49.999" x2="49.999" y1="69.953" y2="81.618" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EBC8A8" stopOpacity=".31" />
                <stop offset="1" stopColor="#C4703E" stopOpacity=".18" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="max-w-[1296px] mx-auto flex flex-col relative z-10 @container/content pb-6 px-4 md:px-12">
          <div className="page-content pt-6 sm:pt-18 pb-6 flex flex-col gap-12">
            <div className="relative w-max mx-auto">
              <div className="absolute -left-[40%] top-[20%] hidden md:block animate-float-coin">
                <img src="/coins/mbx-2.webp" alt="MBX" width="40" height="40" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] opacity-0 transition-opacity rotate-120 object-contain" style={{ opacity: 1 }} />
              </div>
              <div className="absolute -left-3/12 top-[120%] hidden md:block animate-float-coin-reverse z-1">
                <img src="/coins/mbx-1.webp" alt="MBX" width="30" height="30" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] opacity-0 transition-opacity rotate-30 object-contain" style={{ opacity: 1 }} />
              </div>
              <div className="absolute -left-[110%] top-[62%] hidden md:block animate-float-coin-reverse">
                <img src="/coins/mbx-1.webp" alt="MBX" width="48" height="48" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] opacity-0 transition-opacity rotate-40 object-contain" style={{ opacity: 1 }} />
              </div>
              <div className="absolute -left-[90%] top-[140%] hidden md:block animate-float-coin z-1">
                <img src="/coins/mbx-2.webp" alt="MBX" width="30" height="30" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] opacity-0 transition-opacity rotate-120 object-contain" style={{ opacity: 1 }} />
              </div>
              <div className="absolute -right-[110%] top-[69%] hidden md:block animate-float-coin-reverse">
                <img src="/coins/mbx-1.webp" alt="MBX" width="40" height="40" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] opacity-0 transition-opacity rotate-40 object-contain" style={{ opacity: 1 }} />
              </div>
              <div className="absolute -right-[97%] top-[140%] hidden md:block animate-float-coin z-1">
                <img src="/coins/mbx-2.webp" alt="MBX" width="30" height="30" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] opacity-0 transition-opacity rotate-120 object-contain" style={{ opacity: 1 }} />
              </div>
              <div className="absolute -right-1/2 top-[32%] hidden md:block animate-float-coin-delay">
                <img src="/coins/mbx-2.webp" alt="MBX" width="40" height="40" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] opacity-0 transition-opacity rotate-109 object-contain" style={{ opacity: 1 }} />
              </div>
              <div className="absolute -right-4/12 top-[114%] hidden md:block animate-float-coin-delay-reverse z-1">
                <img src="/coins/mbx-2.webp" alt="MBX" width="30" height="30" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] opacity-0 transition-opacity rotate-140 object-contain" style={{ opacity: 1 }} />
              </div>
              <div className="flex flex-col items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 983 185" className="w-[168px] h-[32px] drop-shadow-[0_4px_0px_rgba(0,0,0,0.37)]" dangerouslySetInnerHTML={{ __html: footerLogoInnerMarkup }} />
                <div className="relative">
                  <h3 aria-hidden="true" className="text-3xl sm:text-[54px] font-extrabold absolute inset-0 text-black/37 top-2.5"> REWARDS </h3>
                  <h3
                    className="text-3xl sm:text-[54px] font-extrabold bg-clip-text text-transparent relative"
                    style={{
                      backgroundImage: "linear-gradient(202.82deg, rgba(255,226,177,0.55) 6.99%, rgba(255,255,255,0.01) 52.82%, rgba(255,205,121,0.55) 90.17%), linear-gradient(0deg, rgba(255,255,255,0.18), rgba(255,255,255,0.18)), linear-gradient(357.71deg, rgb(225,140,7) 1.92%, rgb(244,235,12) 98.08%)",
                      filter: "drop-shadow(rgb(255,255,255) 0px -1.2px 0px)",
                    }}
                  > REWARDS </h3>
                </div>
              </div>
            </div>

            <div
              className="w-full rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:gap-7 md:justify-between"
              style={{
                background: "radial-gradient(75.12% 56.09% at 50% 0%, rgba(255,176,73,0.16) 0%, rgba(20,27,53,0) 92.66%), rgba(20,27,53,0.53)",
              }}
            >
              <div className="absolute top-0 left-1/12 right-1/12 h-0.75" style={{ background: "linear-gradient(90deg, rgba(62,52,51,0) 0%, rgba(255,192,85,0.82) 40.38%, rgb(255,227,181) 49.52%, rgba(255,192,85,0.82) 60.1%, rgba(62,52,51,0) 100%)" }} />
              <div className="absolute bottom-0 left-1/12 right-1/12 h-0.5 opacity-30" style={{ background: "linear-gradient(90deg, rgba(62,52,51,0) 0%, rgba(255,192,85,0.82) 40.38%, rgb(255,227,181) 49.52%, rgba(255,192,85,0.82) 60.1%, rgba(62,52,51,0) 100%)" }} />
              <div className="flex flex-col gap-3 py-8 px-6 md:pl-10 md:pr-0">
                <div className="flex flex-col gap-2">
                  <h5 className="font-extrabold">
                    <span className="text-[28px] leading-none italic bg-clip-text text-transparent pr-1 inline-block -skew-x-12" style={{ backgroundImage: "linear-gradient(90deg, rgb(255,222,166) 0%, rgb(255,183,62) 62%, rgba(255,183,62,0.71) 100%)" }}>OPEN 0 FREE</span>
                    <br />
                    <span className="text-[21px] leading-none">CASES TO GET STARTED</span>
                  </h5>
                  <span className="text-accent/75 font-medium text-sm">Enter a referral code below to claim your free cases!</span>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="relative flex group rounded-lg items-center justify-center bg-[#151C35] h-10 pl-3 pr-1 w-auto">
                    <div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" />
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter Code"
                      className="bg-transparent outline-none size-full peer placeholder:text-accent font-medium text-sm"
                    />
                    <button type="submit" className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button h-8 ${code ? "" : "opacity-40 pointer-events-none"}`}>
                      <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(211,133,2)" }} />
                      <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-2 whitespace-nowrap" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(243,178,57)", color: "rgb(58,56,105)" }}>
                        <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(211,133,2) 0px 2px 0px)" }}>CLAIM</div>
                      </div>
                    </button>
                  </div>
                </form>
                <span className="text-accent/75 font-medium text-sm">Don't have a code? Enter code <span className="text-primary font-semibold">"WILD"</span></span>
              </div>
              <div className="grid grid-cols-4 gap-3 flex-1 px-6 pb-6 md:py-6 md:pr-6 md:pl-0" />
            </div>

            <div className="px-4 py-6 max-w-[948px] w-full mx-auto md:py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {bonusCards.map((card) => <BonusCard key={card.label} card={card} />)}
            </div>

            <div className="flex flex-col min-[840px]:flex-row gap-5">
              <div
                className="flex flex-col gap-6 p-7 rounded-2xl w-full min-[840px]:w-85 overflow-hidden relative"
                style={{
                  background: "radial-gradient(102.07% 99.72% at 62.27% 99.89%, rgba(229,173,78,0.2) 0%, rgba(36,49,87,0) 100%), rgba(36,49,87,0.35)",
                }}
              >
                <div className="flex flex-col gap-2.5">
                  <span className="text-[28px] font-extrabold leading-none italic bg-clip-text text-transparent pr-1" style={{ backgroundImage: "linear-gradient(90deg, rgb(255,222,166) 0%, rgb(255,183,62) 62%, rgba(255,183,62,0.71) 100%)" }}>WILD RAIN</span>
                  <span className="text-sm font-medium text-accent/85">Every hour, a coin pool is distributed to active players. Your share is based on your level. Boosted users gain additional weight during distribution.</span>
                </div>
                <div
                  className="flex flex-col rounded-xl overflow-hidden p-3.5 shadow-xl min-h-[80px] relative"
                  style={{
                    background: "radial-gradient(84% 582% at 100% 50%, rgba(229,173,78,0.45) 0%, rgba(54,70,119,0) 100%), rgb(54,70,119)",
                    boxShadow: "rgba(0,0,0,0.3) 0px 10px 12.8px, rgb(34,50,101) 0px 4px 0px",
                  }}
                >
                  <img src="/falling-coins.webp" className="size-28 object-contain absolute right-0 -top-1 pointer-events-none" alt="" />
                  <img src="/simple-leafs.webp" className="size-38 object-contain absolute right-6 -bottom-12 pointer-events-none" alt="" />
                  <div className="left-0 right-0 absolute bottom-0 h-1 bg-[#667297] z-10">
                    <div className="bg-[#E5AD4E] h-full transition-[width] duration-1000" style={{ width: `${rainProgress}%` }} />
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
                    <div className="bg-[#223263] px-1.5 py-1 text-xs font-medium rounded-md flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m4.2 14.2L11 13V7h1.5v5.2l4.5 2.7z" /></svg>
                      <p>{rainTime}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 relative z-10">
                    <p className="text-sm font-semibold text-white">IT'S RAINING!</p>
                    <div className="flex gap-2">
                      <div className="h-8.5 relative">
                        <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#191840] rounded-lg" />
                        <div className="flex items-center gap-1.5 px-3 py-1.5 h-[calc(100%-3px)] bg-[#27376A] text-white text-sm rounded-lg relative">
                          <img src="/coin.webp" className="bg-cover bg-center size-4.5" alt="" />
                          <span className="font-semibold">50,000</span>
                        </div>
                      </div>
                      <button type="button" className="relative cursor-pointer outline-none flex select-none transition-opacity group/button w-7.75 h-8.5">
                        <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(15,195,101)" }} />
                        <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(92,223,154)", color: "rgb(58,56,105)" }}>
                          <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(15,195,101) 0px 2px 0px)" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5"><path fill="currentColor" d="M16 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5m5.45 5.6c-.39-.4-.88-.6-1.45-.6h-7l-2.08-.73.33-.94L13 16h2.8c.35 0 .63-.14.86-.37s.34-.51.34-.82c0-.54-.26-.91-.78-1.12L8.95 11H7v9l7 2 8.03-3c.01-.53-.19-1-.58-1.4M5 11H.984v11H5z" /></svg>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-19 h-24 absolute right-12 bottom-0 bg-[#FFAD22] rounded-full blur-xl z-30 no-interaction" />
                <img src="/leaderboard/character-1.webp" alt="Character" className="size-62 object-contain absolute -right-13 -bottom-22 z-30 rotate-12 no-interaction" />
              </div>

              <div
                className="flex rounded-2xl flex-1"
                style={{
                  background: "radial-gradient(39% 109.08% at 4.92% 100%, rgba(92,223,154,0.2) 0%, rgba(36,49,87,0) 100%), rgba(36,49,87,0.35)",
                }}
              >
                <div className="w-80 relative hidden xl:block">
                  <img src="/items/chroma-evergun.webp" alt="Chroma Evergun" width="110" height="110" className="absolute -right-6 top-28 opacity-0 transition-opacity rotate-2" style={{ opacity: 1 }} />
                  <img src="/items/chroma-evergreen.webp" alt="Chroma Evergreen" width="110" height="110" className="absolute -left-8 top-16 opacity-0 transition-opacity rotate-95" style={{ opacity: 1 }} />
                  <div className="size-80 overflow-hidden relative">
                    <img src="/nand-ilustration.png" alt="Character" className="size-100 object-contain object-bottom max-w-none absolute -left-21 bottom-0" />
                  </div>
                </div>
                <div className="flex flex-col gap-3 p-7">
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[28px] font-extrabold leading-none italic bg-clip-text text-transparent pr-1" style={{ backgroundImage: "linear-gradient(90deg, rgb(166,255,206) 0%, rgb(62,255,155) 62%, rgba(62,255,146,0.71) 100%)" }}>GET WILDER RAINS</span>
                    <span className="text-sm font-medium text-accent/85">Increase your level weight in every hourly drop. Link your Discord and Email to earn a bigger share of the pot.</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="bg-[#283562]/65 rounded-xl p-3 flex flex-col min-[480px]:flex-row justify-between min-[480px]:items-center gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 bg-[#3E507E] rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-6 text-white"><path fill="currentColor" d="M19.303 5.337A17.3 17.3 0 0 0 14.963 4c-.191.329-.403.775-.552 1.125a16.6 16.6 0 0 0-4.808 0C9.454 4.775 9.23 4.329 9.05 4a17 17 0 0 0-4.342 1.337C1.961 9.391 1.218 13.35 1.59 17.255a17.7 17.7 0 0 0 5.318 2.664 13 13 0 0 0 1.136-1.836c-.627-.234-1.22-.52-1.794-.86.149-.106.297-.223.435-.34 3.46 1.582 7.207 1.582 10.624 0 .149.117.287.234.435.34-.573.34-1.167.626-1.793.86a13 13 0 0 0 1.135 1.836 17.6 17.6 0 0 0 5.318-2.664c.457-4.52-.722-8.448-3.1-11.918M8.52 14.846c-1.04 0-1.889-.945-1.889-2.101s.828-2.102 1.89-2.102c1.05 0 1.91.945 1.888 2.102 0 1.156-.838 2.1-1.889 2.1m6.974 0c-1.04 0-1.89-.945-1.89-2.101s.828-2.102 1.89-2.102c1.05 0 1.91.945 1.889 2.102 0 1.156-.828 2.1-1.89 2.1" /></svg>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium text-accent">DISCORD STATUS:</p>
                          <p className="font-semibold leading-none uppercase text-sm">NONE</p>
                        </div>
                      </div>
                      <a href="/account/profile" className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-9">
                        <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(211,133,2)" }} />
                        <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(243,178,57)", color: "rgb(58,56,105)" }}>
                          <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(211,133,2) 0px 2px 0px)" }}> LINK DISCORD </div>
                        </div>
                      </a>
                    </div>
                    <div className="bg-[#283562]/65 rounded-xl p-3 flex flex-col min-[480px]:flex-row justify-between min-[480px]:items-center gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 bg-[#3E507E] rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-6 text-white"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm8-7 8-5V6l-8 5-8-5v2z" /></svg>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium text-accent">EMAIL STATUS:</p>
                          <p className="font-semibold leading-none uppercase text-sm">NONE</p>
                        </div>
                      </div>
                      <a href="/account/profile" className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-9">
                        <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(211,133,2)" }} />
                        <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(243,178,57)", color: "rgb(58,56,105)" }}>
                          <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(211,133,2) 0px 2px 0px)" }}> CONNECT EMAIL </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-accent/85">Boost applies automatically to every rain.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 opacity-50 pointer-events-none">
              <div className="flex items-center gap-6">
                <div className="h-0.5 flex-1 bg-linear-to-l from-accent/25 to-[#E5AD4E]/0" />
                <h2 className="text-lg font-semibold">DAILY CASES (COMING SOON)</h2>
                <div className="h-0.5 flex-1 bg-linear-to-r from-accent/25 to-[#E5AD4E]/0" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                {dailyCases.map((caseData) => <DailyCaseCard key={caseData.level} caseData={caseData} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
