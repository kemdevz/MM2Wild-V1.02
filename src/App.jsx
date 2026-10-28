import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Subheader from "./components/Subheader";
import ChatSidebar from "./components/ChatSidebar";
import Home, { Footer } from "./pages/Home";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Leaderboard from "./pages/Leaderboard";
import Fairness from "./pages/Fairness";
import Rewards from "./pages/Rewards";
import LoadingScreen from "./components/LoadingScreen";
import Affiliates from "./pages/Affiliates";
import NotificationCenter from "./components/NotificationCenter";
import Roulette from "./pages/Roulette";
import Coinflip from "./pages/Coinflip";
import Cases from "./pages/Cases";
import CaseOpen from "./pages/CaseOpen";
import Battles from "./pages/Battles";
import BattleCreate from "./pages/BattleCreate";
import Battle from "./pages/Battle";
import LineWobbleLoader from "./components/LineWobbleLoader";

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [isHeaderReady, setIsHeaderReady] = useState(false);
  const [isChatPresenceReady, setIsChatPresenceReady] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [dataRevision, setDataRevision] = useState(0);
  const pageRef = useRef(null);
  const [selectedBalanceType, setSelectedBalanceType] = useState(() => (
    localStorage.getItem("mm2wild_balance_type") === "crypto" ? "crypto" : "mm2"
  ));

  const markHeaderReady = useCallback(() => setIsHeaderReady(true), []);
  const markChatPresenceReady = useCallback(() => setIsChatPresenceReady(true), []);
  const selectBalanceType = useCallback((balanceType) => {
    const nextBalanceType = balanceType === "crypto" ? "crypto" : "mm2";
    localStorage.setItem("mm2wild_balance_type", nextBalanceType);
    setSelectedBalanceType(nextBalanceType);
  }, []);

  useEffect(() => {
    const updateRoute = () => {
      setIsPageLoading(true);
      setPathname(window.location.pathname);
    };

    const handleInternalNavigation = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = event.target.closest("a[href]");
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      event.preventDefault();

      const nextLocation = `${destination.pathname}${destination.search}${destination.hash}`;
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (nextLocation === currentLocation) return;

      window.history.pushState({}, "", nextLocation);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "instant" });
    };

    document.addEventListener("click", handleInternalNavigation);
    window.addEventListener("popstate", updateRoute);

    return () => {
      document.removeEventListener("click", handleInternalNavigation);
      window.removeEventListener("popstate", updateRoute);
    };
  }, []);

  useEffect(() => {
    let refreshTimer;
    const refreshForSupabaseChange = (event) => {
      const table = event.detail?.table;
      if (!table) return;

      const relevantTables = pathname.startsWith("/account/")
        ? ["mm2wild_users", "mm2wild_bets", "mm2wild_transactions", "mm2wild_tips", "mm2wild_sessions", "mm2wild_fairness"]
        : pathname === "/leaderboard"
          ? ["mm2wild_users"]
          : pathname === "/rewards"
            ? ["mm2wild_users"]
            : pathname === "/affiliates"
              ? ["mm2wild_affiliates", "mm2wild_users"]
              : pathname.startsWith("/games/cases")
                ? ["mm2wild_cases"]
                : pathname === "/games/coinflip"
                  ? ["mm2wild_coinflip"]
                  : pathname.startsWith("/games/battles")
                    ? ["mm2wild_battles", "mm2wild_cases"]
                    : [];

      if (!relevantTables.includes(table)) return;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => setDataRevision((revision) => revision + 1), 120);
    };
    window.addEventListener("mm2wild:supabase-change", refreshForSupabaseChange);
    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("mm2wild:supabase-change", refreshForSupabaseChange);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isPageLoading) return undefined;

    let cancelled = false;
    let firstFrame;
    let secondFrame;
    let minimumTimer;
    let maximumTimer;

    const waitForPaint = new Promise((resolve) => {
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(resolve);
      });
    });
    const minimumDisplay = new Promise((resolve) => {
      minimumTimer = window.setTimeout(resolve, 180);
    });

    const finishLoading = async () => {
      await waitForPaint;
      const visibleImages = [...(pageRef.current?.querySelectorAll("img") || [])].filter((image) => {
        const rect = image.getBoundingClientRect();
        return rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
      });
      const imagesReady = Promise.allSettled(visibleImages.map((image) => {
        if (image.complete) return image.decode?.().catch(() => {}) ?? Promise.resolve();
        return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }));
      const maximumWait = new Promise((resolve) => {
        maximumTimer = window.setTimeout(resolve, 1500);
      });

      await Promise.all([minimumDisplay, Promise.race([imagesReady, maximumWait])]);
      if (!cancelled) setIsPageLoading(false);
    };

    finishLoading();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(maximumTimer);
    };
  }, [pathname, isPageLoading]);

  const isAccountPage = pathname.startsWith("/account/");
  const activeTab = pathname.replace("/account/", "");
  const isTermsPage = pathname === "/terms";
  const isLeaderboardPage = pathname === "/leaderboard";
  const isFairnessPage = pathname === "/fairness";
  const isRewardsPage = pathname === "/rewards";
  const isAffiliatesPage = pathname === "/affiliates";
  const isRoulettePage = pathname === "/games/roulette";
  const isCoinflipPage = pathname === "/games/coinflip";
  const isCasesPage = pathname === "/games/cases";
  const isBattlesPage = pathname === "/games/battles";
  const isBattleCreatePage = pathname === "/games/battles/create";
  const caseOpenMatch = pathname.match(/^\/games\/cases\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  const battleMatch = pathname.match(/^\/games\/battles\/(\d+|[0-9a-f-]{36})\/?$/i);

  return (
    <>
      <div className="app-background fixed inset-0 size-full bg-linear-to-br from-[#131C2F] to-[#212A53] z-0" />
      <main className="relative z-1">
        <Header
          onInitialRenderReady={markHeaderReady}
          selectedBalanceType={selectedBalanceType}
          onBalanceTypeChange={selectBalanceType}
        />
        <Subheader />
        <ChatSidebar
          onInitialRenderReady={markChatPresenceReady}
          selectedBalanceType={selectedBalanceType}
        />
        <div key={`${pathname}-${dataRevision}`} ref={pageRef} aria-busy={isPageLoading} className="min-h-screen flex flex-col">
          {isAccountPage ? (
            <Profile activeTab={activeTab} />
          ) : isTermsPage ? (
            <Terms />
          ) : isLeaderboardPage ? (
            <Leaderboard />
          ) : isFairnessPage ? (
            <Fairness />
          ) : isRewardsPage ? (
            <Rewards />
          ) : isAffiliatesPage ? (
            <Affiliates />
          ) : isRoulettePage ? (
            <Roulette />
          ) : isCoinflipPage ? (
            <Coinflip />
          ) : isCasesPage ? (
            <Cases />
          ) : isBattleCreatePage ? (
            <BattleCreate />
          ) : isBattlesPage ? (
            <Battles />
          ) : battleMatch ? (
            <Battle id={battleMatch[1]} />
          ) : caseOpenMatch ? (
            <CaseOpen slug={caseOpenMatch[1]} />
          ) : (
            <Home />
          )}
          <div className="global-footer mt-auto">
            <Footer />
          </div>
        </div>
        {isPageLoading && (
          <div
            className="fixed right-0 bottom-0 z-50 bg-linear-to-br from-[#131C2F] to-[#212A53] flex items-center justify-center"
            style={{ top: "var(--layout-top, 120px)", left: "var(--layout-left, 0px)" }}
          >
            <LineWobbleLoader />
          </div>
        )}
      </main>
      <NotificationCenter />
      <LoadingScreen appReady={isHeaderReady && isChatPresenceReady} />
    </>
  );
}
