import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import LineWobbleLoader from "../components/LineWobbleLoader";
import CoinflipCreateModal, { preloadCoinflipItems } from "../components/CoinflipCreateModal";
import CoinflipViewModal from "../components/CoinflipViewModal";
import {
  COINFLIP_COUNTDOWN_MS,
  COINFLIP_FLIP_MS,
  coinflipAnimationAsset,
} from "../utils/coinflipAnimation";

const COINFLIP_PAGE_SIZE = 15;
const COINFLIP_LOAD_MORE_SIZE = 10;
const COINFLIP_ARCHIVE_MS = 15_000;

const formatWholeNumber = (value) => Number(value || 0).toLocaleString("en-US", {
  maximumFractionDigits: 0,
});

function CoinflipPlayerTooltip({ tooltip }) {
  if (!tooltip) return null;

  return createPortal(
    <div
      className="fixed z-50 min-w-max pointer-events-none"
      style={{
        left: tooltip.left,
        top: tooltip.top,
        transform: "translate(-50%, calc(-100% - 8px))",
      }}
      role="presentation"
    >
      <div className="z-50 bg-[#314175] rounded-lg px-2.5 py-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 overflow-visible text-xs font-semibold relative">
        {tooltip.label}
        <svg
          className="absolute left-1/2 top-full -translate-x-1/2 -mt-1"
          width="8"
          height="12"
          viewBox="0 0 14 8"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M0,0 Q7,14 14,0 Z" fill="#314175" />
        </svg>
      </div>
    </div>,
    document.body,
  );
}

function CoinflipRowItems({ game }) {
  const items = [
    ...(game.creator?.items || []),
    ...(game.joiner?.items || []),
  ].sort((left, right) => Number(right.value || 0) - Number(left.value || 0));

  return (
    <div className="items-center -space-x-5 flex" bis_skin_checked="1">
      {items.slice(0, 4).map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          data-state="closed"
          data-grace-area-trigger=""
          className={`coinflip-row-item size-14.5 md:size-17 group relative bg-[#1B2542] border-[5px] border-[#243157] hover:border-[#314274] transition-colors rounded-full ${
            index === 3
              ? "hidden sm:block md:hidden @[1072px]/coinflip-card:block"
              : index === 2
                ? "md:hidden @[950px]/coinflip-card:block"
                : index === 1
                  ? "md:hidden md:@[950px]/coinflip-card:block"
                  : ""
          }`}
          bis_skin_checked="1"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="coinflip-row-item-image absolute inset-0 size-full object-contain group-hover:scale-110 transition-transform will-change-transform opacity-0 ease-in-out no-interaction"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ opacity: "1" }}
          />
        </div>
      ))}
      {items.length > 4 ? (
        <div className="size-16 items-center justify-center rounded-full border-[5px] border-[#243157] bg-[#1B2542] text-sm z-1 hidden md:hidden @[1072px]/coinflip-card:flex">
          <p className="font-semibold text-accent">+{items.length - 4}</p>
        </div>
      ) : null}
      {items.length > 3 ? (
        <div className="size-16 items-center justify-center rounded-full border-[5px] border-[#243157] bg-[#1B2542] text-sm z-1 hidden md:hidden @[950px]/coinflip-card:flex @[1072px]/coinflip-card:hidden">
          <p className="font-semibold text-accent">+{items.length - 3}</p>
        </div>
      ) : null}
      {items.length > 1 ? (
        <div className="size-16 items-center justify-center rounded-full border-[5px] border-[#243157] bg-[#1B2542] text-sm z-1 hidden sm:hidden md:flex @[950px]/coinflip-card:hidden">
          <p className="font-semibold text-accent">+{items.length - 1}</p>
        </div>
      ) : null}
      {items.length > 3 ? (
        <div className="size-16 flex items-center justify-center rounded-full border-[5px] border-[#243157] bg-[#1B2542] text-sm z-1 sm:hidden">
          <p className="font-semibold text-accent">+{items.length - 3}</p>
        </div>
      ) : null}
    </div>
  );
}

function CoinflipWinnerRow({ game, history = true, faded = false, animation = null }) {
  const [hasFlipped, setHasFlipped] = useState(false);
  const winnerSide = game.winnerSide;
  const tailsWon = winnerSide === "tails";
  const animationActive = Boolean(animation && animation.phase !== "settled");
  const revealed = !animationActive;
  const creatorWon = winnerSide === game.creator.side;
  const joinerWon = !creatorWon;
  const winner = creatorWon ? game.creator : game.joiner;
  const flipAsset = coinflipAnimationAsset(game);

  useEffect(() => {
    if (animation?.phase === "flipping") setHasFlipped(true);
  }, [animation?.phase]);

  return (
          <div
            data-v-e7c3a4a2=""
            data-game-id={game.id}
            className={`@container/coinflip-card will-change-transform coinflip-list-item ${animationActive ? "coinflip-flipping-row" : history ? "is-history coinflip-public-row" : "coinflip-active-row"} ${faded ? "coinflip-faded-row" : ""}`}
            bis_skin_checked="1"
            style={{}}
          >
            <div
              className={`group/coinflip-card relative flex flex-col items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-[#243157] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden md:flex-row hover:bg-[#273764] ${faded ? "opacity-40" : ""}`}
              bis_skin_checked="1"
            >
              <div
                className={`absolute inset-0 bg-linear-91 to-transparent to-20% transition-opacity duration-300 ${tailsWon ? "from-[#F38A39]/40" : "from-[#2369FF]/40"} ${revealed ? "opacity-100" : "opacity-0"}`}
                bis_skin_checked="1"
              ></div>
              <div className="md:w-70" bis_skin_checked="1">
                <div
                  className="flex items-center gap-4.5 z-1"
                  bis_skin_checked="1"
                >
                  <div
                    className={`flex items-center gap-4 transition-opacity duration-300 ${revealed && !creatorWon ? "opacity-55" : ""}`}
                    bis_skin_checked="1"
                  >
                    <div
                      className={`coinflip-avatar-frame size-16 relative bg-[#232E4E]/65 border-2 rounded-xl p-0.75 flex items-center justify-center transition-colors duration-300 ${revealed && creatorWon ? "coinflip-winner-indicator border-[#5CDF9A]" : "border-[#314274]"}`}
                      bis_skin_checked="1"
                    >
                      <div
                        data-state="closed"
                        data-grace-area-trigger=""
                        className="rounded-[10px] p-0 bg-transparent size-11.5 flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) rounded-[10px] p-0 bg-transparent size-11.5"
                        style={{
                          "--level-border-start": "#222a3f",
                          "--level-border-end": "#BEBEBE",
                          "--level-text": "#BEBEBE",
                        }}
                        bis_skin_checked="1"
                      >
                        <div
                          className="size-full flex justify-center rounded-lg items-end"
                          style={{ backgroundColor: "rgb(26, 35, 57)" }}
                          bis_skin_checked="1"
                        >
                          <img
                            src={game.creator.avatar}
                            className="size-9/12 object-contain object-center rounded-[5px] ease-in-out opacity-0 transition-opacity no-interaction"
                            alt={game.creator.username}
                            loading="lazy"
                            fetchPriority="low"
                            style={{ opacity: "1" }}
                          />
                        </div>
                      </div>
                      <div
                        className="size-5 rounded-full absolute -top-1.5 -right-1.5"
                        bis_skin_checked="1"
                      >
                        <img
                          src={`/coinflip/${game.creator.side}.webp`}
                          alt={game.creator.username}
                          className="size-full object-cover no-interaction"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative" bis_skin_checked="1">
                    <div
                      className="group-hover/coinflip-card:rotate-y-180 transform-3d td transition-transform duration-500 relative size-5"
                      bis_skin_checked="1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 16 16"
                        className="size-full text-accent/50 absolute inset-0 m-auto backface-hidden translate-z-0.5"
                      >
                        <path
                          fill="currentColor"
                          d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z"
                        ></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 16 16"
                        className="size-full text-primary absolute inset-0 m-auto backface-hidden -translate-z-0.5 rotate-y-180"
                      >
                        <path
                          fill="currentColor"
                          d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z"
                        ></path>
                      </svg>
                    </div>
                    <div
                      className="absolute top-0 size-6 bg-primary blur-lg rounded-full opacity-0 group-hover/coinflip-card:animate-flash-glow"
                      bis_skin_checked="1"
                    ></div>
                  </div>
                  <div
                    className={`flex items-center gap-4 transition-opacity duration-300 ${revealed && !joinerWon ? "opacity-55" : ""}`}
                    bis_skin_checked="1"
                  >
                    <div
                      className={`coinflip-avatar-frame size-16 relative bg-[#232E4E]/65 border-2 rounded-xl p-0.75 flex items-center justify-center transition-colors duration-300 ${revealed && joinerWon ? "coinflip-winner-indicator border-[#5CDF9A]" : "border-[#314274]"}`}
                      bis_skin_checked="1"
                    >
                      <div
                        data-state="closed"
                        data-grace-area-trigger=""
                        className="rounded-[10px] p-0 bg-transparent size-11.5 flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) rounded-[10px] p-0 bg-transparent size-11.5"
                        style={{
                          "--level-border-start": "#222a3f",
                          "--level-border-end": "#BEBEBE",
                          "--level-text": "#BEBEBE",
                        }}
                        bis_skin_checked="1"
                      >
                        <div
                          className="size-full flex justify-center rounded-lg items-end"
                          style={{ backgroundColor: "rgb(26, 35, 57)" }}
                          bis_skin_checked="1"
                        >
                          <img
                            src={game.joiner?.avatar}
                            className="size-9/12 object-contain object-center rounded-[5px] ease-in-out opacity-0 transition-opacity no-interaction"
                            alt={game.joiner?.username}
                            loading="lazy"
                            fetchPriority="low"
                            style={{ opacity: "1" }}
                          />
                        </div>
                      </div>
                      <div
                        className="size-5 rounded-full absolute -top-1.5 -right-1.5"
                        bis_skin_checked="1"
                      >
                        <img
                          src={`/coinflip/${game.joiner?.side || (game.creator.side === "heads" ? "tails" : "heads")}.webp`}
                          alt={game.joiner?.username}
                          className="size-full object-cover no-interaction"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="size-14.5 rounded-full bg-[#18213A] relative flex items-center justify-center ml-auto"
                    bis_skin_checked="1"
                  >
                    {(animation?.phase === "flipping" || (animation?.phase === "settled" && hasFlipped)) && flipAsset ? (
                      <video
                        key={`${game.id}-${animation.startedAt}`}
                        src={`/coinflip/${flipAsset}.webm`}
                        className="size-17 max-w-none absolute top-1/2 left-1/2 -translate-1/2 object-cover pointer-events-none"
                        autoPlay
                        muted
                        playsInline
                      />
                    ) : revealed ? <div className="size-10 relative" bis_skin_checked="1">
                      <img
                        src={`/coinflip/${winnerSide}.webp`}
                        alt={winnerSide}
                        className="size-full object-cover"
                      />
                    </div> : null}
                  </div>
                </div>
              </div>
              <div
                className="flex items-center justify-center w-full sm:justify-between md:w-auto"
                bis_skin_checked="1"
              >
                <CoinflipRowItems game={game} />
                <div
                  className="w-0.5 h-7 rounded-full bg-accent/25 block sm:hidden mx-4"
                  bis_skin_checked="1"
                ></div>
              </div>
              <div
                className="flex flex-col items-center gap-2 w-full sm:flex-row sm:justify-between md:w-100"
                bis_skin_checked="1"
              >
                <div
                  className="flex flex-col min-w-fit items-center sm:items-start md:gap-0.5 md:mr-auto md:w-42 md:items-center"
                  bis_skin_checked="1"
                >
                  <div className="flex items-center gap-2" bis_skin_checked="1">
                    <img
                      src="/coin.webp"
                      className="bg-cover bg-center size-4.5"
                    />
                    <span className="tabular-nums font-semibold">{game.creator.wager + (game.joiner?.wager || 0)}</span>
                  </div>
                  <p className="text-accent font-semibold text-sm">
                    <span className="normal-nums">(</span>
                    <span className="tabular-nums font-semibold">
                      {formatWholeNumber(game.minimum)}
                    </span> -{" "}
                    <span className="tabular-nums font-semibold">{formatWholeNumber(game.maximum)}</span>
                    <span className="normal-nums">)</span>
                  </p>
                </div>
                <div
                  className="w-0.5 h-7 rounded-full bg-accent/25 hidden sm:block md:hidden"
                  bis_skin_checked="1"
                ></div>
                <div className="flex items-center gap-2" bis_skin_checked="1">
                  {animationActive ? <div className="w-30 h-10.5 bg-[#57689A]/16 rounded-lg flex items-center justify-center">
                    <p className="font-semibold text-[15px]">FLIPPING</p>
                  </div> : <div
                    className={`w-30 h-10.5 rounded-lg flex items-center justify-center bg-linear-to-r ${tailsWon ? "from-[#F38A39] to-[#F38A39]/30" : "from-[#2369FF] to-[#2369FF]/30"}`}
                    bis_skin_checked="1"
                  >
                    <div
                      className="size-8 rounded-[10px] from-accent/0 to-accent/45 flex flex-col items-center relative bg-linear-to-b from-5% p-0.5 size-8 rounded-[10px] from-accent/0 to-accent/45"
                      style={{
                        "--level-border-start": "#222a3f",
                        "--level-border-end": "#BEBEBE",
                        "--level-text": "#BEBEBE",
                      }}
                      bis_skin_checked="1"
                    >
                      <div
                        className="size-full flex items-center justify-center rounded-lg bg-[#18213A]"
                        style={{ backgroundColor: "rgb(26, 35, 57)" }}
                        bis_skin_checked="1"
                      >
                        <img
                          src={winner?.avatar}
                          className="size-9/12 object-contain object-center rounded-[5px] ease-in-out opacity-0 transition-opacity no-interaction"
                          alt={winner?.username}
                          loading="lazy"
                          fetchPriority="low"
                          style={{ opacity: "1" }}
                        />
                      </div>
                    </div>
                    <p className="font-semibold text-[15px] ml-1.5">WINNER</p>
                  </div>}
                  <button className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5">
                    <div
                      className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                      style={{
                        top: "var(--sb-shadow-size,3px)",
                        backgroundColor: "rgb(34, 51, 100)",
                      }}
                      bis_skin_checked="1"
                    ></div>
                    <div
                      className="font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-2.5 md:px-3 rounded-lg"
                      style={{
                        height: "calc(100% - var(--sb-shadow-size,3px))",
                        backgroundColor: "rgb(87, 104, 154)",
                        color: "rgb(255, 255, 255)",
                      }}
                      bis_skin_checked="1"
                    >
                      <div
                        className="transition-opacity flex items-center justify-center size-full"
                        style={{
                          filter: "drop-shadow(rgb(34, 51, 100) 0px 2px 0px)",
                        }}
                        bis_skin_checked="1"
                      >
                        <span className="hidden sm:block">VIEW</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="size-5 sm:hidden"
                        >
                          <g fill="currentColor">
                            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                            <path
                              fillRule="evenodd"
                              d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.76 1.76 0 0 1 0-1.113M17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0"
                              clipRule="evenodd"
                            ></path>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
  );
}

function FlippingCoinflipRow() {
  return (
    <div
      data-v-e7c3a4a2=""
      className="@container/coinflip-card will-change-transform coinflip-list-item coinflip-flipping-row"
      bis_skin_checked="1"
    >
      <div
        className="group/coinflip-card relative flex flex-col items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-[#243157] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden md:flex-row hover:bg-[#273764]"
        bis_skin_checked="1"
      >
        <div
          className="absolute inset-0 bg-linear-91 to-transparent to-20% transition-opacity duration-300"
          bis_skin_checked="1"
        />
        <div className="md:w-70" bis_skin_checked="1">
          <div className="flex items-center gap-4.5 z-1" bis_skin_checked="1">
            <div
              className="flex items-center gap-4 transition-opacity duration-300"
              bis_skin_checked="1"
            >
              <div
                className="coinflip-avatar-frame size-16 relative bg-[#232E4E]/65 border-2 rounded-xl p-0.75 flex items-center justify-center transition-colors duration-300 border-[#314274]"
                bis_skin_checked="1"
              >
                <div
                  data-state="closed"
                  data-grace-area-trigger=""
                  className="rounded-[10px] p-0 bg-transparent size-11.5 flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) rounded-[10px] p-0 bg-transparent size-11.5"
                  style={{
                    "--level-border-start": "#222a3f",
                    "--level-border-end": "#BEBEBE",
                    "--level-text": "#BEBEBE",
                  }}
                  bis_skin_checked="1"
                >
                  <div
                    className="size-full flex justify-center rounded-lg items-end"
                    style={{ backgroundColor: "rgb(26, 35, 57)" }}
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://tr.rbxcdn.com/30DAY-AvatarHeadshot-B2EF54E3E066D91C690A43B85F79AFAA-Png/180/180/AvatarHeadshot/Webp/noFilter"
                      className="size-9/12 object-contain object-center rounded-[5px] ease-in-out opacity-0 transition-opacity no-interaction"
                      alt="amirweldi"
                      loading="lazy"
                      fetchPriority="low"
                      style={{ opacity: "1" }}
                    />
                  </div>
                </div>
                <div
                  className="size-5 rounded-full absolute -top-1.5 -right-1.5"
                  bis_skin_checked="1"
                >
                  <img
                    src="/coinflip/heads.webp"
                    alt="amirweldi"
                    className="size-full object-cover no-interaction"
                  />
                </div>
              </div>
            </div>
            <div className="relative" bis_skin_checked="1">
              <div
                className="group-hover/coinflip-card:rotate-y-180 transform-3d td transition-transform duration-500 relative size-5"
                bis_skin_checked="1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="size-full text-accent/50 absolute inset-0 m-auto backface-hidden translate-z-0.5"
                >
                  <path
                    fill="currentColor"
                    d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="size-full text-primary absolute inset-0 m-auto backface-hidden -translate-z-0.5 rotate-y-180"
                >
                  <path
                    fill="currentColor"
                    d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z"
                  />
                </svg>
              </div>
              <div
                className="absolute top-0 size-6 bg-primary blur-lg rounded-full opacity-0 group-hover/coinflip-card:animate-flash-glow"
                bis_skin_checked="1"
              />
            </div>
            <div
              className="flex items-center gap-4 transition-opacity duration-300"
              bis_skin_checked="1"
            >
              <div
                className="coinflip-avatar-frame size-16 relative bg-[#232E4E]/65 border-2 rounded-xl p-0.75 flex items-center justify-center transition-colors duration-300 border-[#314274]"
                bis_skin_checked="1"
              >
                <div
                  data-state="closed"
                  data-grace-area-trigger=""
                  className="rounded-[10px] p-0 bg-transparent size-11.5 flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) rounded-[10px] p-0 bg-transparent size-11.5"
                  style={{
                    "--level-border-start": "#222a3f",
                    "--level-border-end": "#BEBEBE",
                    "--level-text": "#BEBEBE",
                  }}
                  bis_skin_checked="1"
                >
                  <div
                    className="size-full flex justify-center rounded-lg items-end"
                    style={{ backgroundColor: "rgb(26, 35, 57)" }}
                    bis_skin_checked="1"
                  >
                    <img
                      src="/bots/travis.webp"
                      className="size-9/12 object-contain object-center rounded-[5px] ease-in-out opacity-0 transition-opacity no-interaction"
                      alt="bots/travis.webp"
                      loading="lazy"
                      fetchPriority="low"
                      style={{ opacity: "1" }}
                    />
                  </div>
                </div>
                <div
                  className="size-5 rounded-full absolute -top-1.5 -right-1.5"
                  bis_skin_checked="1"
                >
                  <img
                    src="/coinflip/tails.webp"
                    alt="Travis"
                    className="size-full object-cover no-interaction"
                  />
                </div>
              </div>
            </div>
            <div
              className="size-14.5 rounded-full bg-[#18213A] relative flex items-center justify-center ml-auto"
              bis_skin_checked="1"
            />
          </div>
        </div>
        <div
          className="flex items-center justify-center w-full sm:justify-between md:w-auto"
          bis_skin_checked="1"
        >
          <div className="items-center -space-x-5 flex" bis_skin_checked="1">
            <div
              data-state="closed"
              data-grace-area-trigger=""
              className="coinflip-row-item size-14.5 md:size-17 group relative bg-[#1B2542] border-[5px] border-[#243157] hover:border-[#314274] transition-colors rounded-full size-14.5 md:size-17"
              bis_skin_checked="1"
            >
              <img
                src="https://cdn.mm2wild.com/items/138.webp"
                alt="Winter's Edge"
                className="coinflip-row-item-image absolute inset-0 size-full object-contain group-hover:scale-110 transition-transform will-change-transform opacity-0 ease-in-out no-interaction"
                loading="lazy"
                fetchPriority="low"
                style={{ opacity: "1" }}
              />
            </div>
            <div
              data-state="closed"
              data-grace-area-trigger=""
              className="coinflip-row-item size-14.5 md:size-17 md:hidden md:@[950px]/coinflip-card:block group relative bg-[#1B2542] border-[5px] border-[#243157] hover:border-[#314274] transition-colors rounded-full size-14.5 md:size-17 md:hidden md:@[950px]/coinflip-card:block"
              bis_skin_checked="1"
            >
              <img
                src="https://cdn.mm2wild.com/items/138.webp"
                alt="Winter's Edge"
                className="coinflip-row-item-image absolute inset-0 size-full object-contain group-hover:scale-110 transition-transform will-change-transform opacity-0 ease-in-out no-interaction"
                loading="lazy"
                fetchPriority="low"
                style={{ opacity: "1" }}
              />
            </div>
            <div
              className="size-16 items-center justify-center rounded-full border-[5px] border-[#243157] bg-[#1B2542] text-sm z-1 hidden sm:hidden md:flex @[950px]/coinflip-card:hidden"
              bis_skin_checked="1"
            >
              <p className="font-semibold text-accent">+1</p>
            </div>
          </div>
          <div
            className="w-0.5 h-7 rounded-full bg-accent/25 block sm:hidden mx-4"
            bis_skin_checked="1"
          />
        </div>
        <div
          className="flex flex-col items-center gap-2 w-full sm:flex-row sm:justify-between md:w-100"
          bis_skin_checked="1"
        >
          <div
            className="flex flex-col min-w-fit items-center sm:items-start md:gap-0.5 md:mr-auto md:w-42 md:items-center"
            bis_skin_checked="1"
          >
            <div className="flex items-center gap-2" bis_skin_checked="1">
              <img src="/coin.webp" className="bg-cover bg-center size-4.5" />
              <span className="tabular-nums font-semibold">20</span>
            </div>
            <p className="text-accent font-semibold text-sm">
              <span className="normal-nums">(</span>
              <span className="tabular-nums font-semibold">10</span> -{" "}
              <span className="tabular-nums font-semibold">11</span>
              <span className="normal-nums">)</span>
            </p>
          </div>
          <div
            className="w-0.5 h-7 rounded-full bg-accent/25 hidden sm:block md:hidden"
            bis_skin_checked="1"
          />
          <div className="flex items-center gap-2" bis_skin_checked="1">
            <div
              className="w-30 h-10.5 bg-[#57689A]/16 rounded-lg flex items-center justify-center"
              bis_skin_checked="1"
            >
              <p className="font-semibold text-[15px]">FLIPPING</p>
            </div>
            <button className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5">
              <div
                className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                style={{
                  top: "var(--sb-shadow-size,3px)",
                  backgroundColor: "rgb(34, 51, 100)",
                }}
                bis_skin_checked="1"
              />
              <div
                className="font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-2.5 md:px-3 rounded-lg"
                style={{
                  height: "calc(100% - var(--sb-shadow-size,3px))",
                  backgroundColor: "rgb(87, 104, 154)",
                  color: "rgb(255, 255, 255)",
                }}
                bis_skin_checked="1"
              >
                <div
                  className="transition-opacity flex items-center justify-center size-full"
                  style={{ filter: "drop-shadow(rgb(34, 51, 100) 0px 2px 0px)" }}
                  bis_skin_checked="1"
                >
                  <span className="hidden sm:block">VIEW</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="size-5 sm:hidden"
                  >
                    <g fill="currentColor">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.76 1.76 0 0 1 0-1.113M17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0"
                        clipRule="evenodd"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function JoinableCoinflipRow({ game, onJoin, currentUser }) {
  const orange = game.creator.side === "heads";
  const playerAvatar = game.creator.avatar;
  const playerName = game.creator.username;
  const playerSide = game.creator.side;
  const opponentSide = playerSide === "heads" ? "tails" : "heads";
  const amount = game.creator.wager;
  const minimum = game.minimum;
  const maximum = game.maximum;

  return (
    <div
      data-v-e7c3a4a2=""
      data-game-id={game.id}
      className={`@container/coinflip-card will-change-transform is-joinable coinflip-list-item ${orange ? "coinflip-secondary-joinable-row" : "coinflip-primary-joinable-row"}`}
      bis_skin_checked="1"
    >
      <div
        className="group/coinflip-card relative flex flex-col items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-[#243157] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden md:flex-row hover:bg-[#273764]"
        bis_skin_checked="1"
      >
        <div
          className="absolute inset-0 bg-linear-91 to-transparent to-20% transition-opacity duration-300"
          bis_skin_checked="1"
        />
        <div className="md:w-70" bis_skin_checked="1">
          <div className="flex items-center gap-4.5 z-1" bis_skin_checked="1">
            <div
              className="flex items-center gap-4 transition-opacity duration-300"
              bis_skin_checked="1"
            >
              <div
                className="coinflip-avatar-frame size-16 relative bg-[#232E4E]/65 border-2 rounded-xl p-0.75 flex items-center justify-center transition-colors duration-300 border-[#314274]"
                bis_skin_checked="1"
              >
                <div
                  data-state="closed"
                  data-grace-area-trigger=""
                  className="rounded-[10px] p-0 bg-transparent size-11.5 flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) rounded-[10px] p-0 bg-transparent size-11.5"
                  style={{
                    "--level-border-start": orange ? "#222a3f" : "#272539",
                    "--level-border-end": orange ? "#BEBEBE" : "#F33939",
                    "--level-text": orange ? "#BEBEBE" : "#F33939",
                  }}
                  bis_skin_checked="1"
                >
                  <div
                    className="size-full flex justify-center rounded-lg items-end"
                    style={{ backgroundColor: "rgb(26, 35, 57)" }}
                    bis_skin_checked="1"
                  >
                    <img
                      src={playerAvatar}
                      className="size-9/12 object-contain object-center rounded-[5px] ease-in-out opacity-0 transition-opacity no-interaction"
                      alt={playerAvatar}
                      loading="lazy"
                      fetchPriority="low"
                      style={{ opacity: "1" }}
                    />
                  </div>
                </div>
                <div
                  className="size-5 rounded-full absolute -top-1.5 -right-1.5"
                  bis_skin_checked="1"
                >
                  <img
                    src={`/coinflip/${playerSide}.webp`}
                    alt={playerName}
                    className="size-full object-cover no-interaction"
                  />
                </div>
              </div>
            </div>
            <div className="relative" bis_skin_checked="1">
              <div
                className="group-hover/coinflip-card:rotate-y-180 transform-3d td transition-transform duration-500 relative size-5"
                bis_skin_checked="1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="size-full text-accent/50 absolute inset-0 m-auto backface-hidden translate-z-0.5"
                >
                  <path
                    fill="currentColor"
                    d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="size-full text-primary absolute inset-0 m-auto backface-hidden -translate-z-0.5 rotate-y-180"
                >
                  <path
                    fill="currentColor"
                    d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z"
                  />
                </svg>
              </div>
              <div
                className="absolute top-0 size-6 bg-primary blur-lg rounded-full opacity-0 group-hover/coinflip-card:animate-flash-glow"
                bis_skin_checked="1"
              />
            </div>
            <div
              className="flex items-center gap-4 transition-opacity duration-300"
              bis_skin_checked="1"
            >
              <div
                className="coinflip-avatar-frame size-16 relative bg-[#232E4E]/65 border-2 rounded-xl p-0.75 flex items-center justify-center transition-colors duration-300 border-[#314274]"
                bis_skin_checked="1"
              >
                <div
                  className="size-11.5 bg-linear-to-b rounded-[10px]"
                  bis_skin_checked="1"
                >
                  <div
                    className="size-full bg-[#18213A] rounded-lg"
                    bis_skin_checked="1"
                  />
                </div>
                <div
                  className="size-5 rounded-full absolute -top-1.5 -right-1.5"
                  bis_skin_checked="1"
                >
                  <img
                    src={`/coinflip/${opponentSide}.webp`}
                    alt="Unknown"
                    className="size-full object-cover no-interaction"
                  />
                </div>
              </div>
            </div>
            <div
              className="size-14.5 rounded-full bg-[#18213A] relative flex items-center justify-center ml-auto"
              bis_skin_checked="1"
            />
          </div>
        </div>
        <div
          className="flex items-center justify-center w-full sm:justify-between md:w-auto"
          bis_skin_checked="1"
        >
          <CoinflipRowItems game={game} />
          <div
            className="w-0.5 h-7 rounded-full bg-accent/25 block sm:hidden mx-4"
            bis_skin_checked="1"
          />
        </div>
        <div
          className="flex flex-col items-center gap-2 w-full sm:flex-row sm:justify-between md:w-100"
          bis_skin_checked="1"
        >
          <div
            className="flex flex-col min-w-fit items-center sm:items-start md:gap-0.5 md:mr-auto md:w-42 md:items-center"
            bis_skin_checked="1"
          >
            <div className="flex items-center gap-2" bis_skin_checked="1">
              <img src="/coin.webp" className="bg-cover bg-center size-4.5" />
              <span className="tabular-nums font-semibold">{amount}</span>
            </div>
            <p className="text-accent font-semibold text-sm">
              <span className="normal-nums">(</span>
              <span className="tabular-nums font-semibold">{formatWholeNumber(minimum)}</span> -{" "}
              <span className="tabular-nums font-semibold">{formatWholeNumber(maximum)}</span>
              <span className="normal-nums">)</span>
            </p>
          </div>
          <div
            className="w-0.5 h-7 rounded-full bg-accent/25 hidden sm:block md:hidden"
            bis_skin_checked="1"
          />
          <div className="flex items-center gap-2" bis_skin_checked="1">
            {currentUser?.uuid === game.creator.uuid ? (
              <div className="w-30 h-10.5 bg-[#57689A]/16 rounded-lg flex items-center justify-center">
                <p className="font-semibold text-[15px]">WAITING</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); onJoin(game); }}
                className="relative cursor-pointer outline-none flex select-none transition-opacity group/button w-30 h-10.5"
              >
                <div
                  className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                  style={{
                    top: "var(--sb-shadow-size,3px)",
                    backgroundColor: orange
                      ? "rgb(171, 91, 29)"
                      : "rgb(0, 73, 229)",
                  }}
                  bis_skin_checked="1"
                />
                <div
                  className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0"
                  style={{
                    height: "calc(100% - var(--sb-shadow-size,3px))",
                    backgroundColor: orange
                      ? "rgb(243, 138, 57)"
                      : "rgb(35, 105, 255)",
                    color: "rgb(255, 255, 255)",
                  }}
                  bis_skin_checked="1"
                >
                  <div
                    className="transition-opacity flex items-center justify-center size-full"
                    bis_skin_checked="1"
                  >
                    JOIN
                  </div>
                </div>
              </button>
            )}
            <button
              type="button"
              className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5"
            >
              <div
                className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                style={{
                  top: "var(--sb-shadow-size,3px)",
                  backgroundColor: "rgb(34, 51, 100)",
                }}
                bis_skin_checked="1"
              />
              <div
                className="font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-2.5 md:px-3 rounded-lg"
                style={{
                  height: "calc(100% - var(--sb-shadow-size,3px))",
                  backgroundColor: "rgb(87, 104, 154)",
                  color: "rgb(255, 255, 255)",
                }}
                bis_skin_checked="1"
              >
                <div
                  className="transition-opacity flex items-center justify-center size-full"
                  style={{ filter: "drop-shadow(rgb(34, 51, 100) 0px 2px 0px)" }}
                  bis_skin_checked="1"
                >
                  <span className="hidden sm:block">VIEW</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="size-5 sm:hidden"
                  >
                    <g fill="currentColor">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.76 1.76 0 0 1 0-1.113M17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0"
                        clipRule="evenodd"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoinflipContent({
  games,
  animations,
  currentUser,
  isPriceAscending,
  onTogglePrice,
  onCreateCoinflip,
  onJoinCoinflip,
  onViewCoinflip,
}) {
  const [playerTooltip, setPlayerTooltip] = useState(null);
  const [visibleRowCount, setVisibleRowCount] = useState(COINFLIP_PAGE_SIZE);
  const [archiveClock, setArchiveClock] = useState(() => Date.now());
  const coinflipListRef = useRef(null);

  const archiveDeadline = useCallback((game) => {
    const animation = animations[game.id];
    if (animation?.startedAt) {
      return animation.startedAt
        + COINFLIP_COUNTDOWN_MS
        + COINFLIP_FLIP_MS
        + COINFLIP_ARCHIVE_MS;
    }

    const completedAt = Date.parse(game.completedAt);
    return Number.isFinite(completedAt) ? completedAt + COINFLIP_ARCHIVE_MS : Infinity;
  }, [animations]);

  useEffect(() => {
    const now = Date.now();
    const hasNewlyArchivedGame = games.some((game) => {
      if (game.status === "open") return false;
      const deadline = archiveDeadline(game);
      return deadline <= now && deadline > archiveClock;
    });
    if (hasNewlyArchivedGame) {
      setArchiveClock(now);
    }

    const nextDeadline = games.reduce((next, game) => {
      if (game.status === "open") return next;
      const deadline = archiveDeadline(game);
      return deadline > now && deadline < next ? deadline : next;
    }, Infinity);

    if (!Number.isFinite(nextDeadline)) return undefined;
    const timer = window.setTimeout(
      () => setArchiveClock(Date.now()),
      Math.max(0, nextDeadline - now) + 20,
    );
    return () => window.clearTimeout(timer);
  }, [archiveClock, archiveDeadline, games]);

  const orderedGames = useMemo(() => {
    const joinable = [];
    const flipping = [];
    const completed = [];

    games.forEach((game) => {
      const animationPhase = animations[game.id]?.phase;
      if (game.status === "open") joinable.push(game);
      else if (animationPhase === "countdown" || animationPhase === "flipping") flipping.push(game);
      else completed.push(game);
    });

    const totalValue = (game) => Number(game.creator?.wager || 0) + Number(game.joiner?.wager || 0);
    const comparePrice = (left, right) => isPriceAscending
      ? totalValue(left) - totalValue(right)
      : totalValue(right) - totalValue(left);

    joinable.sort(comparePrice);
    flipping.sort(comparePrice);
    if (joinable.length + flipping.length < visibleRowCount) {
      completed.sort(comparePrice);
    }
    return [...joinable, ...flipping, ...completed];
  }, [animations, games, isPriceAscending, visibleRowCount]);
  const visibleGames = orderedGames.slice(0, visibleRowCount);
  const hasMoreRows = visibleRowCount < orderedGames.length;

  const showPlayerTooltip = (event) => {
    const trigger = event.target.closest("[data-grace-area-trigger]");
    if (!trigger) return;

    const playerFrame = trigger.parentElement;
    const playerCoin = playerFrame?.querySelector(
      'img[src*="/coinflip/heads"], img[src*="/coinflip/tails"]',
    );
    const itemImage = trigger.querySelector(".coinflip-row-item-image[alt]");
    const label = playerCoin?.alt?.trim() || itemImage?.alt?.trim();
    if (!label) return;

    const rect = trigger.getBoundingClientRect();
    setPlayerTooltip({
      label,
      left: rect.left + rect.width / 2,
      top: rect.top,
    });
  };

  const hidePlayerTooltip = (event) => {
    const trigger = event.target.closest("[data-grace-area-trigger]");
    if (!trigger || trigger.contains(event.relatedTarget)) return;
    setPlayerTooltip(null);
  };

  const loadMoreRows = () => {
    const list = coinflipListRef.current;
    if (
      !list ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisibleRowCount((count) => count + COINFLIP_LOAD_MORE_SIZE);
      return;
    }

    const visibleRows = Array.from(
      list.querySelectorAll(":scope > .coinflip-list-item:not([hidden])"),
    );
    visibleRows.forEach((row) => {
      row.getAnimations().forEach((animation) => animation.cancel());
    });
    const firstPositions = new Map(
      visibleRows.map((row) => [row, row.getBoundingClientRect().top]),
    );

    flushSync(() => {
      setVisibleRowCount((count) => count + COINFLIP_LOAD_MORE_SIZE);
    });

    const revealedRows = Array.from(
      list.querySelectorAll(":scope > .coinflip-list-item:not([hidden])"),
    );
    let revealIndex = 0;

    revealedRows.forEach((row) => {
      const firstTop = firstPositions.get(row);
      if (firstTop !== undefined) {
        const deltaY = firstTop - row.getBoundingClientRect().top;
        if (deltaY === 0) return;
        row.animate(
          [
            { transform: `translateY(${deltaY}px)` },
            { transform: "translateY(0)" },
          ],
          { duration: 300, easing: "ease" },
        );
        return;
      }

      row.animate(
        [
          { opacity: 0, transform: "translateY(-12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 300,
          delay: revealIndex * 35,
          easing: "ease",
          fill: "backwards",
        },
      );
      revealIndex += 1;
    });
  };

  return (
    <>
      <div
        data-v-e7c3a4a2=""
        className="max-w-[1660px] mx-auto flex flex-col @container/content px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]"
        bis_skin_checked="1"
      >
      <div
        data-v-e7c3a4a2=""
        className="page-content coinflip-page py-6 flex flex-col gap-6"
        bis_skin_checked="1"
      >
        <div
          data-v-e7c3a4a2=""
          className="flex flex-wrap gap-4 items-center"
          bis_skin_checked="1"
        >
          <div
            data-v-e7c3a4a2=""
            className="flex items-center justify-between w-full sm:w-auto sm:flex-1"
            bis_skin_checked="1"
          >
            <h1 data-v-e7c3a4a2="" className="text-2xl font-bold">
              COINFLIP
            </h1>
            <div
              data-v-e7c3a4a2=""
              className="h-10.5 relative"
              bis_skin_checked="1"
            >
              <div
                data-v-e7c3a4a2=""
                className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#171F37] rounded-lg"
                bis_skin_checked="1"
              ></div>
              <button
                data-v-e7c3a4a2=""
                type="button"
                onClick={onTogglePrice}
                aria-label={`Sort by price ${isPriceAscending ? "descending" : "ascending"}`}
                aria-pressed={isPriceAscending}
                className="px-3.5 h-[calc(100%-3px)] bg-[#222D4E] rounded-lg flex items-center relative cursor-pointer outline-none font-medium"
              >
                {" "}
                PRICE{" "}
                <svg
                  data-v-e7c3a4a2=""
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className={`size-4.5 ml-1.5 transition-transform duration-200 ${
                    isPriceAscending ? "rotate-180" : ""
                  }`}
                  strokeWidth="2.5"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    d="m6 9 6 6 6-6"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          <button
            data-v-e7c3a4a2=""
            type="button"
            onClick={onCreateCoinflip}
            className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 w-full sm:w-auto"
          >
            <div
              className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
              style={{
                top: "var(--sb-shadow-size,3px)",
                backgroundColor: "rgb(211, 133, 2)",
              }}
              bis_skin_checked="1"
            ></div>
            <div
              className="font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 w-full sm:w-auto px-3 rounded-lg"
              style={{
                height: "calc(100% - var(--sb-shadow-size,3px))",
                backgroundColor: "rgb(243, 178, 57)",
                color: "rgb(58, 56, 105)",
              }}
              bis_skin_checked="1"
            >
              <div
                className="transition-opacity flex items-center justify-center size-full"
                style={{ filter: "drop-shadow(rgb(211, 133, 2) 0px 2px 0px)" }}
                bis_skin_checked="1"
              >
                <svg
                  data-v-e7c3a4a2=""
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4.5 mr-1.5"
                  strokeWidth="3.5"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    d="M5 12h14m-7-7v14"
                  ></path>
                </svg>
                <p data-v-e7c3a4a2="" className="font-bold">
                  CREATE COINFLIP
                </p>
              </div>
            </div>
          </button>
        </div>
        <div
          data-v-e7c3a4a2=""
          ref={coinflipListRef}
          className="coinflip-list relative"
          onMouseOver={showPlayerTooltip}
          onMouseOut={hidePlayerTooltip}
          onClick={(event) => {
            const coinflipRow = event.target.closest(".coinflip-list-item");
            if (coinflipRow && event.currentTarget.contains(coinflipRow)) {
              const game = games.find((entry) => entry.id === coinflipRow.dataset.gameId);
              if (game) onViewCoinflip(game);
            }
          }}
          bis_skin_checked="1"
        >
          {visibleGames.map((game) => game.status === "open" ? (
            <JoinableCoinflipRow key={game.id} game={game} currentUser={currentUser} onJoin={onJoinCoinflip} />
          ) : (() => {
            const archived = archiveClock >= archiveDeadline(game);
            return (
              <CoinflipWinnerRow
                key={game.id}
                game={game}
                animation={animations[game.id] || null}
                history={archived}
                faded={archived}
              />
            );
          })())}
        </div>
        {hasMoreRows ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={loadMoreRows}
              className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 w-full sm:w-auto"
            >
              <div
                className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                style={{
                  top: "var(--sb-shadow-size,3px)",
                  backgroundColor: "rgb(34, 51, 100)",
                }}
              />
              <div
                className="font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 w-full sm:w-auto px-6 rounded-lg"
                style={{
                  height: "calc(100% - var(--sb-shadow-size,3px))",
                  backgroundColor: "rgb(87, 104, 154)",
                  color: "rgb(255, 255, 255)",
                }}
              >
                <div
                  className="transition-opacity flex items-center justify-center size-full"
                  style={{ filter: "drop-shadow(rgb(34, 51, 100) 0px 2px 0px)" }}
                >
                  LOAD MORE
                </div>
              </div>
            </button>
          </div>
        ) : null}
      </div>
      </div>
      <CoinflipPlayerTooltip tooltip={playerTooltip} />
    </>
  );
}

export default function CoinflipPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPriceAscending, setIsPriceAscending] = useState(false);
  const [createModal, setCreateModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [games, setGames] = useState([]);
  const [animations, setAnimations] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [botBusy, setBotBusy] = useState(false);
  const [botError, setBotError] = useState("");
  const [error, setError] = useState("");
  const animationTimersRef = useRef(new Map());
  const animationPreloadsRef = useRef(new Map());
  const knownStatusesRef = useRef(new Map());
  const statusesInitializedRef = useRef(false);

  useEffect(() => {
    preloadCoinflipItems().catch(() => {});
  }, []);

  const startGameAnimation = useCallback((game) => {
    if (!game?.id || !game?.winnerSide) return;
    const currentTimers = animationTimersRef.current.get(game.id) || [];
    currentTimers.forEach((timer) => window.clearTimeout(timer));
    const startedAt = Date.now();
    const flipAsset = coinflipAnimationAsset(game);
    if (flipAsset) {
      const preload = document.createElement("video");
      preload.preload = "auto";
      preload.src = `/coinflip/${flipAsset}.webm`;
      preload.load();
      animationPreloadsRef.current.set(game.id, preload);
    }
    knownStatusesRef.current.set(game.id, "complete");
    setAnimations((current) => ({
      ...current,
      [game.id]: { phase: "countdown", startedAt },
    }));
    const flipTimer = window.setTimeout(() => {
      setAnimations((current) => current[game.id]
        ? { ...current, [game.id]: { phase: "flipping", startedAt } }
        : current);
    }, COINFLIP_COUNTDOWN_MS);
    const finishTimer = window.setTimeout(() => {
      setAnimations((current) => current[game.id]
        ? { ...current, [game.id]: { phase: "settled", startedAt } }
        : current);
      animationTimersRef.current.delete(game.id);
      animationPreloadsRef.current.delete(game.id);
    }, COINFLIP_COUNTDOWN_MS + COINFLIP_FLIP_MS);
    animationTimersRef.current.set(game.id, [flipTimer, finishTimer]);
  }, []);

  const loadGames = useCallback(async () => {
    const response = await fetch("/api/coinflip?limit=100", { credentials: "include" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load coinflips.");
    const nextGames = data.games || [];
    if (statusesInitializedRef.current) {
      nextGames.forEach((game) => {
        if (knownStatusesRef.current.get(game.id) === "open" && game.status === "complete") {
          startGameAnimation(game);
        }
      });
    }
    knownStatusesRef.current = new Map(nextGames.map((game) => [game.id, game.status]));
    statusesInitializedRef.current = true;
    setGames(nextGames);
    setViewModal((current) => current ? nextGames.find((game) => game.id === current.id) || current : null);
  }, [startGameAnimation]);

  const openCreate = () => {
    if (!currentUser) { setError("Sign in to create a coinflip."); return; }
    setError(""); setCreateModal({ type: "create" });
  };
  const openJoin = (game) => {
    if (!currentUser) { setError("Sign in to join a coinflip."); return; }
    if (currentUser.uuid === game.creator.uuid) { setError("You cannot join your own coinflip."); return; }
    setError(""); setViewModal(null); setCreateModal({ type: "join", game });
  };

  const submitCoinflip = async ({ side, itemIds }) => {
    setBusy(true); setError("");
    try {
      const payload = createModal.type === "join"
        ? { action: "join", gameId: createModal.game.id, itemIds }
        : { action: "create", side, itemIds };
      const response = await fetch("/api/coinflip", {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The coinflip could not be updated.");
      setCurrentUser((user) => user ? { ...user, mm2_balance: Number(data.balance) } : user);
      window.dispatchEvent(new CustomEvent("mm2wild:balance-updated", { detail: { mm2Balance: data.balance } }));
      setCreateModal(null);
      if (createModal.type === "join") startGameAnimation(data.game);
      setViewModal(data.game);
      await loadGames();
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  const callBot = async (game) => {
    if (!currentUser || currentUser.uuid !== game.creator.uuid || botBusy) return;
    setBotBusy(true); setBotError(""); setError("");
    try {
      const response = await fetch("/api/coinflip", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "callBot", gameId: game.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The bot could not join this coinflip.");
      setCurrentUser((user) => user ? { ...user, mm2_balance: Number(data.balance) } : user);
      window.dispatchEvent(new CustomEvent("mm2wild:balance-updated", { detail: { mm2Balance: data.balance } }));
      startGameAnimation(data.game);
      setViewModal(data.game);
      await loadGames();
    } catch (requestError) {
      setBotError(requestError.message);
    } finally {
      setBotBusy(false);
    }
  };

  const togglePriceOrder = () => {
    const rows = Array.from(
      document.querySelectorAll(
        ".coinflip-route .coinflip-list-item:not([hidden])",
      ),
    );

    if (
      rows.length === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsPriceAscending((isAscending) => !isAscending);
      return;
    }

    rows.forEach((row) => {
      row.getAnimations().forEach((animation) => animation.cancel());
    });
    const firstPositions = new Map(
      rows.map((row) => [row, row.getBoundingClientRect().top]),
    );

    flushSync(() => {
      setIsPriceAscending((isAscending) => !isAscending);
    });

    rows.forEach((row) => {
      if (row.hidden) return;
      const deltaY = firstPositions.get(row) - row.getBoundingClientRect().top;
      if (deltaY === 0) return;
      row.animate(
        [
          { transform: `translateY(${deltaY}px)` },
          { transform: "translateY(0)" },
        ],
        {
          duration: 300,
          easing: "ease",
        },
      );
    });
  };

  useEffect(() => {
    let disposed = false;
    Promise.all([
      loadGames(),
      fetch("/api/session", { credentials: "include" }).then(async (response) => response.ok ? (await response.json()).user : null),
    ]).then(([, user]) => { if (!disposed) setCurrentUser(user); }).catch((requestError) => { if (!disposed) setError(requestError.message); }).finally(() => { if (!disposed) setIsLoading(false); });
    const refreshTimer = window.setInterval(() => loadGames().catch(() => {}), 2500);
    return () => { disposed = true; window.clearInterval(refreshTimer); };
  }, [loadGames]);

  useEffect(() => {
    const controller = new AbortController();
    const updateBalance = async (event) => {
      const nextBalance = Number(event.detail?.mm2Balance);
      if (Number.isFinite(nextBalance)) {
        setCurrentUser((user) => user ? { ...user, mm2_balance: nextBalance } : user);
        return;
      }
      try {
        const response = await fetch("/api/session", { credentials: "include", signal: controller.signal });
        const payload = await response.json().catch(() => null);
        if (response.ok && payload?.user) setCurrentUser(payload.user);
      } catch {
      }
    };
    window.addEventListener("mm2wild:balance-updated", updateBalance);
    return () => {
      controller.abort();
      window.removeEventListener("mm2wild:balance-updated", updateBalance);
    };
  }, []);

  useEffect(() => () => {
    animationTimersRef.current.forEach((timers) => timers.forEach((timer) => window.clearTimeout(timer)));
    animationTimersRef.current.clear();
    animationPreloadsRef.current.clear();
  }, []);

  if (isLoading) {
    return (
      <div className="site-content flex items-center justify-center min-h-[calc(100dvh-var(--layout-top))]">
        <LineWobbleLoader />
      </div>
    );
  }

  return (
    <>
      <div className="site-content coinflip-route">
        <CoinflipContent
          games={games}
          animations={animations}
          currentUser={currentUser}
          isPriceAscending={isPriceAscending}
          onTogglePrice={togglePriceOrder}
          onCreateCoinflip={openCreate}
          onJoinCoinflip={openJoin}
          onViewCoinflip={(game) => setViewModal(game)}
        />
      </div>
      {error && !createModal ? <button type="button" onClick={() => setError("")} className="fixed z-[100000000] bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-[#351F35] px-4 py-3 text-[#FF9EAE] font-semibold">{error}</button> : null}
      {createModal ? (
        <CoinflipCreateModal onClose={() => !busy && setCreateModal(null)} onSubmit={submitCoinflip} game={createModal.game} currentBalance={Number(currentUser?.mm2_balance || 0)} busy={busy} error={error} />
      ) : null}
      {viewModal ? (
        <CoinflipViewModal
          game={viewModal}
          idle={viewModal.status === "open"}
          orange={viewModal.creator.side === "heads"}
          animation={animations[viewModal.id] || null}
          actionLabel={currentUser?.uuid === viewModal.creator.uuid ? "CALL BOT" : "JOIN"}
          isCreator={currentUser?.uuid === viewModal.creator.uuid}
          canJoin={Boolean(currentUser && currentUser.uuid !== viewModal.creator.uuid)}
          actionBusy={botBusy}
          actionError={botError}
          onCallBot={() => callBot(viewModal)}
          onJoin={() => openJoin(viewModal)}
          onClose={() => { setViewModal(null); setBotError(""); }}
        />
      ) : null}
    </>
  );
}
