import { useCallback, useEffect, useRef, useState } from "react";
import { showNotification } from "./NotificationCenter";
import SquircleLoader from "./SquircleLoader";

const hiddenIfMissing = (event) => {
  event.currentTarget.style.display = "none";
};

function RaisedButton({ children, className = "", frontClassName = "", green = false, disabled = false, type = "button", onClick }) {
  const shadow = green ? "rgb(15, 195, 101)" : "rgb(211, 133, 2)";
  const background = green ? "rgb(92, 223, 154)" : "rgb(243, 178, 57)";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button ${disabled ? "opacity-40 pointer-events-none" : ""} ${className}`}>
      <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: shadow }} />
      <div className={`rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 ${frontClassName}`} style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: background, color: "rgb(58, 56, 105)" }}>
        <div className="transition-opacity flex items-center justify-center size-full" style={{ filter: `drop-shadow(${shadow} 0px 2px 0px)` }}>{children}</div>
      </div>
    </button>
  );
}

const cryptoOptions = [
  { id: "SOL", color: "217, 34, 254" },
  { id: "LTC", color: "191, 187, 187" },
  { id: "BTC", color: "247, 147, 26" },
  { id: "ETH", color: "95, 126, 221" },
  { id: "USDT", color: "80, 175, 149" },
];

function CryptoIcon({ id }) {
  if (id === "SOL") return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="size-8.5 rounded-[11px] relative"><circle cx="15" cy="15" r="15" fill="#0D192B" /><path fill="url(#wallet-sol-a)" d="M8.956 18.19a.612.612 0 0 1 .411-.164h14.292a.291.291 0 0 1 .21.494l-2.805 2.823a.585.585 0 0 1-.411.174H6.334a.292.292 0 0 1-.2-.5l2.822-2.826Z" /><path fill="url(#wallet-sol-b)" d="M8.954 7.655a.585.585 0 0 1 .411-.174h14.291a.292.292 0 0 1 .21.5l-2.805 2.825a.575.575 0 0 1-.41.164H6.33a.292.292 0 0 1-.2-.485l2.823-2.83Z" /><path fill="url(#wallet-sol-c)" d="M21.063 12.892a.585.585 0 0 0-.411-.175H6.334a.293.293 0 0 0-.2.5l2.824 2.824c.109.11.256.173.411.174h14.29a.292.292 0 0 0 .21-.5l-2.806-2.823Z" /><defs><linearGradient id="wallet-sol-a" x1="22.302" x2="21.922" y1="24.324" y2="5.179" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3" /><stop offset="1" stopColor="#DC1FFF" /></linearGradient><linearGradient id="wallet-sol-b" x1="17.959" x2="17.579" y1="26.565" y2="7.44" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3" /><stop offset="1" stopColor="#DC1FFF" /></linearGradient><linearGradient id="wallet-sol-c" x1="20.123" x2="19.742" y1="25.45" y2="6.319" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3" /><stop offset="1" stopColor="#DC1FFF" /></linearGradient></defs></svg>;
  if (id === "LTC") return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="size-8.5 rounded-[11px] relative"><g fill="none" fillRule="evenodd"><circle cx="16" cy="16" r="16" fill="#bfbbbb" /><path fill="#fff" d="M10.427 19.214 9 19.768l.688-2.759 1.444-.58L13.213 8h5.129l-1.519 6.196 1.41-.571-.68 2.75-1.427.571-.848 3.483H23L22.127 24H9.252z" /></g></svg>;
  if (id === "BTC") return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="size-8.5 rounded-[11px] relative"><g fill="none" fillRule="evenodd"><circle cx="16" cy="16" r="16" fill="#f7931a" /><path fill="#fff" fillRule="nonzero" d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839q-.565-.127-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235q.073.017.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84q.707.19 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538m-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11m.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733" /></g></svg>;
  if (id === "ETH") return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="size-8.5 rounded-[11px] relative"><g fill="none" fillRule="evenodd"><circle cx="16" cy="16" r="16" fill="#627eea" /><g fill="#fff" fillRule="nonzero"><path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" /><path d="M16.498 4 9 16.22l7.498-3.35z" /><path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" /><path d="M16.498 27.995v-6.028L9 17.616z" /><path fillOpacity=".2" d="m16.498 20.573 7.497-4.353-7.497-3.348z" /><path fillOpacity=".602" d="m9 16.22 7.498 4.353v-7.701z" /></g></g></svg>;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="size-8.5 rounded-[11px] relative"><g fill="none" fillRule="evenodd"><circle cx="16" cy="16" r="16" fill="#26a17b" /><path fill="#fff" d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658s2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118s3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116s-3.301-1.914-7.694-2.117" /></g></svg>;
}

function CryptoOption({ option }) {
  return <button className="rounded-[13px] p-0.5 relative overflow-hidden group cursor-pointer" style={{ background: `linear-gradient(to right, rgba(${option.color}, 0.6), rgb(37, 51, 97))` }}><div className="w-19 h-17 rounded-full absolute top-1/2 -left-10 -translate-y-1/2 blur-2xl opacity-80 group-hover:opacity-100 group-hover:scale-140 transition-transform duration-300" style={{ background: `rgb(${option.color})` }} /><div className="bg-[#253361] p-2 flex items-center gap-3 rounded-xl"><CryptoIcon id={option.id} /><p className="font-medium text-sm relative">{option.id}</p></div></button>;
}

function SwappedCardArtwork() {
  return <>
    <div className="absolute inset-0" style={{ maskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)" }}>
      <svg data-v-97a3b0ca="" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 162 164" className="size-38 absolute -bottom-10 left-1/2 -translate-x-1/2"><path fill="currentColor" d="M161.232 46.51a39.489 39.489 0 0 0-1.499-5.292 37.936 37.936 0 0 0-1.423-3.35 40.304 40.304 0 0 0-2.454-4.302 37.822 37.822 0 0 0-2.979-3.916v-.019c-.4-.47-.822-.921-1.266-1.35-.124-.135-.255-.255-.375-.375L134.744 11.36l-.041.023A37.098 37.098 0 0 0 107.99 0H37.244A37.253 37.253 0 0 0 10.93 10.918 37.338 37.338 0 0 0 0 37.253v72.735a37.242 37.242 0 0 0 10.352 25.716l17.526 17.527a37.639 37.639 0 0 0 4.945 4.16c1.36.933 2.776 1.78 4.241 2.535a36.927 36.927 0 0 0 9.434 3.324c2.466.501 4.977.753 7.493.75h70.72c2.533.008 5.06-.244 7.541-.75a43.296 43.296 0 0 0 3.545-.927 37.2 37.2 0 0 0 14.701-8.683 45.683 45.683 0 0 0 2.623-2.787 37.2 37.2 0 0 0 4.331-6.256c.307-.574.588-1.125.876-1.714a36.442 36.442 0 0 0 1.424-3.323c.191-.574.401-1.163.573-1.722.378-1.175.687-2.371.926-3.582.501-2.469.752-4.982.749-7.502V54.011a37.684 37.684 0 0 0-.749-7.535m-36.54 104.475H53.984a23.87 23.87 0 0 1-12.873-3.725 24.283 24.283 0 0 1-8.284-8.791 24.317 24.317 0 0 1-3.027-11.699V54.011a24.251 24.251 0 0 1 7.098-17.1 24.197 24.197 0 0 1 17.086-7.092h70.727a24.111 24.111 0 0 1 11.718 3.01 24.143 24.143 0 0 1 8.786 8.325 23.891 23.891 0 0 1 3.717 12.887v72.698a24.254 24.254 0 0 1-7.1 17.122 24.197 24.197 0 0 1-17.11 7.09" /><path fill="currentColor" d="M107.54 95.86H69.326c-1.43 0-2.801.568-3.812 1.58a5.4 5.4 0 0 0 0 7.633 5.389 5.389 0 0 0 3.812 1.581H87.98v10.686l.112-.09a5.393 5.393 0 0 0 3.602 4.74 5.39 5.39 0 0 0 5.764-1.469l14.076-15.637a5.398 5.398 0 0 0-1.071-8.133 5.38 5.38 0 0 0-2.934-.87M68.921 85.976h38.192a5.4 5.4 0 0 0 5.458-5.273 5.403 5.403 0 0 0-5.203-5.526H88.459V64.48l-.112.09a5.382 5.382 0 0 0-3.6-4.75 5.367 5.367 0 0 0-5.766 1.494L64.905 76.96a5.395 5.395 0 0 0 4.005 9.002" /></svg>
    </div>
    <svg data-v-97a3b0ca="" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 133 36" className="h-8 absolute top-1/2 right-4 -translate-y-1/2"><path fill="#fff" d="M35.421 10.209a8.653 8.653 0 0 0-.329-1.162 8.312 8.312 0 0 0-.313-.735 8.32 8.32 0 0 0-1.194-1.804v-.004a4.137 4.137 0 0 0-.277-.296c-.027-.03-.056-.056-.083-.083l-3.623-3.631-.009.005A8.156 8.156 0 0 0 23.724 0H8.182A8.188 8.188 0 0 0 0 8.177v15.965a8.17 8.17 0 0 0 2.274 5.645l3.85 3.847c.336.335.7.64 1.087.913.299.205.61.39.932.556a8.12 8.12 0 0 0 3.718.895h15.537a8.159 8.159 0 0 0 1.657-.165 8.173 8.173 0 0 0 4.585-2.721 8.16 8.16 0 0 0 1.456-2.479c.042-.126.088-.255.126-.378a8.224 8.224 0 0 0 .368-2.433V11.855c.001-.555-.054-1.11-.165-1.654m-8.027 22.932H11.86a5.247 5.247 0 0 1-2.828-.817 5.332 5.332 0 0 1-2.485-4.498V11.855a5.32 5.32 0 0 1 5.313-5.31h15.538a5.3 5.3 0 0 1 4.505 2.488 5.24 5.24 0 0 1 .816 2.829v15.957a5.32 5.32 0 0 1-5.319 5.314" /><path fill="#fff" d="M23.626 21.04H15.23a1.184 1.184 0 1 0 0 2.37h4.098v2.346l.025-.02a1.184 1.184 0 0 0 2.058.718l3.092-3.432a1.185 1.185 0 0 0-.88-1.976M15.141 18.872h8.39a1.185 1.185 0 0 0 .057-2.37h-4.154v-2.349l-.025.02a1.18 1.18 0 0 0-2.058-.715l-3.092 3.434a1.183 1.183 0 0 0 .88 1.976M69.894 15.456l-3.001 9.386a.969.969 0 0 1-.921.67h-1.615a.919.919 0 0 1-.878-.658l-1.376-4.59a.151.151 0 0 0-.29 0l-1.4 4.675a.802.802 0 0 1-.767.571h-1.851a.768.768 0 0 1-.731-.533l-3.002-9.37a.633.633 0 0 1 .6-.826h1.975a.768.768 0 0 1 .746.572l1.252 4.658a.152.152 0 0 0 .291 0l1.375-4.724a.706.706 0 0 1 .677-.509h1.942a.709.709 0 0 1 .68.51l1.38 4.718a.151.151 0 0 0 .29 0l1.285-4.783a.605.605 0 0 1 .585-.448h2.258a.521.521 0 0 1 .497.68M81.69 15.42v9.445a.646.646 0 0 1-.645.646h-2.058a.521.521 0 0 1-.521-.522v-.487a4.034 4.034 0 0 1-3.198 1.31 5.694 5.694 0 0 1-5.127-5.668 5.697 5.697 0 0 1 5.126-5.668 4.11 4.11 0 0 1 3.015 1.113.11.11 0 0 0 .183-.075v-.28a.452.452 0 0 1 .452-.453h2.122a.646.646 0 0 1 .645.646m-3.219 4.717a2.553 2.553 0 0 0-4.378-1.713 2.553 2.553 0 0 0 1.827 4.333 2.448 2.448 0 0 0 2.558-2.334c.005-.095.005-.19 0-.285M108.37 20.14a5.392 5.392 0 0 1-5.098 5.667h-.032a4.267 4.267 0 0 1-2.68-.823.324.324 0 0 0-.519.256v4.051a.504.504 0 0 1-.504.505h-2.212a.504.504 0 0 1-.505-.504v-14.01a.505.505 0 0 1 .504-.504h2.167a.549.549 0 0 1 .548.548v.243c0 .022.009.043.024.058a.085.085 0 0 0 .091.018.081.081 0 0 0 .028-.019 4.08 4.08 0 0 1 3.053-1.152 5.39 5.39 0 0 1 5.137 5.63v.036m-3.219 0a2.553 2.553 0 0 0-3.089-2.427 2.548 2.548 0 0 0-1.969 2.021 2.552 2.552 0 0 0 2.507 3.026 2.45 2.45 0 0 0 2.558-2.334c.005-.095.005-.19 0-.285M115.354 22.935a3.012 3.012 0 0 0 1.639-.46.948.948 0 0 1 .988-.028l1.481.853a.513.513 0 0 1 .128.791 5.817 5.817 0 0 1-7.844.887 5.822 5.822 0 0 1-1.819-2.212 5.822 5.822 0 0 1 .323-5.541 5.812 5.812 0 0 1 4.822-2.747 5.416 5.416 0 0 1 5.457 5.38c0 .096 0 .192-.006.287.001.26-.015.52-.045.779a.585.585 0 0 1-.582.51h-6.874a.165.165 0 0 0-.147.238 2.501 2.501 0 0 0 2.476 1.267m1.755-3.907a.163.163 0 0 0 .154-.219 2.437 2.437 0 0 0-2.24-1.482 2.432 2.432 0 0 0-2.239 1.482.166.166 0 0 0 .095.21c.019.006.039.01.059.01l4.171-.001ZM132.95 11.039v13.913a.557.557 0 0 1-.556.557h-2.182a.483.483 0 0 1-.483-.482v-.18a.14.14 0 0 0-.236-.101 4.131 4.131 0 0 1-2.963 1.062 5.385 5.385 0 0 1-4.818-3.556 5.392 5.392 0 0 1-.314-2.08v-.033a5.4 5.4 0 0 1 1.378-3.89 5.392 5.392 0 0 1 3.725-1.774h.035a4.26 4.26 0 0 1 2.69.828.318.318 0 0 0 .458-.082.32.32 0 0 0 .049-.165V11.04a.558.558 0 0 1 .556-.557h2.107a.558.558 0 0 1 .556.556h-.002Zm-3.219 9.108a2.558 2.558 0 0 0-2.501-2.572 2.554 2.554 0 0 0-2.607 2.465v.107a2.553 2.553 0 0 0 4.31 1.874 2.56 2.56 0 0 0 .798-1.767v-.107ZM95.3 20.166a5.393 5.393 0 0 1-3.06 5.149 5.39 5.39 0 0 1-2.038.518h-.029a4.266 4.266 0 0 1-2.68-.816.323.323 0 0 0-.518.257v4.052a.505.505 0 0 1-.504.504h-2.217a.504.504 0 0 1-.504-.504V15.304a.504.504 0 0 1 .504-.505h2.164a.549.549 0 0 1 .549.549v.247a.083.083 0 0 0 .142.057 4.093 4.093 0 0 1 3.055-1.153 5.387 5.387 0 0 1 5.132 5.636v.032m-3.219 0a2.552 2.552 0 1 0-2.551 2.62 2.449 2.449 0 0 0 2.558-2.334c.005-.095.005-.19 0-.285M52.799 20.42a3.26 3.26 0 0 0-1.42-1.07 14.587 14.587 0 0 0-1.63-.514 7.38 7.38 0 0 1-1.35-.459c-.333-.159-.493-.351-.493-.59a.619.619 0 0 1 .297-.54c.247-.155.537-.231.828-.216a1.611 1.611 0 0 1 1.365.638.658.658 0 0 0 .839.185l1.486-.81.04-.024a.535.535 0 0 0 .148-.741 4.367 4.367 0 0 0-1.473-1.317 5.066 5.066 0 0 0-2.41-.601 4.698 4.698 0 0 0-2.951.93 3.082 3.082 0 0 0-1.203 2.564 2.77 2.77 0 0 0 .591 1.8 3.43 3.43 0 0 0 1.418 1.044c.532.211 1.075.39 1.629.536.462.116.914.274 1.349.47.334.159.494.352.494.59a.643.643 0 0 1-.313.59 2.035 2.035 0 0 1-1.051.211 1.894 1.894 0 0 1-1.754-.848.652.652 0 0 0-.879-.238l-1.354.764a.724.724 0 0 0-.239 1.028 4.69 4.69 0 0 0 4.235 2.006h.184a5.237 5.237 0 0 0 2.934-.906 3.017 3.017 0 0 0 1.27-2.607 2.978 2.978 0 0 0-.586-1.88" /></svg>
  </>;
}

function WithdrawView() {
  const withdrawOptions = [
    cryptoOptions.find((option) => option.id === "LTC"),
    cryptoOptions.find((option) => option.id === "SOL"),
  ];

  return <>
    <div className="w-full h-0.5 bg-[#253361] rounded-full" />
    <div data-v-1de7bf4c="" className="flex flex-col gap-3">
      <p data-v-1de7bf4c="" className="font-medium">ROBLOX INGAME</p>
      <a data-v-1de7bf4c="" href="/marketplace" className="h-30 relative rounded-2xl overflow-hidden group cursor-pointer" type="button" style={{ background: "linear-gradient(100deg, rgba(37, 51, 97, 0) 0%, rgba(243, 178, 57, 0.8) 100%), rgb(46, 63, 119)" }}>
        <div data-v-1de7bf4c="" className="absolute inset-0" style={{ "--tw-mask-image": "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)", maskImage: "var(--tw-mask-image)" }}><img data-v-1de7bf4c="" src="/wallet/mm2-illustration.webp" alt="Murder Mystery 2" className="size-full object-cover pointer-events-none" onError={hiddenIfMissing} /></div>
        <img data-v-1de7bf4c="" src="/wallet/gingerscope-illustration.webp" alt="Gingerscope" className="w-[140px] h-[74px] float-anim object-cover pointer-events-none ml-auto mr-2 drop-shadow-[0_3px_2px_rgba(0,0,0,0.25)] absolute bottom-3 right-4 animate-[float_6s_ease-in-out_infinite] transition-transform duration-500 group-hover:rotate-3" style={{ animationDelay: "2s" }} onError={hiddenIfMissing} />
        <img data-v-1de7bf4c="" src="/wallet/corrupt-illustration.webp" alt="Corrupt" className="w-[60px] h-[70px] float-anim object-cover pointer-events-none ml-auto mr-2 drop-shadow-[0_3px_2px_rgba(0,0,0,0.25)] absolute bottom-9 right-0 animate-[float_6s_ease-in-out_infinite] transition-transform duration-500 group-hover:-rotate-3" style={{ animationDelay: "3s" }} onError={hiddenIfMissing} />
        <p data-v-1de7bf4c="" className="font-semibold absolute bottom-4 left-4">MURDER MYSTERY 2</p>
      </a>
    </div>
    <div className="flex flex-col gap-3"><p className="font-medium">CRYPTO CURRENCIES</p><div className="grid grid-cols-2 gap-3">{withdrawOptions.map((option) => <CryptoOption key={option.id} option={option} />)}</div></div>
  </>;
}

function BotActionLink({ children, href, secondary = false }) {
  const shadow = secondary ? "rgb(31, 43, 71)" : "rgb(211, 133, 2)";
  const background = secondary ? "rgb(53, 71, 116)" : "rgb(243, 178, 57)";
  const color = secondary ? "rgb(255, 255, 255)" : "rgb(58, 56, 105)";
  return <a href={href} rel="noopener noreferrer" target="_blank" className="relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10 flex-1 sm:flex-none">
    <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: shadow }} />
    <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 sm:px-3" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: background, color }}><div className="transition-opacity flex items-center justify-center size-full" style={{ filter: `drop-shadow(${shadow} 0px 2px 0px)` }}>{children}</div></div>
  </a>;
}

function Mm2BotRow({ name, online, avatar, joinUrl, profileUrl }) {
  const pingClass = online ? "bg-success/75" : "bg-error/75";
  const gradientClass = online ? "from-success" : "from-error";
  const dotClass = online ? "bg-success" : "bg-error";
  const textClass = online ? "text-success" : "text-error";
  return <div className="flex sm:items-center flex-col sm:flex-row gap-3.5">
    <div className="flex items-center gap-3.5 min-w-0">
      <div className="size-16 relative shrink-0">
        <div className="size-full rounded-[16px] flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end) p-0.5" style={{ "--level-border-start": "#1f1f2f", "--level-border-end": "#E5AD4E", "--level-text": "#E5AD4E" }}><div className="size-full flex items-center justify-center rounded-[14px]" style={{ backgroundColor: "rgb(20, 25, 45)" }}><img src={avatar} className="size-9/12 object-contain object-center ease-in-out opacity-0 transition-opacity no-interaction rounded-[9px]" alt={avatar} loading="lazy" fetchPriority="low" style={{ opacity: 1 }} /></div></div>
        <div className="flex size-3.5 absolute bottom-0 right-0"><span className={`animate-ping absolute inline-flex size-full rounded-full transition-colors ${pingClass}`} /><div className={`relative size-full rounded-full p-[2px] bg-gradient-to-b to-[#E5AD4E] transition-colors ${gradientClass}`}><span className={`block w-full h-full rounded-full transition-colors ${dotClass}`} /></div></div>
      </div>
      <div className="flex flex-col min-w-0"><p className="font-medium truncate">{name}</p><p className={`text-sm font-medium transition-colors ${textClass}`}>{online ? "Online" : "Offline"}</p></div>
    </div>
    <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto shrink-0"><BotActionLink href={joinUrl}><span>JOIN</span></BotActionLink><BotActionLink href={profileUrl} secondary>PROFILE</BotActionLink></div>
  </div>;
}

function Mm2DepositView({ onBack, onClose }) {
  const [mmv2, setMmv2] = useState("1,000");
  const [coinValue, setCoinValue] = useState("1,000");
  const updateMmv2 = (value) => {
    const clean = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
    setMmv2(clean);
    setCoinValue(clean);
  };
  const updateCoins = (value) => {
    const clean = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
    setCoinValue(clean);
    setMmv2(clean);
  };
  const formatValues = () => {
    const amount = Number(mmv2.replace(/,/g, "") || coinValue.replace(/,/g, ""));
    if (Number.isFinite(amount)) {
      const formatted = amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
      setMmv2(formatted);
      setCoinValue(formatted);
    }
  };

  return <div className="flex flex-col gap-6 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80">
    <h2 id="reka-dialog-title-v-2" className="sr-only">Wallet</h2>
    <div className="flex items-center gap-1.5">
      <div className="text-lg sm:text-xl font-semibold flex items-center gap-2"><img src="/wallet/mm2.webp" alt="MM2" width="32" height="32" className="size-8 rounded-lg shrink-0" /><p className="shrink-0">DEPOSIT MM2</p></div>
      <div className="flex items-center gap-3 ml-auto"><button type="button" onClick={onBack} className="cursor-pointer text-accent px-3 h-10 bg-[#253361] hover:bg-[#2D3D73] rounded-lg hidden sm:flex items-center font-medium transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5 rotate-180" strokeWidth="2.5"><path fill="none" stroke="currentColor" d="M5 12h14m-7-7 7 7-7 7" /></svg><span className="ml-1.5">BACK</span></button><button type="button" aria-label="Close" onClick={onClose} className="text-accent cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"><path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" /></svg></button></div>
    </div>
    <div className="w-full h-0.5 bg-[#253361] rounded-full shrink-0" />
    <div className="flex flex-col gap-4.5 min-w-0">
      <p className="font-medium text-accent/85">Please verify the bot&apos;s name before trading. If you trade a fake bot you will not be credited. If your account is &lt;13, visit the bot&apos;s profile and follow the steps shown in their bio.</p>
      <div className="flex bg-[#253361] rounded-xl p-4 max-h-76"><div dir="ltr" className="w-full overflow-hidden rounded-[13px]" style={{ position: "relative", "--reka-scroll-area-corner-width": "0px", "--reka-scroll-area-corner-height": "0px" }}><div data-reka-scroll-area-viewport="" className="h-full w-full" tabIndex={0} style={{ overflow: "hidden scroll" }}><div><div className="w-full flex flex-col gap-3 p-3.5 bg-[#151C35]"><Mm2BotRow name="MM2W_HHH" online avatar="https://tr.rbxcdn.com/30DAY-AvatarHeadshot-EF723055A3F0324529727534E42B611A-Png/180/180/AvatarHeadshot/Webp/noFilter" joinUrl="https://www.roblox.com/share?code=0a9df74bc8b2b047991ef0df2a35de2d&type=Server" profileUrl="https://www.roblox.com/users/10955141707/profile" /><div className="w-full h-0.5 rounded-full bg-accent/13" /><Mm2BotRow name="MM2W_FFF" avatar="https://tr.rbxcdn.com/30DAY-AvatarHeadshot-E5D5EC5FCAC27DF8ED8A278C4C6FA2AA-Png/180/180/AvatarHeadshot/Webp/noFilter" joinUrl="https://www.roblox.com/share?code=fa7799fba146144eac9733f011c50fde&type=Server" profileUrl="https://www.roblox.com/users/10953571946/profile" /></div></div></div></div></div>
    </div>
    <div className="flex flex-col gap-3 bg-[#253361] rounded-xl p-4"><p className="font-medium text-accent">CONVERSION RATE</p><div className="flex flex-col sm:flex-row items-center gap-3"><div className="bg-[#151C35] h-12 px-3 flex items-center gap-3 rounded-[10px] sm:flex-1 min-w-0 w-full"><p className="font-medium text-sm text-primary shrink-0">MMV2</p><div className="flex-1 min-w-0"><div className="w-full relative flex group rounded-lg items-center justify-center"><div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" /><input id="v-2-0" type="text" value={mmv2} onFocus={() => setMmv2((value) => value.replace(/,/g, ""))} onChange={(event) => updateMmv2(event.target.value)} onBlur={formatValues} className="bg-transparent text-white outline-none min-w-0 w-full h-full font-medium text-sm text-right ml-auto peer text-[15px] placeholder:text-accent" inputMode="decimal" /></div></div></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5 text-accent hidden sm:block" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path fill="none" stroke="currentColor" d="M5 9h14M5 15h14" /></svg><div className="bg-[#151C35] h-12 px-3 flex items-center gap-3 rounded-[10px] sm:flex-1 min-w-0 w-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5 text-accent block sm:hidden" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path fill="none" stroke="currentColor" d="M5 9h14M5 15h14" /></svg><img src="/coin.webp" alt="" className="bg-cover bg-center size-6 shrink-0" /><div className="flex-1 min-w-0"><div className="w-full relative flex group rounded-lg items-center justify-center"><div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" /><input id="v-2-1" type="text" value={coinValue} onFocus={() => setCoinValue((value) => value.replace(/,/g, ""))} onChange={(event) => updateCoins(event.target.value)} onBlur={formatValues} className="bg-transparent text-white outline-none min-w-0 w-full h-full font-medium text-sm text-right ml-auto peer text-[15px] placeholder:text-accent" inputMode="decimal" /></div></div></div></div></div>
  </div>;
}

const kinguinGiftCards = [
  { coins: 500, price: "5.00", href: "https://www.kinguin.net/category/443565/mm2wild-500-coins-gift-card" },
  { coins: 1000, price: "10.00", href: "https://www.kinguin.net/category/447069/mm2wild-1000-coins-gift-card" },
  { coins: 2500, price: "25.00", href: "https://www.kinguin.net/category/447070/mm2wild-2500-coins-gift-card" },
  { coins: 5000, price: "50.00", href: "https://www.kinguin.net/category/447072/mm2wild-5000-coins-gift-card" },
  { coins: 10000, price: "100.00", href: "https://www.kinguin.net/category/447077/mm2wild-10000-coins-gift-card" },
  { coins: 15000, price: "150.00", href: "https://www.kinguin.net/category/447078/mm2wild-15000-coins-gift-card" },
  { coins: 25000, price: "250.00", href: "https://www.kinguin.net/category/447079/mm2wild-25000-coins-gift-card" },
  { coins: 50000, price: "500.00", href: "https://www.kinguin.net/category/447085/mm2wild-50000-coins-gift-card" },
];

function DollarIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="rounded-full size-6 shrink-0"><path fill="#6CDE07" d="M20 20H0V0h20v20ZM9.437 4a.324.324 0 0 0-.24.094.325.325 0 0 0-.093.239v.934c-.893.124-1.596.435-2.109.933a2.453 2.453 0 0 0-.756 1.814c0 .55.124 1.013.371 1.386.248.365.606.662 1.075.893.477.222 1.052.405 1.724.547.522.107.938.213 1.247.32.319.098.55.213.69.347a.61.61 0 0 1 .213.48c0 .275-.133.493-.398.653-.256.16-.641.24-1.154.24-.31 0-.571-.036-.783-.107a1.562 1.562 0 0 1-.504-.306 1.647 1.647 0 0 1-.292-.387 1.111 1.111 0 0 0-.186-.174.48.48 0 0 0-.278-.066H6.292c-.08 0-.15.031-.212.094a.257.257 0 0 0-.08.186c.018.409.141.8.371 1.173.23.364.57.676 1.022.934.46.257 1.03.431 1.711.52v.92c0 .098.032.177.093.24a.323.323 0 0 0 .24.093h1.1a.306.306 0 0 0 .226-.094.304.304 0 0 0 .106-.239v-.934c.628-.08 1.176-.244 1.645-.493a2.841 2.841 0 0 0 1.088-.973c.265-.4.398-.863.398-1.387 0-.542-.115-.991-.345-1.347-.23-.364-.592-.657-1.088-.88-.495-.23-1.145-.422-1.95-.573a10.744 10.744 0 0 1-1.154-.307c-.283-.097-.487-.213-.61-.346a.693.693 0 0 1-.173-.467c0-.284.11-.494.332-.627.22-.142.522-.213.902-.213.363 0 .659.076.889.227.23.142.371.311.424.507a.49.49 0 0 0 .186.172c.07.036.155.054.252.054h1.751a.27.27 0 0 0 .2-.08.304.304 0 0 0 .08-.2c-.01-.32-.125-.654-.346-1-.213-.347-.526-.658-.942-.934-.415-.275-.929-.466-1.539-.573v-.96a.304.304 0 0 0-.106-.24.307.307 0 0 0-.226-.093h-1.1Z" /></svg>;
}

function RedeemSpinner() {
  return <svg viewBox="0 0 40 40" className="ring-loader size-5.5 [--uib-speed:1.5s]" aria-hidden="true"><circle className="track" cx="20" cy="20" r="17.5" fill="none" strokeWidth="5" /><circle className="car" cx="20" cy="20" r="17.5" fill="none" strokeWidth="5" pathLength="100" /></svg>;
}

function KinguinDepositView({ onBack, onClose }) {
  const [giftcardCode, setGiftcardCode] = useState("");
  const [coinValue, setCoinValue] = useState("1,000");
  const [usdValue, setUsdValue] = useState("10.00");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const redeemTimerRef = useRef(null);

  useEffect(() => () => {
    if (redeemTimerRef.current) window.clearTimeout(redeemTimerRef.current);
  }, []);

  const cleanNumber = (value) => value.replace(/,/g, "").replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  const updateCoins = (value) => {
    const clean = cleanNumber(value);
    setCoinValue(clean);
    setUsdValue(clean && clean !== "." ? String(Number(clean) / 100) : "");
  };
  const updateUsd = (value) => {
    const clean = cleanNumber(value);
    setUsdValue(clean);
    setCoinValue(clean && clean !== "." ? String(Number(clean) * 100) : "");
  };
  const formatValues = () => {
    const coins = Number(coinValue.replace(/,/g, ""));
    if (!coinValue || !Number.isFinite(coins)) return;
    setCoinValue(coins.toLocaleString("en-US", { maximumFractionDigits: 2 }));
    setUsdValue((coins / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };
  const formatUsd = () => {
    const dollars = Number(usdValue.replace(/,/g, ""));
    if (!usdValue || !Number.isFinite(dollars)) return;
    setUsdValue(dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setCoinValue((dollars * 100).toLocaleString("en-US", { maximumFractionDigits: 2 }));
  };
  const redeemGiftcard = (event) => {
    event.preventDefault();
    if (!giftcardCode.trim() || isRedeeming) return;
    setIsRedeeming(true);
    redeemTimerRef.current = window.setTimeout(() => {
      setIsRedeeming(false);
      showNotification({
        type: "error",
        title: "Uh-oh, Error!",
        message: <span>The gift card you requested could not be found</span>,
        duration: 6000,
      });
    }, 1000);
  };

  return <div className="flex flex-col gap-6 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80">
    <h2 id="reka-dialog-title-v-6" className="sr-only">Deposit Giftcard</h2>
    <div className="flex items-center gap-1.5">
      <div className="text-lg sm:text-xl font-semibold flex items-center gap-2"><div className="size-8 rounded-lg shrink-0 bg-[#D74B2E] flex relative overflow-hidden"><img src="/wallet/kinguin.webp" alt="Kinguin" className="size-8.5 object-contain absolute -bottom-1.5 left-1/2 -translate-x-1/2" /></div><p className="shrink-0">DEPOSIT VIA KINGUIN</p></div>
      <div className="flex items-center gap-3 ml-auto"><button type="button" onClick={onBack} className="cursor-pointer text-accent px-3 h-10 bg-[#253361] hover:bg-[#2D3D73] rounded-lg hidden sm:flex items-center font-medium transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5 rotate-180" strokeWidth="2.5"><path fill="none" stroke="currentColor" d="M5 12h14m-7-7 7 7-7 7" /></svg><span className="ml-1.5">BACK</span></button><button type="button" aria-label="Close" onClick={onClose} className="text-accent cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"><path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" /></svg></button></div>
    </div>
    <div className="w-full h-0.5 bg-[#253361] rounded-full shrink-0" />
    <form className="flex flex-col sm:flex-row w-full gap-2" onSubmit={redeemGiftcard}>
      <div className="w-full"><label htmlFor="kinguin-giftcard-code" className="text-sm font-semibold text-accent mb-1.75 block w-fit">REDEEM YOUR GIFTCARD</label><div className="relative flex group rounded-lg items-center justify-center bg-[#151C35] h-12 pl-3 pr-1 w-full"><div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" /><input id="kinguin-giftcard-code" value={giftcardCode} onChange={(event) => setGiftcardCode(event.target.value)} placeholder="XXXX-XXXX-XXXXXX-XXXXXX" className="bg-transparent outline-none size-full peer placeholder:text-accent font-medium text-sm" /><button type="submit" disabled={!giftcardCode.trim() || isRedeeming} aria-busy={isRedeeming} className={`relative w-[130px] cursor-pointer outline-none select-none transition-opacity group/button h-9 shrink-0 hidden sm:flex ${giftcardCode.trim() ? "" : "opacity-40 pointer-events-none"}`}><div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(15, 195, 101)" }} /><div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-2" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(92, 223, 154)", color: "rgb(58, 56, 105)" }}><div className="transition-opacity flex items-center justify-center size-full whitespace-nowrap" style={{ filter: "drop-shadow(rgb(15, 195, 101) 0px 2px 0px)" }}>{isRedeeming ? <RedeemSpinner /> : "REDEEM CODE"}</div></div></button></div></div>
      <button type="submit" disabled={!giftcardCode.trim() || isRedeeming} aria-busy={isRedeeming} className={`relative w-full cursor-pointer outline-none flex select-none transition-opacity group/button h-11 shrink-0 sm:hidden ${giftcardCode.trim() ? "" : "opacity-40 pointer-events-none"}`}><div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none" style={{ top: "var(--sb-shadow-size,3px)", backgroundColor: "rgb(15, 195, 101)" }} /><div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-2" style={{ height: "calc(100% - var(--sb-shadow-size,3px))", backgroundColor: "rgb(92, 223, 154)", color: "rgb(58, 56, 105)" }}><div className="transition-opacity flex items-center justify-center size-full whitespace-nowrap" style={{ filter: "drop-shadow(rgb(15, 195, 101) 0px 2px 0px)" }}>{isRedeeming ? <RedeemSpinner /> : "REDEEM CODE"}</div></div></button>
    </form>
    <div className="flex flex-col gap-4">
      <p className="font-medium text-accent">Buy a gift card from Kinguin. After purchase, you&apos;ll get a code you can redeem here. Click on a card to be redirected to Kinguin.com.</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">{kinguinGiftCards.map((card) => <a key={card.coins} href={card.href} rel="noopener noreferrer" target="_blank" className="group h-18 rounded-xl flex flex-col relative justify-center p-3.5 cursor-pointer bg-[#24315D]"><div className="size-full absolute inset-0 overflow-hidden"><div className="w-40 h-20 left-1/2 -translate-x-1/2 -bottom-12 absolute bg-[#DA4726]/20 blur-2xl rounded-xl transition-all group-hover:scale-110 group-hover:bg-[#DA4726]/30" /></div><div className="flex items-center gap-1.5"><img src="/coin.webp" alt="" className="bg-cover bg-center size-5.5" /><span className="tabular-nums font-medium">{card.coins.toLocaleString("en-US")}</span></div><p className="text-sm text-accent font-medium"> for <span className="tabular-nums">${card.price}</span></p><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="size-5 text-[#DA4726]/80 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2"><g fill="currentColor"><path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69z" /><path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25z" /></g></svg></a>)}</div>
    </div>
    <div className="flex flex-col gap-3 bg-[#253361] rounded-xl p-4"><p className="font-medium text-accent">CONVERSION RATE</p><div className="flex flex-col sm:flex-row items-center gap-3"><div className="bg-[#151C35] h-12 px-3 flex items-center gap-3 rounded-[10px] sm:flex-1 min-w-0 w-full"><img src="/coin.webp" alt="" className="bg-cover bg-center size-6 shrink-0" /><div className="w-full"><div className="w-full relative flex group rounded-lg items-center justify-center"><div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" /><input id="kinguin-coins" type="text" value={coinValue} onFocus={() => setCoinValue((value) => value.replace(/,/g, ""))} onChange={(event) => updateCoins(event.target.value)} onBlur={formatValues} className="bg-transparent text-white outline-none font-medium text-sm sm:text-right sm:ml-auto size-full peer text-[15px] placeholder:text-accent" inputMode="decimal" /></div></div></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5 text-accent hidden sm:block" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path fill="none" stroke="currentColor" d="M5 9h14M5 15h14" /></svg><div className="bg-[#151C35] h-12 px-3 flex items-center gap-3 rounded-[10px] sm:flex-1 min-w-0 w-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5 text-accent block sm:hidden" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path fill="none" stroke="currentColor" d="M5 9h14M5 15h14" /></svg><DollarIcon /><div className="w-full"><div className="w-full relative flex group rounded-lg items-center justify-center"><div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" /><input id="kinguin-usd" type="text" value={usdValue} onFocus={() => setUsdValue((value) => value.replace(/,/g, ""))} onChange={(event) => updateUsd(event.target.value)} onBlur={formatUsd} className="bg-transparent text-white outline-none font-medium text-sm sm:text-right sm:ml-auto size-full peer text-[15px] placeholder:text-accent" inputMode="decimal" /></div></div></div></div></div>
  </div>;
}

export default function WalletModal({ onClose, initialTab = "deposit" }) {
  const [dialogState, setDialogState] = useState("open");
  const [walletView, setWalletView] = useState("wallet");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabTransition, setTabTransition] = useState("idle");
  const [promo, setPromo] = useState("");
  const [coins, setCoins] = useState("1,000");
  const [usd, setUsd] = useState("10.00");
  const closeTimerRef = useRef(null);
  const tabTimerRef = useRef(null);
  const viewTimerRef = useRef(null);

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

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    if (tabTimerRef.current) window.clearTimeout(tabTimerRef.current);
    if (viewTimerRef.current) window.clearTimeout(viewTimerRef.current);
  }, []);

  const switchTab = (nextTab) => {
    if (nextTab === activeTab || tabTransition !== "idle") return;
    setTabTransition("leaving");
    tabTimerRef.current = window.setTimeout(() => {
      setActiveTab(nextTab);
      setTabTransition("entering");
      tabTimerRef.current = window.setTimeout(() => setTabTransition("idle"), 150);
    }, 150);
  };

  const openMm2Deposit = () => {
    if (tabTransition !== "idle") return;
    setTabTransition("leaving");
    viewTimerRef.current = window.setTimeout(() => {
      setWalletView("loading");
      setTabTransition("idle");
      viewTimerRef.current = window.setTimeout(() => {
        setWalletView("mm2");
        setTabTransition("entering");
        viewTimerRef.current = window.setTimeout(() => setTabTransition("idle"), 150);
      }, 700);
    }, 150);
  };

  const openKinguinDeposit = () => {
    if (tabTransition !== "idle") return;
    setTabTransition("leaving");
    viewTimerRef.current = window.setTimeout(() => {
      setWalletView("loading");
      setTabTransition("idle");
      viewTimerRef.current = window.setTimeout(() => {
        setWalletView("kinguin");
        setTabTransition("entering");
        viewTimerRef.current = window.setTimeout(() => setTabTransition("idle"), 150);
      }, 700);
    }, 150);
  };

  const returnToWallet = () => {
    if (tabTransition !== "idle") return;
    setTabTransition("leaving");
    viewTimerRef.current = window.setTimeout(() => {
      setWalletView("wallet");
      setTabTransition("entering");
      viewTimerRef.current = window.setTimeout(() => setTabTransition("idle"), 150);
    }, 150);
  };

  const setCoinValue = (value) => {
    const clean = value.replace(/,/g, "").replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setCoins(clean);
    setUsd(clean && clean !== "." ? String(Number(clean) / 100) : "");
  };
  const setUsdValue = (value) => {
    const clean = value.replace(/,/g, "").replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setUsd(clean);
    setCoins(clean && clean !== "." ? String(Number(clean) * 100) : "");
  };

  const formatCoinValue = () => {
    if (!coins.trim() || coins === ".") return;
    const amount = Number(coins.replace(/,/g, ""));
    if (!Number.isFinite(amount)) return;
    setCoins(amount.toLocaleString("en-US", { maximumFractionDigits: 2 }));
    setUsd((amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const formatUsdValue = () => {
    if (!usd.trim() || usd === ".") return;
    const amount = Number(usd.replace(/,/g, ""));
    if (!Number.isFinite(amount)) return;
    setUsd(amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setCoins((amount * 100).toLocaleString("en-US", { maximumFractionDigits: 2 }));
  };

  return <div className="fixed inset-0 z-[9998] bg-[#0C1535]/65 transition-opacity duration-200 data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0" data-state={dialogState} onPointerDown={(event) => event.target === event.currentTarget && requestClose()}>
    <div data-v-8ead2f23="" data-dismissable-layer="" tabIndex={-1} className="dialog-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95" role="dialog" aria-describedby="reka-dialog-description-v-3" aria-labelledby="reka-dialog-title-v-2" data-state={dialogState} style={{ maxWidth: "min(100dvw - 24px, 660px)", maxHeight: "calc(100% - 24px)", zIndex: 9999, pointerEvents: "auto" }} onPointerDown={(event) => event.stopPropagation()}>
      <div data-v-8ead2f23="" className={walletView === "loading" ? "flex items-center justify-center" : `bg-[#1D284E] rounded-2xl shadow-lg flex flex-col gap-5.5 max-h-[calc(100vh-24px)] overflow-hidden relative ${tabTransition === "leaving" ? "wallet-tab-leaving" : tabTransition === "entering" ? "wallet-tab-entering" : ""}`}>
        {walletView === "loading" ? <SquircleLoader /> : walletView === "mm2" ? <Mm2DepositView onBack={returnToWallet} onClose={requestClose} /> : walletView === "kinguin" ? <KinguinDepositView onBack={returnToWallet} onClose={requestClose} /> : <div className="flex flex-col gap-6 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80">
          <h2 id="reka-dialog-title-v-2" className="sr-only">Wallet</h2>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-1.5"><h2 id="reka-dialog-title-v-2" className="text-lg xs:text-xl font-semibold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-7 text-[#E5AD4E]"><g fill="none" fillRule="evenodd"><path d="m12.593 23.258-.011.002-.071.035-.02.004-.014-.004-.071-.035q-.016-.005-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093q.019.005.029-.008l.004-.014-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z" /><path fill="currentColor" d="M5 6.5a.5.5 0 0 1 .5-.5H16a1 1 0 1 0 0-2H5.5A2.5 2.5 0 0 0 3 6.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5.5a.5.5 0 0 1-.5-.5M15.5 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" /></g></svg> WALLET </h2><button type="button" aria-label="Close" className="text-accent ml-auto cursor-pointer" onClick={requestClose}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"><path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" /></svg></button></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
              <div className="flex w-full sm:w-auto gap-2">
                {activeTab === "deposit" ? <>
                  <RaisedButton className="flex-1 sm:flex-none h-10 justify-center" frontClassName="w-full sm:px-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" className="size-3.5 mr-1.5"><path fill="currentColor" d="M15 16H1a1 1 0 0 1-1-1v-3.5a1 1 0 1 1 2 0V14h12v-2.5a1 1 0 0 1 2 0V15a1 1 0 0 1-1 1Z" /><path fill="currentColor" d="M7 3.414v8.074a1 1 0 0 0 2 0V3.414l1.879 1.88a1 1 0 0 0 1.414-1.415L8.707.293a1 1 0 0 0-1.414 0L3.707 3.879A1 1 0 0 0 5.12 5.293l1.88-1.879Z" /></svg> DEPOSIT</RaisedButton>
                  <button type="button" onClick={() => switchTab("withdraw")} className="flex-1 sm:flex-none cursor-pointer text-accent px-3 h-10 bg-[#253361] hover:bg-[#2D3D73] rounded-lg transition-colors flex items-center justify-center font-medium"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className="size-4 mr-2"><path fill="currentColor" d="M13.125 14H.875A.875.875 0 0 1 0 13.125v-3.063a.875.875 0 0 1 1.75 0v2.188h10.5v-2.188a.875.875 0 0 1 1.75 0v3.063a.875.875 0 0 1-.875.875Zm-7-13.125V7.94L4.481 6.296a.875.875 0 1 0-1.238 1.237l3.138 3.138a.875.875 0 0 0 1.238 0l3.138-3.138a.875.875 0 0 0-1.238-1.237L7.875 7.94V.875a.875.875 0 0 0-1.75 0Z" /></svg> WITHDRAW</button>
                </> : <>
                  <button type="button" onClick={() => switchTab("deposit")} className="flex-1 sm:flex-none cursor-pointer text-accent px-3 h-10 bg-[#253361] hover:bg-[#2D3D73] rounded-lg transition-colors flex items-center justify-center font-medium"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className="size-4 mr-2"><path fill="currentColor" d="M13.125 14H.875A.875.875 0 0 1 0 13.125v-3.063a.875.875 0 0 1 1.75 0v2.188h10.5v-2.188a.875.875 0 0 1 1.75 0v3.063a.875.875 0 0 1-.875.875Zm-7-13.125V7.94L4.481 6.296a.875.875 0 1 0-1.238 1.237l3.138 3.138a.875.875 0 0 0 1.238 0l3.138-3.138a.875.875 0 0 0-1.238-1.237L7.875 7.94V.875a.875.875 0 0 0-1.75 0Z" /></svg> DEPOSIT</button>
                  <RaisedButton className="flex-1 sm:flex-none h-10 justify-center" frontClassName="w-full sm:px-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" className="size-3.5 mr-1.5"><path fill="currentColor" d="M15 16H1a1 1 0 0 1-1-1v-3.5a1 1 0 1 1 2 0V14h12v-2.5a1 1 0 0 1 2 0V15a1 1 0 0 1-1 1Z" /><path fill="currentColor" d="M7 3.414v8.074a1 1 0 0 0 2 0V3.414l1.879 1.88a1 1 0 0 0 1.414-1.415L8.707.293a1 1 0 0 0-1.414 0L3.707 3.879A1 1 0 0 0 5.12 5.293l1.88-1.879Z" /></svg> WITHDRAW</RaisedButton>
                </>}
              </div>
              <form className="flex w-full sm:w-65 gap-2" onSubmit={(event) => event.preventDefault()}><div className="w-full"><div className="relative flex group rounded-lg items-center justify-center bg-[#151C35] h-10 pl-3 pr-1 w-full"><div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" /><input id="v-18-0" value={promo} onChange={(event) => setPromo(event.target.value)} placeholder="Enter Promocode" className="bg-transparent outline-none size-full peer placeholder:text-accent font-medium text-sm" /><RaisedButton type="submit" disabled={!promo.trim()} green className="h-8" frontClassName="px-2">CLAIM</RaisedButton></div></div></form>
            </div>
          </div>
          {activeTab === "deposit" ? <>
          <div className="w-full h-0.5 bg-[#253361] rounded-full shrink-0" />
          <div data-v-97a3b0ca="" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={openMm2Deposit} className="h-30 relative rounded-2xl overflow-hidden group cursor-pointer sm:col-span-2" style={{ background: "linear-gradient(100deg, rgba(37, 51, 97, 0) 0%, rgba(243, 178, 57, 0.8) 100%), rgb(46, 63, 119)" }}><div className="absolute inset-0" style={{ maskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)" }}><img src="/wallet/mm2-illustration.webp" alt="Murder Mystery 2" className="size-full object-cover pointer-events-none" onError={hiddenIfMissing} /></div><img src="/wallet/blossom-illustration.webp" alt="Blossom" className="hidden sm:block w-[65px] h-[64px] object-cover pointer-events-none ml-auto mr-2 drop-shadow-[0_3px_2px_rgba(0,0,0,0.25)] absolute bottom-0 right-24 rotate-45 float-anim transition-transform duration-500 group-hover:rotate-[48deg]" style={{ animationDelay: "0s" }} onError={hiddenIfMissing} /><img src="/wallet/gingerscope-illustration.webp" alt="Gingerscope" className="w-[147px] h-[78px] object-cover pointer-events-none ml-auto mr-2 drop-shadow-[0_3px_2px_rgba(0,0,0,0.25)] absolute bottom-3 right-4 float-anim transition-transform duration-500 group-hover:rotate-3" style={{ animationDelay: "2s" }} onError={hiddenIfMissing} /><img src="/wallet/corrupt-illustration.webp" alt="Corrupt" className="w-[60px] h-[70px] object-cover pointer-events-none ml-auto mr-2 drop-shadow-[0_3px_2px_rgba(0,0,0,0.25)] absolute bottom-9 right-0 float-anim transition-transform duration-500 group-hover:-rotate-3" style={{ animationDelay: "3s" }} onError={hiddenIfMissing} /><p className="font-semibold absolute bottom-4 left-4">MURDER MYSTERY 2</p></button>
            <button type="button" onClick={openKinguinDeposit} className="h-30 relative rounded-2xl overflow-hidden group cursor-pointer" style={{ background: "linear-gradient(100deg, rgba(87, 87, 87, 0) 0%, rgba(255, 165, 0, 0.8) 100%), rgb(119, 53, 46)" }}><div className="absolute inset-0" style={{ maskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)" }}><img src="/wallet/kinguin.webp" alt="Kinguin" className="w-50 h-73 object-contain pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2" onError={hiddenIfMissing} /></div><img src="/wallet/kinguin.webp" alt="Penguin" className="w-[84px] h-[122px] object-cover pointer-events-none ml-auto mr-2 drop-shadow-[0_3px_2px_rgba(0,0,0,0.25)] absolute -bottom-5 right-4 float-anim rotate-anim transition-transform duration-500 group-hover:rotate-3" style={{ animationDelay: "1s" }} onError={hiddenIfMissing} /><p className="font-semibold absolute top-4 left-4">KINGUIN</p></button>
            <button className="h-30 relative rounded-2xl overflow-hidden group no-interaction opacity-40" style={{ background: "linear-gradient(100deg, rgba(37, 51, 97, 0) 0%, rgba(243, 178, 57, 0.8) 100%), rgb(43, 41, 136)" }}><div className="absolute inset-0 bg-[#2E3F77] opacity-50" /><SwappedCardArtwork /><p className="font-semibold absolute top-4 left-4">CARD</p></button>
          </div>
          <div className="flex flex-col gap-3"><p className="font-medium">CRYPTO CURRENCIES</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{cryptoOptions.map((option) => <CryptoOption key={option.id} option={option} />)}</div></div>
          <div className="flex flex-col gap-3 bg-[#253361] rounded-xl p-4"><p className="font-medium text-accent">CONVERSION RATE</p><div className="flex flex-col sm:flex-row items-center gap-3"><div className="bg-[#151C35] h-12 px-3 flex items-center gap-3 rounded-[10px] sm:flex-1 min-w-0 w-full"><img src="/coin.webp" alt="" className="bg-cover bg-center size-6 shrink-0" /><input id="v-18-1" type="text" value={coins} onFocus={() => setCoins((value) => value.replace(/,/g, ""))} onBlur={formatCoinValue} onChange={(event) => setCoinValue(event.target.value)} className="bg-transparent text-white outline-none size-full font-medium text-[15px] sm:text-right sm:ml-auto" inputMode="decimal" /></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5 text-accent hidden sm:block" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path fill="none" stroke="currentColor" d="M5 9h14M5 15h14" /></svg><div className="bg-[#151C35] h-12 px-3 flex items-center gap-3 rounded-[10px] sm:flex-1 min-w-0 w-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5 text-accent block sm:hidden" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path fill="none" stroke="currentColor" d="M5 9h14M5 15h14" /></svg><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="rounded-full size-6 shrink-0"><path fill="#6CDE07" d="M20 20H0V0h20v20ZM9.437 4a.324.324 0 0 0-.333.333v.934c-1.91.265-2.865 1.18-2.865 2.747 0 1.648 1.056 2.59 3.17 2.826 1.434.293 2.15.675 2.15 1.147 0 .609-.517.913-1.552.913-.81 0-1.336-.266-1.579-.8a.62.62 0 0 0-.464-.24H6.292a.28.28 0 0 0-.292.28c.035 1.812 1.07 2.928 3.104 3.347v.92c0 .222.111.333.333.333h1.1c.221 0 .332-.111.332-.333v-.934C12.956 15.16 14 14.192 14 12.567c0-1.57-1.128-2.543-3.383-2.92-1.291-.257-1.937-.639-1.937-1.147 0-.56.411-.84 1.234-.84.735 0 1.172.245 1.313.734a.54.54 0 0 0 .438.226h1.751c.187 0 .28-.093.28-.28-.044-1.484-.986-2.427-2.827-2.827v-.96c0-.222-.11-.333-.332-.333h-1.1Z" /></svg><input id="v-18-2" type="text" value={usd} onFocus={() => setUsd((value) => value.replace(/,/g, ""))} onBlur={formatUsdValue} onChange={(event) => setUsdValue(event.target.value)} className="bg-transparent text-white outline-none size-full font-medium text-[15px] sm:text-right sm:ml-auto" inputMode="decimal" /></div></div></div>
          </> : <WithdrawView />}
        </div>}
      </div>
    </div>
  </div>;
}
