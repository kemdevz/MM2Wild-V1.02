import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import LineWobbleLoader from "../components/LineWobbleLoader";
import ProfileGameDropdown, {
  ProfileGameIcon,
  profileGames,
} from "../components/ProfileGameDropdown";
import FairnessPanel, { preloadFairnessData } from "../components/FairnessPanel";
import GameHistoryPanel from "../components/GameHistoryPanel";
import TransactionsPanel from "../components/TransactionsPanel";
import SecurityPanel from "../components/SecurityPanel";

const formatNumber = (value, maximumFractionDigits = 2) =>
  Number(value || 0).toLocaleString("en-US", { maximumFractionDigits });

function StatCard({ label, value, coins = false }) {
  return (
    <div className="bg-[#283562] rounded-xl p-4 px-5 flex flex-col gap-0.5 shadow-[0_6px_0_#1B2440]">
      <p className="text-sm font-medium text-accent h-5">{label}</p>
      {coins ? (
        <div className="flex items-center gap-1.5 h-5">
          <img src="/coin.webp" alt="" className="bg-cover bg-center size-5" />
          <span className="tabular-nums text-lg font-semibold leading-none">
            {value}
          </span>
        </div>
      ) : (
        <p className="text-lg font-semibold leading-none h-5">{value}</p>
      )}
    </div>
  );
}

function GoldButton({ children }) {
  return (
    <button className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10 sm:ml-auto">
      <div
        className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
        style={{
          top: "var(--sb-shadow-size,3px)",
          backgroundColor: "rgb(211, 133, 2)",
        }}
      />
      <div
        className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3"
        style={{
          height: "calc(100% - var(--sb-shadow-size,3px))",
          backgroundColor: "rgb(243, 178, 57)",
          color: "rgb(58, 56, 105)",
        }}
      >
        <div
          className="transition-opacity flex items-center justify-center size-full"
          style={{ filter: "drop-shadow(rgb(211, 133, 2) 0px 2px 0px)" }}
        >
          {children}
        </div>
      </div>
    </button>
  );
}

function LinkedAccountCard({ type }) {
  const discord = type === "discord";
  return (
    <div className="bg-[#283562]/65 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-2.5">
        <div className="size-10 bg-[#3E507E] rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-6 text-white">
            <path
              fill="currentColor"
              d={
                discord
                  ? "M19.303 5.337A17.3 17.3 0 0 0 14.963 4c-.191.329-.403.775-.552 1.125a16.6 16.6 0 0 0-4.808 0C9.454 4.775 9.23 4.329 9.05 4a17 17 0 0 0-4.342 1.337C1.961 9.391 1.218 13.35 1.59 17.255a17.7 17.7 0 0 0 5.318 2.664 13 13 0 0 0 1.136-1.836c-.627-.234-1.22-.52-1.794-.86.149-.106.297-.223.435-.34 3.46 1.582 7.207 1.582 10.624 0 .149.117.287.234.435.34-.573.34-1.167.626-1.793.86a13 13 0 0 0 1.135 1.836 17.6 17.6 0 0 0 5.318-2.664c.457-4.52-.722-8.448-3.1-11.918M8.52 14.846c-1.04 0-1.889-.945-1.889-2.101s.828-2.102 1.89-2.102c1.05 0 1.91.945 1.888 2.102 0 1.156-.838 2.1-1.889 2.1m6.974 0c-1.04 0-1.89-.945-1.89-2.101s.828-2.102 1.89-2.102c1.05 0 1.91.945 1.889 2.102 0 1.156-.828 2.1-1.89 2.1"
                  : "M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm8-7 8-5V6l-8 5-8-5v2z"
              }
            />
          </svg>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-accent">
            CURRENT LINKED {discord ? "DISCORD" : "EMAIL"}:
          </p>
          <p className="font-semibold leading-none uppercase">NONE</p>
        </div>
      </div>
      <GoldButton>{discord ? "LINK DISCORD" : "CONNECT EMAIL"}</GoldButton>
    </div>
  );
}

const accountTabs = [
  ["Profile", "profile", "/account/profile"],
  ["Fairness", "fairness", "/account/fairness"],
  ["Game History", "bets", "/account/bets"],
  ["Transactions", "transactions", "/account/transactions"],
  ["Security", "security", "/account/security"],
];

export default function Profile({ activeTab: initialTab = "profile" }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedGameId, setSelectedGameId] = useState("battles");
  const [displayedGameId, setDisplayedGameId] = useState("battles");
  const [gameImagePhase, setGameImagePhase] = useState("visible");
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const [gameDropdownStyle, setGameDropdownStyle] = useState({});
  const [hasSwitchedTabs, setHasSwitchedTabs] = useState(false);
  const gameTriggerRef = useRef(null);
  const tabListRef = useRef(null);
  const tabButtonRefs = useRef([]);
  const [animateTabIndicator, setAnimateTabIndicator] = useState(false);
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({ opacity: 0 });

  const activeTabIndex = Math.max(
    0,
    accountTabs.findIndex(([, key]) => key === activeTab),
  );

  const positionTabIndicator = useCallback(() => {
    const activeButton = tabButtonRefs.current[activeTabIndex];
    if (!activeButton) return false;

    setTabIndicatorStyle({
      width: `${activeButton.offsetWidth}px`,
      height: `${activeButton.offsetHeight}px`,
      transform: `translate3d(${activeButton.offsetLeft}px, ${activeButton.offsetTop}px, 0)`,
      opacity: 1,
    });
    return true;
  }, [activeTabIndex]);

  useLayoutEffect(() => {
    if (isLoading || !positionTabIndicator()) return undefined;

    const activeButton = tabButtonRefs.current[activeTabIndex];
    const resizeObserver = new ResizeObserver(positionTabIndicator);
    if (tabListRef.current) resizeObserver.observe(tabListRef.current);
    if (activeButton) resizeObserver.observe(activeButton);

    const frame = window.requestAnimationFrame(() => {
      positionTabIndicator();
      setAnimateTabIndicator(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [isLoading, positionTabIndicator]);

  useEffect(() => {
    window.addEventListener("resize", positionTabIndicator);
    return () => window.removeEventListener("resize", positionTabIndicator);
  }, [positionTabIndicator]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const switchTab = useCallback((tabKey) => {
    const nextTabIndex = accountTabs.findIndex(([, key]) => key === tabKey);
    const tab = accountTabs[nextTabIndex];
    if (!tab) return;

    const nextButton = tabButtonRefs.current[nextTabIndex];
    if (nextButton) {
      setAnimateTabIndicator(true);
      setTabIndicatorStyle({
        width: `${nextButton.offsetWidth}px`,
        height: `${nextButton.offsetHeight}px`,
        transform: `translate3d(${nextButton.offsetLeft}px, ${nextButton.offsetTop}px, 0)`,
        opacity: 1,
      });
    }

    setHasSwitchedTabs(true);
    setActiveTab(tabKey);
    window.history.pushState({}, "", tab[2]);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    preloadFairnessData().catch(() => {});
    fetch("/api/session", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.user) setUser(payload.user);
        else window.location.replace("/");
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);


  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.replace("/account/", "");
      setHasSwitchedTabs(true);
      setActiveTab(path || "profile");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const positionGameDropdown = useCallback(() => {
    const trigger = gameTriggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 10;
    const naturalMenuHeight = profileGames.length * 38 + 8;
    const availableHeight = Math.max(0, rect.top - gap - 8);
    const menuHeight = Math.min(384, naturalMenuHeight, availableHeight);
    const menuTop = Math.max(8, rect.top - gap - menuHeight);
    setGameDropdownStyle({
      position: "fixed",
      left: "0px",
      top: "0px",
      transform: `translate3d(${rect.left}px, ${menuTop}px, 0)`,
      width: `${rect.width}px`,
      minWidth: `${rect.width}px`,
      "--reka-popper-transform-origin": "0% 100%",
      zIndex: 9999,
      "--reka-popper-available-width": `${window.innerWidth - rect.left}px`,
      "--reka-popper-available-height": `${availableHeight}px`,
      "--reka-popper-anchor-width": `${rect.width}px`,
      "--reka-popper-anchor-height": `${rect.height}px`,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isGameDropdownOpen) return undefined;
    positionGameDropdown();
    const update = () => positionGameDropdown();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isGameDropdownOpen, positionGameDropdown]);

  useEffect(() => {
    if (!isGameDropdownOpen) return undefined;
    const closeOnOutsidePress = (event) => {
      if (
        gameTriggerRef.current?.contains(event.target) ||
        event.target.closest?.("[data-reka-popper-content-wrapper]")
      ) return;
      setIsGameDropdownOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsGameDropdownOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isGameDropdownOpen]);

  useEffect(() => {
    if (selectedGameId === displayedGameId) return undefined;

    setGameImagePhase("leaving");
    const swapTimer = window.setTimeout(() => {
      setDisplayedGameId(selectedGameId);
      setGameImagePhase("entering");
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setGameImagePhase("visible"));
      });
    }, 300);

    return () => window.clearTimeout(swapTimer);
  }, [selectedGameId, displayedGameId]);

  if (isLoading || !user) {
    return (
      <div className="site-content flex items-center justify-center min-h-dvh">
        <LineWobbleLoader />
      </div>
    );
  }

  const level = Number(user.level || 1);
  const levelColor = level === 1 ? "#BEBEBE" : "#F33939";
  const xp = Number(user.xp || 0);
  const requiredXp = Number(user.required_xp || 120000);
  const progress = Math.min(100, Math.max(0, (xp / requiredXp) * 100));
  const joined = user.joined_at
    ? new Date(user.joined_at).toLocaleDateString("en-US")
    : "—";
  const levelStyle = {
    "--level-border-start": "#222942",
    "--level-border-end": levelColor,
    "--level-text": levelColor,
  };
  const selectedGame =
    profileGames.find((game) => game.id === selectedGameId) ?? profileGames[2];
  const displayedGame =
    profileGames.find((game) => game.id === displayedGameId) ?? profileGames[2];
  const selectedGameStats = user.game_stats?.[selectedGame.id] ?? {};

  return (
    <div className="site-content">
      <div className="max-w-[1296px] mx-auto flex flex-col @container/content px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content account-page py-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#202D57]/45 rounded-[20px] p-5">
            <div
              className="size-27 p-0.75 rounded-3xl flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end)"
              style={levelStyle}
            >
              <div
                className="size-full flex items-center justify-center rounded-[21px]"
                style={{ backgroundColor: "rgb(26, 34, 60)" }}
              >
                <img
                  src={user.avatar_headshot}
                  className="size-9/12 object-contain object-center ease-in-out transition-opacity no-interaction rounded-xl"
                  alt={user.avatar_headshot}
                  loading="lazy"
                  fetchPriority="low"
                />
              </div>
            </div>
            <div className="flex flex-col flex-1 gap-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-gradient-to-b from-(--level-border-start) to-(--level-border-end) p-0.5 rounded-lg"
                    style={{ ...levelStyle, "--level-border-start": "#2e3a5c" }}
                  >
                    <div
                      className="size-full flex items-center justify-center font-medium !leading-none text-(--level-text) px-1.25 py-0.75 text-sm rounded-md"
                      style={{ backgroundColor: "rgb(38, 52, 87)" }}
                    >
                      {level}
                    </div>
                  </div>
                  <h1 className="text-xl font-semibold">{user.username}</h1>
                </div>
                <button
                  className="relative cursor-pointer outline-none select-none px-2 py-1.25 sm:ml-auto rounded-[7px] bg-[#DF5C5C]/12 hover:bg-[#DF5C5C]/18 text-[#DF5C5C] *:drop-shadow-[0_2px_0_#0000001F] font-medium transition-colors flex items-center"
                  onClick={() => window.location.assign("/")}
                >
                  <div className="transition-opacity flex items-center justify-center size-full">
                    <span>Logout</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16" className="size-4.5 ml-1.5">
                      <path fill="currentColor" d="M12.665 11.517a1 1 0 0 1 .008 1.414 6.963 6.963 0 0 1-4.986 2.082 6.967 6.967 0 0 1-4.96-2.054A6.967 6.967 0 0 1 .674 8c0-1.873.73-3.635 2.055-4.96A6.967 6.967 0 0 1 7.687.988c1.888 0 3.658.739 4.986 2.082a1 1 0 0 1-1.422 1.406 4.977 4.977 0 0 0-3.564-1.488A5.02 5.02 0 0 0 2.673 8a5.02 5.02 0 0 0 5.014 5.013c1.35 0 2.615-.528 3.564-1.488a1 1 0 0 1 1.414-.008Zm3.37-4.224L14.07 5.33a1 1 0 1 0-1.414 1.414l.256.256H7.687a1 1 0 1 0 0 2h5.226l-.256.256a1 1 0 1 0 1.414 1.414l1.963-1.963a1 1 0 0 0 0-1.414Z" />
                    </svg>
                  </div>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 font-medium text-accent text-sm">
                <p>Joined: {joined}</p>
                <p className="text-[13px] text-white font-medium">
                  <span className="text-white">{formatNumber(xp, 0)}</span>
                  <span className="text-accent">
                    {" "}/ {formatNumber(requiredXp, 0)} XP
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-1 relative w-full sm:w-auto">
                <div className="bg-[#2A3868] rounded-lg h-3.25 w-full overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: levelColor,
                      boxShadow:
                        "0px 0px 5.6px rgba(0, 0, 0, 0.1), 0px 0px 50px var(--color)",
                      "--color": levelColor,
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#202D57]/45 rounded-[20px] p-5 flex flex-col gap-4">
            <div
              ref={tabListRef}
              className="relative grid grid-cols-2 md:flex md:h-12 bg-[#2F3F71] p-1.5 rounded-[10px] w-full md:w-max gap-1.5 md:gap-0"
            >
              <div
                aria-hidden="true"
                className={`absolute left-0 top-0 z-0 rounded-lg bg-primary shadow-[0_3px_0_#D38502] duration-300 ease-in-out will-change-transform pointer-events-none ${animateTabIndicator ? "transition-[transform,width,height,opacity]" : "transition-none"}`}
                style={tabIndicatorStyle}
              />
              {accountTabs.map(([label, key, href], index) => (
                <button
                  key={href}
                  ref={(node) => {
                    tabButtonRefs.current[index] = node;
                  }}
                  type="button"
                  onClick={() => switchTab(key)}
                  className={`relative z-10 h-[33px] px-4 py-0 flex items-center justify-center text-sm font-semibold leading-none text-center whitespace-nowrap rounded-lg transition-colors duration-200 cursor-pointer ${
                    index === activeTabIndex
                      ? `text-[#3A3869] ${
                          hasSwitchedTabs
                            ? ""
                            : "bg-primary shadow-[0_3px_0_#D38502]"
                        }`
                      : "text-white hover:text-accent"
                  }`}
                  data-active={index === activeTabIndex}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "fairness" ? (
              <FairnessPanel />
            ) : activeTab === "bets" ? (
              <GameHistoryPanel />
            ) : activeTab === "transactions" ? (
              <TransactionsPanel />
            ) : activeTab === "security" ? (
              <SecurityPanel />
            ) : activeTab === "profile" ? (
              <>
            <div className="relative">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard label="Total Bets" value={formatNumber(user.total_bets, 0)} />
                  <StatCard label="Games Won" value={formatNumber(user.games_won, 0)} />
                  <StatCard label="Total Deposited" value={formatNumber(user.total_deposited)} coins />
                  <StatCard label="Total Wagered" value={formatNumber(user.total_wagered)} coins />
                </div>

                <div
                  className="profile-game-panel rounded-xl p-5 shadow-[0_6px_0_#1B2440] flex flex-col md:flex-row md:items-center gap-4 md:gap-7 relative overflow-hidden transition-all duration-300 ease-in-out [background:radial-gradient(93%_100%_at_100%_100%,rgba(var(--color),.55)_0%,rgba(40,53,98,0)_100%),radial-gradient(100%_291.84%_at_0%_100%,rgba(var(--color),.1)_0%,rgba(40,53,98,0)_100%),#283562] md:[background:radial-gradient(53.36%_324.92%_at_100%_100%,rgba(var(--color),.55)_0%,rgba(40,53,98,0)_100%),radial-gradient(100%_291.84%_at_0%_100%,rgba(var(--color),.1)_0%,rgba(40,53,98,0)_100%),#283562]"
                  style={{
                    "--color": selectedGame.color,
                    "--profile-game-color": `rgb(${selectedGame.color})`,
                  }}
                >
                  <div className="flex flex-col">
                    <button
                      ref={gameTriggerRef}
                      id="reka-select-trigger-v-0-70"
                      className="ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap [&>span]:line-clamp-1 rounded-[10px] flex items-center justify-between cursor-pointer outline-none group relative bg-[#6776B3]/30 w-full md:w-50 h-12.5 px-3.75"
                      role="combobox"
                      type="button"
                      aria-controls="reka-select-content-v-0-71"
                      aria-expanded={isGameDropdownOpen}
                      aria-required="false"
                      aria-autocomplete="none"
                      dir="ltr"
                      data-state={isGameDropdownOpen ? "open" : "closed"}
                      onClick={() => setIsGameDropdownOpen((open) => !open)}
                    >
                      <div className="absolute inset-0.25 ring-2 ring-transparent rounded-[10px] transition-shadow pointer-events-none" />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ProfileGameIcon game={selectedGame} className="size-5.5 shrink-0 text-primary" />
                        <span className="text-white font-medium uppercase">{selectedGame.label}</span>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 transition-transform group-data-[state=open]:rotate-180 shrink-0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2"><div className="flex flex-col gap-0.5"><p className="text-sm font-medium text-accent h-5">Total Bets</p><p className="text-lg font-semibold leading-none h-5">{formatNumber(selectedGameStats.total_bets, 0)}</p></div></div>
                  <div className="flex items-center gap-2"><div className="flex flex-col gap-0.5"><p className="text-sm font-medium text-accent h-5">Games Won</p><p className="text-lg font-semibold leading-none h-5">{formatNumber(selectedGameStats.games_won, 0)}</p></div></div>
                  <div className="flex items-center gap-2"><div className="flex flex-col gap-0.5"><p className="text-sm font-medium text-accent h-5">Total Wagered</p><div className="flex items-center gap-1.5 h-5"><img src="/coin.webp" alt="" className="bg-cover bg-center size-5" /><span className="tabular-nums text-lg font-semibold leading-none">{formatNumber(selectedGameStats.total_wagered)}</span></div></div></div>
                  <div className="absolute top-4/5 -right-8 -translate-y-1/2 opacity-60 no-interaction">
                    <div className="relative size-75">
                      <img
                        src={`/games/${displayedGame.image}.webp`}
                        alt="Game"
                        className={`${displayedGame.imageClass} transition-opacity duration-300 ease-in-out ${gameImagePhase === "visible" ? "opacity-100" : "opacity-0"}`}
                        style={{ maskImage: "radial-gradient(100% 100% at left center, transparent 0%, transparent 15%, black 50%)" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <LinkedAccountCard type="discord" />
              <LinkedAccountCard type="email" />
            </div>
              </>
            ) : (
              <div className="bg-[#283562]/65 rounded-xl p-5 flex flex-col gap-4">
                <p className="text-sm font-medium text-accent">
                  This section is not available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isGameDropdownOpen && createPortal(
        <ProfileGameDropdown
          style={gameDropdownStyle}
          selectedGame={selectedGame}
          onSelect={(game) => {
            setSelectedGameId(game.id);
            setIsGameDropdownOpen(false);
          }}
        />,
        document.body,
      )}
    </div>
  );
}
