import LineWavesJSCSS from "@/components/LineWaves-JS-CSS";

const lineWavesPreset = {
  brightness: 0.1,
  color1: "#ef4444",
  color2: "#eab308",
  color3: "#10b981",
  colorCycleSpeed: 5,
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
