import { useEffect, useRef, useState } from "react";

const banners = [
  {
    desktop: "/home/banner-release.webp",
    mobile: "/home/banner-release.webp",
    alt: "Banner",
  },
  {
    desktop: "/home/banner-discord.webp",
    mobile: "/home/banner-discord.webp",
    alt: "Discord Banner",
  },
  {
    desktop: "/home/banner-leaderboards.webp",
    mobile: "/home/banner-leaderboards.webp",
    alt: "Leaderboards Banner",
  },
];

const games = [
  {
    slug: "battles",
    title: "Battles",
    subtitle: "Battle & win",
    color: "243, 57, 57",
    overlay: "size-[180%] -rotate-10 top-4/5 left-3/5",
  },
  {
    slug: "cases",
    title: "Cases",
    subtitle: "Unbox skins",
    color: "243, 178, 57",
    overlay: "size-[180%] -rotate-8 top-4/5 left-2/5",
  },
  {
    slug: "coinflip",
    title: "Coinflip",
    subtitle: "Flip for double",
    color: "130, 164, 255",
    overlay: "size-[160%] top-4/5 left-1/2",
  },
  {
    slug: "roulette",
    title: "Roulette",
    subtitle: "Pick your luck",
    color: "78, 229, 226",
    overlay: "size-[170%] top-4/5 left-1/2",
  },
  {
    slug: "upgrader",
    title: "Upgrader",
    subtitle: "Get better items",
    color: "118, 229, 78",
    overlay: "size-[180%] -rotate-10 top-4/5 left-3/5",
  },
];

const bets = [
  ["Battles", "TRslaxy1", "21:32:49", "2,650", "x6.13", "+13,594", true],
  ["Upgrader", "Kudurotacapter", "21:32:53", "25", "x0.00", "-25", false],
  ["Coinflip", "Itz_NinjaPlayzz", "21:32:51", "1,250", "x2.00", "+1,250", true],
  ["Upgrader", "g3nb4d", "21:32:50", "2", "x0.00", "-2", false],
  ["Roulette", "MM2_DBA", "21:32:46", "480", "x3.50", "+1,200", true],
];

function BannerCarousel() {
  const [slideIndex, setSlideIndex] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const dragStartX = useRef(0);
  const dragPointerId = useRef(null);
  const carouselWidth = useRef(0);
  const interactionLocked = useRef(false);
  const carouselSlides = [banners.at(-1), ...banners, banners[0]];
  const activeBanner =
    (slideIndex - 1 + banners.length) % banners.length;

  useEffect(() => {
    if (isDragging) return undefined;
    const timer = window.setInterval(
      () => {
        if (interactionLocked.current || dragPointerId.current !== null) return;
        interactionLocked.current = true;
        setSlideIndex((current) => current + 1);
      },
      6000,
    );
    return () => window.clearInterval(timer);
  }, [isDragging]);

  const startDragging = (event) => {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      interactionLocked.current
    ) {
      return;
    }
    dragPointerId.current = event.pointerId;
    dragStartX.current = event.clientX;
    carouselWidth.current = event.currentTarget.getBoundingClientRect().width;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragOffset(0);
    setIsDragging(true);
  };

  const dragBanner = (event) => {
    if (!isDragging || event.pointerId !== dragPointerId.current) return;
    setDragOffset(event.clientX - dragStartX.current);
  };

  const finishDragging = (event, cancelled = false) => {
    if (!isDragging || event.pointerId !== dragPointerId.current) return;

    const offset = event.clientX - dragStartX.current;
    const threshold = Math.min(100, carouselWidth.current * 0.12);
    const shouldMove = !cancelled && Math.abs(offset) >= threshold;

    if (Math.abs(offset) > 0.5) {
      interactionLocked.current = true;
    }
    if (shouldMove) {
      setSlideIndex((current) => current + (offset < 0 ? 1 : -1));
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragPointerId.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col relative">
      <div className="rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden relative bg-[#253665]">
        <section
          dir="ltr"
          aria-label="Gallery"
          tabIndex={0}
          className="carousel is-ltr is-effect-slide cursor-default"
          style={{ touchAction: "pan-y" }}
          onPointerDown={startDragging}
          onPointerMove={dragBanner}
          onPointerUp={(event) => finishDragging(event)}
          onPointerCancel={(event) => finishDragging(event, true)}
          onKeyDown={(event) => {
            const direction =
              event.key === "ArrowLeft"
                ? -1
                : event.key === "ArrowRight"
                  ? 1
                  : 0;
            if (!direction || interactionLocked.current) return;

            event.preventDefault();
            interactionLocked.current = true;
            setSlideIndex((current) => current + direction);
          }}
        >
          <div className="overflow-hidden">
            <ol
              className={`flex ease-out ${isDragging || isRepositioning ? "" : "transition-transform duration-500"}`}
              style={{
                transform: `translateX(calc(-${slideIndex * 100}% + ${dragOffset}px))`,
              }}
              onTransitionEnd={(event) => {
                if (event.propertyName !== "transform") return;

                const resetIndex =
                  slideIndex === 0
                    ? banners.length
                    : slideIndex === banners.length + 1
                      ? 1
                      : null;
                if (resetIndex === null) {
                  interactionLocked.current = false;
                  return;
                }

                setIsRepositioning(true);
                setSlideIndex(resetIndex);
                window.requestAnimationFrame(() => {
                  window.requestAnimationFrame(() => {
                    setIsRepositioning(false);
                    interactionLocked.current = false;
                  });
                });
              }}
            >
              {carouselSlides.map((banner, index) => (
                <li
                  key={`${banner.desktop}-${index}`}
                  className="min-w-full"
                  style={{ width: "100%" }}
                  aria-hidden={index === 0 || index === carouselSlides.length - 1}
                >
                  <picture className="no-interaction block aspect-[4/1]">
                    <source media="(max-width: 699px)" srcSet={banner.mobile} />
                    <source
                      media="(min-width: 700px)"
                      srcSet={banner.desktop}
                    />
                    <img
                      src={banner.desktop}
                      alt={banner.alt}
                      className="size-full object-cover rounded-xl md:rounded-2xl lg:rounded-3xl"
                    />
                  </picture>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <div className="flex gap-1 justify-center absolute bottom-4 left-0 right-0 z-10">
          {banners.map((banner, index) => (
            <button
              key={banner.desktop}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              data-active={activeBanner === index}
              data-banner-pagination=""
              id={`banner-${index}`}
              className={`rounded-full h-[5px] transition-[width,background] duration-200 origin-center ${activeBanner === index ? "bg-white w-10 shadow-[0_0_35px_5px_rgba(243,178,57,0.35)] delay-300" : "w-3 bg-white/20"}`}
              onClick={() => {
                if (interactionLocked.current || activeBanner === index) return;
                interactionLocked.current = true;
                setSlideIndex(index + 1);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GameCard({ game }) {
  return (
    <a
      href={`/games/${game.slug}`}
      className="game-card pb-5 rounded-xl shadow-[0px_16px_25px_rgba(0,0,0,0.12)] relative overflow-hidden"
      style={{
        "--color": game.color,
        background: `radial-gradient(141.46% 89% at 50% 106.33%, rgba(var(--color), 0.65) 0%, rgba(34, 47, 89, 0) 100%), linear-gradient(0deg, rgba(var(--color), 0.05), rgba(var(--color), 0.05)), #222F59`,
      }}
    >
      <div className="glow" />
      <div className="flex items-center relative">
        <div className="flex-1 pb-[100%]" />
        <img
          src={`/games/${game.slug}.webp`}
          alt="Game"
          className="game-image"
        />
      </div>
      <img
        src={`/games/${game.slug}.webp`}
        alt="Game"
        className={`game-image-overlay -translate-1/2 ${game.overlay}`}
      />
      <div className="flex flex-col items-center game-text">
        <h3 className="font-bold text-2xl uppercase">{game.title}</h3>
        <h4 className="text-[#EEF2FB]/70 font-semibold text-[13px] uppercase">
          {game.subtitle}
        </h4>
      </div>
    </a>
  );
}

function LiveBets() {
  const [tab, setTab] = useState("All Bets");
  const shownBets =
    tab === "Lucky Wins"
      ? bets.filter((bet) => bet[6])
      : tab === "High Rollers"
        ? bets.filter((bet) => Number(bet[3].replace(",", "")) >= 1000)
        : bets;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 max-[530px]:flex-col max-[530px]:items-stretch">
        <div className="relative flex bg-[#2F3F71] p-1.5 rounded-[10px] w-max gap-0 max-[530px]:w-full max-[530px]:flex-wrap">
          {["All Bets", "High Rollers", "Lucky Wins"].map((label) => (
            <button
              key={label}
              type="button"
              className={`relative z-10 px-4 py-2 text-sm font-semibold text-center whitespace-nowrap transition-colors max-[530px]:w-1/2 rounded-lg ${tab === label ? "bg-primary text-[#3A3869] shadow-[0_3px_0_#D38502]" : "text-white"}`}
              onClick={() => setTab(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="bg-[#2F3F71] rounded-[10px] h-10 px-3.5 min-w-0 flex items-center justify-center gap-1.5 text-sm max-[530px]:w-full"
        >
          <span className="text-left truncate flex-1 min-w-0 font-medium">
            10
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      <div className="overflow-x-auto chat-scrollbar">
        <div className="w-full min-w-[880px]">
          <div className="flex text-left text-sm pb-3 text-accent/70 font-medium">
            <div className="pl-4 w-[15%]">GAME</div>
            <div className="w-[24%]">PLAYER</div>
            <div className="w-[11%]">DATE</div>
            <div className="w-[20%]">AMOUNT</div>
            <div className="w-[15%]">MULTIPLIER</div>
            <div className="pr-4 w-[15%] text-right">PROFIT</div>
          </div>
          <div
            className="flex flex-col gap-2"
            style={{ maskImage: "linear-gradient(#000 70%, transparent)" }}
          >
            {shownBets.map((bet, index) => (
              <div
                key={`${bet[1]}-${index}`}
                className={`flex text-left text-sm font-medium py-2.5 h-[56px] rounded-xl transition-all duration-300 ease-out cursor-pointer hover:opacity-80 ${index % 2 ? "bg-[#17203c]/75" : "bg-[#263462]/75"}`}
              >
                <div className="pl-4 flex items-center w-[15%]">
                  <span className="uppercase text-white font-semibold text-[#FFD896]">
                    {bet[0]}
                  </span>
                </div>
                <div className="text-white flex items-center gap-2 w-[24%]">
                  <div className="size-8 rounded-lg p-0.5 bg-linear-to-b from-[#343756] to-[#F33939]">
                    <div className="rounded-[6px] size-full flex items-center justify-center bg-[#1A2339] text-xs font-bold">
                      {bet[1][0]}
                    </div>
                  </div>
                  <span className="font-medium">{bet[1]}</span>
                </div>
                <div className="text-accent flex items-center w-[11%]">
                  {bet[2]}
                </div>
                <div className="flex items-center w-[20%]">
                  <div className="flex items-center gap-2">
                    <img src="/coin.webp" alt="" className="size-5" />
                    <span className="tabular-nums">{bet[3]}</span>
                  </div>
                </div>
                <div className="text-accent flex items-center w-[15%]">
                  {bet[4]}
                </div>
                <div className="pr-4 flex items-center justify-end w-[15%]">
                  <div
                    className={`flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg min-w-23 w-max ${bet[6] ? "bg-[#5CDF9A]/9 text-[#5CDF9A]" : "bg-accent/9 text-accent"}`}
                  >
                    <img src="/coin.webp" alt="" className="size-5" />
                    <span className="tabular-nums">{bet[5]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const footerLogoMarkup = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 983 185" class="w-[194px] h-[36px]"><path fill="url(#i-1853660109__a)" d="M32.528 28.723c2.438 0 4.267.678 5.486 2.032 1.22 1.355 2.032 2.303 2.439 2.845L72.97 90.097 105.486 33.6c.406-.542 1.22-1.49 2.438-2.845 1.22-1.354 3.048-2.032 5.487-2.032h27.029c1.49 0 2.71.542 3.658 1.626 1.084.948 1.626 2.167 1.626 3.658v131.689c0 1.49-.542 2.778-1.626 3.862-.948.948-2.168 1.422-3.658 1.422h-30.484c-1.49 0-2.777-.474-3.861-1.422-.948-1.084-1.423-2.372-1.423-3.862V99.852l-18.29 32.109c-.677 1.084-1.558 2.168-2.642 3.251-1.083 1.084-2.642 1.626-4.674 1.626H66.67c-1.896 0-3.387-.542-4.47-1.626-1.084-1.083-1.965-2.167-2.642-3.251l-18.29-32.11v65.845c0 1.49-.543 2.778-1.627 3.862-.948.948-2.167 1.422-3.657 1.422H5.498c-1.49 0-2.777-.474-3.86-1.422-1.084-1.084-1.626-2.372-1.626-3.862V34.006c0-1.49.542-2.709 1.626-3.657 1.084-1.084 2.37-1.626 3.86-1.626h27.03Z"></path><path fill="url(#i-1853660109__b)" d="M197.505 28.723c2.438 0 4.267.678 5.487 2.032 1.218 1.355 2.032 2.303 2.438 2.845l32.516 56.497L270.462 33.6c.406-.542 1.22-1.49 2.438-2.845 1.22-1.354 3.05-2.032 5.488-2.032h27.028c1.491 0 2.711.542 3.659 1.626 1.084.948 1.625 2.168 1.625 3.658v131.689c0 1.49-.541 2.778-1.625 3.862-.948.948-2.168 1.422-3.659 1.422h-30.483c-1.49 0-2.778-.474-3.861-1.422-.949-1.084-1.422-2.372-1.423-3.862V99.852l-18.29 32.109c-.677 1.084-1.559 2.167-2.642 3.251-1.084 1.084-2.642 1.626-4.673 1.626h-12.397c-1.897 0-3.388-.542-4.472-1.626-1.083-1.084-1.965-2.167-2.642-3.251l-18.289-32.11v65.845c0 1.49-.543 2.778-1.626 3.862-.949.948-2.168 1.422-3.658 1.422h-30.484c-1.49 0-2.778-.474-3.862-1.422-1.084-1.084-1.625-2.372-1.625-3.862V34.006c0-1.49.542-2.71 1.625-3.657 1.084-1.084 2.371-1.626 3.862-1.626h27.029Z"></path><path fill="url(#i-1853660109__c)" d="M386.055 26.081c11.923 0 22.152 1.829 30.687 5.487 6.84 2.931 12.418 6.82 16.735 11.665-1.317 4.565-2.105 7.242-2.649 8.95-.346 1.085-.514 1.525-.578 1.683-.013.03.01-.01-.055.107l-.069.124-.066.124c-.545 1.036-1.707 3.21-2.403 4.552-.737 1.357-2.196 4.071-3.3 6.144-.372.68-.77 1.419-1.161 2.15-10.917 2.829-15.922 15.535-9.779 25.014-.523 2.101-1.276 5.11-1.963 7.831a550.265 550.265 0 0 0-6.091-.061l-.488-.003c-1.533-.008-3.873.103-6.344.924-2.16.717-7.675 3.149-9.562 9.806-1.808 6.377 1.31 11.216 2.518 12.829 1.481 1.977 3.224 3.377 4.463 4.265l.557.397c.64.464 1.255.904 1.828 1.316a15.803 15.803 0 0 0 5.038 7.401c1.961 1.605 3.523 2.835 4.784 3.739.958.686 2.925 2.078 5.411 2.891 2.813.919 5.413.991 7.96.623 1.777-.257 3.84-.786 5.886-1.325 1.77-.457 4.127-1.122 6.09-1.775.404.067.878.148 1.443.243a461.71 461.71 0 0 0 8.116 1.352c.883.141 2.151.349 3.351.55v22.612c0 1.49-.542 2.778-1.626 3.862-.948.948-2.168 1.422-3.658 1.422H330.372c-1.49 0-2.777-.474-3.861-1.422-.948-1.084-1.423-2.372-1.423-3.862v-17.68c0-.949.203-2.507.61-4.675.542-2.167 2.033-4.132 4.471-5.893l11.787-11.178c12.464-9.212 22.829-17.002 31.093-23.37 8.264-6.503 14.43-12.126 18.494-16.868 4.2-4.742 6.299-9.145 6.299-13.21 0-3.25-.813-6.028-2.438-8.331-1.49-2.439-4.539-3.658-9.145-3.658-3.387 0-6.097.744-8.129 2.234-2.032 1.49-3.59 3.32-4.674 5.488-.948 2.168-1.694 4.268-2.236 6.3-.542 1.76-1.491 2.98-2.845 3.657-1.355.678-2.913 1.017-4.675 1.017h-31.702c-1.355 0-2.439-.407-3.252-1.22-.813-.948-1.219-2.032-1.219-3.25.135-7.18 1.626-13.684 4.471-19.51 2.981-5.961 7.045-11.178 12.193-15.649 5.148-4.47 11.245-7.858 18.29-10.161 7.181-2.439 15.039-3.658 23.574-3.658Z"></path><path fill="#fff" fill-rule="evenodd" d="M440.518 2.348c-.105-1.107 1.018-1.806 1.863-1.083 1.074.967 4.742 4.107 8.11 7.027 3.378 2.892 7.679 6.55 9.545 8.115 1.856 1.593 4.002 3.434 4.777 4.089.989.847 1.308 1.29 1.124 1.57a10.4 10.4 0 0 0-.67 1.014c-.336.51-.2.995 2.538 6.06a1.812 1.812 0 0 0 2.411.756 1.816 1.816 0 0 1 1.348-.118l12.99 3.953a35.612 35.612 0 0 0 5.87 1.258l4.126.524c2.925.379 6.582.842 11.134 1.364 3.108.356 6.205-.73 8.429-2.931a70.262 70.262 0 0 1 2.163-2.051c.814-.742 2.096-.507 2.401.551.238.763.647 2.12 1.372 4.527a7.188 7.188 0 0 0 4.311 4.638c1.814.685 4.14 1.6 5.21 2.01 1.06.44 2.753 1.116 3.823 1.528.935.387 3.049 1.205 7.613 2.958a4.416 4.416 0 0 0 3.227-.024c.199-.08.395-.173.583-.283 1.035-.618 2.097-1.505 2.474-2.091.367-.559 2.124-3.1 3.889-5.669 1.765-2.569 3.871-5.614 4.689-6.796.895-1.282 1.337-1.801 1.523-1.754.045.01.074.053.093.124.063.263.214 3.372.547 13.143a2.235 2.235 0 0 0 1.311 1.959l.251.12c.328.158.623.312.823.431.045.027.088.05.122.073.075.05.123.092.137.12.057.12.225 1.775.375 3.669.212 2.659.164 3.847-.2 4.961-.446 1.365-.732 1.675-4.544 4.84a69.781 69.781 0 0 1-2.219 1.742l-.251.191c-.3.224-.604.446-.912.666-.109.078-.217.158-.325.238-.496.365-.979.748-1.446 1.149-1.905 1.635-3.536 3.568-4.603 5.84a513.377 513.377 0 0 1-2.027 4.29c-.46.967-.955 2.004-1.462 3.062l-.294.615c-.767 1.596-1.549 3.219-2.271 4.706a3141.084 3141.084 0 0 1-6.275 13.062 774.575 774.575 0 0 0-4.441 9.344c-1.134 2.434-2.122 4.609-2.196 4.833-.091.279.291.62 1.241 1.116.996.484 1.097 1.299.324 2.092-.401.411-.884.895-1.406 1.409-.313.312-.611.617-.883.903-1.078 1.133-.872 2.351.437 3.207 1.723 1.149 1.751 1.159 1.338 1.949-.201.427-.355 1.087-.315 1.439.06.323.929 3.629 3.672 13.623a28.072 28.072 0 0 1 .97 8.767l-.274 5.705a7.617 7.617 0 0 0 .921 4.011c.742 1.414 1.145 1.885 1.683 1.938.483.034 1.726 1.427 4.964 5.599.271.353.54.71.808 1.066l.125.166c.245.326.488.653.728.98 1.129 1.537 2.188 3.062 3.051 4.462.143.231.258.474.348.723l.014.04c.054.152.097.308.132.465l.011.05c.034.167.06.336.073.505a4.45 4.45 0 0 1-.498 2.392c-1.082 2.017-3.088 3.302-5.112 4.37a1120.532 1120.532 0 0 1-12.354 6.405 7.967 7.967 0 0 1-4.027.863c-1.747-.072-3.4-.943-4.249-2.472a9.672 9.672 0 0 1-.233-.441c-.686-1.397-2.073-4.903-3.094-7.827-1.323-3.793-1.779-5.515-1.606-6.045.201-.617-.386-1.979-6.485-13.87a5.435 5.435 0 0 0-2.079-2.204l-.991-.582a3.4 3.4 0 0 0-3.36-.05 3.4 3.4 0 0 1-4.447-1.068l-.743-1.093a610.542 610.542 0 0 1-3.573-5.385 3.631 3.631 0 0 0-2.691-1.627c-1.522-.158-1.746-.231-1.85-.665-.039-.26-.035-1.308.014-2.31.023-.467.038-.911.042-1.262.005-.494-.279-.835-.742-.662-.324.141-1.936.447-3.586.679-.681.088-1.237.121-1.678.123-.802.003-1.336-.726-1.088-1.488.219-.669.198-1.078-.1-1.299-.243-.202-1.238-.466-2.213-.599-.975-.134-3.503-.527-5.583-.868-2.081-.34-7.349-1.228-11.715-1.945-4.357-.744-9.216-1.561-10.832-1.811a468.49 468.49 0 0 0-5.566-.923c-1.44-.224-5.015-.806-7.904-1.318-5.268-.888-5.269-.888-6.73-.193-.797.357-3.715 1.254-6.512 1.974-4.391 1.156-5.226 1.254-6.23.926-.687-.225-2.027-1.123-5.846-4.25a2.36 2.36 0 0 1-.776-2.454 2.37 2.37 0 0 0-.886-2.543l-.049-.037c-.746-.552-3.404-2.437-5.874-4.231l-.523-.374c-2.746-1.968-2.501-3.331.687-3.397l.318-.002.441.002c.805.002 1.673.008 2.555.016a750.58 750.58 0 0 1 6.977.106 137.06 137.06 0 0 0 .915.023c4.474.084 7.327-4.352 8.43-8.689.95-3.76 2.19-8.691 2.751-10.976.56-2.282 1.011-4.323 1.02-4.539-.001-.185-1.322-2.098-2.95-4.203-1.48-1.878-.481-4.544 1.865-5.004.908-.178 1.967-.382 3.195-.612a4.464 4.464 0 0 0 3.176-2.395c.54-1.087 1.916-3.692 3.062-5.785a992.449 992.449 0 0 1 3.312-6.166c.669-1.293 1.778-3.366 2.429-4.603 1.04-1.879 1.516-3.313 5.783-18.185.123-.427.42-.795.817-.996a1.601 1.601 0 0 0 .711-2.136l-.972-1.963c-1.541-3.161-1.679-3.403-3.845-4.124a.77.77 0 0 1-.524-.645l-1.117-9.914c-.658-5.735-1.521-13.111-1.894-16.41a177.344 177.344 0 0 1-.401-3.774Zm29.542 79.971c-.112-.036-.223.019-.269.158-.037.113-.724 1.462-1.531 2.986-.12.238-.239.47-.355.694-.798 1.535-2.085 1.905-3.448.839-1.082-.847-2.312-1.712-2.75-1.978-.736-.395-.949-.31-3.869 1.728-1.681 1.177-4.777 3.281-6.847 4.702-3.391 2.254-3.908 2.703-4.826 4.284-.588.95-1.607 2.651-2.287 3.786-.679 1.135-2.056 3.461-3.076 5.164a537.284 537.284 0 0 0-4.617 7.899c-1.542 2.641-3.057 5.199-3.398 5.674-.312.483-.624.967-.67 1.107-.035.113.469.74 1.076 1.431 1.037 1.079 1.141 1.33.849 2.129-.155.473-.225.974-.132 1.066.12.131 3.666.796 7.934 1.512 4.264.746 9.013 1.526 10.536 1.777 1.525.251 7.145 1.192 12.448 2.061 5.305.869 10.98 1.829 12.588 2.108 1.607.278 3.252.538 3.67.582.529.08 1.334-.398 2.967-1.807 1.235-1.044 2.268-1.94 2.298-2.025.027-.087-.299-1.735-.738-3.696-.43-1.991-1.015-4.742-1.33-6.14-.526-2.546-.517-2.574-1.248-2.227-.61.263-1 .228-2.349-.367-1.517-.65-1.732-.843-3.204-3.236a11.3 11.3 0 0 1-.811-1.551c-.435-1.045-.154-2.172.305-3.206.238-.536.5-1.138.724-1.679.695-1.694.951-3.54.703-5.354-.262-1.917-.396-2.561-.456-2.583-.085-.028-.66-.063-1.291-.114-.938-.06-1.264-.197-1.918-.935-.635-.7-.787-1.182-.711-2.453.04-.88.106-2.216.166-2.968.058-1.122-.254-2.057-1.899-5.34-1.108-2.18-2.094-3.98-2.234-4.028Zm50.385-22.865a27.52 27.52 0 0 0-12.57 1.526 2505.042 2505.042 0 0 1-6.105 2.243c-1.935.725-3.61 1.504-3.683 1.727-.101.214-.165 1.735-.192 3.33l-.007.285c-.041 1.762-1.39 3.167-3.129 2.885-1.551-.26-3.092-.455-3.408-.434-.473.03-.162.78 1.716 4.2 1.497 2.733 3.766 4.9 6.237 6.8.832.64.996.957 1.109 1.427.191.74.093 1.419-.318 2.487-.419 1.096-.482 1.57-.23 1.837.178.213 1.028 1.015 1.877 1.816a7.629 7.629 0 0 0 3.596 1.867l3.714.79a2.159 2.159 0 0 1 1.482 1.142c1.131 2.26 1.626 3.403 1.819 3.985.312 1.027.268 1.444-.28 2.838-.356.901-.776 1.813-.96 2-.268.252.135.815 1.573 2.272 1.074 1.06 2.895 2.95 4.035 4.186 1.177 1.217 2.251 2.275 2.419 2.331.169.054 1.502-.249 2.983-.628 1.939-.508 3.214-1.948 4.051-3.769.67-1.457 1.554-3.372 2.509-5.438 2.032-4.332 3.825-8.125 3.982-8.415.184-.28 1.027-2.009 1.878-3.858.851-1.85 2.647-5.642 3.956-8.422 1.338-2.77 3.287-6.853 4.35-9.066 1.081-2.175 2.061-4.323 2.197-4.74.219-.67.124-.855-.62-1.221-.661-.34-.896-.755-1.126-1.94-.24-1.157-.437-1.5-1.004-1.654-.39-.128-2.74-.402-5.2-.62-2.479-.255-5.767-.588-7.318-.755-1.551-.168-5.758-.617-9.333-1.014Z" clip-rule="evenodd"></path><path fill="url(#i-1853660109__d)" fill-rule="evenodd" d="M440.518 2.348c-.105-1.107 1.018-1.806 1.863-1.083 1.074.967 4.742 4.107 8.11 7.027 3.378 2.892 7.679 6.55 9.545 8.115 1.856 1.593 4.002 3.434 4.777 4.089.989.847 1.308 1.29 1.124 1.57a10.4 10.4 0 0 0-.67 1.014c-.336.51-.2.995 2.538 6.06a1.812 1.812 0 0 0 2.411.756 1.816 1.816 0 0 1 1.348-.118l12.99 3.953a35.612 35.612 0 0 0 5.87 1.258l4.126.524c2.925.379 6.582.842 11.134 1.364 3.108.356 6.205-.73 8.429-2.931a70.262 70.262 0 0 1 2.163-2.051c.814-.742 2.096-.507 2.401.551.238.763.647 2.12 1.372 4.527a7.188 7.188 0 0 0 4.311 4.638c1.814.685 4.14 1.6 5.21 2.01 1.06.44 2.753 1.116 3.823 1.528.935.387 3.049 1.205 7.613 2.958a4.416 4.416 0 0 0 3.227-.024c.199-.08.395-.173.583-.283 1.035-.618 2.097-1.505 2.474-2.091.367-.559 2.124-3.1 3.889-5.669 1.765-2.569 3.871-5.614 4.689-6.796.895-1.282 1.337-1.801 1.523-1.754.045.01.074.053.093.124.063.263.214 3.372.547 13.143a2.235 2.235 0 0 0 1.311 1.959l.251.12c.328.158.623.312.823.431.045.027.088.05.122.073.075.05.123.092.137.12.057.12.225 1.775.375 3.669.212 2.659.164 3.847-.2 4.961-.446 1.365-.732 1.675-4.544 4.84a69.781 69.781 0 0 1-2.219 1.742l-.251.191c-.3.224-.604.446-.912.666-.109.078-.217.158-.325.238-.496.365-.979.748-1.446 1.149-1.905 1.635-3.536 3.568-4.603 5.84a513.377 513.377 0 0 1-2.027 4.29c-.46.967-.955 2.004-1.462 3.062l-.294.615c-.767 1.596-1.549 3.219-2.271 4.706a3141.084 3141.084 0 0 1-6.275 13.062 774.575 774.575 0 0 0-4.441 9.344c-1.134 2.434-2.122 4.609-2.196 4.833-.091.279.291.62 1.241 1.116.996.484 1.097 1.299.324 2.092-.401.411-.884.895-1.406 1.409-.313.312-.611.617-.883.903-1.078 1.133-.872 2.351.437 3.207 1.723 1.149 1.751 1.159 1.338 1.949-.201.427-.355 1.087-.315 1.439.06.323.929 3.629 3.672 13.623a28.072 28.072 0 0 1 .97 8.767l-.274 5.705a7.617 7.617 0 0 0 .921 4.011c.742 1.414 1.145 1.885 1.683 1.938.483.034 1.726 1.427 4.964 5.599.271.353.54.71.808 1.066l.125.166c.245.326.488.653.728.98 1.129 1.537 2.188 3.062 3.051 4.462.143.231.258.474.348.723l.014.04c.054.152.097.308.132.465l.011.05c.034.167.06.336.073.505a4.45 4.45 0 0 1-.498 2.392c-1.082 2.017-3.088 3.302-5.112 4.37a1120.532 1120.532 0 0 1-12.354 6.405 7.967 7.967 0 0 1-4.027.863c-1.747-.072-3.4-.943-4.249-2.472a9.672 9.672 0 0 1-.233-.441c-.686-1.397-2.073-4.903-3.094-7.827-1.323-3.793-1.779-5.515-1.606-6.045.201-.617-.386-1.979-6.485-13.87a5.435 5.435 0 0 0-2.079-2.204l-.991-.582a3.4 3.4 0 0 0-3.36-.05 3.4 3.4 0 0 1-4.447-1.068l-.743-1.093a610.542 610.542 0 0 1-3.573-5.385 3.631 3.631 0 0 0-2.691-1.627c-1.522-.158-1.746-.231-1.85-.665-.039-.26-.035-1.308.014-2.31.023-.467.038-.911.042-1.262.005-.494-.279-.835-.742-.662-.324.141-1.936.447-3.586.679-.681.088-1.237.121-1.678.123-.802.003-1.336-.726-1.088-1.488.219-.669.198-1.078-.1-1.299-.243-.202-1.238-.466-2.213-.599-.975-.134-3.503-.527-5.583-.868-2.081-.34-7.349-1.228-11.715-1.945-4.357-.744-9.216-1.561-10.832-1.811a468.49 468.49 0 0 0-5.566-.923c-1.44-.224-5.015-.806-7.904-1.318-5.268-.888-5.269-.888-6.73-.193-.797.357-3.715 1.254-6.512 1.974-4.391 1.156-5.226 1.254-6.23.926-.687-.225-2.027-1.123-5.846-4.25a2.36 2.36 0 0 1-.776-2.454 2.37 2.37 0 0 0-.886-2.543l-.049-.037c-.746-.552-3.404-2.437-5.874-4.231l-.523-.374c-2.746-1.968-2.501-3.331.687-3.397l.318-.002.441.002c.805.002 1.673.008 2.555.016a750.58 750.58 0 0 1 6.977.106 137.06 137.06 0 0 0 .915.023c4.474.084 7.327-4.352 8.43-8.689.95-3.76 2.19-8.691 2.751-10.976.56-2.282 1.011-4.323 1.02-4.539-.001-.185-1.322-2.098-2.95-4.203-1.48-1.878-.481-4.544 1.865-5.004.908-.178 1.967-.382 3.195-.612a4.464 4.464 0 0 0 3.176-2.395c.54-1.087 1.916-3.692 3.062-5.785a992.449 992.449 0 0 1 3.312-6.166c.669-1.293 1.778-3.366 2.429-4.603 1.04-1.879 1.516-3.313 5.783-18.185.123-.427.42-.795.817-.996a1.601 1.601 0 0 0 .711-2.136l-.972-1.963c-1.541-3.161-1.679-3.403-3.845-4.124a.77.77 0 0 1-.524-.645l-1.117-9.914c-.658-5.735-1.521-13.111-1.894-16.41a177.344 177.344 0 0 1-.401-3.774Zm29.542 79.971c-.112-.036-.223.019-.269.158-.037.113-.724 1.462-1.531 2.986-.12.238-.239.47-.355.694-.798 1.535-2.085 1.905-3.448.839-1.082-.847-2.312-1.712-2.75-1.978-.736-.395-.949-.31-3.869 1.728-1.681 1.177-4.777 3.281-6.847 4.702-3.391 2.254-3.908 2.703-4.826 4.284-.588.95-1.607 2.651-2.287 3.786-.679 1.135-2.056 3.461-3.076 5.164a537.284 537.284 0 0 0-4.617 7.899c-1.542 2.641-3.057 5.199-3.398 5.674-.312.483-.624.967-.67 1.107-.035.113.469.74 1.076 1.431 1.037 1.079 1.141 1.33.849 2.129-.155.473-.225.974-.132 1.066.12.131 3.666.796 7.934 1.512 4.264.746 9.013 1.526 10.536 1.777 1.525.251 7.145 1.192 12.448 2.061 5.305.869 10.98 1.829 12.588 2.108 1.607.278 3.252.538 3.67.582.529.08 1.334-.398 2.967-1.807 1.235-1.044 2.268-1.94 2.298-2.025.027-.087-.299-1.735-.738-3.696-.43-1.991-1.015-4.742-1.33-6.14-.526-2.546-.517-2.574-1.248-2.227-.61.263-1 .228-2.349-.367-1.517-.65-1.732-.843-3.204-3.236a11.3 11.3 0 0 1-.811-1.551c-.435-1.045-.154-2.172.305-3.206.238-.536.5-1.138.724-1.679.695-1.694.951-3.54.703-5.354-.262-1.917-.396-2.561-.456-2.583-.085-.028-.66-.063-1.291-.114-.938-.06-1.264-.197-1.918-.935-.635-.7-.787-1.182-.711-2.453.04-.88.106-2.216.166-2.968.058-1.122-.254-2.057-1.899-5.34-1.108-2.18-2.094-3.98-2.234-4.028Zm50.385-22.865a27.52 27.52 0 0 0-12.57 1.526 2505.042 2505.042 0 0 1-6.105 2.243c-1.935.725-3.61 1.504-3.683 1.727-.101.214-.165 1.735-.192 3.33l-.007.285c-.041 1.762-1.39 3.167-3.129 2.885-1.551-.26-3.092-.455-3.408-.434-.473.03-.162.78 1.716 4.2 1.497 2.733 3.766 4.9 6.237 6.8.832.64.996.957 1.109 1.427.191.74.093 1.419-.318 2.487-.419 1.096-.482 1.57-.23 1.837.178.213 1.028 1.015 1.877 1.816a7.629 7.629 0 0 0 3.596 1.867l3.714.79a2.159 2.159 0 0 1 1.482 1.142c1.131 2.26 1.626 3.403 1.819 3.985.312 1.027.268 1.444-.28 2.838-.356.901-.776 1.813-.96 2-.268.252.135.815 1.573 2.272 1.074 1.06 2.895 2.95 4.035 4.186 1.177 1.217 2.251 2.275 2.419 2.331.169.054 1.502-.249 2.983-.628 1.939-.508 3.214-1.948 4.051-3.769.67-1.457 1.554-3.372 2.509-5.438 2.032-4.332 3.825-8.125 3.982-8.415.184-.28 1.027-2.009 1.878-3.858.851-1.85 2.647-5.642 3.956-8.422 1.338-2.77 3.287-6.853 4.35-9.066 1.081-2.175 2.061-4.323 2.197-4.74.219-.67.124-.855-.62-1.221-.661-.34-.896-.755-1.126-1.94-.24-1.157-.437-1.5-1.004-1.654-.39-.128-2.74-.402-5.2-.62-2.479-.255-5.767-.588-7.318-.755-1.551-.168-5.758-.617-9.333-1.014Z" clip-rule="evenodd"></path><path fill="#fff" d="M690.836 28.721c1.625 0 2.641.543 3.048 1.627.541.948.542 2.167 0 3.657l-50.806 130.878c-.678 1.761-1.762 3.251-3.252 4.47-1.355 1.084-3.048 1.626-5.08 1.626h-14.43c-2.032 0-3.522-.542-4.47-1.626-.949-1.084-1.491-2.236-1.626-3.455l-9.552-67.673-35.564 67.673c-.677 1.219-1.694 2.371-3.049 3.455s-3.048 1.626-5.08 1.626h-1.922c-.034-3-.83-6.09-2.597-8.954-1.635-2.65-3.66-5.418-5.492-7.804l-.02-.027-.02-.027c-1.616-2.082-2.981-3.792-4.084-5.035a37.045 37.045 0 0 0-.529-.581l.131-2.732a41.546 41.546 0 0 0-1.435-12.977 2123.348 2123.348 0 0 1-2.783-10.222c.17-1.26.196-2.75-.106-4.382a14.207 14.207 0 0 0 .887-7.475 14.877 14.877 0 0 0-.176-.965 777.243 777.243 0 0 1 3.533-7.419c1.341-2.76 4.173-8.665 6.312-13.138 2.156-4.443 4.878-10.137 6.094-12.76.099-.212.553-.947 2.012-1.99a78.768 78.768 0 0 0 4.085-3.14l.069-.056c1.615-1.34 3.435-2.836 4.752-4.24.071-.075.141-.154.213-.233l-1.404 56.603 30.687-58.123c.541-1.084 1.422-2.167 2.641-3.251 1.219-1.22 2.845-1.829 4.877-1.829h10.975c2.167 0 3.59.61 4.267 1.829.677 1.084 1.084 2.167 1.219 3.251l6.301 59.342 36.376-91.858c1.084-2.71 3.252-4.064 6.503-4.065h18.495ZM736.076 28.721c1.355 0 2.439.475 3.252 1.424.813.948 1.083 2.1.813 3.454l-28.452 132.503c-.271 1.354-.948 2.507-2.031 3.455-1.084.948-2.304 1.422-3.658 1.422h-19.307c-1.355 0-2.439-.474-3.252-1.422-.677-.948-.88-2.101-.61-3.455L711.08 33.599c.271-1.355.949-2.506 2.033-3.454 1.083-.949 2.37-1.424 3.86-1.424h19.103ZM790.302 28.721c1.49 0 2.575.475 3.252 1.424.813.948 1.083 2.1.813 3.454l-24.184 113.196h64.422c1.49 0 2.575.474 3.252 1.422.813.949 1.084 2.169.813 3.659l-3.049 14.226c-.271 1.354-.948 2.507-2.031 3.455-1.084.948-2.372 1.422-3.862 1.422h-88.199c-1.49 0-2.642-.474-3.455-1.422-.677-.948-.881-2.101-.61-3.455l28.249-132.503c.271-1.355.948-2.506 2.031-3.454 1.084-.949 2.372-1.424 3.862-1.424h18.696Z"></path><path fill="#fff" fill-rule="evenodd" d="M928.743 28.721c8.941 0 17.003 1.22 24.183 3.658 7.181 2.303 13.142 5.827 17.884 10.568 4.742 4.606 8.061 10.366 9.958 17.275 1.897 6.91 2.033 14.836.407 23.777-1.219 5.961-2.303 11.246-3.251 15.852-.949 4.606-2.169 9.822-3.659 15.648-2.981 12.599-7.248 23.032-12.803 31.296-5.419 8.129-12.668 14.226-21.745 18.291-8.942 3.928-20.39 5.893-34.345 5.893h-53.244c-1.49 0-2.642-.474-3.455-1.422-.677-.948-.881-2.101-.61-3.455l28.249-132.3c.27-1.49.948-2.709 2.031-3.657 1.084-.949 2.371-1.423 3.861-1.424h46.539Zm-48.368 118.887h26.013c7.587 0 13.955-1.084 19.104-3.251 5.283-2.168 9.55-5.624 12.802-10.365 3.251-4.878 5.758-11.245 7.52-19.103 1.083-4.064 1.965-7.587 2.642-10.568a274.062 274.062 0 0 0 1.829-9.144c.677-3.116 1.354-6.64 2.032-10.568 2.167-11.11 1.151-19.307-3.048-24.59-4.065-5.285-11.923-7.926-23.575-7.926h-24.996l-20.323 95.515Z" clip-rule="evenodd"></path><defs><linearGradient id="i-1853660109__a" x1=".012" x2="970.497" y1="70.806" y2="202.24" gradientUnits="userSpaceOnUse"><stop stop-color="#B6CEFF"></stop><stop offset=".245" stop-color="#F3F5FF"></stop><stop offset=".476" stop-color="#FFCD79"></stop></linearGradient><linearGradient id="i-1853660109__b" x1=".012" x2="970.497" y1="70.806" y2="202.24" gradientUnits="userSpaceOnUse"><stop stop-color="#B6CEFF"></stop><stop offset=".245" stop-color="#F3F5FF"></stop><stop offset=".476" stop-color="#FFCD79"></stop></linearGradient><linearGradient id="i-1853660109__c" x1=".012" x2="970.497" y1="70.806" y2="202.24" gradientUnits="userSpaceOnUse"><stop stop-color="#B6CEFF"></stop><stop offset=".245" stop-color="#F3F5FF"></stop><stop offset=".476" stop-color="#FFCD79"></stop></linearGradient><linearGradient id="i-1853660109__d" x1="760.726" x2="768.466" y1=".97" y2="157.961" gradientUnits="userSpaceOnUse"><stop offset=".114" stop-color="#FFE2B1"></stop><stop offset=".519" stop-color="#fff"></stop><stop offset=".85" stop-color="#FFCD79"></stop></linearGradient></defs></svg>`;

export const footerLogoInnerMarkup = footerLogoMarkup.slice(
  footerLogoMarkup.indexOf(">") + 1,
  footerLogoMarkup.lastIndexOf("</svg>"),
);

function SocialButton({ href, label, gradient, path }) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5"
    >
      <div
        className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none bg-[#34447C]"
        style={{ top: "var(--sb-shadow-size,3px)" }}
      />
      <div
        className={`rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3 ${gradient} *:drop-shadow-[0_2px_0_#34447C]`}
        style={{ height: "calc(100% - var(--sb-shadow-size,3px))" }}
      >
        <div className="transition-opacity flex items-center justify-center size-full">
          <span className="text-sm hidden md:block">{label}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-4.5 md:ml-1.5"
          >
            <path fill="currentColor" d={path} />
          </svg>
        </div>
      </div>
    </a>
  );
}

export function Footer() {
  const linkClass =
    "text-sm text-accent hover:text-accent-light transition-colors font-medium";
  const isHomePage = window.location.pathname === "/";
  const isTermsPage = window.location.pathname === "/terms";
  return (
    <footer
      className="flex flex-col md:flex-row gap-8 md:gap-4 justify-between p-10 relative"
      style={{
        background:
          "radial-gradient(100% 189% at 100% 100%, rgba(243,178,57,.1) 0%, rgba(32,44,84,0) 100%), radial-gradient(48.14% 138.34% at 12% 207.44%, rgba(201,126,0,.74) 0%, rgba(201,126,0,0) 100%), linear-gradient(0deg,#212E5B,#212E5B),#182245",
      }}
    >
      <div className="flex flex-col gap-4 max-w-140">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 983 185"
          className="w-[194px] h-[36px]"
          dangerouslySetInnerHTML={{ __html: footerLogoInnerMarkup }}
        />
        <p className="text-sm text-accent font-medium">
          MM2Wild is an independent platform and is not affiliated with,
          endorsed by, or connected to Roblox Corporation, its subsidiaries, or
          affiliates in any manner.
        </p>
        <div className="flex gap-3">
          <SocialButton
            href="https://x.com/mm2wild"
            label="TWITTER"
            gradient="bg-gradient-to-r from-[#03A9F4] to-[#4D5C88]"
            path="M22.213 5.656a8.4 8.4 0 0 1-2.402.658A4.2 4.2 0 0 0 21.649 4c-.82.488-1.719.83-2.655 1.015a4.182 4.182 0 0 0-7.126 3.814 11.87 11.87 0 0 1-8.621-4.37 4.17 4.17 0 0 0-.566 2.103c0 1.45.739 2.731 1.86 3.481a4.2 4.2 0 0 1-1.894-.523v.051a4.185 4.185 0 0 0 3.355 4.102 4.2 4.2 0 0 1-1.89.072A4.185 4.185 0 0 0 8.02 16.65a8.4 8.4 0 0 1-6.192 1.732 11.83 11.83 0 0 0 6.41 1.88c7.694 0 11.9-6.373 11.9-11.9q0-.271-.012-.541a8.5 8.5 0 0 0 2.086-2.164"
          />
          <SocialButton
            href="https://discord.gg/mm2wild"
            label="DISCORD"
            gradient="bg-gradient-to-r from-[#5460E6] to-[#4E5C88]"
            path="M19.303 5.337A17.3 17.3 0 0 0 14.963 4c-.191.329-.403.775-.552 1.125a16.6 16.6 0 0 0-4.808 0C9.454 4.775 9.23 4.329 9.05 4a17 17 0 0 0-4.342 1.337C1.961 9.391 1.218 13.35 1.59 17.255a17.7 17.7 0 0 0 5.318 2.664 13 13 0 0 0 1.136-1.836c-.627-.234-1.22-.52-1.794-.86.149-.106.297-.223.435-.34 3.46 1.582 7.207 1.582 10.624 0 .149.117.287.234.435.34-.573.34-1.167.626-1.793.86a13 13 0 0 0 1.135 1.836 17.6 17.6 0 0 0 5.318-2.664c.457-4.52-.722-8.448-3.1-11.918M8.52 14.846c-1.04 0-1.889-.945-1.889-2.101s.828-2.102 1.89-2.102c1.05 0 1.91.945 1.888 2.102 0 1.156-.838 2.1-1.889 2.1m6.974 0c-1.04 0-1.89-.945-1.89-2.101s.828-2.102 1.89-2.102c1.05 0 1.91.945 1.889 2.102 0 1.156-.828 2.1-1.89 2.1"
          />
          <SocialButton
            href="https://kick.com/mm2wild"
            label="KICK"
            gradient="bg-gradient-to-r from-[#54E66F] to-[#4E5C88]"
            path="M3 3h18v18H3zm7.564 2.536h-4.31v12.928h4.31V15.59H12v1.436h1.436v1.436h4.31v-4.309h-1.437v-1.436h-1.436v-1.436h1.436V9.845h1.436V5.536h-4.309v1.436H12V8.41h-1.436z"
          />
        </div>
        <p className="text-sm text-accent font-medium">
          Get started &amp; explore our many free play options! Find out more{" "}
          <a
            aria-current={isHomePage ? "page" : undefined}
            href="/"
            className={`${isHomePage ? "router-link-active router-link-exact-active " : ""}text-primary font-medium hover:underline`}
          >
            here
          </a>
          .
        </p>
        <p className="text-sm text-accent font-medium">
          © 2025 MM2Wild.com. All Rights Reserved.
        </p>
      </div>
      <div className="flex justify-between flex-wrap gap-15">
        <div className="flex flex-col gap-4">
          <p className="text-primary font-semibold">GAMEMODES</p>
          <div className="flex flex-col gap-2">
            <a href="/games/cases" className={linkClass}>
              Cases
            </a>
            <a href="/games/battles" className={linkClass}>
              Case Battles
            </a>
            <a href="/games/coinflip" className={linkClass}>
              Coinflip
            </a>
            <a href="/games/upgrader" className={linkClass}>
              Upgrader
            </a>
            <a href="/games/roulette" className={linkClass}>
              Roulette
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-primary font-semibold">LINKS</p>
          <div className="flex flex-col gap-2">
            <a href="/fairness" className={linkClass}>
              Provably Fair
            </a>
            <a
              aria-current={isTermsPage ? "page" : undefined}
              href="/terms"
              className={`${isTermsPage ? "router-link-active router-link-exact-active " : ""}${linkClass}`}
            >
              TOS
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-primary font-semibold">SUPPORT</p>
          <div className="flex flex-col gap-2">
            <button className={linkClass}>
              Live Support
            </button>
            <a
              href="https://discord.gg/mm2wild"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="site-content">
      <div className="max-w-[1296px] mx-auto flex flex-col px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content home-page py-6 flex flex-col gap-12.5">
          <BannerCarousel />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">OUR GAMES</h2>
              <div className="h-0.5 flex-1 bg-linear-to-r from-accent/25 to-[#E5AD4E]/0" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
              {games.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          </div>
          <LiveBets />
        </div>
      </div>
    </div>
  );
}
