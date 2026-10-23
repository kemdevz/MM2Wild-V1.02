import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import SignInModal from "./SignInModal";
import { showNotification } from "./NotificationCenter";
import WhatIsThisModal from "./WhatIsThisModal";
import ProfileDropdown from "./ProfileDropdown";
import WalletModal from "./WalletModal";

async function preloadImage(source) {
  if (!source) return;
  const image = new Image();
  image.src = source;
  try {
    await image.decode();
  } catch {
  }
}

function GamesDropdown({ style, selectedGame, onSelect }) {
  const selectGame = (event, game) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    onSelect(game);
  };

  return (
    <div data-reka-popper-content-wrapper="" style={style}>
      <div
        data-dismissable-layer=""
        tabIndex={-1}
        className="shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-[#263457] flex w-40 min-w-40 flex-col gap-1.5 rounded-lg p-2 z-100"
        id="reka-popover-content-v-0-9"
        data-state="open"
        aria-labelledby="reka-popover-trigger-v-0-0"
        role="dialog"
        data-side="bottom"
        data-align="center"
        style={{
          "--reka-popover-content-transform-origin":
            "var(--reka-popper-transform-origin)",
          "--reka-popover-content-available-width":
            "var(--reka-popper-available-width)",
          "--reka-popover-content-available-height":
            "var(--reka-popper-available-height)",
          "--reka-popover-trigger-width": "var(--reka-popper-anchor-width)",
          "--reka-popover-trigger-height": "var(--reka-popper-anchor-height)",
          scale: "var(--games-dropdown-scale, 1)",
          transformOrigin: "top left",
        }}
      >
        <a
          href="/games/battles"
          className="h-9.5 relative group/button"
          type="button"
          onClick={(event) => selectGame(event, "/games/battles")}
        >
          <div className="absolute top-1/3 left-0 right-0 bottom-0 bg-[#344986] rounded-lg" />
          <div
            className="group/dropdown-item h-[calc(100%-3px)] *:drop-shadow-[0_2px_0_#344986] flex items-center gap-2 select-none rounded-lg px-2.5 text-sm font-medium outline-none cursor-pointer relative hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-125 bg-[#57689A]"
            data-active={selectedGame === "/games/battles"}
          >
            <div className="group-data-[active=true]/dropdown-item:opacity-100 opacity-0 transition-opacity absolute inset-0 p-0.5 rounded-lg bg-gradient-to-tr from-[#E5AD4E] via-[#E5AD4E]/11 to-[#E5AD4E]/45 !drop-shadow-none">
              <div className="size-full rounded-[6px] bg-linear-to-r from-[#36449E]/60 to-[#36449E] drop-shadow-none!" />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 16"
              className="size-4.5 transition-colors group-data-[active=true]/dropdown-item:text-[#FFD896]"
            >
              <path
                fill="currentColor"
                d="m4.23 13.096-1.418 1.417V16H0v-2.813h1.487l1.417-1.417 1.326 1.326Zm10.283.091H16V16h-2.813v-1.487l-1.417-1.417 1.326-1.326 1.417 1.418Zm-7.24-2.328-.761.642c.411.716.319 1.645-.292 2.257L2.242 9.78A1.862 1.862 0 0 1 4.5 9.488l.477-.564 2.296 1.935Zm4.23-1.373a1.861 1.861 0 0 1 2.255.294L9.78 13.758a1.873 1.873 0 0 1-.294-2.255L0 3.497V0h3.497l8.006 9.486ZM16 0v3.499l-4.862 4.104-2.525-2.996L12.501 0H16ZM1.67 2.334 5.018 5.68l.663-.663L2.334 1.67l-.663.663Zm8.65 2.683.663.663 3.346-3.346-.663-.663-3.346 3.346Z"
              />
            </svg>
            <p className="font-semibold">Case Battles</p>
          </div>
        </a>
        <a
          href="/games/cases"
          className="h-9.5 relative group/button"
          type="button"
          onClick={(event) => selectGame(event, "/games/cases")}
        >
          <div className="absolute top-1/3 left-0 right-0 bottom-0 bg-[#344986] rounded-lg" />
          <div
            className="group/dropdown-item h-[calc(100%-3px)] *:drop-shadow-[0_2px_0_#344986] flex items-center gap-2 select-none rounded-lg px-2.5 text-sm font-medium outline-none cursor-pointer relative hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-125 bg-[#57689A]"
            data-active={selectedGame === "/games/cases"}
          >
            <div className="group-data-[active=true]/dropdown-item:opacity-100 opacity-0 transition-opacity absolute inset-0 p-0.5 rounded-lg bg-gradient-to-tr from-[#E5AD4E] via-[#E5AD4E]/11 to-[#E5AD4E]/45 !drop-shadow-none">
              <div className="size-full rounded-[6px] bg-linear-to-r from-[#36449E]/60 to-[#36449E] drop-shadow-none!" />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 14"
              className="size-4.5 transition-colors group-data-[active=true]/dropdown-item:text-[#FFD896]"
            >
              <path
                fill="currentColor"
                d="m.456 3.777 1.768-2.273a.364.364 0 0 1 .287-.14h1.871c.277 0 .453.298.318.54L3.437 4.177a.364.364 0 0 1-.318.187H.744a.364.364 0 0 1-.288-.587ZM2.057 13.094.122 5.82a.364.364 0 0 1 .351-.457h3.118c.165 0 .31.11.352.27l1.935 7.272a.364.364 0 0 1-.351.458H2.409a.364.364 0 0 1-.352-.27ZM13.943 13.094l1.935-7.273a.364.364 0 0 0-.351-.457h-3.118c-.165 0-.31.11-.352.27l-1.935 7.272a.364.364 0 0 0 .351.458h3.118c.165 0 .31-.111.352-.27ZM15.543 3.777l-1.767-2.273a.364.364 0 0 0-.287-.14h-1.871a.364.364 0 0 0-.318.54l1.263 2.273a.364.364 0 0 0 .318.187h2.376a.364.364 0 0 0 .287-.587ZM8 1.54l-.467 1.13A2.741 2.741 0 0 1 5 4.363L6.014.887a.727.727 0 0 1 .698-.523h2.576c.323 0 .608.213.698.523L11 4.364a2.83 2.83 0 0 1-2.668-1.886L8 1.54ZM7.752 7.932 5.419 5.755a.182.182 0 0 0-.302.17l1.43 6.86c.07.337.367.579.711.579h1.484a.727.727 0 0 0 .712-.58l1.43-6.86a.182.182 0 0 0-.303-.17L8.248 7.933a.364.364 0 0 1-.496 0Z"
              />
              <path
                fill="currentColor"
                d="M9.419 4.61 11 4.894l-1.671.452c-.42.114-.766.409-.945.805L8 7l-.384-.848a1.455 1.455 0 0 0-.945-.805L5 4.895l1.581-.286c.471-.085.87-.396 1.067-.832L8 3l.352.777c.197.436.596.747 1.067.832Z"
              />
            </svg>
            <p className="font-semibold">Cases</p>
          </div>
        </a>
        <a
          href="/games/coinflip"
          className="h-9.5 relative group/button"
          type="button"
          onClick={(event) => selectGame(event, "/games/coinflip")}
        >
          <div className="absolute top-1/3 left-0 right-0 bottom-0 bg-[#344986] rounded-lg" />
          <div
            className="group/dropdown-item h-[calc(100%-3px)] *:drop-shadow-[0_2px_0_#344986] flex items-center gap-2 select-none rounded-lg px-2.5 text-sm font-medium outline-none cursor-pointer relative hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-125 bg-[#57689A]"
            data-active={selectedGame === "/games/coinflip"}
          >
            <div className="group-data-[active=true]/dropdown-item:opacity-100 opacity-0 transition-opacity absolute inset-0 p-0.5 rounded-lg bg-gradient-to-tr from-[#E5AD4E] via-[#E5AD4E]/11 to-[#E5AD4E]/45 !drop-shadow-none">
              <div className="size-full rounded-[6px] bg-linear-to-r from-[#36449E]/60 to-[#36449E] drop-shadow-none!" />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 512 512"
              className="size-4.5 transition-colors group-data-[active=true]/dropdown-item:text-[#FFD896]"
            >
              <path
                fill="currentColor"
                d="M256 136c88.4 0 160 28.7 160 64s-71.6 64-160 64-160-28.7-160-64 71.6-64 160-64Zm0 216C114.6 352 0 287.5 0 208S114.6 64 256 64s256 64.5 256 144-114.6 144-256 144Zm-125.9-77.9c34.5 14.3 78.7 21.9 125 21.9 48.1 0 92.3-7.6 125.9-21.9 16.7-5.8 32.4-14.6 44.4-25.9 12.1-11.5 22.6-27.7 22.6-48.2 0-20.5-10.5-36.7-22.6-48.2-12-11.3-27.7-20.1-44.4-26.8-33.6-13.4-77.8-21-125.9-21-46.3 0-90.5 7.6-125 21-15.8 6.7-31.5 15.5-43.51 26.8C74.5 163.3 63.1 179.5 63.1 200c0 20.5 11.4 36.7 23.49 48.2 12.01 11.3 27.71 20.1 43.51 25.9ZM0 290.1c13.21 15.7 29.72 29.4 48 40v64.5c-30.21-21-48-46.7-48-74.6v-29.9Zm80 122v-63.8c28.4 13.1 60.9 23 96 29v64.3c-36.2-5.9-68.9-15.8-96-29.5Zm128-30.5c15.7 1.6 31.7 2.4 48 2.4s32.3-.8 48-2.4v64.2c-15.5 1.4-31.6 2.2-48 2.2s-32.5-.8-48-2.2v-64.2Zm128 60v-64.3c35.1-6 67.6-15.9 96-29v63.8c-27.1 13.7-59.8 23.6-96 29.5Zm128-111.5c18.3-10.6 34.8-24.3 48-40V320c0 27.9-17.8 53.6-48 74.6v-64.5Z"
              />
            </svg>
            <p className="font-semibold">Coinflip</p>
          </div>
        </a>
        <a
          href="/games/roulette"
          className="h-9.5 relative group/button"
          type="button"
          onClick={(event) => selectGame(event, "/games/roulette")}
        >
          <div className="absolute top-1/3 left-0 right-0 bottom-0 bg-[#344986] rounded-lg" />
          <div
            className="group/dropdown-item h-[calc(100%-3px)] *:drop-shadow-[0_2px_0_#344986] flex items-center gap-2 select-none rounded-lg px-2.5 text-sm font-medium outline-none cursor-pointer relative hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-125 bg-[#57689A]"
            data-active={selectedGame === "/games/roulette"}
          >
            <div className="group-data-[active=true]/dropdown-item:opacity-100 opacity-0 transition-opacity absolute inset-0 p-0.5 rounded-lg bg-gradient-to-tr from-[#E5AD4E] via-[#E5AD4E]/11 to-[#E5AD4E]/45 !drop-shadow-none">
              <div className="size-full rounded-[6px] bg-linear-to-r from-[#36449E]/60 to-[#36449E] drop-shadow-none!" />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 31 31"
              className="size-4.5 transition-colors group-data-[active=true]/dropdown-item:text-[#FFD896]"
            >
              <path
                fill="currentColor"
                d="M4.149 20.542c.474-.255.656-.84.468-1.345a8.924 8.924 0 0 1-.374-1.302C4.14 17.39 3.716 17 3.202 17H1.074c-.58 0-1.042.494-.952 1.067C.29 19.12.587 20.133 1 21.09c.22.51.834.695 1.323.432l1.826-.981ZM18.067.122C17.494.032 17 .494 17 1.074v2.128c0 .514.391.938.895 1.041.446.092.88.218 1.302.374.506.188 1.09.006 1.345-.468l.982-1.829c.263-.488.08-1.1-.43-1.32a12.502 12.502 0 0 0-3.027-.878ZM10.194 10.194c-2.925 2.925-2.925 7.687 0 10.612s7.687 2.925 10.612 0 2.925-7.687 0-10.612-7.687-2.925-10.612 0Zm9.53 3.395c-.26.382-1.065.186-1.467.27-.904.191-1.329.984-1.986 1.633.685.604.917 1.639 1.821 1.821.305.061 1.185-.381 1.42-.146a1.662 1.662 0 0 1-.24 2.552 1.66 1.66 0 0 1-1.857.008c-.381-.26-.02-1.229-.106-1.63-.19-.905-1.148-1.165-1.797-1.822-.604.685-1.47 1.078-1.652 1.982-.061.305.212 1.024-.023 1.26a1.662 1.662 0 0 1-2.552-.24 1.66 1.66 0 0 1-.008-1.858c.26-.381 1.064-.194 1.466-.279.904-.19 1.329-.975 1.986-1.624-.685-.604-1.078-1.47-1.982-1.652-.304-.061-1.024.212-1.26-.023a1.664 1.664 0 0 1 .244-2.556 1.66 1.66 0 0 1 1.858-.008c.382.26.19 1.068.275 1.47.19.904.979 1.325 1.628 1.982.604-.685 1.466-1.082 1.648-1.986.061-.305-.208-1.02.027-1.255a1.664 1.664 0 0 1 2.556.243 1.66 1.66 0 0 1 .008 1.858h-.008ZM10.458 4.149c.255.474.84.656 1.345.468a8.924 8.924 0 0 1 1.302-.374c.504-.103.895-.527.895-1.041V1.074c0-.58-.493-1.042-1.067-.952A12.615 12.615 0 0 0 9.91 1c-.51.22-.695.834-.432 1.323l.981 1.826ZM12.933 30.878c.574.09 1.067-.372 1.067-.952v-2.128c0-.514-.391-.938-.895-1.041a8.93 8.93 0 0 1-1.302-.374c-.506-.188-1.09-.006-1.345.468l-.982 1.829c-.263.488-.08 1.1.43 1.32.958.416 1.973.712 3.027.878ZM20.542 26.851c-.255-.474-.84-.656-1.345-.468a8.93 8.93 0 0 1-1.302.374c-.504.103-.895.527-.895 1.041v2.128c0 .58.494 1.043 1.067.952A12.608 12.608 0 0 0 21.09 30c.51-.22.695-.834.432-1.323l-.981-1.826ZM.122 12.933C.032 13.507.494 14 1.074 14h2.128c.514 0 .938-.391 1.041-.895.092-.446.218-.88.374-1.302.188-.506.006-1.09-.468-1.345L2.32 9.476c-.488-.263-1.1-.08-1.32.43a12.502 12.502 0 0 0-.878 3.027ZM25.218 22.454c-.446-.257-1.01-.13-1.345.261-.354.416-.74.802-1.155 1.157-.392.335-.52.902-.262 1.349l1.07 1.852c.29.502.946.655 1.401.298.91-.714 1.73-1.534 2.444-2.444.357-.455.204-1.111-.298-1.4l-1.855-1.073ZM8.546 25.218c.257-.446.13-1.01-.262-1.345a10.34 10.34 0 0 1-1.156-1.155c-.335-.392-.902-.52-1.349-.262l-1.852 1.07c-.502.29-.655.946-.298 1.401.714.91 1.534 1.73 2.444 2.444.455.357 1.111.204 1.4-.298l1.073-1.855ZM5.782 8.546c.446.257 1.01.13 1.345-.262.354-.415.74-.801 1.155-1.156.392-.335.52-.902.262-1.349l-1.07-1.852c-.29-.502-.946-.655-1.401-.298-.91.714-1.73 1.534-2.444 2.444-.357.455-.204 1.111.298 1.4l1.855 1.073ZM30.878 18.067c.09-.573-.372-1.067-.952-1.067h-2.128c-.514 0-.938.391-1.041.895a8.93 8.93 0 0 1-.374 1.302c-.188.506-.006 1.09.468 1.345l1.829.982c.488.263 1.1.08 1.32-.43.416-.958.712-1.973.878-3.027ZM26.851 10.458c-.474.255-.656.84-.468 1.345.156.421.282.856.374 1.302.103.504.527.895 1.041.895h2.128c.58 0 1.043-.493.952-1.067A12.608 12.608 0 0 0 30 9.91c-.22-.51-.834-.695-1.323-.432l-1.826.981ZM22.454 5.782c-.257.446-.13 1.01.261 1.345.416.354.802.74 1.157 1.155.335.392.902.52 1.349.262l1.852-1.07c.502-.29.655-.946.298-1.401a14.442 14.442 0 0 0-2.444-2.444c-.455-.357-1.111-.204-1.4.298l-1.073 1.855Z"
              />
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M24.864 17.108a.245.245 0 0 1-.29.197.256.256 0 0 1-.2-.294 9.071 9.071 0 0 0 0-3.022.256.256 0 0 1 .2-.295.245.245 0 0 1 .29.198 9.556 9.556 0 0 1 0 3.216Zm-1.606-7.092a.245.245 0 0 1-.066.345.256.256 0 0 1-.35-.067 9.055 9.055 0 0 0-2.136-2.136.255.255 0 0 1-.067-.35.245.245 0 0 1 .345-.066 9.553 9.553 0 0 1 2.274 2.274Zm-6.15-3.88a.245.245 0 0 1 .197.29.255.255 0 0 1-.294.2 9.063 9.063 0 0 0-3.022 0 .255.255 0 0 1-.295-.2.245.245 0 0 1 .198-.29 9.564 9.564 0 0 1 3.216 0Zm-7.092 1.606a.245.245 0 0 1 .345.066.255.255 0 0 1-.067.35 9.055 9.055 0 0 0-2.136 2.136.255.255 0 0 1-.35.067.245.245 0 0 1-.066-.345 9.553 9.553 0 0 1 2.274-2.274Zm-3.59 5.952a.245.245 0 0 0-.29.198 9.564 9.564 0 0 0 0 3.216.245.245 0 0 0 .29.197.255.255 0 0 0 .2-.294 9.063 9.063 0 0 1 0-3.022.255.255 0 0 0-.2-.295Zm1.316 7.29a.245.245 0 0 1 .066-.345.255.255 0 0 1 .35.067 9.055 9.055 0 0 0 2.136 2.136c.113.08.143.235.067.35a.245.245 0 0 1-.345.066 9.553 9.553 0 0 1-2.274-2.274Zm6.15 3.88a.245.245 0 0 1-.197-.29.256.256 0 0 1 .294-.2 9.071 9.071 0 0 0 3.022 0 .256.256 0 0 1 .294.2.245.245 0 0 1-.197.29 9.556 9.556 0 0 1-3.216 0Zm7.092-1.606a.245.245 0 0 1-.345-.066.256.256 0 0 1 .067-.35 9.055 9.055 0 0 0 2.136-2.136.256.256 0 0 1 .35-.067.245.245 0 0 1 .066.345 9.552 9.552 0 0 1-2.274 2.274Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-semibold">Roulette</p>
          </div>
        </a>
        <a
          href="/games/upgrader"
          className="h-9.5 relative group/button"
          type="button"
          onClick={(event) => selectGame(event, "/games/upgrader")}
        >
          <div className="absolute top-1/3 left-0 right-0 bottom-0 bg-[#344986] rounded-lg" />
          <div
            className="group/dropdown-item h-[calc(100%-3px)] *:drop-shadow-[0_2px_0_#344986] flex items-center gap-2 select-none rounded-lg px-2.5 text-sm font-medium outline-none cursor-pointer relative hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-125 bg-[#57689A]"
            data-active={selectedGame === "/games/upgrader"}
          >
            <div className="group-data-[active=true]/dropdown-item:opacity-100 opacity-0 transition-opacity absolute inset-0 p-0.5 rounded-lg bg-gradient-to-tr from-[#E5AD4E] via-[#E5AD4E]/11 to-[#E5AD4E]/45 !drop-shadow-none">
              <div className="size-full rounded-[6px] bg-linear-to-r from-[#36449E]/60 to-[#36449E] drop-shadow-none!" />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 16"
              className="size-4.5 transition-colors group-data-[active=true]/dropdown-item:text-[#FFD896]"
            >
              <path
                fill="currentColor"
                d="M15.531 12.043c.26 0 .469.21.469.469v3.013a.47.47 0 0 1-.469.468H.47A.47.47 0 0 1 0 15.525v-3.013c0-.259.21-.469.469-.469H15.53ZM3.824 4.481a5.43 5.43 0 0 0-1.28 3.512c0 .522.073 1.033.217 1.526l-2.2.44A.469.469 0 0 1 0 9.5V7.993c0-1.98.715-3.85 2.021-5.315l1.803 1.803ZM8 6.018a1.977 1.977 0 0 1 1.79 2.811A1.978 1.978 0 0 1 8 9.968a1.978 1.978 0 0 1-1.975-1.975c0-1.089.886-1.975 1.975-1.975Zm5.979-3.34A7.942 7.942 0 0 1 16 7.993V9.5a.468.468 0 0 1-.56.46l-2.2-.44a5.443 5.443 0 0 0 .216-1.526 5.424 5.424 0 0 0-1.28-3.512l1.803-1.803ZM5.636 6.292a2.899 2.899 0 0 0-.364 2.724l-1.59.318a4.518 4.518 0 0 1-.202-1.34c0-1.08.378-2.07 1.01-2.847l1.146 1.145Zm5.873-1.145a4.501 4.501 0 0 1 1.009 2.846c0 .467-.071.918-.203 1.341l-1.59-.318a2.9 2.9 0 0 0-.363-2.724l1.147-1.145ZM7.53 5.118A2.897 2.897 0 0 0 6.3 5.63L5.153 4.484a4.498 4.498 0 0 1 2.378-.986v1.62Zm.938-1.62a4.499 4.499 0 0 1 2.378.986L9.7 5.63a2.897 2.897 0 0 0-1.231-.512v-1.62Zm-.938-.941a5.43 5.43 0 0 0-3.044 1.26L2.685 2.016A7.932 7.932 0 0 1 7.53.007v2.55ZM8.47.007a7.932 7.932 0 0 1 4.846 2.008l-1.802 1.803a5.427 5.427 0 0 0-3.044-1.261V.007Z"
              />
            </svg>
            <p className="font-semibold">Upgrader</p>
          </div>
        </a>
        <a
          href="/games/mines"
          className="h-9.5 relative group/button"
          type="button"
          onClick={(event) => selectGame(event, "/games/mines")}
        >
          <div className="absolute top-1/3 left-0 right-0 bottom-0 bg-[#344986] rounded-lg" />
          <div
            className="group/dropdown-item h-[calc(100%-3px)] *:drop-shadow-[0_2px_0_#344986] flex items-center gap-2 select-none rounded-lg px-2.5 text-sm font-medium outline-none cursor-pointer relative hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-125 bg-[#57689A]"
            data-active={selectedGame === "/games/mines"}
          >
            <div className="group-data-[active=true]/dropdown-item:opacity-100 opacity-0 transition-opacity absolute inset-0 p-0.5 rounded-lg bg-gradient-to-tr from-[#E5AD4E] via-[#E5AD4E]/11 to-[#E5AD4E]/45 !drop-shadow-none">
              <div className="size-full rounded-[6px] bg-linear-to-r from-[#36449E]/60 to-[#36449E] drop-shadow-none!" />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 19 15"
              className="size-4.5 transition-colors group-data-[active=true]/dropdown-item:text-[#FFD896]"
            >
              <path
                fill="currentColor"
                d="m18.287 3.857-.402-.401a.602.602 0 1 0-.851.851l.401.401a.6.6 0 0 0 .852 0 .602.602 0 0 0 0-.851ZM15.88 3.456a.602.602 0 0 0-.852 0l-.401.401a.602.602 0 1 0 .85.851l.402-.4a.602.602 0 0 0 0-.852ZM18.288 1.048a.6.6 0 0 0-.852 0l-.401.4a.602.602 0 1 0 .851.852l.402-.401a.602.602 0 0 0 0-.851Z"
              />
              <path
                fill="currentColor"
                d="m15.927 1.596-.852-.852a1.808 1.808 0 0 0-2.554 0l-.284.284-.851-.852a.602.602 0 0 0-.852 0L8.927 1.784a6.422 6.422 0 0 0-2.508-.505c-1.717 0-3.33.667-4.541 1.878a6.43 6.43 0 0 0 0 9.082 6.378 6.378 0 0 0 4.54 1.878c1.718 0 3.331-.667 4.542-1.878a6.378 6.378 0 0 0 1.878-4.541c0-.877-.174-1.726-.505-2.508l1.607-1.608a.602.602 0 0 0 0-.851l-.851-.852.284-.284a.603.603 0 0 1 .851 0l.851.852a.6.6 0 0 0 .852 0 .602.602 0 0 0 0-.851Zm-6.668 8.936a3.986 3.986 0 0 1-2.837 1.176 3.986 3.986 0 0 1-2.837-1.176.602.602 0 1 1 .851-.852 2.79 2.79 0 0 0 1.986.824c.75 0 1.455-.292 1.986-.824a.602.602 0 1 1 .851.852Z"
              />
            </svg>
            <p className="font-semibold">Mines</p>
          </div>
        </a>
        <a
          href="/games/plinko"
          className="h-9.5 relative group/button"
          type="button"
          onClick={(event) => selectGame(event, "/games/plinko")}
        >
          <div className="absolute top-1/3 left-0 right-0 bottom-0 bg-[#344986] rounded-lg" />
          <div
            className="group/dropdown-item h-[calc(100%-3px)] *:drop-shadow-[0_2px_0_#344986] flex items-center gap-2 select-none rounded-lg px-2.5 text-sm font-medium outline-none cursor-pointer relative hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-125 bg-[#57689A]"
            data-active={selectedGame === "/games/plinko"}
          >
            <div className="group-data-[active=true]/dropdown-item:opacity-100 opacity-0 transition-opacity absolute inset-0 p-0.5 rounded-lg bg-gradient-to-tr from-[#E5AD4E] via-[#E5AD4E]/11 to-[#E5AD4E]/45 !drop-shadow-none">
              <div className="size-full rounded-[6px] bg-linear-to-r from-[#36449E]/60 to-[#36449E] drop-shadow-none!" />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 41 36"
              className="size-4.5 transition-colors group-data-[active=true]/dropdown-item:text-[#FFD896]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M20.236 13.878c2.757 0 4.992-1.927 4.992-4.304 0-2.377-2.235-4.303-4.992-4.303-2.758 0-4.993 1.926-4.993 4.303s2.236 4.304 4.993 4.304Zm0-3.051c1.415 0 2.562-.99 2.562-2.21S21.651 6.41 20.236 6.41c-1.415 0-2.563.989-2.563 2.209 0 1.22 1.148 2.209 2.563 2.209ZM19.153 18.84c0 2.042-1.921 3.698-4.29 3.698-2.37 0-4.292-1.656-4.292-3.699s1.921-3.699 4.291-3.699 4.291 1.656 4.291 3.7Zm-2.166-1.527c0 .994-.934 1.8-2.087 1.8-1.152 0-2.087-.806-2.087-1.8s.935-1.8 2.087-1.8c1.153 0 2.087.806 2.087 1.8ZM25.61 22.7c2.473 0 4.478-1.728 4.478-3.86 0-2.133-2.005-3.862-4.479-3.862-2.473 0-4.479 1.729-4.479 3.861 0 2.133 2.006 3.861 4.48 3.861Zm-.117-3.588c1.152 0 2.087-.805 2.087-1.8 0-.993-.934-1.798-2.087-1.798s-2.087.805-2.087 1.799c0 .994.934 1.8 2.087 1.8ZM34.949 28.104c0 1.888-1.776 3.419-3.966 3.419-2.19 0-3.967-1.531-3.967-3.42 0-1.888 1.776-3.419 3.967-3.419 2.19 0 3.966 1.531 3.966 3.42Zm-2.352-1.573c0 .742-.698 1.343-1.558 1.343-.86 0-1.558-.601-1.558-1.343s.697-1.343 1.558-1.343c.86 0 1.558.601 1.558 1.343ZM20.081 31.523c2.19 0 3.967-1.531 3.967-3.42 0-1.888-1.776-3.419-3.966-3.419-2.19 0-3.967 1.531-3.967 3.42 0 1.888 1.776 3.419 3.966 3.419Zm.057-3.649c.86 0 1.558-.601 1.558-1.343s-.698-1.343-1.558-1.343c-.86 0-1.558.601-1.558 1.343s.698 1.343 1.558 1.343ZM13.72 28.104c0 1.888-1.776 3.419-3.966 3.419-2.19 0-3.966-1.531-3.966-3.42 0-1.888 1.775-3.419 3.966-3.419 2.19 0 3.966 1.531 3.966 3.42Zm-2.352-1.573c0 .742-.697 1.343-1.558 1.343-.86 0-1.558-.601-1.558-1.343s.698-1.343 1.558-1.343c.86 0 1.558.601 1.558 1.343Z"
                clipRule="evenodd"
              />
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M33.92 36H7.08c-5.626-.857-8.906-6.79-6-11.685L13.098 4.077c3.228-5.436 11.575-5.436 14.803 0L39.92 24.315c2.906 4.894-.374 10.828-6 11.685ZM25.778 5.183l12.018 20.239c2.24 3.77-.671 8.407-5.278 8.407H8.482c-4.607 0-7.517-4.637-5.278-8.407L15.222 5.183c2.302-3.876 8.254-3.876 10.556 0Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-semibold">Plinko</p>
          </div>
        </a>
      </div>
    </div>
  );
}

function RewardsIcon({ className = "size-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M11 14v8H7a3 3 0 0 1-3-3v-4a1 1 0 0 1 1-1zm8 0a1 1 0 0 1 1 1v4a3 3 0 0 1-3 3h-4v-8zM16.5 2a3.5 3.5 0 0 1 3.163 5H20a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-7V7h-2v5H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h.337A3.5 3.5 0 0 1 4 5.5C4 3.567 5.567 2 7.483 2c1.755-.03 3.312 1.092 4.381 2.934l.136.243c1.033-1.914 2.56-3.114 4.291-3.175zm-9 2a1.5 1.5 0 0 0 0 3h3.143C9.902 5.095 8.694 3.98 7.5 4m8.983 0c-1.18-.02-2.385 1.096-3.126 3H16.5a1.5 1.5 0 1 0-.017-3"
      />
    </svg>
  );
}

function CurrencyDropdown({
  style,
  mm2Balance,
  cryptoBalance,
  selectedCurrency,
  onSelect,
  onExplain,
}) {
  const options = [
    {
      id: "mm2",
      label: "MM2 ITEMS",
      balance: mm2Balance,
      glow:
        "radial-gradient(101.8% 100% at 48.73% 100%, rgba(59, 252, 255, 0.25) 0%, rgba(32, 48, 89, 0) 100%), rgb(50, 68, 113)",
      viewBox: "0 0 19 21",
      path: "m1.194 0 .597.107.163.86 5.212 2.9.434.215.706-.161 2.443 1.504.597-.108.76.43.217.376 2.117 1.181 1.086.108.325.322.055.537.38.215.434.161.109-.268.271-.054 1.737.913.163.698-.109.376-.597.43-1.248 2.148.054.483.271.269-.108.322-1.412-.752-.705.322-.543.484-.38 1.128v2.793l-.272 1.503-1.031 1.504-.597.054-4.017-1.772-.217-.591.922-1.934.978-2.9.38-.322.108-.645-.271-.537-1.846-.805-.76-.913-.054-1.02.163-.645-.543-.323-.435-.644-.162-.59v-.645l.542-1.02-.108-.484-5.429-3.062-.434-.053L.054 1.45 0 .967.326.322 1.194 0Zm6.677 9.614.055.913.705.806 1.358.537.38-.645-.218-.967-2.117-1.074-.163.43Z",
      rule: true,
    },
    {
      id: "crypto",
      label: "CRYPTO",
      balance: cryptoBalance,
      glow:
        "radial-gradient(101.8% 100% at 48.73% 100%, rgba(255, 134, 59, 0.25) 0%, rgba(32, 48, 89, 0) 100%), rgb(50, 68, 113)",
      viewBox: "0 0 9 12",
      path: "M8.262 5.142c.167-1.137-.693-1.743-1.879-2.155l.384-1.532-.936-.233-.374 1.494-.747-.178.379-1.505L4.153.8l-.385 1.537-.595-.14V2.19l-1.294-.324-.25 1s.694.164.683.169c.379.097.444.346.433.541l-.434 1.754.098.033-.102-.022-.612 2.452c-.044.114-.162.287-.428.216.011.017-.676-.162-.676-.162L.125 8.915l1.218.303.666.173-.39 1.554.936.233.38-1.538.752.195-.384 1.532.936.233.384-1.554c1.597.303 2.8.184 3.303-1.261.406-1.164-.022-1.83-.86-2.274.611-.135 1.07-.541 1.19-1.37h.006ZM6.123 8.14c-.287 1.164-2.247.53-2.88.378l.514-2.062c.633.162 2.67.47 2.366 1.678v.006Zm.287-3.016c-.26 1.056-1.895.52-2.42.39l.465-1.867c.531.13 2.231.379 1.955 1.477Z",
    },
  ];

  return (
    <div data-reka-popper-content-wrapper="" data-currency-dropdown="" style={style}>
      <div
        data-dismissable-layer=""
        tabIndex={-1}
        className="shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-100 flex flex-col gap-2 bg-[#263457] rounded-xl min-w-(--reka-popover-trigger-width) p-2"
        id="reka-popover-content-v-0-146"
        data-state="open"
        aria-labelledby="reka-popover-trigger-v-0-142"
        role="dialog"
        data-side="bottom"
        data-align="center"
        style={{
          "--reka-popover-content-transform-origin":
            "var(--reka-popper-transform-origin)",
          "--reka-popover-content-available-width":
            "var(--reka-popper-available-width)",
          "--reka-popover-content-available-height":
            "var(--reka-popper-available-height)",
          "--reka-popover-trigger-width": "var(--reka-popper-anchor-width)",
          "--reka-popover-trigger-height": "var(--reka-popper-anchor-height)",
        }}
      >
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="p-2.5 font-medium text-sm relative outline-none cursor-pointer group"
            data-active={selectedCurrency === option.id}
            onClick={() => onSelect(option.id)}
          >
            <div className="flex items-center relative z-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox={option.viewBox}
                className="size-5 mr-1.5"
              >
                <path
                  fill="currentColor"
                  d={option.path}
                  {...(option.rule
                    ? {
                        fillRule: "evenodd",
                        clipRule: "evenodd",
                        opacity: ".99",
                      }
                    : {})}
                />
              </svg>
              <p className="mr-1.5">{option.label}</p>
              <img
                src="/coin.webp"
                alt=""
                className="bg-cover bg-center size-5 ml-auto mr-1.5"
              />
              <span className="tabular-nums">{option.balance}</span>
            </div>
            <div
              className="absolute inset-0 rounded-[10px] opacity-0 group-data-[active=true]:opacity-100 group-hover:opacity-100 transition-opacity"
              style={{ background: option.glow }}
            />
          </button>
        ))}
        <button
          type="button"
          className="relative cursor-pointer outline-none flex select-none transition-opacity bg-[#324471]/80 rounded-[10px] text-accent font-medium py-2"
          onClick={onExplain}
        >
          <div className="transition-opacity flex items-center justify-center size-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-5 mr-1.5"
            >
              <path
                fill="currentColor"
                d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2"
              />
            </svg>
            What is this?
          </div>
        </button>
      </div>
    </div>
  );
}

function SignedInHeaderControls({ user, onLogout, selectedCurrency, onSelectCurrency }) {
  const mm2Balance = Number(user.mm2_balance || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
  const cryptoBalance = Number(user.crypto_balance || 0).toLocaleString(
    "en-US",
    { maximumFractionDigits: 8 },
  );
  const isLevelOne = Number(user.level || 1) === 1;
  const levelColor = isLevelOne ? "#FFFFFF" : "#F33939";
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isWhatModalOpen, setIsWhatModalOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletInitialTab, setWalletInitialTab] = useState("deposit");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currencyDropdownStyle, setCurrencyDropdownStyle] = useState({});
  const balanceTriggerRef = useRef(null);
  const profileTriggerRef = useRef(null);
  const [profileDropdownStyle, setProfileDropdownStyle] = useState({});
  const selectedBalance =
    selectedCurrency === "crypto" ? cryptoBalance : mm2Balance;

  const openWallet = (tab) => {
    setIsCurrencyOpen(false);
    setIsProfileOpen(false);
    setWalletInitialTab(tab);
    setIsWalletOpen(true);
  };

  const positionCurrencyDropdown = useCallback(() => {
    const rect = balanceTriggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setCurrencyDropdownStyle({
      position: "fixed",
      left: 0,
      top: 0,
      transform: `translate(${rect.left}px, ${rect.bottom + 12}px)`,
      width: `${rect.width}px`,
      "--reka-popper-transform-origin": "50% 0px",
      "--reka-popper-available-width": `${window.innerWidth - rect.left}px`,
      "--reka-popper-available-height": `${window.innerHeight - rect.bottom - 12}px`,
      "--reka-popper-anchor-width": `${rect.width}px`,
      "--reka-popper-anchor-height": `${rect.height}px`,
      zIndex: 100,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isCurrencyOpen) return;
    positionCurrencyDropdown();

    window.addEventListener("resize", positionCurrencyDropdown);
    window.addEventListener("scroll", positionCurrencyDropdown, true);
    return () => {
      window.removeEventListener("resize", positionCurrencyDropdown);
      window.removeEventListener("scroll", positionCurrencyDropdown, true);
    };
  }, [isCurrencyOpen, positionCurrencyDropdown]);

  useEffect(() => {
    if (!isCurrencyOpen) return;

    const closeOnOutsidePress = (event) => {
      if (
        balanceTriggerRef.current?.contains(event.target) ||
        event.target.closest?.("[data-currency-dropdown]")
      ) {
        return;
      }
      setIsCurrencyOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setIsCurrencyOpen(false);
      balanceTriggerRef.current
        ?.querySelector("[data-currency-trigger]")
        ?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isCurrencyOpen]);

  const positionProfileDropdown = useCallback(() => {
    const rect = profileTriggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setProfileDropdownStyle({
      position: "fixed",
      right: `${window.innerWidth - rect.right}px`,
      top: `${rect.bottom + 12}px`,
      "--reka-popper-transform-origin": "100% 0px",
      "--reka-popper-available-width": `${rect.right}px`,
      "--reka-popper-available-height": `${window.innerHeight - rect.bottom - 12}px`,
      "--reka-popper-anchor-width": `${rect.width}px`,
      "--reka-popper-anchor-height": `${rect.height}px`,
      zIndex: 100,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isProfileOpen) return;
    positionProfileDropdown();
    window.addEventListener("resize", positionProfileDropdown);
    window.addEventListener("scroll", positionProfileDropdown, true);
    return () => {
      window.removeEventListener("resize", positionProfileDropdown);
      window.removeEventListener("scroll", positionProfileDropdown, true);
    };
  }, [isProfileOpen, positionProfileDropdown]);

  useEffect(() => {
    if (!isProfileOpen) return;
    const closeOnOutsidePress = (event) => {
      if (
        profileTriggerRef.current?.contains(event.target) ||
        event.target.closest?.("[data-profile-dropdown]")
      ) {
        return;
      }
      setIsProfileOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setIsProfileOpen(false);
      profileTriggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isProfileOpen]);

  return (
    <div className="contents">
      <div className="absolute left-1/2 xl:left-[calc(50%+3.5rem)] top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          ref={balanceTriggerRef}
          id="reka-popover-trigger-v-0-142"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isCurrencyOpen}
          aria-controls="reka-popover-content-v-0-146"
          data-state={isCurrencyOpen ? "open" : "closed"}
          className="p-2 xs:p-2 bg-[#263457] rounded-2xl flex items-center gap-3 z-12 relative group"
        >
          <div className="flex gap-2 items-center w-full min-w-22">
            <button
              type="button"
              className="flex items-center gap-0.5 cursor-pointer outline-none"
              data-currency-trigger=""
              aria-haspopup="dialog"
              aria-expanded={isCurrencyOpen}
              aria-controls="reka-popover-content-v-0-146"
              onClick={() => setIsCurrencyOpen((open) => !open)}
            >
              {selectedCurrency === "crypto" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 9 12" className="size-5.5 xs:size-5.5">
                  <path fill="currentColor" d="M8.262 5.142c.167-1.137-.693-1.743-1.879-2.155l.384-1.532-.936-.233-.374 1.494-.747-.178.379-1.505L4.153.8l-.385 1.537-.595-.14V2.19l-1.294-.324-.25 1s.694.164.683.169c.379.097.444.346.433.541l-.434 1.754.098.033-.102-.022-.612 2.452c-.044.114-.162.287-.428.216.011.017-.676-.162-.676-.162L.125 8.915l1.218.303.666.173-.39 1.554.936.233.38-1.538.752.195-.384 1.532.936.233.384-1.554c1.597.303 2.8.184 3.303-1.261.406-1.164-.022-1.83-.86-2.274.611-.135 1.07-.541 1.19-1.37h.006ZM6.123 8.14c-.287 1.164-2.247.53-2.88.378l.514-2.062c.633.162 2.67.47 2.366 1.678v.006Zm.287-3.016c-.26 1.056-1.895.52-2.42.39l.465-1.867c.531.13 2.231.379 1.955 1.477Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 19 21" className="size-5.5 xs:size-5.5">
                  <path fill="currentColor" fillRule="evenodd" d="m1.194 0 .597.107.163.86 5.212 2.9.434.215.706-.161 2.443 1.504.597-.108.76.43.217.376 2.117 1.181 1.086.108.325.322.055.537.38.215.434.161.109-.268.271-.054 1.737.913.163.698-.109.376-.597.43-1.248 2.148.054.483.271.269-.108.322-1.412-.752-.705.322-.543.484-.38 1.128v2.793l-.272 1.503-1.031 1.504-.597.054-4.017-1.772-.217-.591.922-1.934.978-2.9.38-.322.108-.645-.271-.537-1.846-.805-.76-.913-.054-1.02.163-.645-.543-.323-.435-.644-.162-.59v-.645l.542-1.02-.108-.484-5.429-3.062-.434-.053L.054 1.45 0 .967.326.322 1.194 0Zm6.677 9.614.055.913.705.806 1.358.537.38-.645-.218-.967-2.117-1.074-.163.43Z" clipRule="evenodd" opacity=".99" />
                </svg>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 transition-transform -rotate-180 group-data-[state=open]:rotate-0 ml-auto" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
                <path fill="none" stroke="currentColor" d="m18 15-6-6-6 6" />
              </svg>
            </button>
            <div className="w-0.5 h-6 bg-accent/12 rounded-full" />
            <img src="/coin.webp" alt="" className="bg-cover bg-center size-5.5 xs:size-5.5" />
            <div className="flex flex-col gap-0.5 font-medium text-sm leading-none">
              <p className="text-primary text-xs hidden md:block">Balance</p>
              <span>{selectedBalance}</span>
            </div>
          </div>
          <button type="button" onClick={() => openWallet("deposit")} className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-8 w-7.25 shrink-0 lg:hidden">
            <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(15, 195, 101)" }} />
            <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(92, 223, 154)", color: "rgb(58, 56, 105)" }}>
              <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(15, 195, 101) 0px 2px 0px)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-3.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
                  <path fill="none" stroke="currentColor" d="M5 12h14m-7-7v14" />
                </svg>
              </div>
            </div>
          </button>
          <button type="button" onClick={() => openWallet("deposit")} className="relative cursor-pointer outline-none select-none transition-opacity group/button h-8 hidden lg:block">
            <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(15, 195, 101)" }} />
            <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3.25" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(92, 223, 154)", color: "rgb(58, 56, 105)" }}>
              <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: "drop-shadow(rgb(15, 195, 101) 0px 2px 0px)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className="size-4.5 mr-1.5">
                  <path fill="currentColor" d="M13.125 14H.875A.875.875 0 0 1 0 13.125v-3.063a.875.875 0 0 1 1.75 0v2.188h10.5v-2.188a.875.875 0 0 1 1.75 0v3.063a.875.875 0 0 1-.875.875Zm-7-13.125V7.94L4.481 6.296a.875.875 0 1 0-1.238 1.237l3.138 3.138a.875.875 0 0 0 1.238 0l3.138-3.138a.875.875 0 0 0-1.238-1.237L7.875 7.94V.875a.875.875 0 0 0-1.75 0Z" />
                </svg>
                <span>DEPOSIT</span>
              </div>
            </div>
          </button>
        </div>
      </div>
      <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <button type="button" onClick={() => openWallet("withdraw")} className="relative cursor-pointer outline-none select-none text-accent hidden lg:flex px-3 py-2 hover:bg-accent/12 rounded-lg font-medium transition-colors">
          <div className="transition-opacity flex items-center justify-center size-full">WITHDRAW</div>
        </button>
        <div
          ref={profileTriggerRef}
          id="reka-popover-trigger-v-0-144"
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={isProfileOpen}
          aria-controls="reka-popover-content-v-0-147"
          data-state={isProfileOpen ? "open" : "closed"}
          className="h-12 relative group/button flex gap-2.5 items-center outline-none cursor-pointer"
          onClick={() => {
            setIsCurrencyOpen(false);
            setIsProfileOpen((open) => !open);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            setIsCurrencyOpen(false);
            setIsProfileOpen((open) => !open);
          }}
        >
          <button type="button" className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-12">
            <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(23, 36, 68)" }} />
            <div className="font-bold size-full relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 rounded-lg px-1 flex items-center gap-2.5 !translate-y-0 !drop-shadow-none overflow-hidden" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(41, 59, 103)", color: "rgb(255, 255, 255)" }}>
              <div className="transition-opacity flex items-center justify-center size-full">
                {!isLevelOne && (
                  <div className="absolute inset-0 size-full pointer-events-none flex items-center justify-center">
                    <svg className="size-full opacity-90" viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet">
                      <path d="M 18 2 L 29 2 A 5 5 0 0 1 34 7 L 34 29 A 5 5 0 0 1 29 34 L 7 34 A 5 5 0 0 1 2 29 L 2 7 A 5 5 0 0 1 7 2 L 18 2" fill="none" stroke={levelColor} strokeWidth="7" strokeDasharray="10.27401813331975 119.41592653589794" />
                    </svg>
                  </div>
                )}
                <div className="size-9.5 flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) rounded-lg p-0.5" style={{ "--level-border-start": "#272539", "--level-border-end": levelColor, "--level-text": levelColor }}>
                  <div className="rounded-[6px] size-full flex items-center justify-center bg-[#1A2339]">
                    <img src={user.avatar_headshot} className="size-9/12 object-contain object-center rounded-[5px] ease-in-out transition-opacity no-interaction" alt={`${user.username} avatar`} loading="eager" />
                  </div>
                  <div className="bg-linear-to-b from-(--level-border-start) to-(--level-border-end) absolute bottom-0 right-0 p-0.5 rounded-md rounded-br-lg">
                    <div className="rounded-sm size-full flex items-center justify-center px-1.25 py-0.5 text-[10px] font-medium leading-none text-(--level-text) bg-[#1A2339]">{user.level || 1}</div>
                  </div>
                </div>
              </div>
            </div>
          </button>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 text-accent" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
            <path fill="none" stroke="currentColor" d="m18 15-6-6-6 6" />
          </svg>
        </div>
      </div>
      {isCurrencyOpen &&
        createPortal(
          <CurrencyDropdown
            style={currencyDropdownStyle}
            mm2Balance={mm2Balance}
            cryptoBalance={cryptoBalance}
            selectedCurrency={selectedCurrency}
            onSelect={(currency) => {
              onSelectCurrency(currency);
              setIsCurrencyOpen(false);
            }}
            onExplain={() => {
              setIsCurrencyOpen(false);
              setIsWhatModalOpen(true);
            }}
          />,
          document.body,
        )}
      {isWhatModalOpen &&
        createPortal(
          <WhatIsThisModal onClose={() => setIsWhatModalOpen(false)} />,
          document.body,
        )}
      {isWalletOpen &&
        createPortal(
          <WalletModal initialTab={walletInitialTab} onClose={() => setIsWalletOpen(false)} />,
          document.body,
        )}
      {isProfileOpen &&
        createPortal(
          <ProfileDropdown
            style={profileDropdownStyle}
            user={user}
            onLogout={onLogout}
          />,
          document.body,
        )}
    </div>
  );
}

export default function Header({ onInitialRenderReady, selectedBalanceType, onBalanceTypeChange }) {
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [signedInUser, setSignedInUser] = useState(null);
  const [isSessionResolved, setIsSessionResolved] = useState(false);
  const [selectedGame, setSelectedGame] = useState(() =>
    window.location.pathname.startsWith("/games/")
      ? window.location.pathname
      : null,
  );
  const [dropdownStyle, setDropdownStyle] = useState({});
  const gamesTriggerRef = useRef(null);
  const showSessionNotification = useCallback(() => {
    showNotification({
      type: "error",
      title: "Uh-oh, Error!",
      message: "The login session could not be found",
      duration: 6000,
    });
  }, []);

  const handleSignedIn = useCallback((user) => {
    setSignedInUser(user);
  }, []);

  const navigateToGame = useCallback((game) => {
    setSelectedGame(game);
    setIsGamesOpen(false);

    if (window.location.pathname === game) return;

    window.history.pushState({}, "", game);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const syncSelectedGame = () => {
      setSelectedGame(
        window.location.pathname.startsWith("/games/")
          ? window.location.pathname
          : null,
      );
    };

    window.addEventListener("popstate", syncSelectedGame);
    return () => window.removeEventListener("popstate", syncSelectedGame);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetch("/api/session", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (response.status === 401) showSessionNotification();
        return response.ok ? payload : null;
      })
      .then(async (payload) => {
        if (!payload?.user) return;
        await preloadImage(payload.user.avatar_headshot);
        if (active) setSignedInUser(payload.user);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsSessionResolved(true);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [showSessionNotification]);

  useEffect(() => {
    if (isSessionResolved) onInitialRenderReady?.();
  }, [isSessionResolved, onInitialRenderReady]);

  useEffect(() => {
    const controller = new AbortController();
    const updateBalance = async (event) => {
      const mm2Balance = Number(event.detail?.mm2Balance);
      if (Number.isFinite(mm2Balance)) {
        setSignedInUser((current) => current ? { ...current, mm2_balance: mm2Balance } : current);
        return;
      }
      try {
        const response = await fetch("/api/session", { signal: controller.signal });
        const payload = await response.json().catch(() => null);
        if (response.ok && payload?.user) setSignedInUser(payload.user);
      } catch {
      }
    };
    window.addEventListener("mm2wild:balance-updated", updateBalance);
    return () => {
      controller.abort();
      window.removeEventListener("mm2wild:balance-updated", updateBalance);
    };
  }, []);

  const positionDropdown = useCallback(() => {
    const trigger = gamesTriggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      left: 0,
      top: 0,
      transform: `translate(${rect.left}px, ${rect.bottom + 12}px)`,
      width: `${rect.width}px`,
      minWidth: `${rect.width}px`,
      maxWidth: `${rect.width}px`,
      "--games-dropdown-scale": `${rect.width / 160}`,
      "--reka-popper-transform-origin": "50% 0px",
      zIndex: 100,
      "--reka-popper-available-width": `${window.innerWidth - rect.left}px`,
      "--reka-popper-available-height": `${window.innerHeight - rect.bottom - 12}px`,
      "--reka-popper-anchor-width": `${rect.width}px`,
      "--reka-popper-anchor-height": `${rect.height}px`,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isGamesOpen) return;
    positionDropdown();

    window.addEventListener("resize", positionDropdown);
    window.addEventListener("scroll", positionDropdown, true);
    return () => {
      window.removeEventListener("resize", positionDropdown);
      window.removeEventListener("scroll", positionDropdown, true);
    };
  }, [isGamesOpen, positionDropdown]);

  useEffect(() => {
    if (!isGamesOpen) return;

    const closeOnOutsidePress = (event) => {
      if (
        gamesTriggerRef.current?.contains(event.target) ||
        event.target.closest?.("[data-reka-popper-content-wrapper]")
      ) {
        return;
      }
      setIsGamesOpen(false);
    };

    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setIsGamesOpen(false);
      gamesTriggerRef.current?.querySelector("button")?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isGamesOpen]);

  return (
    <>
      <div className="flex fixed top-0 left-0 right-0 z-100">
        <div className="pl-3 md:pl-6 h-20 shrink-0 bg-[#152340] relative flex items-center justify-center overflow-hidden">
          <a
            href="/"
            className="router-link-active router-link-exact-active block"
            aria-current="page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 249 287"
              className="w-[37px] h-[43px] lg:invisible lg:absolute"
            >
              <path
                fill="url(#i-1354559475__a)"
                fillRule="evenodd"
                d="M60.178 2.146C60.013.423 61.763-.666 63.079.46c1.673 1.507 7.385 6.398 12.631 10.945 5.261 4.505 11.96 10.201 14.866 12.64 2.892 2.48 6.234 5.349 7.441 6.368 1.54 1.32 2.037 2.01 1.75 2.445-.243.305-.714 1.015-1.043 1.58-.523.795-.31 1.55 3.954 9.439a2.822 2.822 0 0 0 3.755 1.177 2.827 2.827 0 0 1 2.099-.183l20.232 6.157a55.43 55.43 0 0 0 9.144 1.958l6.426.817c4.555.59 10.251 1.31 17.341 2.124 4.84.556 9.665-1.137 13.127-4.565 1.203-1.193 2.386-2.299 3.37-3.195 1.268-1.155 3.265-.789 3.74.859.37 1.188 1.007 3.302 2.136 7.051 1 3.318 3.48 5.986 6.715 7.224 2.825 1.067 6.448 2.49 8.114 3.13 1.652.684 4.289 1.74 5.955 2.38 1.456.602 4.748 1.877 11.857 4.607a6.883 6.883 0 0 0 5.026-.037c.311-.125.616-.27.909-.44 1.612-.963 3.266-2.345 3.853-3.258.572-.87 3.308-4.828 6.057-8.829 2.75-4.001 6.03-8.744 7.304-10.585 1.394-1.998 2.083-2.806 2.372-2.732.069.016.116.083.144.193.099.41.334 5.252.852 20.471a3.48 3.48 0 0 0 2.043 3.05c.133.062.263.126.391.188.51.245.97.485 1.281.671.071.043.137.078.191.115.116.078.191.143.213.186.089.186.349 2.764.584 5.714.33 4.142.255 5.992-.312 7.728-.695 2.126-1.14 2.608-7.077 7.536a108.797 108.797 0 0 1-3.457 2.715c-.13.099-.259.2-.391.298-.466.347-.94.694-1.419 1.036-.17.122-.339.247-.507.37a38.896 38.896 0 0 0-2.253 1.79c-2.967 2.547-5.507 5.558-7.169 9.098a777.778 777.778 0 0 1-3.156 6.681c-.717 1.506-1.488 3.12-2.278 4.768l-.458.958a1958.528 1958.528 0 0 1-3.537 7.33 5039.707 5039.707 0 0 1-9.773 20.345 1186.33 1186.33 0 0 0-6.917 14.554c-1.767 3.791-3.306 7.177-3.421 7.528-.141.434.455.965 1.934 1.736 1.551.755 1.708 2.024.503 3.259-.624.64-1.376 1.394-2.189 2.194-.488.487-.951.962-1.375 1.408-1.679 1.764-1.358 3.661.68 4.995 2.684 1.789 2.727 1.804 2.085 3.035-.314.666-.553 1.693-.492 2.242.094.502 1.448 5.651 5.72 21.217a43.737 43.737 0 0 1 1.511 13.656l-.427 8.885a11.86 11.86 0 0 0 1.435 6.248c1.155 2.202 1.782 2.935 2.621 3.017.752.054 2.689 2.223 7.731 8.722a206.545 206.545 0 0 1 1.453 1.918c.382.508.761 1.018 1.134 1.526 1.759 2.395 3.408 4.769 4.753 6.949.223.361.401.74.542 1.128l.022.061a6.395 6.395 0 0 1 .336 1.59 6.951 6.951 0 0 1-.775 3.725c-1.686 3.141-4.811 5.143-7.964 6.807-3.762 1.986-9.955 5.221-19.241 9.975a12.387 12.387 0 0 1-6.271 1.344c-2.722-.112-5.296-1.468-6.619-3.849a15.977 15.977 0 0 1-.363-.688c-1.069-2.175-3.229-7.636-4.819-12.191-2.061-5.907-2.771-8.59-2.502-9.415.314-.961-.6-3.082-10.1-21.603a8.476 8.476 0 0 0-3.238-3.433l-1.543-.907a5.299 5.299 0 0 0-5.233-.076 5.296 5.296 0 0 1-6.927-1.664l-1.158-1.703a1009.243 1009.243 0 0 1-5.564-8.386 5.66 5.66 0 0 0-4.191-2.535c-2.37-.246-2.719-.359-2.882-1.036-.061-.405-.055-2.037.022-3.597.036-.728.059-1.419.065-1.966.008-.769-.434-1.301-1.155-1.031-.504.219-3.016.696-5.586 1.057a21.074 21.074 0 0 1-2.613.191c-1.249.005-2.082-1.129-1.694-2.317.34-1.042.307-1.678-.157-2.022-.378-.316-1.928-.726-3.446-.934-1.519-.208-5.456-.821-8.696-1.351-3.242-.531-11.446-1.913-18.246-3.03-6.786-1.16-14.354-2.431-16.871-2.821a725.393 725.393 0 0 0-8.67-1.438 719.408 719.408 0 0 1-12.31-2.053c-8.205-1.383-8.206-1.382-10.483-.3-1.24.555-5.785 1.953-10.142 3.075-6.84 1.801-8.14 1.953-9.704 1.442-1.07-.35-3.156-1.75-9.104-6.62a3.676 3.676 0 0 1-1.21-3.822 3.69 3.69 0 0 0-1.38-3.96l-.076-.058c-1.162-.86-5.3-3.797-9.149-6.591-.275-.195-.546-.39-.814-.582-4.276-3.065-3.895-5.187 1.07-5.291l.496-.003.686.003c1.253.004 2.606.013 3.98.026 1.43.013 2.882.032 4.269.051 2.641.037 5.044.079 6.597.113.488.014.937.026 1.354.034l.072.002c6.968.13 11.411-6.778 13.13-13.533 1.48-5.857 3.41-13.537 4.284-17.095.873-3.554 1.575-6.733 1.588-7.07-.001-.289-2.058-3.268-4.594-6.546-2.305-2.925-.75-7.078 2.905-7.794 1.414-.277 3.064-.594 4.977-.953a6.954 6.954 0 0 0 4.946-3.73c.842-1.694 2.984-5.751 4.77-9.01 1.742-3.274 4.071-7.606 5.157-9.605 1.042-2.013 2.77-5.243 3.784-7.17 1.62-2.925 2.36-5.16 9.007-28.323a2.528 2.528 0 0 1 1.273-1.55 2.492 2.492 0 0 0 1.106-3.327l-1.513-3.059c-2.4-4.923-2.616-5.299-5.989-6.423a1.202 1.202 0 0 1-.816-1.004l-1.739-15.442c-1.025-8.933-2.369-20.42-2.951-25.559a274.561 274.561 0 0 1-.623-5.878Zm46.011 124.558c-.174-.057-.348.029-.419.246-.058.176-1.128 2.276-2.384 4.65-.187.371-.373.734-.553 1.081-1.242 2.392-3.248 2.968-5.37 1.306-1.685-1.318-3.602-2.665-4.284-3.08-1.146-.615-1.478-.483-6.025 2.691-2.62 1.835-7.442 5.111-10.665 7.325-5.282 3.51-6.087 4.209-7.516 6.672a564.763 564.763 0 0 0-3.563 5.897c-1.058 1.768-3.203 5.39-4.79 8.042a841.61 841.61 0 0 0-7.191 12.303c-2.402 4.114-4.762 8.097-5.293 8.838-.486.752-.972 1.507-1.043 1.725-.055.175.73 1.152 1.675 2.228 1.615 1.681 1.776 2.07 1.322 3.315-.241.737-.35 1.518-.205 1.662.187.203 5.71 1.239 12.357 2.355 6.642 1.161 14.038 2.376 16.41 2.766 2.375.391 11.128 1.857 19.389 3.211a2960.454 2960.454 0 0 1 19.605 3.282c2.504.434 5.065.839 5.716.907.825.125 2.078-.62 4.622-2.814 1.923-1.626 3.532-3.021 3.579-3.155.041-.135-.466-2.701-1.149-5.755-.67-3.101-1.581-7.386-2.072-9.563-.82-3.966-.805-4.009-1.943-3.469-.951.41-1.559.354-3.66-.572-2.362-1.012-2.697-1.313-4.99-5.04a17.36 17.36 0 0 1-1.262-2.416c-.678-1.628-.24-3.382.475-4.994.37-.834.778-1.772 1.127-2.614 1.083-2.638 1.481-5.514 1.094-8.339-.408-2.986-.615-3.989-.71-4.024-.132-.043-1.028-.097-2.01-.178-1.46-.092-1.968-.306-2.987-1.455-.99-1.091-1.226-1.842-1.108-3.82.063-1.372.165-3.453.259-4.623.09-1.748-.396-3.205-2.958-8.317-1.726-3.396-3.261-6.2-3.48-6.274Zm78.476-35.613a42.862 42.862 0 0 0-19.578 2.376c-4.6 1.694-7.557 2.782-9.509 3.494-3.013 1.129-5.622 2.342-5.737 2.69-.156.333-.256 2.703-.298 5.186l-.011.444c-.064 2.744-2.164 4.933-4.874 4.493-2.415-.405-4.816-.707-5.307-.676-.737.048-.252 1.214 2.672 6.541 2.331 4.259 5.866 7.633 9.714 10.593 1.296.997 1.552 1.49 1.728 2.222.297 1.154.145 2.209-.495 3.873-.654 1.708-.751 2.446-.358 2.863.277.331 1.601 1.579 2.923 2.828a11.879 11.879 0 0 0 5.6 2.906l5.786 1.232c.999.212 1.85.866 2.307 1.779 1.761 3.52 2.533 5.299 2.833 6.206.487 1.6.418 2.25-.435 4.42-.555 1.403-1.209 2.824-1.496 3.115-.416.392.211 1.27 2.451 3.539a235.571 235.571 0 0 1 6.284 6.52c1.833 1.895 3.506 3.544 3.768 3.631.263.084 2.34-.389 4.647-.979 3.019-.791 5.004-3.033 6.308-5.87 1.044-2.269 2.421-5.251 3.907-8.47 3.166-6.746 5.959-12.655 6.203-13.106.287-.436 1.6-3.129 2.926-6.009 1.326-2.882 4.122-8.789 6.161-13.118 2.083-4.315 5.12-10.673 6.775-14.12 1.684-3.388 3.21-6.733 3.422-7.384.341-1.042.194-1.33-.966-1.901-1.029-.528-1.395-1.176-1.754-3.021-.373-1.803-.68-2.337-1.563-2.577-.608-.199-4.267-.626-8.1-.965-3.861-.397-8.982-.916-11.397-1.177-2.416-.26-8.969-.96-14.537-1.578Z"
                clipRule="evenodd"
              />
              <defs>
                <linearGradient
                  id="i-1354559475__a"
                  x1="235.016"
                  x2="-54.818"
                  y1="301.999"
                  y2="213.421"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FFE2B1" />
                  <stop offset=".471" stopColor="#fff" />
                  <stop offset={1} stopColor="#FFCD79" />
                </linearGradient>
              </defs>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 983 185"
              className="w-[194px] h-[36px] max-lg:invisible max-lg:absolute"
            >
              <path
                fill="url(#i-1853660109__a)"
                d="M32.528 28.723c2.438 0 4.267.678 5.486 2.032 1.22 1.355 2.032 2.303 2.439 2.845L72.97 90.097 105.486 33.6c.406-.542 1.22-1.49 2.438-2.845 1.22-1.354 3.048-2.032 5.487-2.032h27.029c1.49 0 2.71.542 3.658 1.626 1.084.948 1.626 2.167 1.626 3.658v131.689c0 1.49-.542 2.778-1.626 3.862-.948.948-2.168 1.422-3.658 1.422h-30.484c-1.49 0-2.777-.474-3.861-1.422-.948-1.084-1.423-2.372-1.423-3.862V99.852l-18.29 32.109c-.677 1.084-1.558 2.168-2.642 3.251-1.083 1.084-2.642 1.626-4.674 1.626H66.67c-1.896 0-3.387-.542-4.47-1.626-1.084-1.083-1.965-2.167-2.642-3.251l-18.29-32.11v65.845c0 1.49-.543 2.778-1.627 3.862-.948.948-2.167 1.422-3.657 1.422H5.498c-1.49 0-2.777-.474-3.86-1.422-1.084-1.084-1.626-2.372-1.626-3.862V34.006c0-1.49.542-2.709 1.626-3.657 1.084-1.084 2.37-1.626 3.86-1.626h27.03Z"
              />
              <path
                fill="url(#i-1853660109__b)"
                d="M197.505 28.723c2.438 0 4.267.678 5.487 2.032 1.218 1.355 2.032 2.303 2.438 2.845l32.516 56.497L270.462 33.6c.406-.542 1.22-1.49 2.438-2.845 1.22-1.354 3.05-2.032 5.488-2.032h27.028c1.491 0 2.711.542 3.659 1.626 1.084.948 1.625 2.168 1.625 3.658v131.689c0 1.49-.541 2.778-1.625 3.862-.948.948-2.168 1.422-3.659 1.422h-30.483c-1.49 0-2.778-.474-3.861-1.422-.949-1.084-1.422-2.372-1.423-3.862V99.852l-18.29 32.109c-.677 1.084-1.559 2.167-2.642 3.251-1.084 1.084-2.642 1.626-4.673 1.626h-12.397c-1.897 0-3.388-.542-4.472-1.626-1.083-1.084-1.965-2.167-2.642-3.251l-18.289-32.11v65.845c0 1.49-.543 2.778-1.626 3.862-.949.948-2.168 1.422-3.658 1.422h-30.484c-1.49 0-2.778-.474-3.862-1.422-1.084-1.084-1.625-2.372-1.625-3.862V34.006c0-1.49.542-2.71 1.625-3.657 1.084-1.084 2.371-1.626 3.862-1.626h27.029Z"
              />
              <path
                fill="url(#i-1853660109__c)"
                d="M386.055 26.081c11.923 0 22.152 1.829 30.687 5.487 6.84 2.931 12.418 6.82 16.735 11.665-1.317 4.565-2.105 7.242-2.649 8.95-.346 1.085-.514 1.525-.578 1.683-.013.03.01-.01-.055.107l-.069.124-.066.124c-.545 1.036-1.707 3.21-2.403 4.552-.737 1.357-2.196 4.071-3.3 6.144-.372.68-.77 1.419-1.161 2.15-10.917 2.829-15.922 15.535-9.779 25.014-.523 2.101-1.276 5.11-1.963 7.831a550.265 550.265 0 0 0-6.091-.061l-.488-.003c-1.533-.008-3.873.103-6.344.924-2.16.717-7.675 3.149-9.562 9.806-1.808 6.377 1.31 11.216 2.518 12.829 1.481 1.977 3.224 3.377 4.463 4.265l.557.397c.64.464 1.255.904 1.828 1.316a15.803 15.803 0 0 0 5.038 7.401c1.961 1.605 3.523 2.835 4.784 3.739.958.686 2.925 2.078 5.411 2.891 2.813.919 5.413.991 7.96.623 1.777-.257 3.84-.786 5.886-1.325 1.77-.457 4.127-1.122 6.09-1.775.404.067.878.148 1.443.243a461.71 461.71 0 0 0 8.116 1.352c.883.141 2.151.349 3.351.55v22.612c0 1.49-.542 2.778-1.626 3.862-.948.948-2.168 1.422-3.658 1.422H330.372c-1.49 0-2.777-.474-3.861-1.422-.948-1.084-1.423-2.372-1.423-3.862v-17.68c0-.949.203-2.507.61-4.675.542-2.167 2.033-4.132 4.471-5.893l11.787-11.178c12.464-9.212 22.829-17.002 31.093-23.37 8.264-6.503 14.43-12.126 18.494-16.868 4.2-4.742 6.299-9.145 6.299-13.21 0-3.25-.813-6.028-2.438-8.331-1.49-2.439-4.539-3.658-9.145-3.658-3.387 0-6.097.744-8.129 2.234-2.032 1.49-3.59 3.32-4.674 5.488-.948 2.168-1.694 4.268-2.236 6.3-.542 1.76-1.491 2.98-2.845 3.657-1.355.678-2.913 1.017-4.675 1.017h-31.702c-1.355 0-2.439-.407-3.252-1.22-.813-.948-1.219-2.032-1.219-3.25.135-7.18 1.626-13.684 4.471-19.51 2.981-5.961 7.045-11.178 12.193-15.649 5.148-4.47 11.245-7.858 18.29-10.161 7.181-2.439 15.039-3.658 23.574-3.658Z"
              />
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M440.518 2.348c-.105-1.107 1.018-1.806 1.863-1.083 1.074.967 4.742 4.107 8.11 7.027 3.378 2.892 7.679 6.55 9.545 8.115 1.856 1.593 4.002 3.434 4.777 4.089.989.847 1.308 1.29 1.124 1.57a10.4 10.4 0 0 0-.67 1.014c-.336.51-.2.995 2.538 6.06a1.812 1.812 0 0 0 2.411.756 1.816 1.816 0 0 1 1.348-.118l12.99 3.953a35.612 35.612 0 0 0 5.87 1.258l4.126.524c2.925.379 6.582.842 11.134 1.364 3.108.356 6.205-.73 8.429-2.931a70.262 70.262 0 0 1 2.163-2.051c.814-.742 2.096-.507 2.401.551.238.763.647 2.12 1.372 4.527a7.188 7.188 0 0 0 4.311 4.638c1.814.685 4.14 1.6 5.21 2.01 1.06.44 2.753 1.116 3.823 1.528.935.387 3.049 1.205 7.613 2.958a4.416 4.416 0 0 0 3.227-.024c.199-.08.395-.173.583-.283 1.035-.618 2.097-1.505 2.474-2.091.367-.559 2.124-3.1 3.889-5.669 1.765-2.569 3.871-5.614 4.689-6.796.895-1.282 1.337-1.801 1.523-1.754.045.01.074.053.093.124.063.263.214 3.372.547 13.143a2.235 2.235 0 0 0 1.311 1.959l.251.12c.328.158.623.312.823.431.045.027.088.05.122.073.075.05.123.092.137.12.057.12.225 1.775.375 3.669.212 2.659.164 3.847-.2 4.961-.446 1.365-.732 1.675-4.544 4.84a69.781 69.781 0 0 1-2.219 1.742l-.251.191c-.3.224-.604.446-.912.666-.109.078-.217.158-.325.238-.496.365-.979.748-1.446 1.149-1.905 1.635-3.536 3.568-4.603 5.84a513.377 513.377 0 0 1-2.027 4.29c-.46.967-.955 2.004-1.462 3.062l-.294.615c-.767 1.596-1.549 3.219-2.271 4.706a3141.084 3141.084 0 0 1-6.275 13.062 774.575 774.575 0 0 0-4.441 9.344c-1.134 2.434-2.122 4.609-2.196 4.833-.091.279.291.62 1.241 1.116.996.484 1.097 1.299.324 2.092-.401.411-.884.895-1.406 1.409-.313.312-.611.617-.883.903-1.078 1.133-.872 2.351.437 3.207 1.723 1.149 1.751 1.159 1.338 1.949-.201.427-.355 1.087-.315 1.439.06.323.929 3.629 3.672 13.623a28.072 28.072 0 0 1 .97 8.767l-.274 5.705a7.617 7.617 0 0 0 .921 4.011c.742 1.414 1.145 1.885 1.683 1.938.483.034 1.726 1.427 4.964 5.599.271.353.54.71.808 1.066l.125.166c.245.326.488.653.728.98 1.129 1.537 2.188 3.062 3.051 4.462.143.231.258.474.348.723l.014.04c.054.152.097.308.132.465l.011.05c.034.167.06.336.073.505a4.45 4.45 0 0 1-.498 2.392c-1.082 2.017-3.088 3.302-5.112 4.37a1120.532 1120.532 0 0 1-12.354 6.405 7.967 7.967 0 0 1-4.027.863c-1.747-.072-3.4-.943-4.249-2.472a9.672 9.672 0 0 1-.233-.441c-.686-1.397-2.073-4.903-3.094-7.827-1.323-3.793-1.779-5.515-1.606-6.045.201-.617-.386-1.979-6.485-13.87a5.435 5.435 0 0 0-2.079-2.204l-.991-.582a3.4 3.4 0 0 0-3.36-.05 3.4 3.4 0 0 1-4.447-1.068l-.743-1.093a610.542 610.542 0 0 1-3.573-5.385 3.631 3.631 0 0 0-2.691-1.627c-1.522-.158-1.746-.231-1.85-.665-.039-.26-.035-1.308.014-2.31.023-.467.038-.911.042-1.262.005-.494-.279-.835-.742-.662-.324.141-1.936.447-3.586.679-.681.088-1.237.121-1.678.123-.802.003-1.336-.726-1.088-1.488.219-.669.198-1.078-.1-1.299-.243-.202-1.238-.466-2.213-.599-.975-.134-3.503-.527-5.583-.868-2.081-.34-7.349-1.228-11.715-1.945-4.357-.744-9.216-1.561-10.832-1.811a468.49 468.49 0 0 0-5.566-.923c-1.44-.224-5.015-.806-7.904-1.318-5.268-.888-5.269-.888-6.73-.193-.797.357-3.715 1.254-6.512 1.974-4.391 1.156-5.226 1.254-6.23.926-.687-.225-2.027-1.123-5.846-4.25a2.36 2.36 0 0 1-.776-2.454 2.37 2.37 0 0 0-.886-2.543l-.049-.037c-.746-.552-3.404-2.437-5.874-4.231l-.523-.374c-2.746-1.968-2.501-3.331.687-3.397l.318-.002.441.002c.805.002 1.673.008 2.555.016a750.58 750.58 0 0 1 6.977.106 137.06 137.06 0 0 0 .915.023c4.474.084 7.327-4.352 8.43-8.689.95-3.76 2.19-8.691 2.751-10.976.56-2.282 1.011-4.323 1.02-4.539-.001-.185-1.322-2.098-2.95-4.203-1.48-1.878-.481-4.544 1.865-5.004.908-.178 1.967-.382 3.195-.612a4.464 4.464 0 0 0 3.176-2.395c.54-1.087 1.916-3.692 3.062-5.785a992.449 992.449 0 0 1 3.312-6.166c.669-1.293 1.778-3.366 2.429-4.603 1.04-1.879 1.516-3.313 5.783-18.185.123-.427.42-.795.817-.996a1.601 1.601 0 0 0 .711-2.136l-.972-1.963c-1.541-3.161-1.679-3.403-3.845-4.124a.77.77 0 0 1-.524-.645l-1.117-9.914c-.658-5.735-1.521-13.111-1.894-16.41a177.344 177.344 0 0 1-.401-3.774Zm29.542 79.971c-.112-.036-.223.019-.269.158-.037.113-.724 1.462-1.531 2.986-.12.238-.239.47-.355.694-.798 1.535-2.085 1.905-3.448.839-1.082-.847-2.312-1.712-2.75-1.978-.736-.395-.949-.31-3.869 1.728-1.681 1.177-4.777 3.281-6.847 4.702-3.391 2.254-3.908 2.703-4.826 4.284-.588.95-1.607 2.651-2.287 3.786-.679 1.135-2.056 3.461-3.076 5.164a537.284 537.284 0 0 0-4.617 7.899c-1.542 2.641-3.057 5.199-3.398 5.674-.312.483-.624.967-.67 1.107-.035.113.469.74 1.076 1.431 1.037 1.079 1.141 1.33.849 2.129-.155.473-.225.974-.132 1.066.12.131 3.666.796 7.934 1.512 4.264.746 9.013 1.526 10.536 1.777 1.525.251 7.145 1.192 12.448 2.061 5.305.869 10.98 1.829 12.588 2.108 1.607.278 3.252.538 3.67.582.529.08 1.334-.398 2.967-1.807 1.235-1.044 2.268-1.94 2.298-2.025.027-.087-.299-1.735-.738-3.696-.43-1.991-1.015-4.742-1.33-6.14-.526-2.546-.517-2.574-1.248-2.227-.61.263-1 .228-2.349-.367-1.517-.65-1.732-.843-3.204-3.236a11.3 11.3 0 0 1-.811-1.551c-.435-1.045-.154-2.172.305-3.206.238-.536.5-1.138.724-1.679.695-1.694.951-3.54.703-5.354-.262-1.917-.396-2.561-.456-2.583-.085-.028-.66-.063-1.291-.114-.938-.06-1.264-.197-1.918-.935-.635-.7-.787-1.182-.711-2.453.04-.88.106-2.216.166-2.968.058-1.122-.254-2.057-1.899-5.34-1.108-2.18-2.094-3.98-2.234-4.028Zm50.385-22.865a27.52 27.52 0 0 0-12.57 1.526 2505.042 2505.042 0 0 1-6.105 2.243c-1.935.725-3.61 1.504-3.683 1.727-.101.214-.165 1.735-.192 3.33l-.007.285c-.041 1.762-1.39 3.167-3.129 2.885-1.551-.26-3.092-.455-3.408-.434-.473.03-.162.78 1.716 4.2 1.497 2.733 3.766 4.9 6.237 6.8.832.64.996.957 1.109 1.427.191.74.093 1.419-.318 2.487-.419 1.096-.482 1.57-.23 1.837.178.213 1.028 1.015 1.877 1.816a7.629 7.629 0 0 0 3.596 1.867l3.714.79a2.159 2.159 0 0 1 1.482 1.142c1.131 2.26 1.626 3.403 1.819 3.985.312 1.027.268 1.444-.28 2.838-.356.901-.776 1.813-.96 2-.268.252.135.815 1.573 2.272 1.074 1.06 2.895 2.95 4.035 4.186 1.177 1.217 2.251 2.275 2.419 2.331.169.054 1.502-.249 2.983-.628 1.939-.508 3.214-1.948 4.051-3.769.67-1.457 1.554-3.372 2.509-5.438 2.032-4.332 3.825-8.125 3.982-8.415.184-.28 1.027-2.009 1.878-3.858.851-1.85 2.647-5.642 3.956-8.422 1.338-2.77 3.287-6.853 4.35-9.066 1.081-2.175 2.061-4.323 2.197-4.74.219-.67.124-.855-.62-1.221-.661-.34-.896-.755-1.126-1.94-.24-1.157-.437-1.5-1.004-1.654-.39-.128-2.74-.402-5.2-.62-2.479-.255-5.767-.588-7.318-.755-1.551-.168-5.758-.617-9.333-1.014Z"
                clipRule="evenodd"
              />
              <path
                fill="url(#i-1853660109__d)"
                fillRule="evenodd"
                d="M440.518 2.348c-.105-1.107 1.018-1.806 1.863-1.083 1.074.967 4.742 4.107 8.11 7.027 3.378 2.892 7.679 6.55 9.545 8.115 1.856 1.593 4.002 3.434 4.777 4.089.989.847 1.308 1.29 1.124 1.57a10.4 10.4 0 0 0-.67 1.014c-.336.51-.2.995 2.538 6.06a1.812 1.812 0 0 0 2.411.756 1.816 1.816 0 0 1 1.348-.118l12.99 3.953a35.612 35.612 0 0 0 5.87 1.258l4.126.524c2.925.379 6.582.842 11.134 1.364 3.108.356 6.205-.73 8.429-2.931a70.262 70.262 0 0 1 2.163-2.051c.814-.742 2.096-.507 2.401.551.238.763.647 2.12 1.372 4.527a7.188 7.188 0 0 0 4.311 4.638c1.814.685 4.14 1.6 5.21 2.01 1.06.44 2.753 1.116 3.823 1.528.935.387 3.049 1.205 7.613 2.958a4.416 4.416 0 0 0 3.227-.024c.199-.08.395-.173.583-.283 1.035-.618 2.097-1.505 2.474-2.091.367-.559 2.124-3.1 3.889-5.669 1.765-2.569 3.871-5.614 4.689-6.796.895-1.282 1.337-1.801 1.523-1.754.045.01.074.053.093.124.063.263.214 3.372.547 13.143a2.235 2.235 0 0 0 1.311 1.959l.251.12c.328.158.623.312.823.431.045.027.088.05.122.073.075.05.123.092.137.12.057.12.225 1.775.375 3.669.212 2.659.164 3.847-.2 4.961-.446 1.365-.732 1.675-4.544 4.84a69.781 69.781 0 0 1-2.219 1.742l-.251.191c-.3.224-.604.446-.912.666-.109.078-.217.158-.325.238-.496.365-.979.748-1.446 1.149-1.905 1.635-3.536 3.568-4.603 5.84a513.377 513.377 0 0 1-2.027 4.29c-.46.967-.955 2.004-1.462 3.062l-.294.615c-.767 1.596-1.549 3.219-2.271 4.706a3141.084 3141.084 0 0 1-6.275 13.062 774.575 774.575 0 0 0-4.441 9.344c-1.134 2.434-2.122 4.609-2.196 4.833-.091.279.291.62 1.241 1.116.996.484 1.097 1.299.324 2.092-.401.411-.884.895-1.406 1.409-.313.312-.611.617-.883.903-1.078 1.133-.872 2.351.437 3.207 1.723 1.149 1.751 1.159 1.338 1.949-.201.427-.355 1.087-.315 1.439.06.323.929 3.629 3.672 13.623a28.072 28.072 0 0 1 .97 8.767l-.274 5.705a7.617 7.617 0 0 0 .921 4.011c.742 1.414 1.145 1.885 1.683 1.938.483.034 1.726 1.427 4.964 5.599.271.353.54.71.808 1.066l.125.166c.245.326.488.653.728.98 1.129 1.537 2.188 3.062 3.051 4.462.143.231.258.474.348.723l.014.04c.054.152.097.308.132.465l.011.05c.034.167.06.336.073.505a4.45 4.45 0 0 1-.498 2.392c-1.082 2.017-3.088 3.302-5.112 4.37a1120.532 1120.532 0 0 1-12.354 6.405 7.967 7.967 0 0 1-4.027.863c-1.747-.072-3.4-.943-4.249-2.472a9.672 9.672 0 0 1-.233-.441c-.686-1.397-2.073-4.903-3.094-7.827-1.323-3.793-1.779-5.515-1.606-6.045.201-.617-.386-1.979-6.485-13.87a5.435 5.435 0 0 0-2.079-2.204l-.991-.582a3.4 3.4 0 0 0-3.36-.05 3.4 3.4 0 0 1-4.447-1.068l-.743-1.093a610.542 610.542 0 0 1-3.573-5.385 3.631 3.631 0 0 0-2.691-1.627c-1.522-.158-1.746-.231-1.85-.665-.039-.26-.035-1.308.014-2.31.023-.467.038-.911.042-1.262.005-.494-.279-.835-.742-.662-.324.141-1.936.447-3.586.679-.681.088-1.237.121-1.678.123-.802.003-1.336-.726-1.088-1.488.219-.669.198-1.078-.1-1.299-.243-.202-1.238-.466-2.213-.599-.975-.134-3.503-.527-5.583-.868-2.081-.34-7.349-1.228-11.715-1.945-4.357-.744-9.216-1.561-10.832-1.811a468.49 468.49 0 0 0-5.566-.923c-1.44-.224-5.015-.806-7.904-1.318-5.268-.888-5.269-.888-6.73-.193-.797.357-3.715 1.254-6.512 1.974-4.391 1.156-5.226 1.254-6.23.926-.687-.225-2.027-1.123-5.846-4.25a2.36 2.36 0 0 1-.776-2.454 2.37 2.37 0 0 0-.886-2.543l-.049-.037c-.746-.552-3.404-2.437-5.874-4.231l-.523-.374c-2.746-1.968-2.501-3.331.687-3.397l.318-.002.441.002c.805.002 1.673.008 2.555.016a750.58 750.58 0 0 1 6.977.106 137.06 137.06 0 0 0 .915.023c4.474.084 7.327-4.352 8.43-8.689.95-3.76 2.19-8.691 2.751-10.976.56-2.282 1.011-4.323 1.02-4.539-.001-.185-1.322-2.098-2.95-4.203-1.48-1.878-.481-4.544 1.865-5.004.908-.178 1.967-.382 3.195-.612a4.464 4.464 0 0 0 3.176-2.395c.54-1.087 1.916-3.692 3.062-5.785a992.449 992.449 0 0 1 3.312-6.166c.669-1.293 1.778-3.366 2.429-4.603 1.04-1.879 1.516-3.313 5.783-18.185.123-.427.42-.795.817-.996a1.601 1.601 0 0 0 .711-2.136l-.972-1.963c-1.541-3.161-1.679-3.403-3.845-4.124a.77.77 0 0 1-.524-.645l-1.117-9.914c-.658-5.735-1.521-13.111-1.894-16.41a177.344 177.344 0 0 1-.401-3.774Zm29.542 79.971c-.112-.036-.223.019-.269.158-.037.113-.724 1.462-1.531 2.986-.12.238-.239.47-.355.694-.798 1.535-2.085 1.905-3.448.839-1.082-.847-2.312-1.712-2.75-1.978-.736-.395-.949-.31-3.869 1.728-1.681 1.177-4.777 3.281-6.847 4.702-3.391 2.254-3.908 2.703-4.826 4.284-.588.95-1.607 2.651-2.287 3.786-.679 1.135-2.056 3.461-3.076 5.164a537.284 537.284 0 0 0-4.617 7.899c-1.542 2.641-3.057 5.199-3.398 5.674-.312.483-.624.967-.67 1.107-.035.113.469.74 1.076 1.431 1.037 1.079 1.141 1.33.849 2.129-.155.473-.225.974-.132 1.066.12.131 3.666.796 7.934 1.512 4.264.746 9.013 1.526 10.536 1.777 1.525.251 7.145 1.192 12.448 2.061 5.305.869 10.98 1.829 12.588 2.108 1.607.278 3.252.538 3.67.582.529.08 1.334-.398 2.967-1.807 1.235-1.044 2.268-1.94 2.298-2.025.027-.087-.299-1.735-.738-3.696-.43-1.991-1.015-4.742-1.33-6.14-.526-2.546-.517-2.574-1.248-2.227-.61.263-1 .228-2.349-.367-1.517-.65-1.732-.843-3.204-3.236a11.3 11.3 0 0 1-.811-1.551c-.435-1.045-.154-2.172.305-3.206.238-.536.5-1.138.724-1.679.695-1.694.951-3.54.703-5.354-.262-1.917-.396-2.561-.456-2.583-.085-.028-.66-.063-1.291-.114-.938-.06-1.264-.197-1.918-.935-.635-.7-.787-1.182-.711-2.453.04-.88.106-2.216.166-2.968.058-1.122-.254-2.057-1.899-5.34-1.108-2.18-2.094-3.98-2.234-4.028Zm50.385-22.865a27.52 27.52 0 0 0-12.57 1.526 2505.042 2505.042 0 0 1-6.105 2.243c-1.935.725-3.61 1.504-3.683 1.727-.101.214-.165 1.735-.192 3.33l-.007.285c-.041 1.762-1.39 3.167-3.129 2.885-1.551-.26-3.092-.455-3.408-.434-.473.03-.162.78 1.716 4.2 1.497 2.733 3.766 4.9 6.237 6.8.832.64.996.957 1.109 1.427.191.74.093 1.419-.318 2.487-.419 1.096-.482 1.57-.23 1.837.178.213 1.028 1.015 1.877 1.816a7.629 7.629 0 0 0 3.596 1.867l3.714.79a2.159 2.159 0 0 1 1.482 1.142c1.131 2.26 1.626 3.403 1.819 3.985.312 1.027.268 1.444-.28 2.838-.356.901-.776 1.813-.96 2-.268.252.135.815 1.573 2.272 1.074 1.06 2.895 2.95 4.035 4.186 1.177 1.217 2.251 2.275 2.419 2.331.169.054 1.502-.249 2.983-.628 1.939-.508 3.214-1.948 4.051-3.769.67-1.457 1.554-3.372 2.509-5.438 2.032-4.332 3.825-8.125 3.982-8.415.184-.28 1.027-2.009 1.878-3.858.851-1.85 2.647-5.642 3.956-8.422 1.338-2.77 3.287-6.853 4.35-9.066 1.081-2.175 2.061-4.323 2.197-4.74.219-.67.124-.855-.62-1.221-.661-.34-.896-.755-1.126-1.94-.24-1.157-.437-1.5-1.004-1.654-.39-.128-2.74-.402-5.2-.62-2.479-.255-5.767-.588-7.318-.755-1.551-.168-5.758-.617-9.333-1.014Z"
                clipRule="evenodd"
              />
              <path
                fill="#fff"
                d="M690.836 28.721c1.625 0 2.641.543 3.048 1.627.541.948.542 2.167 0 3.657l-50.806 130.878c-.678 1.761-1.762 3.251-3.252 4.47-1.355 1.084-3.048 1.626-5.08 1.626h-14.43c-2.032 0-3.522-.542-4.47-1.626-.949-1.084-1.491-2.236-1.626-3.455l-9.552-67.673-35.564 67.673c-.677 1.219-1.694 2.371-3.049 3.455s-3.048 1.626-5.08 1.626h-1.922c-.034-3-.83-6.09-2.597-8.954-1.635-2.65-3.66-5.418-5.492-7.804l-.02-.027-.02-.027c-1.616-2.082-2.981-3.792-4.084-5.035a37.045 37.045 0 0 0-.529-.581l.131-2.732a41.546 41.546 0 0 0-1.435-12.977 2123.348 2123.348 0 0 1-2.783-10.222c.17-1.26.196-2.75-.106-4.382a14.207 14.207 0 0 0 .887-7.475 14.877 14.877 0 0 0-.176-.965 777.243 777.243 0 0 1 3.533-7.419c1.341-2.76 4.173-8.665 6.312-13.138 2.156-4.443 4.878-10.137 6.094-12.76.099-.212.553-.947 2.012-1.99a78.768 78.768 0 0 0 4.085-3.14l.069-.056c1.615-1.34 3.435-2.836 4.752-4.24.071-.075.141-.154.213-.233l-1.404 56.603 30.687-58.123c.541-1.084 1.422-2.167 2.641-3.251 1.219-1.22 2.845-1.829 4.877-1.829h10.975c2.167 0 3.59.61 4.267 1.829.677 1.084 1.084 2.167 1.219 3.251l6.301 59.342 36.376-91.858c1.084-2.71 3.252-4.064 6.503-4.065h18.495ZM736.076 28.721c1.355 0 2.439.475 3.252 1.424.813.948 1.083 2.1.813 3.454l-28.452 132.503c-.271 1.354-.948 2.507-2.031 3.455-1.084.948-2.304 1.422-3.658 1.422h-19.307c-1.355 0-2.439-.474-3.252-1.422-.677-.948-.88-2.101-.61-3.455L711.08 33.599c.271-1.355.949-2.506 2.033-3.454 1.083-.949 2.37-1.424 3.86-1.424h19.103ZM790.302 28.721c1.49 0 2.575.475 3.252 1.424.813.948 1.083 2.1.813 3.454l-24.184 113.196h64.422c1.49 0 2.575.474 3.252 1.422.813.949 1.084 2.169.813 3.659l-3.049 14.226c-.271 1.354-.948 2.507-2.031 3.455-1.084.948-2.372 1.422-3.862 1.422h-88.199c-1.49 0-2.642-.474-3.455-1.422-.677-.948-.881-2.101-.61-3.455l28.249-132.503c.271-1.355.948-2.506 2.031-3.454 1.084-.949 2.372-1.424 3.862-1.424h18.696Z"
              />
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M928.743 28.721c8.941 0 17.003 1.22 24.183 3.658 7.181 2.303 13.142 5.827 17.884 10.568 4.742 4.606 8.061 10.366 9.958 17.275 1.897 6.91 2.033 14.836.407 23.777-1.219 5.961-2.303 11.246-3.251 15.852-.949 4.606-2.169 9.822-3.659 15.648-2.981 12.599-7.248 23.032-12.803 31.296-5.419 8.129-12.668 14.226-21.745 18.291-8.942 3.928-20.39 5.893-34.345 5.893h-53.244c-1.49 0-2.642-.474-3.455-1.422-.677-.948-.881-2.101-.61-3.455l28.249-132.3c.27-1.49.948-2.709 2.031-3.657 1.084-.949 2.371-1.423 3.861-1.424h46.539Zm-48.368 118.887h26.013c7.587 0 13.955-1.084 19.104-3.251 5.283-2.168 9.55-5.624 12.802-10.365 3.251-4.878 5.758-11.245 7.52-19.103 1.083-4.064 1.965-7.587 2.642-10.568a274.062 274.062 0 0 0 1.829-9.144c.677-3.116 1.354-6.64 2.032-10.568 2.167-11.11 1.151-19.307-3.048-24.59-4.065-5.285-11.923-7.926-23.575-7.926h-24.996l-20.323 95.515Z"
                clipRule="evenodd"
              />
              <defs>
                <linearGradient
                  id="i-1853660109__a"
                  x1=".012"
                  x2="970.497"
                  y1="70.806"
                  y2="202.24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#B6CEFF" />
                  <stop offset=".245" stopColor="#F3F5FF" />
                  <stop offset=".476" stopColor="#FFCD79" />
                </linearGradient>
                <linearGradient
                  id="i-1853660109__b"
                  x1=".012"
                  x2="970.497"
                  y1="70.806"
                  y2="202.24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#B6CEFF" />
                  <stop offset=".245" stopColor="#F3F5FF" />
                  <stop offset=".476" stopColor="#FFCD79" />
                </linearGradient>
                <linearGradient
                  id="i-1853660109__c"
                  x1=".012"
                  x2="970.497"
                  y1="70.806"
                  y2="202.24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#B6CEFF" />
                  <stop offset=".245" stopColor="#F3F5FF" />
                  <stop offset=".476" stopColor="#FFCD79" />
                </linearGradient>
                <linearGradient
                  id="i-1853660109__d"
                  x1="760.726"
                  x2="768.466"
                  y1=".97"
                  y2="157.961"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset=".114" stopColor="#FFE2B1" />
                  <stop offset=".519" stopColor="#fff" />
                  <stop offset=".85" stopColor="#FFCD79" />
                </linearGradient>
              </defs>
            </svg>
          </a>
          <div className="hidden lg:block absolute -top-16 -left-4 w-28 h-11 bg-[#FFD896] rounded-full blur-3xl" />
        </div>
        <div className="md:hidden absolute -top-5 -left-9 size-7 bg-[#FFD896] rounded-full blur-[26px]" />
        <div className="flex flex-col flex-1">
          <div className="flex flex-col relative">
            <div className="bg-linear-to-r from-[#152340] to-[#212A53] h-20 flex items-center px-3 md:px-6 relative">
              <div className="flex items-center justify-between flex-1">
                <div className="md:hidden" />
                <div className="items-center gap-3 hidden md:flex">
                  <div
                    ref={gamesTriggerRef}
                    id="reka-popover-trigger-v-0-0"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={isGamesOpen}
                    aria-controls="reka-popover-content-v-0-9"
                    data-state={isGamesOpen ? "open" : "closed"}
                    className="h-11 relative group/button"
                  >
                    <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#D38502] rounded-lg" />
                    <button
                      type="button"
                      className="min-w-40 h-[calc(100%-3px)] bg-[#E5AD4E] group-hover/button:-translate-y-0.5 group-data-[state=open]/button:translate-y-0 transition-transform duration-125 text-[#3A3869] [&>*]:drop-shadow-[0_2px_0_#D38502] rounded-lg px-4 flex items-center outline-none cursor-pointer group relative"
                      onClick={() => setIsGamesOpen((open) => !open)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 14 14"
                        className="size-5.25 mr-2"
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M1.203 5.169.784 8.94a2.305 2.305 0 0 0 4.353 1.286L5.5 9.5h3l.363.726a2.305 2.305 0 0 0 4.353-1.286l-.42-3.771A3 3 0 0 0 9.816 2.5h-5.63a3 3 0 0 0-2.982 2.669m3.172-.794c.345 0 .625.28.625.625v.542h.542a.625.625 0 1 1 0 1.25H5v.541a.625.625 0 1 1-1.25 0v-.541h-.542a.625.625 0 1 1 0-1.25h.542V5c0-.345.28-.625.625-.625m4.89 3.042a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25m1.876-2.175a.625.625 0 1 1-1.25 0 .625.625 0 0 1 1.25 0"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="font-bold">Games</p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-4.5 transition-transform -rotate-180 group-data-[state=open]/button:rotate-0 ml-auto"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          d="m18 15-6-6-6 6"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="relative group">
                    <a
                      href="/rewards"
                      className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-11"
                    >
                      <div
                        className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none bg-[#FFC055]"
                        style={{ top: "var(--sb-shadow-size,3px)" }}
                      />
                      <div
                        className="rounded-lg size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 bg-[linear-gradient(94deg,#FFD896_34%,#FFFFFF_50%,#FFD896_67%)] text-[#40324C] [&>*]:drop-shadow-[0_2px_0_#FFC055] font-bold px-3.25"
                        style={{
                          height: "calc(100% - var(--sb-shadow-size,3px))",
                        }}
                      >
                        {/**/}
                        <div className="transition-opacity flex items-center justify-center size-full">
                          <RewardsIcon className="size-5 xl:mr-2" />
                          <span className="hidden xl:block">REWARDS</span>
                        </div>
                      </div>
                    </a>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 128 37"
                      className="absolute top-0 -left-0.25 w-11.5 xl:w-33.5 h-11 pointer-events-none"
                    >
                      <path fill="url(#i856738536__a)" d="M3 7h1v7H3z" />
                      <path
                        fill="url(#i856738536__b)"
                        d="M0 11h1v7H0z"
                        transform="rotate(-90 0 11)"
                      />
                      <path fill="url(#i856738536__c)" d="M44 0h1v7h-1z" />
                      <path
                        fill="url(#i856738536__d)"
                        d="M41 4h1v7h-1z"
                        transform="rotate(-90 41 4)"
                      />
                      <path fill="url(#i856738536__e)" d="M34 28h1v7h-1z" />
                      <path
                        fill="url(#i856738536__f)"
                        d="M31 32h1v7h-1z"
                        transform="rotate(-90 31 32)"
                      />
                      <path fill="url(#i856738536__g)" d="M89 1h1v7h-1z" />
                      <path
                        fill="url(#i856738536__h)"
                        d="M86 5h1v7h-1z"
                        transform="rotate(-90 86 5)"
                      />
                      <path
                        fill="url(#i856738536__i)"
                        d="M122.857 18h1.286v9h-1.286z"
                      />
                      <path
                        fill="url(#i856738536__j)"
                        d="M119 23.143h1.286v9H119z"
                        transform="rotate(-90 119 23.143)"
                      />
                      <path fill="url(#i856738536__k)" d="M92 30h1v7h-1z" />
                      <path
                        fill="url(#i856738536__l)"
                        d="M89 34h1v7h-1z"
                        transform="rotate(-90 89 34)"
                      />
                      <defs>
                        <linearGradient
                          id="i856738536__a"
                          x1="3.5"
                          x2="3.5"
                          y1={7}
                          y2={14}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__b"
                          x1=".5"
                          x2=".5"
                          y1={11}
                          y2={18}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__c"
                          x1="44.5"
                          x2="44.5"
                          y1={0}
                          y2={7}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__d"
                          x1="41.5"
                          x2="41.5"
                          y1={4}
                          y2={11}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__e"
                          x1="34.5"
                          x2="34.5"
                          y1={28}
                          y2={35}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__f"
                          x1="31.5"
                          x2="31.5"
                          y1={32}
                          y2={39}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__g"
                          x1="89.5"
                          x2="89.5"
                          y1={1}
                          y2={8}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__h"
                          x1="86.5"
                          x2="86.5"
                          y1={5}
                          y2={12}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__i"
                          x1="123.5"
                          x2="123.5"
                          y1={18}
                          y2={27}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__j"
                          x1="119.643"
                          x2="119.643"
                          y1="23.143"
                          y2="32.143"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__k"
                          x1="92.5"
                          x2="92.5"
                          y1={30}
                          y2={37}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient
                          id="i856738536__l"
                          x1="89.5"
                          x2="89.5"
                          y1={34}
                          y2={41}
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#fff" stopOpacity={0} />
                          <stop offset=".504" stopColor="#fff" />
                          <stop offset={1} stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <p
                      className="text-[#00FF79] -top-2.5 -right-2.5 absolute font-bold no-interaction group-hover:-translate-y-0.5 group-active:translate-y-0 transition-transform duration-125"
                      style={{
                        textShadow:
                          "rgb(64, 50, 76) 0px 2.5px 0px, rgb(64, 50, 76) -1.5px -1.5px 0px, rgb(64, 50, 76) 1.5px -1.5px 0px, rgb(64, 50, 76) -1.5px 1.5px 0px, rgb(64, 50, 76) 1.5px 1.5px 0px",
                      }}
                    >
                      {" "}
                      NEW{" "}
                    </p>
                  </div>
                </div>
                {signedInUser ? (
                  <SignedInHeaderControls
                    user={signedInUser}
                    onLogout={() => setSignedInUser(null)}
                    selectedCurrency={selectedBalanceType}
                    onSelectCurrency={onBalanceTypeChange}
                  />
                ) : (
                <button
                  type="button"
                  className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5"
                  onClick={() => setIsSignInOpen(true)}
                >
                  <div
                    className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none"
                    style={{
                      top: "var(--sb-shadow-size,3px)",
                      backgroundColor: "rgb(211, 133, 2)",
                    }}
                  />
                  <div
                    className="rounded-lg size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 font-bold px-3.25"
                    style={{
                      height: "calc(100% - var(--sb-shadow-size,3px))",
                      backgroundColor: "rgb(243, 178, 57)",
                      color: "rgb(58, 56, 105)",
                    }}
                  >
                    {/**/}
                    <div
                      className="transition-opacity flex items-center justify-center size-full"
                      style={{
                        filter: "drop-shadow(rgb(211, 133, 2) 0px 2px 0px)",
                      }}
                    >
                      {" "}
                      SIGN IN{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-5 ml-1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          d="M5 12h14m-7-7 7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isGamesOpen &&
        createPortal(
          <GamesDropdown
            style={dropdownStyle}
            selectedGame={selectedGame}
            onSelect={navigateToGame}
          />,
          document.body,
        )}
      {isSignInOpen &&
        createPortal(
          <SignInModal
            onClose={() => setIsSignInOpen(false)}
            onSignedIn={handleSignedIn}
          />,
          document.body,
        )}
    </>
  );
}
