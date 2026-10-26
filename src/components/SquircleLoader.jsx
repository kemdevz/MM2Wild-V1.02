export default function SquircleLoader() {
  return (
    <svg
      className="squircle-loader text-primary size-9 [--uib-speed:0.5s] [--uib-stroke:6px] [--uib-bg-opacity:0.1]"
      viewBox="0 0 37 37"
      height="37"
      width="37"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Loading"
    >
      <path className="track" fill="none" strokeWidth="5" pathLength="100" d="M0.37 18.5 C0.37 5.772 5.772 0.37 18.5 0.37 S36.63 5.772 36.63 18.5 S31.228 36.63 18.5 36.63 S0.37 31.228 0.37 18.5" />
      <path className="car" fill="none" strokeWidth="5" pathLength="100" d="M0.37 18.5 C0.37 5.772 5.772 0.37 18.5 0.37 S36.63 5.772 36.63 18.5 S31.228 36.63 18.5 36.63 S0.37 31.228 0.37 18.5" />
    </svg>
  );
}
