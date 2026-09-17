import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function ModalContent({ onClose, onSubmit, game, busy = false, error = "" }) {
  const [selectedCoin, setSelectedCoin] = useState("heads");
  const [selectedItems, setSelectedItems] = useState(() => new Set());
  const [priceSort, setPriceSort] = useState("highest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortMenuPosition, setSortMenuPosition] = useState(null);
  const [search, setSearch] = useState("");
  const [catalogItems, setCatalogItems] = useState([]);
  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);
  const itemsGridRef = useRef(null);

  const selectedValue = Array.from(itemsGridRef.current?.children ?? []).reduce((total, card) => {
    const name = card.querySelector("img[alt]")?.alt;
    if (!name || !selectedItems.has(name)) return total;
    return total + (Number(card.querySelector(".tabular-nums")?.textContent?.replace(/,/g, "")) || 0);
  }, 0);
  const minimum = Number(game?.minimum || 0);
  const maximum = Number(game?.maximum || Number.POSITIVE_INFINITY);
  const selectionValid = selectedItems.size > 0 && selectedValue >= minimum && selectedValue <= maximum;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/coinflip/items", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load items.");
        setCatalogItems(data.items || []);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") console.error(requestError);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!catalogItems.length) return;
    const byName = new Map(catalogItems.map((item) => [item.name, item]));
    Array.from(itemsGridRef.current?.children ?? []).forEach((card) => {
      const image = card.querySelector("img[alt]");
      const item = byName.get(image?.alt);
      card.hidden = !item;
      if (!item) return;
      image.src = item.imageUrl;
      const value = card.querySelector(".tabular-nums");
      if (value) value.textContent = Number(item.value).toLocaleString("en-US", { maximumFractionDigits: 2 });
    });
  });

  useEffect(() => {
    const itemCards = itemsGridRef.current?.children ?? [];
    Array.from(itemCards).forEach((card) => {
      const itemName = card.querySelector("img[alt]")?.alt;
      const isSelected = Boolean(itemName && selectedItems.has(itemName));
      card.classList.toggle("coinflip-item-selected", isSelected);
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-pressed", String(isSelected));
      card.setAttribute(
        "aria-label",
        `${isSelected ? "Deselect" : "Select"} ${itemName || "item"}`,
      );
    });
  }, [selectedItems]);

  useEffect(() => {
    const cards = Array.from(itemsGridRef.current?.children ?? []);
    const knownNames = new Set(catalogItems.map((item) => item.name.toLowerCase()));
    cards.forEach((card) => {
      const name = card.querySelector("img[alt]")?.alt?.toLowerCase() || "";
      const value = Number(card.querySelector(".tabular-nums")?.textContent?.replace(/,/g, "")) || 0;
      card.hidden = (knownNames.size > 0 && !knownNames.has(name)) || !name.includes(search.trim().toLowerCase());
      card.style.order = String((priceSort === "highest" ? -value : value) * 100);
    });
  }, [search, priceSort, catalogItems]);

  const toggleItemCard = (card) => {
    if (!card || !itemsGridRef.current?.contains(card)) return;
    const itemName = card.querySelector("img[alt]")?.alt;
    if (!itemName) return;
    setSelectedItems((currentItems) => {
      const nextItems = new Set(currentItems);
      if (nextItems.has(itemName)) nextItems.delete(itemName);
      else if (nextItems.size < 12) nextItems.add(itemName);
      return nextItems;
    });
  };

  const getItemCard = (target) =>
    target.closest(".size-full.relative.group.cursor-pointer");

  useEffect(() => {
    if (!isSortOpen) return undefined;

    const updatePosition = () => {
      const rect = sortButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setSortMenuPosition({
        left: rect.left,
        top: rect.bottom + 8,
        width: rect.width,
      });
    };
    const handlePointerDown = (event) => {
      if (
        !sortButtonRef.current?.contains(event.target) &&
        !sortMenuRef.current?.contains(event.target)
      ) {
        setIsSortOpen(false);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isSortOpen]);

  const coinButtonClass = (coin) =>
    `cursor-pointer size-9.5 relative transition-all rounded-full ${
      selectedCoin === coin
        ? "ring-[2.5px] ring-accent/25 ring-offset-3 ring-offset-[#263564]"
        : "opacity-40"
    }`;

  return (
    <div
      data-v-8ead2f23=""
      className="bg-[#1D284E] rounded-2xl shadow-lg flex flex-col gap-5.5 max-h-[min(calc(100vh-24px),680px)] overflow-hidden relative"
      bis_skin_checked="1"
    >
      <div
        className="flex flex-col gap-5.5 overflow-y-auto p-4.5 sm:p-6 mb-35 sm:mb-21 [&amp;::-webkit-scrollbar]:w-1 [&amp;::-webkit-scrollbar-track]:bg-transparent [&amp;::-webkit-scrollbar-thumb]:bg-primary [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb:hover]:bg-primary/80"
        bis_skin_checked="1"
      >
        <div
          className="flex items-center justify-between gap-2"
          bis_skin_checked="1"
        >
          <h2
            id="reka-dialog-title-v-18"
            className="text-xl font-bold flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 512 512"
              className="size-5 text-[#E5AD4E]"
            >
              <path
                fill="currentColor"
                d="M256 136c88.4 0 160 28.7 160 64s-71.6 64-160 64-160-28.7-160-64 71.6-64 160-64Zm0 216C114.6 352 0 287.5 0 208S114.6 64 256 64s256 64.5 256 144-114.6 144-256 144Zm-125.9-77.9c34.5 14.3 78.7 21.9 125 21.9 48.1 0 92.3-7.6 125.9-21.9 16.7-5.8 32.4-14.6 44.4-25.9 12.1-11.5 22.6-27.7 22.6-48.2 0-20.5-10.5-36.7-22.6-48.2-12-11.3-27.7-20.1-44.4-26.8-33.6-13.4-77.8-21-125.9-21-46.3 0-90.5 7.6-125 21-15.8 6.7-31.5 15.5-43.51 26.8C74.5 163.3 63.1 179.5 63.1 200c0 20.5 11.4 36.7 23.49 48.2 12.01 11.3 27.71 20.1 43.51 25.9ZM0 290.1c13.21 15.7 29.72 29.4 48 40v64.5c-30.21-21-48-46.7-48-74.6v-29.9Zm80 122v-63.8c28.4 13.1 60.9 23 96 29v64.3c-36.2-5.9-68.9-15.8-96-29.5Zm128-30.5c15.7 1.6 31.7 2.4 48 2.4s32.3-.8 48-2.4v64.2c-15.5 1.4-31.6 2.2-48 2.2s-32.5-.8-48-2.2v-64.2Zm128 60v-64.3c35.1-6 67.6-15.9 96-29v63.8c-27.1 13.7-59.8 23.6-96 29.5Zm128-111.5c18.3-10.6 34.8-24.3 48-40V320c0 27.9-17.8 53.6-48 74.6v-64.5Z"
              ></path>
            </svg>{" "}
            {game ? `JOIN COINFLIP #${game.number}` : "CREATE COINFLIP"}{" "}
          </h2>
          <button
            type="button"
            className="text-accent cursor-pointer"
            onClick={onClose}
            aria-label="Close create coinflip"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            >
              <path
                fill="none"
                stroke="currentColor"
                d="M20 4 4 20M4 4l16 16"
              ></path>
            </svg>
          </button>
        </div>
        <div
          className="w-full h-0.5 bg-[#2F3C68] rounded-full shrink-0"
          bis_skin_checked="1"
        ></div>
        <div
          className="flex gap-3 flex-col min-[780px]:flex-row"
          bis_skin_checked="1"
        >
          <div
            className="flex-1 min-[780px]:flex-none min-[780px]:max-w-55"
            bis_skin_checked="1"
          >
            <div
              className="w-full relative flex group rounded-lg items-center justify-center bg-[#0F1222]/55 h-11 px-3.5"
              bis_skin_checked="1"
            >
              <div
                className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none"
                bis_skin_checked="1"
              ></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-4 shrink-0 my-auto text-accent"
                strokeWidth="2.5"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="currentStrokeWidth"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607"
                ></path>
              </svg>
              <input
                id="v-10-0"
                placeholder="Search for items..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="bg-transparent outline-none size-full peer placeholder:text-accent px-2 font-medium text-sm"
              />
            </div>
          </div>
          <div
            className="flex gap-3 flex-col min-[530px]:flex-row min-[780px]:ml-auto"
            bis_skin_checked="1"
          >
            <div
              className="flex flex-col min-[530px]:w-70"
              trigger-wrapper-className="min-[530px]:flex-1"
              bis_skin_checked="1"
            >
              <div className="h-11 relative group/button" bis_skin_checked="1">
                <div
                  className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#223364] rounded-lg"
                  bis_skin_checked="1"
                ></div>
                <button
                  ref={sortButtonRef}
      className="ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap w-full h-[calc(100%-3px)] bg-[#57689A] group-hover/button:-translate-y-0.5 data-[state=open]:translate-y-0 transition-transform duration-125 text-white [&amp;&gt;*]:drop-shadow-[0_2px_0_#223364] rounded-lg px-4 flex items-center outline-none cursor-pointer group relative min-w-40"
                  role="combobox"
                  type="button"
                  aria-controls="reka-select-content-v-10-1"
                  aria-expanded={isSortOpen}
                  aria-required="false"
                  aria-autoComplete="none"
                  dir="ltr"
                  data-state={isSortOpen ? "open" : "closed"}
                  onClick={() => setIsSortOpen((isOpen) => !isOpen)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="size-5.25 mr-2 shrink-0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      d="M2 5h20M6 12h12m-9 7h6"
                    ></path>
                  </svg>
      <span className="text-left flex-1 whitespace-nowrap font-semibold uppercase">
                    {" "}
                    SORT BY:{" "}
                    {priceSort === "highest" ? "Highest Price" : "Lowest Price"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180 ml-2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      d="m6 9 6 6 6-6"
                    ></path>
                  </svg>
                </button>
                {isSortOpen && sortMenuPosition
                  ? createPortal(
                      <div
                        ref={sortMenuRef}
                        id="reka-select-content-v-10-1"
                        className="fixed z-[100000002] flex flex-col gap-0 rounded-lg bg-[#263457] px-2 py-2.5 shadow-md outline-none animate-in fade-in-0 zoom-in-95"
                        style={sortMenuPosition}
                        role="listbox"
                        aria-label="Sort coinflip items by price"
                      >
                        {["highest", "lowest"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={priceSort === option}
                            className={`h-9 w-full rounded-md px-2.5 text-left text-sm font-semibold transition-colors ${
                              priceSort === option
                                ? "bg-[#57689A] text-white"
                                : "bg-transparent text-accent hover:bg-[#57689A] hover:text-white"
                            }`}
                            onClick={() => {
                              setPriceSort(option);
                              setIsSortOpen(false);
                            }}
                          >
                            {option === "highest"
                              ? "Highest Price"
                              : "Lowest Price"}
                          </button>
                        ))}
                      </div>,
                      document.body,
                    )
                  : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2" bis_skin_checked="1">
          <div
            ref={itemsGridRef}
            className="coinflip-create-items-grid grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3"
            onClick={(event) => toggleItemCard(getItemCard(event.target))}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              const itemCard = getItemCard(event.target);
              if (!itemCard) return;
              event.preventDefault();
              toggleItemCard(itemCard);
            }}
            bis_skin_checked="1"
          >
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/15.webp"
                      alt="Hallow's Blade"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Hallow's Blade
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        10
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/55.webp"
                      alt="Eternal"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Eternal
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        10
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/63.webp"
                      alt="Flames"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Flames
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        10
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(92, 23, 222)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(92, 23, 222, 0.85), rgba(92, 23, 222, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Ancient)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/94.webp"
                      alt="Icewing"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Icewing
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        10
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(92, 23, 222)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(227, 198, 8)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(227, 198, 8, 0.85), rgba(227, 198, 8, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Vintage)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/125.webp"
                      alt="America"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      America
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        10
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(227, 198, 8)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(255, 255, 255)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(227, 198, 8)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(227, 198, 8, 0.85), rgba(227, 198, 8, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Vintage)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/132.webp"
                      alt="Blood"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Blood
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        10
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(227, 198, 8)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(255, 255, 255)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/138.webp"
                      alt="Winter's Edge"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Winter's Edge
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        10
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/73.webp"
                      alt="Ice Shard"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Ice Shard
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        11
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/23.webp"
                      alt="Frostsaber"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Frostsaber
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        12
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(227, 198, 8)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(227, 198, 8, 0.85), rgba(227, 198, 8, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Vintage)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/51.webp"
                      alt="Ghost"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Ghost
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        12
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(227, 198, 8)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(255, 255, 255)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/110.webp"
                      alt="Pumpking"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Pumpking
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        12
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/143.webp"
                      alt="Hallow's Edge"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Hallow's Edge
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        12
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/274.webp"
                      alt="BattleAxe"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      BattleAxe
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        12
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(221, 0, 5)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(221, 0, 5, 0.85), rgba(221, 0, 5, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Legendary)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/276.webp"
                      alt="Traveler"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Traveler
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        12
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{ background: "rgb(221, 0, 5)", boxShadow: "none" }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/268.webp"
                      alt="Fang"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Fang
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        13
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/270.webp"
                      alt="Chill"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Chill
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        13
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/77.webp"
                      alt="Vampire's Edge"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Vampire's Edge
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        14
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/6.webp"
                      alt="Xmas"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Xmas
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        15
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/48.webp"
                      alt="Tides"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Tides
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        15
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/126.webp"
                      alt="Bioblade"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Bioblade
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        15
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/148.webp"
                      alt="Spider"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Spider
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        15
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/30.webp"
                      alt="Heat"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Heat
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        17
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/129.webp"
                      alt="Minty"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Minty
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        17
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/140.webp"
                      alt="BattleAxe II"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      BattleAxe II
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        17
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/104.webp"
                      alt="Deathshard"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Deathshard
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        18
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/35.webp"
                      alt="Slasher"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Slasher
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        20
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/78.webp"
                      alt="Gingerblade"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Gingerblade
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        20
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/147.webp"
                      alt="Clockwork"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Clockwork
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        20
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/122.webp"
                      alt="Jinglegun"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Jinglegun
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        21
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/5.webp"
                      alt="Eternalcane"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Eternalcane
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        22
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(92, 23, 222)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(92, 23, 222, 0.85), rgba(92, 23, 222, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Ancient)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/130.webp"
                      alt="Logchopper"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Logchopper
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        22
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(92, 23, 222)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/136.webp"
                      alt="Nebula"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Nebula
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        22
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/27.webp"
                      alt="Pixel"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Pixel
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        23
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/41.webp"
                      alt="Gingermint"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Gingermint
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        23
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/45.webp"
                      alt="Virtual"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Virtual
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        23
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/52.webp"
                      alt="Lugercane"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Lugercane
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        23
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/90.webp"
                      alt="Cookiecane"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Cookiecane
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        23
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/137.webp"
                      alt="Ginger Luger"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Ginger Luger
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        23
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/81.webp"
                      alt="Nightblade"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Nightblade
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        25
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="size-full relative group cursor-pointer transition-transform duration-125 ease-linear will-change-transform outline-none"
              bis_skin_checked="1"
            >
              <div
                className="rounded left-2 right-2 -bottom-0.25 will-change-transform transition-transform duration-125 ease-linear absolute h-1/2"
                style={{ background: "rgb(241, 10, 168)" }}
                bis_skin_checked="1"
              ></div>
              <div
                className="absolute inset-0 transition-opacity rounded-[14px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(rgba(241, 10, 168, 0.85), rgba(241, 10, 168, 0))",
                  opacity: "0",
                }}
                bis_skin_checked="1"
              ></div>
              <div className="p-0.5" bis_skin_checked="1">
                <div
                  className="flex flex-col rounded-xl shadow-lg overflow-hidden relative p-4 pt-5 aspect-140/176"
                  style={{
                    background:
                      'url("/leafs-item.png") center center / cover no-repeat, rgb(32, 45, 87)',
                  }}
                  bis_skin_checked="1"
                >
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 140 176"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="140"
                      height="176"
                      fill="url(#rarity-item-detailed-Godly)"
                      fillOpacity="0.12"
                    ></rect>
                  </svg>
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center"
                    bis_skin_checked="1"
                  >
                    <img
                      src="https://cdn.mm2wild.com/items/87.webp"
                      alt="Old Glory"
                      className="max-w-[85%] max-h-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction"
                      style={{ opacity: "1" }}
                    />
                  </div>
                  <div
                    className="flex flex-col mt-auto relative"
                    bis_skin_checked="1"
                  >
                    <p className="font-medium text-[15px] text-left truncate">
                      Old Glory
                    </p>
                    <div
                      className="flex items-center gap-1.5"
                      bis_skin_checked="1"
                    >
                      <img
                        src="/coin.webp"
                        className="bg-cover bg-center size-4.5"
                      />
                      <span className="tabular-nums font-semibold text-left text-[15px]">
                        25
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute top-2 right-2 size-5 flex items-center justify-center rounded-[5px] transition-opacity pointer-events-none opacity-0"
                    style={{
                      background: "rgb(241, 10, 168)",
                      boxShadow: "none",
                    }}
                    bis_skin_checked="1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-3 pointer-events-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgb(15, 18, 34)" }}
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        d="M20 6 9 17l-5-5"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 absolute left-0 bottom-0 right-0 px-6 py-5 bg-[#263564]"
        bis_skin_checked="1"
      >
        <div className="flex items-center gap-6" bis_skin_checked="1">
          <div className="flex flex-col" bis_skin_checked="1">
            <p className="text-[13px] text-accent font-medium">TOTAL VALUE</p>
            <div
              className="flex items-center gap-1.5 font-medium"
              bis_skin_checked="1"
            >
              <img src="/coin.webp" className="bg-cover bg-center size-5" />
              <span className="tabular-nums">{selectedValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="flex flex-col" bis_skin_checked="1">
            <p className="text-[13px] text-accent font-medium">ITEMS</p>
            <p className="font-semibold">{selectedItems.size}</p>
          </div>
          <div className="flex gap-2.5 sm:hidden ml-auto" bis_skin_checked="1">
            <button
              type="button"
              className={coinButtonClass("heads")}
              aria-label="Choose heads"
              aria-pressed={selectedCoin === "heads"}
              onClick={() => setSelectedCoin("heads")}
            >
              <img
                src="/coinflip/heads.webp"
                alt="heads"
                className="size-full object-cover no-interaction rounded-full"
              />
            </button>
            <button
              type="button"
              className={coinButtonClass("tails")}
              aria-label="Choose tails"
              aria-pressed={selectedCoin === "tails"}
              onClick={() => setSelectedCoin("tails")}
            >
              <img
                src="/coinflip/tails.webp"
                alt="tails"
                className="size-full object-cover no-interaction rounded-full"
              />
            </button>
          </div>
        </div>
        <div
          className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto"
          bis_skin_checked="1"
        >
          <div className="hidden sm:flex gap-2.5" bis_skin_checked="1">
            <button
              type="button"
              className={coinButtonClass("heads")}
              aria-label="Choose heads"
              aria-pressed={selectedCoin === "heads"}
              onClick={() => setSelectedCoin("heads")}
            >
              <img
                src="/coinflip/heads.webp"
                alt="heads"
                className="size-full object-cover no-interaction rounded-full"
              />
            </button>
            <button
              type="button"
              className={coinButtonClass("tails")}
              aria-label="Choose tails"
              aria-pressed={selectedCoin === "tails"}
              onClick={() => setSelectedCoin("tails")}
            >
              <img
                src="/coinflip/tails.webp"
                alt="tails"
                className="size-full object-cover no-interaction rounded-full"
              />
            </button>
          </div>
          <button
            type="button"
            disabled={!selectionValid || busy}
            onClick={() => onSubmit?.({ side: selectedCoin, itemIds: [...selectedItems] })}
            className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button h-11 w-full sm:w-auto ${selectionValid && !busy ? "" : "opacity-40 pointer-events-none"}`}
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
              className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 w-full sm:w-auto px-4.5"
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
                <span>{busy ? "WAIT" : game ? "JOIN" : "BET"}</span>
                <img
                  src="/coin.webp"
                  className="bg-cover bg-center size-4.5 mx-1.5"
                />
                <span className="tabular-nums">{selectedValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </button>
          {error ? <p className="absolute right-6 bottom-full mb-2 rounded-lg bg-[#351F35] px-3 py-2 text-sm text-[#FF9EAE] font-semibold">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function CoinflipCreateModal({ onClose, onSubmit, game = null, busy = false, error = "" }) {
  const [isOpen, setIsOpen] = useState(true);
  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    setIsOpen(false);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(onClose, 150);
  }, [onClose]);

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
          isOpen ? "animate-in fade-in-0" : "animate-out fade-out-0"
        }`}
        role="presentation"
        data-state={isOpen ? "open" : "closed"}
        onMouseDown={requestClose}
      />
      <div
        className={`dialog-content fixed left-1/2 top-1/2 z-[100000002] -translate-x-1/2 -translate-y-1/2 w-full outline-none flex flex-col ${
          isOpen
            ? "animate-in fade-in-0 zoom-in-95"
            : "animate-out fade-out-0 zoom-out-95"
        }`}
        style={{
          maxWidth: "min(calc(100dvw - 24px), 960px)",
          maxHeight: "calc(100% - 24px)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reka-dialog-title-v-18"
        data-state={isOpen ? "open" : "closed"}
      >
        <ModalContent onClose={requestClose} onSubmit={onSubmit} game={game} busy={busy} error={error} />
      </div>
    </>,
    document.body,
  );
}
