import { useCallback, useEffect, useRef, useState } from "react";

const gameRules = [
  ["Battles", "battles", "100.00%", "243, 57, 57", false],
  ["Cases", "cases", "100.00%", "243, 178, 57", false],
  ["Coinflip", "coinflip", "75.00%", "130, 164, 255", false],
  ["Roulette", "roulette", "66.67%", "78, 229, 226", false],
  ["Upgrader", "upgrader", "100.00%", "118, 229, 78", true],
];

function RuleCard({ label, image, percentage, color, starred }) {
  return (
    <div
      className="p-2.5 rounded-xl flex items-center gap-2"
      style={{
        background: `radial-gradient(100% 177.56% at 100% 50.48%, rgba(${color}, 0.45) 0%, rgba(32, 48, 89, 0) 100%), rgb(50, 68, 113)`,
      }}
    >
      <img src={`/games/${image}.webp`} alt={image} className="size-8 object-contain" />
      <span>
        <span className="font-medium uppercase">{label}</span>
        {starred && <span className="text-primary">*</span>}
      </span>
      <span className="font-medium ml-auto">{percentage}</span>
    </div>
  );
}

function Accordion({ title, children, id, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div data-state={open ? "open" : "closed"} data-orientation="vertical">
      <button
        type="button"
        aria-controls={`${id}-content`}
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        id={`${id}-trigger`}
        data-orientation="vertical"
        onClick={() => setOpen((current) => !current)}
        className="bg-[#24305B]/70 p-3 rounded-xl data-[state=open]:rounded-b-none data-[state=open]:rounded-t-xl flex items-center justify-between w-full group cursor-pointer"
      >
        <span className="font-medium uppercase text-left">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        role="region"
        aria-labelledby={`${id}-trigger`}
        id={`${id}-content`}
        data-state={open ? "open" : "closed"}
        className="grid text-sm transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="bg-[#18203C]/70 rounded-b-xl p-3 flex flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Lines({ children }) {
  return <div className="flex flex-col gap-1 text-sm text-accent">{children}</div>;
}

export default function LeaderboardRulesModal({ onClose }) {
  const [dialogState, setDialogState] = useState("open");
  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    if (dialogState === "closed") return;
    setDialogState("closed");
    closeTimerRef.current = window.setTimeout(onClose, 200);
  }, [dialogState, onClose]);

  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && requestClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [requestClose]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  return (
    <div
      className="fixed inset-0 z-[9998] bg-[#0C1535]/65 transition-opacity duration-200 data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0"
      data-state={dialogState}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        data-dismissable-layer=""
        tabIndex={-1}
        className="dialog-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        role="dialog"
        aria-modal="true"
        aria-describedby="leaderboard-rules-description"
        aria-labelledby="leaderboard-rules-title"
        data-state={dialogState}
        style={{
          maxWidth: "min(100dvw - 24px, 560px)",
          maxHeight: "calc(100% - 24px)",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="bg-[#1D284E] rounded-2xl shadow-lg flex flex-col gap-5.5 max-h-[calc(100vh-24px)] overflow-hidden relative">
          <div className="relative flex flex-col gap-5.5 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80">
            <div
              className="absolute top-0 left-0 right-0 h-0.75"
              style={{
                background:
                  "linear-gradient(270deg, rgba(36, 38, 81, 0.22) 0%, rgba(243, 178, 57, 0.65) 25%, rgb(243, 178, 57) 49.52%, rgba(243, 178, 57, 0.65) 74.52%, rgba(36, 38, 81, 0.29) 100%)",
              }}
            />
            <div className="bg-primary/80 absolute -top-6 left-1/2 -translate-x-1/2 w-9/12 h-20 rounded-full blur-[90px] pointer-events-none" />
            <button
              type="button"
              aria-label="Close"
              onClick={requestClose}
              className="text-accent absolute top-4 right-4 cursor-pointer z-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
                <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
              </svg>
            </button>

            <div className="flex flex-col">
              <div className="relative h-55 shrink-0 mask-[linear-gradient(to_bottom,black_0%,black_85%,transparent_100%)] overflow-hidden">
                <div className="absolute w-40 md:w-55 h-6 left-1/2 top-1/2 -translate-1/2 bg-primary rounded-full blur-[34px] pointer-events-none" />
                <img src="/leaderboard/indicator-1.webp" alt="Character" className="w-34 h-auto object-contain absolute left-5/12 top-10" />
                <img src="/leaderboard/character-1.webp" alt="Character" className="size-80 object-contain absolute left-1/2 -translate-x-1/2 top-0 rotate-14" />
              </div>
              <h2 id="leaderboard-rules-title" className="text-[22px] font-bold text-center">
                <span className="bg-linear-to-br from-[#FFD896] from-25% via-white to-50% to-[#FFD896] bg-clip-text text-transparent">LEADERBOARD</span>{" "}
                RULES
              </h2>
              <p id="leaderboard-rules-description" className="font-medium text-accent text-center mt-2">
                These numbers show how much each game helps your spot on the race leaderboard. Only real play counts. Any fake play, boosting, or abusing the race system is not allowed on MM2Wild and will lead to penalties.
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2">
              {gameRules.map(([label, image, percentage, color, starred]) => (
                <RuleCard key={label} label={label} image={image} percentage={percentage} color={color} starred={starred} />
              ))}
            </div>

            <p className="font-medium text-accent text-sm">
              <span className="text-primary">*</span> Games marked with a star must be played at 2.00x or higher to count for the full amount. If you play under 2.00x, it will count less based on the multiplier. All losses always count at full value. Group battles may count less depending on how many players are in them. Check the Special Race Rules below for more info.
            </p>

            <div className="flex flex-col gap-3">
              <Accordion title="SPECIAL RACE RULES" id="special-race-rules">
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-white text-sm">Upgrader, Roll</p>
                  <Lines>
                    <span className="font-medium">If you play at 2.00x or higher, you get the full race % shown above.</span>
                    <span className="font-medium">If you play under 2.00x, it counts less based on the multiplier.</span>
                    <span className="font-medium">Example: a 1.33x play only counts about 33% of the normal amount.</span>
                    <span className="font-medium">All losses always count at full value, no matter the multiplier.</span>
                  </Lines>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-white text-sm">Group Case Battles</p>
                  <Lines>
                    <span className="font-medium">Group battles share risk with teammates, so they give less race points than solo.</span>
                    <span className="font-medium">Solo: 100%</span>
                    <span className="font-medium">2 players: 70%</span>
                    <span className="font-medium">3 players: 50%</span>
                    <span className="font-medium">4 players: 40%</span>
                    <span className="font-medium">5 players: 35%</span>
                    <span className="font-medium">6 players: 30%</span>
                  </Lines>
                </div>
              </Accordion>

              <Accordion title="RACE ABUSE & FAIR PLAY POLICY" id="fair-play-policy">
                <Lines>
                  <span className="font-medium">We want races on MM2Wild to be fair and fun.</span>
                  <span className="font-medium">We watch for play styles that try to farm race points without real risk.</span>
                </Lines>
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-accent text-sm">One example is non-genuine play.</p>
                  <Lines>
                    <span className="font-medium">This happens when someone mostly plays very low-risk games just to farm race points instead of playing normally.</span>
                    <span className="font-medium">Over time, this can let players climb the leaderboard with much less risk than others.</span>
                    <span className="font-medium">This creates an unfair race and hurts competition for real players.</span>
                    <span className="font-medium">So we have rules to keep things balanced for everyone.</span>
                  </Lines>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-accent text-sm">Important Rule</p>
                  <Lines>
                    <span className="font-medium">If an account is flagged for non-genuine play:</span>
                    <span className="font-medium">Only 10% of that account&apos;s total play may count toward race points.</span>
                    <span className="font-medium">We may also take extra action if needed, such as:</span>
                    <span className="font-medium">Removing the player from active races</span>
                    <span className="font-medium">Taking away race rewards</span>
                    <span className="font-medium">Removing race access</span>
                    <span className="font-medium">Suspending or closing the account</span>
                    <span className="font-medium">This depends on how serious the situation is and is decided by the MM2Wild team.</span>
                  </Lines>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-accent text-sm">Review Requests</p>
                  <Lines>
                    <span className="font-medium">Play styles can change.</span>
                    <span className="font-medium">If your account gets flagged, you can contact support after 30 days and ask for a review. If we see normal and varied gameplay during that time, we may remove the flag and restore full race points.</span>
                  </Lines>
                </div>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
