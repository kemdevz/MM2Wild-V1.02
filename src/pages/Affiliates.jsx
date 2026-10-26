import { useEffect, useState } from "react";
import LineWobbleLoader from "../components/LineWobbleLoader";
import AffiliateStatusesModal from "../components/AffiliateStatusesModal";
import { showNotification } from "../components/NotificationCenter";

const usersIconPaths = [
  "M12 16.14h-.87a8.67 8.67 0 0 0-6.43 2.52l-.24.28v8.28h4.08v-4.7l.55-.62.25-.29a11 11 0 0 1 4.71-2.86A6.6 6.6 0 0 1 12 16.14",
  "M31.34 18.63a8.67 8.67 0 0 0-6.43-2.52 11 11 0 0 0-1.09.06 6.6 6.6 0 0 1-2 2.45 10.9 10.9 0 0 1 5 3l.25.28.54.62v4.71h3.94v-8.32Z",
  "M11.1 14.19h.31a6.45 6.45 0 0 1 3.11-6.29 4.09 4.09 0 1 0-3.42 6.33Z",
  "M24.43 13.44a7 7 0 0 1 0 .69 4 4 0 0 0 .58.05h.19A4.09 4.09 0 1 0 21.47 8a6.53 6.53 0 0 1 2.96 5.44",
  "M18.11 20.3A9.7 9.7 0 0 0 11 23l-.25.28v6.33a1.57 1.57 0 0 0 1.6 1.54h11.49a1.57 1.57 0 0 0 1.6-1.54V23.3l-.24-.3a9.58 9.58 0 0 0-7.09-2.7",
];

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="size-9 text-primary">
      {usersIconPaths.map((path) => <path key={path} fill="currentColor" d={path} />)}
      <circle cx="17.87" cy="13.45" r="4.47" fill="currentColor" />
      <path fill="none" d="M0 0h36v36H0z" />
    </svg>
  );
}

function Coin({ className = "size-8" }) {
  return <img src="/coin.webp" alt="" className={`bg-cover bg-center ${className}`} />;
}

function StatCard({ label, value, users = false }) {
  return (
    <div className="bg-[#283562] rounded-xl p-4 px-5 flex items-center gap-2.5 shadow-[0_6px_0_#1B2440]">
      {users ? <UsersIcon /> : <Coin />}
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-accent">{label}</p>
        <p className="tabular-nums text-lg font-semibold leading-none">{value}</p>
      </div>
    </div>
  );
}

function LoadingRing() {
  return (
    <svg viewBox="0 0 40 40" className="ring-loader size-5.5 [--uib-speed:1.5s]" aria-hidden="true">
      <circle className="track" cx="20" cy="20" r="17.5" fill="none" strokeWidth="5" />
      <circle className="car" cx="20" cy="20" r="17.5" fill="none" strokeWidth="5" pathLength="100" />
    </svg>
  );
}

function GoldButton({ children, disabled = false, loading = false, type = "button" }) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={`relative cursor-pointer outline-none flex select-none transition-opacity group/button h-10.5 ${isDisabled ? "opacity-40 pointer-events-none" : ""}`}
    >
      <div className="absolute left-0 right-0 bottom-0 rounded-lg pointer-events-none bg-[#D38502]" style={{ top: "var(--sb-shadow-size,3px)" }} />
      <div className="rounded-lg font-bold size-full flex items-center relative transition-transform duration-125 will-change-transform group-hover/button:-translate-y-0.5 group-active/button:translate-y-0 px-3 bg-primary text-[#3A3869]" style={{ height: "calc(100% - var(--sb-shadow-size,3px))" }}>
        <div className="transition-opacity flex items-center justify-center size-full drop-shadow-[0_2px_0_#D38502] whitespace-nowrap">{loading ? <LoadingRing /> : children}</div>
      </div>
    </button>
  );
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5">
      <path fill="currentColor" d="M19 2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-9 13H8a1 1 0 0 0-.117 1.993L8 17h2a1 1 0 0 0 .117-1.993zm9-11H9v2h6a2 2 0 0 1 2 2v8h2zm-7 7H8a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2" />
    </svg>
  );
}

function AffiliateSetup({ onSubmit }) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitCode = async (event) => {
    event.preventDefault();
    const nextCode = code.trim().toLowerCase();
    if (!nextCode || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/affiliates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: nextCode }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.affiliate) {
        throw new Error(payload?.error || "Your affiliate code could not be saved.");
      }
      onSubmit(payload.affiliate);
    } catch (submitError) {
      setError(submitError.message || "Your affiliate code could not be saved.");
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 bg-[#151D3E]/70 flex items-center justify-center rounded-2xl">
      <div className="bg-[#1D284E] rounded-2xl flex shadow-lg overflow-hidden relative w-full" style={{ maxWidth: "680px", maxHeight: "calc(100vh - 24px)" }}>
        <form
          className="flex flex-col flex-1 gap-5.5 max-h-full overflow-y-auto p-4.5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/80"
          onSubmit={submitCode}
        >
          <div className="flex flex-col items-center gap-2 w-full">
            <h2 className="text-xl font-bold">BECOME AN AFFILIATE</h2>
            <div className="bg-[#5CDF9A]/10 py-2 w-full rounded-lg flex items-center justify-center">
              <span className="text-[#5CDF9A] font-medium text-sm">EARN UP TO 10% FROM EVERY DEPOSITER</span>
            </div>
          </div>
          <div className="w-full h-0.75 bg-[#445696]/35 rounded-full" />
          <div className="w-full">
            <label htmlFor="affiliate-code" className="text-sm font-semibold text-accent mb-1.75 block w-fit uppercase">AFFILIATE CODE</label>
            <div className="w-full relative flex group rounded-lg items-center justify-center bg-[#0F1222]/55 h-11 px-3">
              <div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg pointer-events-none" />
              <input
                id="affiliate-code"
                name="code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter affiliate code..."
                className="bg-transparent outline-none size-full font-medium peer text-[15px] placeholder:text-accent"
                autoComplete="off"
                disabled={submitting}
              />
            </div>
            {error && <p className="mt-1.5 text-xs font-medium text-error" role="alert">{error}</p>}
          </div>
          <GoldButton type="submit" loading={submitting} disabled={!code.trim()}>SET CODE</GoldButton>
        </form>
        <div className="absolute right-0 bottom-0 size-42 blur-3xl rounded-lg bg-[#FFC055]/70" />
        <div className="w-68 overflow-hidden relative shrink-0">
          <div className="w-40 right-0 absolute size-full overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-[#FFDD54]/55 to-[#FFDD54]/0" />
            <img src="/affiliates/artie-ilustration.webp" alt="" className="absolute rotate-9 size-86 -left-20 opacity-30 -bottom-8 object-contain max-w-none" />
          </div>
          <img src="/affiliates/nand-ilustration-2.webp" alt="Nand" className="absolute rotate-6 size-100 -left-5 -bottom-8 object-contain max-w-none" />
        </div>
      </div>
    </div>
  );
}

export default function Affiliates() {
  const [user, setUser] = useState(null);
  const [affiliate, setAffiliate] = useState(undefined);
  const [search, setSearch] = useState("");
  const [statusesOpen, setStatusesOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/session", { signal: controller.signal }),
      fetch("/api/affiliates", { signal: controller.signal }),
    ])
      .then(async ([sessionResponse, affiliateResponse]) => {
        const sessionPayload = sessionResponse.ok ? await sessionResponse.json() : null;
        const affiliatePayload = affiliateResponse.ok ? await affiliateResponse.json() : null;
        if (!sessionPayload?.user) {
          window.location.replace("/");
          return;
        }
        setUser(sessionPayload.user);
        setAffiliate(affiliatePayload?.affiliate || null);
      })
      .catch((error) => {
        if (error.name !== "AbortError") window.location.replace("/");
      });
    return () => controller.abort();
  }, []);

  const handleAffiliateCreated = (createdAffiliate) => {
    setAffiliate(createdAffiliate);
    showNotification({
      title: "Well done!",
      message: "Affiliate code set successfully!",
    });
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      showNotification({
        title: "Nice, Copied!",
        message: "Successfully copied to clipboard.",
      });
    } catch {
    }
  };

  if (!user || affiliate === undefined) {
    return (
      <div className="site-content flex items-center justify-center min-h-[calc(100dvh-var(--layout-top))]">
        <LineWobbleLoader />
      </div>
    );
  }

  const level = Number(user.level || 1);
  const levelColor = level === 1 ? "#BEBEBE" : "#F33939";
  const username = user.username;
  const avatar = user.avatar_headshot;
  const affiliateCode = affiliate?.code || "";
  const referralLink = affiliateCode ? `${window.location.origin}/r/${affiliateCode}` : "-";
  const levelStyle = {
    "--level-border-start": "#222a3f",
    "--level-border-end": levelColor,
    "--level-text": levelColor,
  };

  return (
    <div className="site-content">
      <div className="relative">
        <div className="max-w-[1296px] mx-auto flex flex-col @container/content px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
          <div className="page-content affiliates-page py-6 flex flex-col gap-6 relative">
            <div>
              <div className="text-2xl font-bold"><h1>AFFILIATES</h1></div>
              <p className="text-accent font-medium">Share your referral link with friends and get paid for each bet placed! The more you share, the more you earn!</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-[30%] flex flex-col gap-6">
                <div className="bg-[#202D57]/45 rounded-2xl p-4 flex flex-col items-center gap-4">
                  <div className="size-32 p-0.75 rounded-3xl flex flex-col items-center relative bg-linear-to-b from-(--level-border-start) from-5% to-(--level-border-end)" style={levelStyle}>
                    <div className="size-full flex items-center justify-center rounded-[21px] bg-[#1A2339]">
                      <img src={avatar} className="size-9/12 object-contain object-center ease-in-out transition-opacity no-interaction rounded-xl" alt={`${username} avatar`} loading="lazy" fetchPriority="low" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-b from-(--level-border-start) to-(--level-border-end) p-0.5 rounded-lg" style={{ ...levelStyle, "--level-border-start": "#2e3a5c" }}>
                      <div className="size-full flex items-center justify-center font-medium !leading-none text-(--level-text) px-1.25 py-0.75 text-sm rounded-md bg-[#263457]">{level}</div>
                    </div>
                    <p className="text-xl font-semibold truncate">{username}</p>
                  </div>
                  <div className="bg-[#2A3868] rounded-lg p-3 flex items-center justify-center gap-2 shadow-[0_3px_0_#192963] w-full">
                    <p className="text-accent font-medium"><span className="text-[#5CDF9A]">{affiliate ? `${affiliate.commissionRate}%` : "-"}</span> Commission</p>
                  </div>
                  <div className="bg-[#161D3A] p-3.5 rounded-xl w-full flex flex-col gap-2.5">
                    <p className="text-sm font-medium text-accent">YOUR CODE</p>
                    <div className="flex items-center gap-2 bg-[#0F1222]/55 rounded-lg p-2"><p className="font-medium">{affiliateCode || "-"}</p></div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Copy referral link"
                        className="text-accent hover:text-accent-light transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                        disabled={!affiliateCode}
                        onClick={copyReferralLink}
                      ><CopyIcon /></button>
                      <p className="text-accent font-medium text-sm truncate">{referralLink}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[70%] flex flex-col gap-6">
                <div className="bg-[#202D57]/45 rounded-2xl p-4 flex flex-col gap-4">
                  <div
                    className="rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-[0_6px_0_#1B2440] relative overflow-hidden"
                    style={{ background: "radial-gradient(53.36% 324.92% at 100% 100%,rgba(243,178,57,.55) 0%,rgba(40,53,98,0) 100%),radial-gradient(100% 291.84% at 0% 100%,rgba(243,178,57,.1) 0%,rgba(40,53,98,0) 100%),rgb(40,53,98)" }}
                  >
                    <img src="/falling-coins.webp" alt="Falling Coins" className="absolute -top-10 -right-5 size-50 rotate-40 object-contain opacity-20" />
                    <div className="flex items-center gap-3 relative"><Coin className="size-12" /><div className="flex flex-col justify-center gap-0.5"><p className="text-sm font-medium text-accent">Available Earnings</p><span className="tabular-nums text-lg font-semibold leading-none">{affiliate?.availableEarnings || 0}</span></div></div>
                    <div className="shrink-0 w-full sm:w-auto"><GoldButton disabled={!affiliate?.availableEarnings}>CLAIM EARNINGS</GoldButton></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <StatCard label="Active Users" value={affiliate?.activeUsers || 0} users />
                    <StatCard label="All Users" value={affiliate?.totalUsers || 0} users />
                    <StatCard label="Total Wagered" value={affiliate?.totalWagered || 0} />
                    <StatCard label="Total Earned" value={affiliate?.totalEarned || 0} />
                  </div>
                </div>

                <div className="bg-[#202D57]/45 rounded-2xl p-4 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">Referred Users</h2>
                      <button type="button" aria-label="Referral information" className="cursor-pointer text-accent/70 hover:text-accent transition-colors" onClick={() => setStatusesOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4.5"><path fill="currentColor" d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 1 0 22 12 10 10 0 0 0 12 2" /></svg>
                      </button>
                    </div>
                    <div className="w-full sm:w-64 relative flex group rounded-lg items-center justify-center bg-[#0F1222]/55 h-10 px-3">
                      <div className="absolute inset-0.25 ring-2 ring-transparent rounded-lg pointer-events-none" />
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 shrink-0 my-auto text-accent" strokeWidth="2.5"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607" /></svg>
                      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by username..." className="bg-transparent outline-none size-full peer placeholder:text-accent px-2 font-medium text-sm" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <table className="border-separate w-full border-spacing-y-2 table-fixed min-w-192">
                        <thead><tr className="align-middle outline-none text-left text-sm text-accent font-medium border-none"><th className="pb-2 pl-4">USER</th><th className="pb-2 w-40">WAGERED</th><th className="pb-2 w-40">COMMISSION</th><th className="pb-2 pr-4 w-32 text-right">STATUS</th></tr></thead>
                        <tbody><tr><td colSpan="4" className="py-8 text-center bg-[#2F3F71]/50 rounded-xl"><p className="font-medium text-accent">No referred users yet</p></td></tr></tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-end gap-5 py-3 px-4 bg-[#28386A] rounded-xl">
                      <div className="flex items-center gap-2"><p className="text-[13px] font-medium text-accent">Rows per page:</p><button type="button" className="inline-flex items-center gap-1 font-medium text-sm"><span>10</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" strokeWidth="2.5"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg></button></div>
                      <div className="flex items-center gap-2"><p className="text-[13px] font-medium text-accent">0 - 0 of 0</p><div className="flex items-center"><button type="button" className="p-0 opacity-40" disabled><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" strokeWidth="2.5"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg></button><button type="button" className="p-0 opacity-40" disabled><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" strokeWidth="2.5"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg></button></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {affiliate === null && <AffiliateSetup onSubmit={handleAffiliateCreated} />}
      </div>
      {statusesOpen && <AffiliateStatusesModal onClose={() => setStatusesOpen(false)} />}
    </div>
  );
}
