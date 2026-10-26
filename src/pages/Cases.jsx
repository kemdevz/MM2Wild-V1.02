import { useEffect, useMemo, useState } from "react";

const SORTS = [
  { id: "highest", label: "Highest Price" },
  { id: "lowest", label: "Lowest Price" },
  { id: "highest-risk", label: "Highest Risk" },
  { id: "lowest-risk", label: "Lowest Risk" },
];

const RISK_COLORS = ["rgb(92, 223, 154)", "rgb(223, 138, 92)", "rgb(223, 92, 92)"];

function SortIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5.25 mr-2 shrink-0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path fill="none" stroke="currentColor" d="M2 5h20M6 12h12m-9 7h6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180 ml-2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <path fill="none" stroke="currentColor" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CaseCard({ caseItem }) {
  return (
    <a href={`/games/cases/${caseItem.slug}`} className="flex flex-col bg-[#202D57] p-4 pt-5 max-w-full relative group/case rounded-xl cursor-pointer outline-none overflow-hidden h-60">
      <img src="/leafs.png" alt="Blades" className="object-contain size-[145%] absolute left-1/2 -translate-x-7/12 -top-[14%] pointer-events-none max-w-none select-none" />
      <div className="h-full mx-auto aspect-square relative">
        <div className="absolute -translate-1/2 left-1/2 top-1/2 size-43 mt-3">
          <img src={caseItem.imageUrl} alt={caseItem.name} className="absolute inset-0 size-full object-contain opacity-0 transition-opacity duration-300 group-hover/case:opacity-90! blur-[32px] no-interaction" style={{ opacity: 0.6 }} />
          <img src={caseItem.imageUrl} alt={caseItem.name} className="absolute inset-0 size-full object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)] no-interaction" style={{ opacity: 1 }} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3.5">
        <div className="h-8.5 relative w-max">
          <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#293A6C] rounded-lg" />
          <div className="w-full h-[calc(100%-3px)] bg-[#364677] px-4 flex justify-center items-center gap-1.5 *:drop-shadow-[0_2px_0_#293A6C] rounded-lg relative">
            <img src="/coin.webp" alt="" className="bg-cover bg-center size-4.5" />
            <span className="tabular-nums font-medium text-sm">{caseItem.price.toLocaleString("en-US")}</span>
          </div>
        </div>
        <p className="font-medium truncate text-center leading-none">{caseItem.name}</p>
        <div className="relative flex w-full gap-1 h-1.5">
          {RISK_COLORS.map((color, index) => (
            <div key={color} className="flex-1" style={{ backgroundColor: color, opacity: caseItem.risk === index ? 1 : 0.15 }} />
          ))}
          <div className="absolute top-1/2 h-2.5 w-0.75 -translate-1/2 bg-white" style={{ left: `${caseItem.marker}%` }} />
        </div>
      </div>
    </a>
  );
}

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("highest");
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    document.title = "Cases :: MM2Wild";
    const controller = new AbortController();
    fetch("/api/cases", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error || "Could not load cases.");
        setCases(Array.isArray(payload?.cases) ? payload.cases : []);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(error.message || "Could not load cases.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const visibleCases = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const filtered = normalizedSearch
      ? cases.filter((caseItem) => caseItem.name.toLocaleLowerCase().includes(normalizedSearch))
      : [...cases];
    if (sort === "lowest") return filtered.sort((a, b) => a.price - b.price);
    if (sort === "highest-risk") return filtered.sort((a, b) => b.risk - a.risk);
    if (sort === "lowest-risk") return filtered.sort((a, b) => a.risk - b.risk);
    return filtered.sort((a, b) => b.price - a.price);
  }, [cases, search, sort]);

  const selectedSort = SORTS.find((option) => option.id === sort) || SORTS[0];

  return (
    <div className="site-content">
      <div className="max-w-[1296px] mx-auto flex flex-col @container/content px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content cases-list-page py-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <h1>CASES</h1>
            </div>
            <div className="flex flex-col @[820px]/content:flex-row justify-between gap-4 mt-6">
              <div className="w-full @[820px]/content:w-[238px] @[820px]/content:flex-none min-w-0">
                <div className="w-full relative flex group rounded-lg items-center justify-center bg-[#0F1222]/55 h-12 px-3.5">
                  <div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg transition-shadow pointer-events-none" />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 shrink-0 my-auto text-accent" strokeWidth="2.5">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607" />
                  </svg>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for cases..." className="bg-transparent outline-none size-full peer placeholder:text-accent px-2 font-medium text-sm" />
                </div>
              </div>
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-4 min-w-0">
                <div className="flex flex-col relative w-full @[820px]/content:w-70">
                  <div className="h-11 relative group/button">
                    <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-[#223364] rounded-lg" />
                    <button
                      className="ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap w-full h-[calc(100%-3px)] bg-[#57689A] group-hover/button:-translate-y-0.5 data-[state=open]:translate-y-0 transition-transform duration-125 text-white [&>*]:drop-shadow-[0_2px_0_#223364] rounded-lg px-4 flex items-center outline-none cursor-pointer group relative min-w-40"
                      type="button"
                      aria-expanded={sortOpen}
                      data-state={sortOpen ? "open" : "closed"}
                      onClick={() => setSortOpen((open) => !open)}
                    >
                      <SortIcon />
                      <span className="text-left flex-1 whitespace-nowrap font-semibold uppercase">SORT BY: {selectedSort.label}</span>
                      <ChevronIcon />
                    </button>
                  </div>
                  {sortOpen && (
                    <div
                      className="absolute top-[calc(100%+8px)] right-0 z-20 min-w-full flex flex-col gap-0 rounded-lg bg-[#263457] px-2 py-2.5 shadow-md outline-none animate-in fade-in-0 zoom-in-95"
                      role="listbox"
                      aria-label="Sort cases"
                    >
                      {SORTS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          role="option"
                          aria-selected={sort === option.id}
                          className={`h-9 w-full rounded-md px-2.5 text-left text-sm font-semibold transition-colors cursor-pointer ${
                            sort === option.id
                              ? "bg-[#57689A] text-white"
                              : "bg-transparent text-accent hover:bg-[#57689A] hover:text-white"
                          }`}
                          onClick={() => {
                            setSort(option.id);
                            setSortOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            {loadError ? (
              <div className="rounded-xl bg-[#202D57] px-5 py-8 text-center text-accent font-medium">{loadError}</div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                {isLoading
                  ? Array.from({ length: 12 }, (_, index) => <div key={index} className="h-60 rounded-xl bg-[#202D57] animate-pulse" />)
                  : visibleCases.map((caseItem) => <CaseCard key={caseItem.slug} caseItem={caseItem} />)}
              </div>
            )}
            <div className="flex justify-center items-center" />
          </div>
        </div>
      </div>
    </div>
  );
}
