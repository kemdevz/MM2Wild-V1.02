import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const coinIconPath =
  "M256 136c88.4 0 160 28.7 160 64s-71.6 64-160 64-160-28.7-160-64 71.6-64 160-64Zm0 216C114.6 352 0 287.5 0 208S114.6 64 256 64s256 64.5 256 144-114.6 144-256 144Zm-125.9-77.9c34.5 14.3 78.7 21.9 125 21.9 48.1 0 92.3-7.6 125.9-21.9 16.7-5.8 32.4-14.6 44.4-25.9 12.1-11.5 22.6-27.7 22.6-48.2 0-20.5-10.5-36.7-22.6-48.2-12-11.3-27.7-20.1-44.4-26.8-33.6-13.4-77.8-21-125.9-21-46.3 0-90.5 7.6-125 21-15.8 6.7-31.5 15.5-43.51 26.8C74.5 163.3 63.1 179.5 63.1 200c0 20.5 11.4 36.7 23.49 48.2 12.01 11.3 27.71 20.1 43.51 25.9ZM0 290.1c13.21 15.7 29.72 29.4 48 40v64.5c-30.21-21-48-46.7-48-74.6v-29.9Zm80 122v-63.8c28.4 13.1 60.9 23 96 29v64.3c-36.2-5.9-68.9-15.8-96-29.5Zm128-30.5c15.7 1.6 31.7 2.4 48 2.4s32.3-.8 48-2.4v64.2c-15.5 1.4-31.6 2.2-48 2.2s-32.5-.8-48-2.2v-64.2Zm128 60v-64.3c35.1-6 67.6-15.9 96-29v63.8c-27.1 13.7-59.8 23.6-96 29.5Zm128-111.5c18.3-10.6 34.8-24.3 48-40V320c0 27.9-17.8 53.6-48 74.6v-64.5Z";

function Player({ bot, name, coin, side, faded = false, level }) {
  const isLeft = side === "left";
  return (
    <div className="flex-1 relative flex flex-col sm:items-center gap-4">
      <div
        className={`flex flex-col gap-2 text-center transition-opacity duration-300 sm:items-center ${
          isLeft ? "items-start" : "items-end"
        } ${faded ? "opacity-55" : ""}`}
      >
        <div className="size-18 sm:size-30 relative" style={{ cursor: faded ? "pointer" : undefined }}>
          <div
            className={`size-full rounded-[22px] sm:rounded-4xl from-[#283667]/0 transition-colors duration-1000 ${
              isLeft ? "to-[#DF5C5C]" : "to-[#5CDF9A]"
            } flex flex-col items-center relative bg-linear-to-b from-5% p-0.5`}
            style={{
              "--level-border-start": "#222a3f",
              "--level-border-end": "#BEBEBE",
              "--level-text": "#BEBEBE",
            }}
          >
            <div
              className="size-full flex items-center justify-center rounded-[20px] sm:rounded-[30px] bg-[#161D3A]"
              style={{ backgroundColor: "rgb(26, 35, 57)" }}
            >
              <img
                src={bot}
                className="object-contain object-center ease-in-out transition-opacity no-interaction size-[86%] rounded-[16px] sm:rounded-[22px]"
                alt={name}
                loading="lazy"
                fetchPriority="low"
              />
            </div>
          </div>
          <div
            className={`size-8 sm:size-11 rounded-full absolute -top-1.5 sm:-top-2 ${
              isLeft ? "-left-1.5 sm:-left-2" : "-right-1.5 sm:-right-2"
            }`}
          >
            <img src={`/coinflip/${coin}.webp`} alt={coin} className="size-full object-cover pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5" style={{ cursor: faded ? "pointer" : undefined }}>
          {level ? (
            <div
              className="bg-gradient-to-b from-(--level-border-start) to-(--level-border-end) p-0.5 rounded-md"
              style={{
                "--level-border-start": "#222c3b",
                "--level-border-end": "#ABF339",
                "--level-text": "#ABF339",
              }}
            >
              <div
                className="rounded-sm size-full flex items-center justify-center font-medium !leading-none text-(--level-text) bg-[#1A1D39] px-1.75 sm:px-2.25 py-0.5 text-xs sm:text-[13px]"
                style={{ backgroundColor: "rgb(26, 35, 57)" }}
              >
                {level}
              </div>
            </div>
          ) : null}
          <p className="font-medium text-sm sm:text-base">{name}</p>
        </div>
      </div>
    </div>
  );
}

function ValuePanel({ faded = false, blue = false, player }) {
  return (
    <div
      className={`rounded-xl p-4 transition-opacity duration-300 flex-1 max-w-md ${faded ? "opacity-55" : ""}`}
      style={{
        background: `radial-gradient(70% 165% at 50% 0%, rgba(${blue ? "35, 105, 255" : "243, 138, 57"}, 0.25) 0%, rgba(40, 53, 102, 0) 100%), rgb(35, 48, 93)`,
      }}
    >
      <div className="flex flex-col items-center justify-center gap-0.5">
        <div className="flex items-center justify-center gap-1">
          <img src="/coin.webp" className="bg-cover bg-center size-5" alt="" />
          <span className="tabular-nums font-semibold">{player?.wager || 0}</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-accent font-medium text-xs sm:text-sm">
          <p>50.0% Chance</p>
          <div className="size-1 bg-accent rounded-full hidden sm:block" />
          <p className="hidden sm:block">{player?.items?.length || 0} Items</p>
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item }) {
  return (
    <div
      className="won-item flex flex-col rounded-xl shadow-lg overflow-hidden relative p-3 py-4"
      style={{ background: "url('/leafs-item.png') center / cover no-repeat rgb(32, 45, 87)" }}
    >
      <svg className="absolute inset-0" viewBox="0 0 140 176" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="140" height="176" fill="url(#rarity-item-detailed-Godly)" fillOpacity="0.12" />
      </svg>
      <div className="w-10/12 mx-auto aspect-square relative">
        <img
          loading="lazy"
          src={item.imageUrl}
          alt={item.name}
          className="absolute top-1/2 left-1/2 -translate-1/2 size-10/12 object-contain transition-opacity duration-300 no-interaction drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)]"
        />
      </div>
      <div className="flex flex-col mt-2 relative items-center">
        <p className="font-medium text-sm truncate w-full text-center">{item.name}</p>
        <div className="flex items-center gap-1.5">
          <img src="/coin.webp" className="bg-cover bg-center size-4" alt="" />
          <span className="tabular-nums font-semibold text-sm">{item.value}</span>
        </div>
      </div>
    </div>
  );
}

function FairnessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 20" className="size-5" aria-hidden="true">
      <path fill="currentColor" d="M8.912 11.375a.53.53 0 0 0-.53-.53h-.184L6.384 6.753c-.348.091-.698.171-1.05.24l1.706 3.852H3.372l1.684-3.8c-.41.074-.822.133-1.236.177l-1.606 3.623H2.03a.53.53 0 0 0-.529.53c-.008 1.82 1.933 3.04 3.706 3 1.772.041 3.714-1.181 3.706-3ZM18.972 10.845h-.185l-1.605-3.623a17.132 17.132 0 0 1-1.236-.176l1.683 3.8h-3.667l1.707-3.852a17.11 17.11 0 0 1-1.052-.241l-1.813 4.092h-.185a.53.53 0 0 0-.53.53c0 .827.404 1.596 1.136 2.165 1.364 1.106 3.777 1.106 5.142 0 .732-.57 1.135-1.338 1.135-2.165a.53.53 0 0 0-.53-.53ZM2.03 6.257c1.453 0 2.9-.197 4.3-.586a15.584 15.584 0 0 1 8.34 0c1.4.389 2.847.586 4.3.586.6 0 .737-.842.168-1.032a23.547 23.547 0 0 1-3.98-1.75l-.836-.465a7.892 7.892 0 0 0-3.292-.972v-.546c-.026-.701-1.034-.7-1.06 0v.546a7.892 7.892 0 0 0-3.292.972l-.837.465a23.543 23.543 0 0 1-3.979 1.75c-.57.19-.433 1.032.168 1.032ZM12.617 16.916H8.38c-.877 0-1.588.711-1.588 1.588 0 .293.237.53.53.53h6.352a.53.53 0 0 0 .53-.53c0-.877-.711-1.588-1.588-1.588Z" />
      <path fill="currentColor" d="M9.969 15.857h1.059V6.171a14.236 14.236 0 0 0-1.06 0v9.686Z" />
    </svg>
  );
}

function IdlePlayer({ avatar, coin, name, side }) {
  const isLeft = side === "left";

  return (
    <div className="flex-1 relative flex flex-col sm:items-center gap-4">
      <div
        className={`flex flex-col gap-2 text-center transition-opacity duration-300 sm:items-center ${isLeft ? "items-start" : "items-end"}`}
      >
        <div className="size-18 sm:size-30 relative" style={avatar ? { cursor: "pointer" } : undefined}>
          <div className="bg-linear-to-b from-[#283667]/0 to-[#283667] size-full rounded-[22px] sm:rounded-4xl p-0.5">
            <div className="size-full flex items-center justify-center rounded-[20px] sm:rounded-[30px] bg-[#161D3A]">
              {avatar ? (
                <img
                  src={avatar}
                  className="object-contain object-center ease-in-out opacity-0 transition-opacity no-interaction size-[86%] rounded-[16px] sm:rounded-[22px]"
                  alt={avatar}
                  loading="lazy"
                  fetchPriority="low"
                  style={{ opacity: 1 }}
                />
              ) : null}
            </div>
          </div>
          <div
            className={`size-8 sm:size-11 rounded-full absolute -top-1.5 sm:-top-2 ${isLeft ? "-left-1.5 sm:-left-2" : "-right-1.5 sm:-right-2"}`}
          >
            <img
              src={`/coinflip/${coin}.webp`}
              alt={coin}
              className="size-full object-cover pointer-events-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5" style={avatar ? { cursor: "pointer" } : undefined}>
          {avatar ? (
            <div
              className="bg-gradient-to-b from-(--level-border-start) to-(--level-border-end) p-0.5 rounded-md"
              style={{
                "--level-border-start": "#222a3f",
                "--level-border-end": "#BEBEBE",
                "--level-text": "#BEBEBE",
              }}
            >
              <div
                className="rounded-sm size-full flex items-center justify-center font-medium !leading-none text-(--level-text) bg-[#1A1D39] px-1.75 sm:px-2.25 py-0.5 text-xs sm:text-[13px]"
                style={{ backgroundColor: "rgb(26, 35, 57)" }}
              >
                1
              </div>
            </div>
          ) : null}
          <p className="font-medium text-sm sm:text-base">{avatar ? name : "Waiting..."}</p>
        </div>
      </div>
    </div>
  );
}

function IdleItemCard({ item }) {
  return (
    <div
      className="won-item flex flex-col rounded-xl shadow-lg overflow-hidden relative p-3 py-4"
      style={{ background: "url('/leafs-item.png') center / cover no-repeat rgb(32, 45, 87)" }}
    >
      <svg className="absolute inset-0" viewBox="0 0 140 176" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="140" height="176" fill="url(#rarity-item-detailed-Godly)" fillOpacity="0.12" />
      </svg>
      <div className="w-10/12 mx-auto aspect-square relative">
        <img
          loading="lazy"
          src={item.imageUrl}
          alt={item.name}
          className="absolute top-1/2 left-1/2 -translate-1/2 size-10/12 object-contain opacity-0 transition-opacity duration-300 no-interaction drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)]"
          style={{ opacity: 1 }}
        />
      </div>
      <div className="flex flex-col mt-2 relative items-center">
        <p className="font-medium text-sm truncate w-full text-center">{item.name}</p>
        <div className="flex items-center gap-1.5">
          <img src="/coin.webp" className="bg-cover bg-center size-4" alt="" />
          <span className="tabular-nums font-semibold text-sm">{item.value}</span>
        </div>
      </div>
    </div>
  );
}

function IdleModalContent({ onClose, orange, game, onJoin, actionLabel, canJoin }) {
  const [isFairnessOpen, setIsFairnessOpen] = useState(false);
  const playerCoin = orange ? "heads" : "tails";
  const waitingCoin = orange ? "tails" : "heads";
  const joinColor = orange ? "243, 138, 57" : "35, 105, 255";
  const joinShadow = orange ? "171, 91, 29" : "0, 73, 229";
  const playerAvatar = game.creator.avatar;

  return (
    <div className="bg-[#192243] sm:rounded-2xl shadow-lg flex flex-col max-h-[calc(100vh-48px)] overflow-hidden relative">
      <div className="max-h-[calc(100dvh-48px)] overflow-y-auto relative [&amp;::-webkit-scrollbar]:w-1 [&amp;::-webkit-scrollbar-track]:bg-transparent [&amp;::-webkit-scrollbar-thumb]:bg-primary [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb:hover]:bg-primary/80">
        <h2 id="coinflip-view-title" className="sr-only">Coinflip #{game.number}</h2>
        <button type="button" className="text-accent cursor-pointer absolute top-4 right-4 z-1" onClick={onClose} aria-label="Close coinflip">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" aria-hidden="true">
            <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
          </svg>
        </button>

        <div className="flex flex-col relative">
          <div className="absolute inset-0 pointer-events-none transition-colors duration-1000 ease-out bg-radial-[90.62%_73.93%_at_49.77%_0%] to-[rgba(25,34,67,0)] from-[rgba(255,255,255,0.12)]" />
          <img src="/coinflip/coinflip-bg.webp" alt="Coinflip" className="absolute inset-0 size-full object-cover pointer-events-none opacity-32 mask-b-from-77%" />

          <div className="flex items-center justify-center pt-14 pb-10 relative w-full px-6">
            <div className="flex flex-col gap-5 items-center z-1 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
              <div className="size-22 sm:size-40 bg-[#141A32]/40 rounded-full flex items-center justify-center relative mb-10 sm:mb-0">
                <div className="size-[85%] relative overflow-hidden rounded-full bg-[#1A1F37] flex items-center justify-center">
                  <video src="/coinflip/coinflip-idle.webm" className="size-[80%] object-contain" autoPlay loop playsInline />
                </div>
              </div>
            </div>
            <IdlePlayer avatar={playerAvatar} coin={playerCoin} name={game.creator.username} side="left" />
            <IdlePlayer coin={waitingCoin} side="right" />
          </div>

          <div className="relative px-6 flex flex-col gap-4">
            <div className="flex items-start gap-8 justify-center">
              <div
                className="rounded-xl p-4 transition-opacity duration-300 flex-1 max-w-md"
                style={{
                  background: `radial-gradient(70% 165% at 50% 0%, rgba(${orange ? "35, 105, 255" : "243, 138, 57"}, 0.25) 0%, rgba(40, 53, 102, 0) 100%), rgb(35, 48, 93)`,
                }}
              >
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="flex items-center justify-center gap-1">
                    <img src="/coin.webp" className="bg-cover bg-center size-5" alt="" />
                    <span className="tabular-nums font-semibold">{game.creator.wager}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-accent font-medium text-xs sm:text-sm">
                    <p>50% Chance</p>
                    <div className="size-1 bg-accent rounded-full hidden sm:block" />
                    <p className="hidden sm:block">{game.creator.items.length} Items</p>
                  </div>
                </div>
              </div>
              <div
                className="rounded-xl p-4 transition-opacity duration-300 flex-1 max-w-md"
                style={{
                  background: `radial-gradient(70% 165% at 50% 0%, rgba(${joinColor}, 0.25) 0%, rgba(40, 53, 102, 0) 100%), rgb(35, 48, 93)`,
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <button type="button" disabled={!canJoin} onClick={onJoin} className="relative cursor-pointer outline-none flex select-none transition-opacity disabled:opacity-40 disabled:pointer-events-none group/button h-10.5 sm:h-11.5 w-full">
                    <div
                      className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                      style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: `rgb(${joinShadow})` }}
                    />
                    <div
                      className="rounded-lg size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 text-sm sm:text-base px-4.5 font-bold"
                      style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: `rgb(${joinColor})`, color: "rgb(255, 255, 255)" }}
                    >
                      <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: `drop-shadow(rgb(${joinShadow}) 0px 2px 0px)` }}>{actionLabel}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-8 justify-center h-64 overflow-y-auto scrollbar-hide pb-6">
              <div className="transition-opacity duration-300 flex-1 max-w-md">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">{game.creator.items.map((item) => <IdleItemCard key={item.id} item={item} />)}</div>
              </div>
              <div className="transition-opacity duration-300 flex-1 max-w-md">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className="bg-[#243157]/30 rounded-xl aspect-140/177" />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute left-0 right-0 bottom-0 h-10 bg-linear-to-b from-transparent to-[#192243]/80 pointer-events-none" />
          </div>
        </div>

        <div className="bg-[#1D284E] px-6 py-4 relative">
          <div className="h-0.5 left-0 right-0 top-0 absolute" style={{ background: "linear-gradient(90deg, rgba(46, 60, 104, 0) 0%, rgb(46, 60, 104) 20.19%, rgb(46, 60, 104) 50%, rgb(46, 60, 104) 79.81%, rgba(46, 60, 104, 0) 100%)" }} />
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" className="size-5 text-[#E5AD4E]" aria-hidden="true"><path fill="currentColor" d={coinIconPath} /></svg>
              <button type="button" className="font-semibold flex items-center gap-1.5 cursor-pointer" onClick={() => setIsFairnessOpen((isOpen) => !isOpen)} aria-expanded={isFairnessOpen} aria-controls="coinflip-idle-fairness-details">
                Coinflip <span className="inline-block text-accent italic -skew-x-8">#{game.number}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`size-4 transition-transform duration-300 text-accent ${isFairnessOpen ? "rotate-180" : ""}`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" /></svg>
              </button>
            </div>
            <a href="/fairness" className="h-10 px-3 bg-[#2E3C68] rounded-lg text-accent text-sm font-semibold flex items-center gap-1.25 hover:bg-[#2E3C68]/80 transition-colors">
              <FairnessIcon />
              <span className="hidden sm:block">PROVABLY FAIR</span>
            </a>
          </div>
          <div id="coinflip-idle-fairness-details" className={`overflow-hidden transition-all duration-300 ease-in-out ${isFairnessOpen ? "max-h-27" : "max-h-0"}`}>
            <div className="space-y-1 pt-4 text-accent font-semibold text-sm">
              <p className="truncate">HASHED SEED: <span className="text-accent/70">{game.fairness.hashedSeed}</span></p>
              <p className="truncate">SERVER SEED: <span className="text-accent/70">Concealed</span></p>
              <p className="truncate">EOS BLOCK: <span className="text-accent/70">Unavailable</span></p>
              <p className="truncate">EOS HASH: <span className="text-accent/70">Unavailable</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalContent({ onClose, game }) {
  const [isFairnessOpen, setIsFairnessOpen] = useState(false);
  const creatorWon = game.winnerUuid === game.creator.uuid;
  const joinerWon = game.winnerUuid === game.joiner?.uuid;
  return (
    <div className="max-h-[calc(100dvh-48px)] overflow-y-auto relative rounded-2xl bg-[#192243] [&amp;::-webkit-scrollbar]:w-1 [&amp;::-webkit-scrollbar-track]:bg-transparent [&amp;::-webkit-scrollbar-thumb]:bg-primary [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb:hover]:bg-primary/80">
      <h2 id="coinflip-view-title" className="sr-only">Coinflip #{game.number}</h2>
      <button type="button" className="text-accent cursor-pointer absolute top-4 right-4 z-1" onClick={onClose} aria-label="Close coinflip">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" aria-hidden="true">
          <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
        </svg>
      </button>

      <div className="flex flex-col relative">
        <div className="absolute inset-0 pointer-events-none transition-colors duration-1000 ease-out bg-radial-[90.62%_73.93%_at_49.77%_0%] to-[rgba(25,34,67,0)] from-[rgba(35,105,255,0.25)]" />
        <img src="/coinflip/coinflip-bg.webp" alt="" className="absolute inset-0 size-full object-cover pointer-events-none opacity-32 mask-b-from-77%" />

        <div className="flex items-center justify-center pt-14 pb-10 relative w-full px-6">
          <div className="flex flex-col gap-5 items-center z-1 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <div className="size-22 sm:size-40 bg-[#141A32]/40 rounded-full flex items-center justify-center relative mb-10 sm:mb-0">
              <div className="size-[88%] relative">
                <video src={`/coinflip/${game.creator.side[0]}2${game.winnerSide[0]}.webm`} poster={`/coinflip/${game.winnerSide}.webp`} className="size-full object-cover pointer-events-none" autoPlay muted playsInline />
              </div>
            </div>
          </div>
          <Player bot={game.creator.avatar} name={game.creator.username} coin={game.creator.side} side="left" faded={!creatorWon} />
          <Player bot={game.joiner.avatar} name={game.joiner.username} coin={game.joiner.side} side="right" faded={!joinerWon} />
        </div>

        <div className="relative px-6 flex flex-col gap-4">
          <div className="flex items-start gap-8 justify-center">
            <ValuePanel faded={!creatorWon} player={game.creator} />
            <ValuePanel blue faded={!joinerWon} player={game.joiner} />
          </div>
          <div className="flex items-start gap-8 justify-center h-64 overflow-y-auto scrollbar-hide pb-6">
            <div className="transition-opacity duration-300 opacity-55 flex-1 max-w-md">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">{game.creator.items.map((item) => <ItemCard key={item.id} item={item} />)}</div>
            </div>
            <div className="transition-opacity duration-300 flex-1 max-w-md">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">{game.joiner.items.map((item) => <ItemCard key={item.id} item={item} />)}</div>
            </div>
          </div>
          <div className="absolute left-0 right-0 bottom-0 h-10 bg-linear-to-b from-transparent to-[#192243]/80 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[#1D284E] px-6 py-4 relative">
        <div className="h-0.5 left-0 right-0 top-0 absolute" style={{ background: "linear-gradient(90deg, rgba(46, 60, 104, 0) 0%, rgb(46, 60, 104) 20.19%, rgb(46, 60, 104) 50%, rgb(46, 60, 104) 79.81%, rgba(46, 60, 104, 0) 100%)" }} />
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" className="size-5 text-[#E5AD4E]" aria-hidden="true"><path fill="currentColor" d={coinIconPath} /></svg>
            <button
              type="button"
              className="font-semibold flex items-center gap-1.5 cursor-pointer"
              onClick={() => setIsFairnessOpen((isOpen) => !isOpen)}
              aria-expanded={isFairnessOpen}
              aria-controls="coinflip-fairness-details"
            >
              Coinflip <span className="inline-block text-accent italic -skew-x-8">#{game.number}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`size-4 transition-transform duration-300 text-accent ${isFairnessOpen ? "rotate-180" : ""}`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <a href="/fairness" className="h-10 px-3 bg-[#2E3C68] rounded-lg text-accent text-sm font-semibold flex items-center gap-1.25 hover:bg-[#2E3C68]/80 transition-colors">
              <FairnessIcon />
              <span className="hidden sm:block">PROVABLY FAIR</span>
            </a>
          </div>
        </div>
        <div id="coinflip-fairness-details" className={`overflow-hidden transition-all duration-300 ease-in-out ${isFairnessOpen ? "max-h-27" : "max-h-0"}`}>
          <div className="space-y-1 pt-4 text-accent font-semibold text-sm">
            <p className="truncate">HASHED SEED: <span className="text-accent/70">{game.fairness.hashedSeed}</span></p>
            <p className="truncate">SERVER SEED: <span className="text-accent/70">{game.fairness.serverSeed}</span></p>
            <p className="truncate">RESULT HASH: <span className="text-accent/70">{game.fairness.resultHash}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoinflipViewModal({ onClose, onJoin, actionLabel = "JOIN", canJoin = true, game, idle = false, orange = false }) {
  const [isOpen, setIsOpen] = useState(true);
  const closeTimerRef = useRef(null);
  const isClosingRef = useRef(false);
  const hasClosedRef = useRef(false);

  const finishClose = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    window.clearTimeout(closeTimerRef.current);
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsOpen(false);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(finishClose, 250);
  }, [finishClose]);

  useEffect(() => {
    return () => {
      window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [requestClose]);

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[100000001] bg-[#090F20]/80 backdrop-blur-sm ${
          isOpen
            ? "animate-in fade-in-0"
            : "animate-out fade-out-0 fill-mode-forwards pointer-events-none"
        }`}
        role="presentation"
        data-state={isOpen ? "open" : "closed"}
        onMouseDown={requestClose}
      />
      <div
        className={`dialog-content fixed left-1/2 top-1/2 z-[100000002] -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col ${
          isOpen
            ? "animate-in fade-in-0 zoom-in-95"
            : "animate-out fade-out-0 zoom-out-95 fill-mode-forwards pointer-events-none"
        }`}
        style={{
          maxWidth: "min(calc(100dvw - 24px), 960px)",
          maxHeight: "calc(100% - 24px)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coinflip-view-title"
        data-state={isOpen ? "open" : "closed"}
        onAnimationEnd={(event) => {
          if (
            !isOpen &&
            event.currentTarget === event.target &&
            event.animationName === "exit"
          ) {
            finishClose();
          }
        }}
      >
        {idle ? (
          <IdleModalContent onClose={requestClose} onJoin={onJoin} actionLabel={actionLabel} canJoin={canJoin} orange={orange} game={game} />
        ) : (
          <ModalContent onClose={requestClose} game={game} />
        )}
      </div>
    </>,
    document.body,
  );
}
