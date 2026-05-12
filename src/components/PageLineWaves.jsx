import LineWavesJSCSS from "@/components/LineWaves-JS-CSS";

const lineWavesPreset = {
  brightness: 0.28,
  color1: "#eab308",
  color2: "#ef4444",
  color3: "#22c55e",
  colorCycleSpeed: 0.65,
  edgeFadeWidth: 0.2,
  enableMouseInteraction: false,
  innerLineCount: 32,
  mouseInfluence: 0.1,
  outerLineCount: 22,
  rotation: -45,
  speed: 0.1,
  warpIntensity: 1.5,
};

export default function PageLineWaves() {
  return (
    <div className="page-line-waves" aria-hidden="true">
      <LineWavesJSCSS {...lineWavesPreset} />
    </div>
  );
}
