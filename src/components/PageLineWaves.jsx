import LineWavesJSCSS from "@/components/LineWaves-JS-CSS";

const lineWavesPreset = {
  brightness: 0.28,
  color1: "#eab308",
  color2: "#ef4444",
  color3: "#22c55e",
  colorCycleSpeed: 0.32,
  edgeFadeWidth: 0.2,
  enableMouseInteraction: false,
  innerLineCount: 18,
  mobileInnerLineCount: 9,
  mobileOuterLineCount: 7,
  mobileSpeed: 0.026,
  mobileWarpIntensity: 0.8,
  mouseInfluence: 0.1,
  outerLineCount: 11,
  rotation: -45,
  speed: 0.035,
  warpIntensity: 1.5,
};

export default function PageLineWaves() {
  return (
    <div className="page-line-waves" aria-hidden="true">
      <LineWavesJSCSS {...lineWavesPreset} />
    </div>
  );
}
