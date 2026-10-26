export default function Fairness() {
  return (
    <div className="site-content">
      <div className="max-w-[1296px] mx-auto flex flex-col @container/content px-4 md:px-12 min-h-[calc(100dvh-var(--layout-top))]">
        <div className="page-content terms-page py-8 md:py-12 flex flex-col gap-8">
          <div className="bg-[#202D57]/45 rounded-xl p-5 flex flex-col gap-3">
            <h2 className="font-semibold">What is Provably Fair?</h2>
            <p className="text-sm text-accent font-medium">
              Provably Fair is a system allowing players to verify that the site
              operates legitimately and doesn't tamper game results. It leverages
              cryptography and third party input to generate random values. At the
              end of the game, players can verify that the outcome was indeed
              determined by the original seed and inputs, thus proving that the
              game was fair.
            </p>
          </div>
          <div className="bg-[#202D57]/45 rounded-xl p-5 flex flex-col gap-3">
            <h2 className="font-semibold">EOS Blockhash</h2>
            <p className="text-sm text-accent font-medium">
              To ensure battles, coinflip, and roulette are provably fair, we use
              a decentralized EOS block hash. This prevents us from knowing the
              outcome at the time a game is created. Once a game is locked, we
              commit to a block number that is four blocks ahead of the current
              one, and that block's hash is used to determine the result.
            </p>
          </div>
          <div className="bg-[#202D57]/45 rounded-xl p-5 flex flex-col gap-3">
            <p className="text-sm text-accent font-medium">
              You can verify the results by checking out this{" "}
              <a
                href="https://stackblitz.com/edit/vitejs-vite-wpupdd5r"
                rel="noopener noreferrer"
                target="_blank"
                className="text-primary"
              >
                StackBlitz example
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
