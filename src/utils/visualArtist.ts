import { AspectRatio, VisualTheme } from "../types";

export interface VisualParams {
  prompt: string;
  theme: VisualTheme;
  aspectRatio: AspectRatio;
  sceneNumber: number;
  moodColor?: string;
  title?: string;
}

// Curated high quality cinematic unplash stock backdrops categorized by themes for instant rich photorealism
const THEME_STOCK_PRESETS: Record<VisualTheme, string[]> = {
  cinematic: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop", // dramatic mountain mist
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop", // golden epic peaks
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop", // space earth atmosphere
    "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1920&auto=format&fit=crop", // dramatic clouds dark sky
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop", // sunset ocean horizon
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop", // snowy starry night
  ],
  documentary: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop", // rugged rocky mountain
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1920&auto=format&fit=crop", // deep lush forest
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1920&auto=format&fit=crop", // vintage library architecture
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop", // yosemite valley river
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop", // skyscraper urban monument
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1920&auto=format&fit=crop", // deep blue sea surface
  ],
  scifi: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop", // orbital space satellite
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop", // spacecraft orbit view
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop", // starry cosmos galaxy
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop", // aurora nebula
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop", // deep space supernova
  ],
  cyberpunk: [
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1920&auto=format&fit=crop", // neon city night rain
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop", // golden moody skyline
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1920&auto=format&fit=crop", // tokyo shibuya neon cross
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1920&auto=format&fit=crop", // glowing violet horizon
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop", // misty dark spires
  ],
  anime: [
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop", // vibrant cloudscape
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop", // dreamy sunset
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop", // starry mountain
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop", // vivid peaks
  ],
  "3d-render": [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop", // abstract liquid gradient
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1920&auto=format&fit=crop", // 3d geometric shapes
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop", // vibrant modern 3d
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop", // holographic 3d waves
  ],
  vintage: [
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1920&auto=format&fit=crop", // sepia ancient library
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop", // warm retro mountains
    "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1920&auto=format&fit=crop", // film noir clouds
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop", // vintage landscape
  ],
  watercolor: [
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop", // soft color washes
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop", // pastel beach
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1920&auto=format&fit=crop", // misty emerald trees
  ],
};

/**
 * Procedurally generates a high-definition cinematic digital scene artwork using HTML5 Canvas.
 * Combines atmospheric depth, celestial lighting, landscape geometry, volumetric beams, and particle mist.
 */
export function generateProceduralSceneArtwork(params: VisualParams): string {
  const canvas = document.createElement("canvas");
  
  let width = 1920;
  let height = 1080;
  if (params.aspectRatio === "9:16") {
    width = 1080;
    height = 1920;
  } else if (params.aspectRatio === "1:1") {
    width = 1080;
    height = 1080;
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const seed = (params.sceneNumber * 9301 + 49297) % 233280;
  const pseudoRand = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  // Base theme color schemes
  let topColor = "#0f172a";
  let midColor = "#1e293b";
  let botColor = "#020617";
  let accentColor = params.moodColor || "#38bdf8";

  switch (params.theme) {
    case "scifi":
      topColor = "#030712";
      midColor = "#1e1b4b";
      botColor = "#0f172a";
      accentColor = params.moodColor || "#818cf8";
      break;
    case "cyberpunk":
      topColor = "#18022d";
      midColor = "#4a044e";
      botColor = "#05050f";
      accentColor = params.moodColor || "#f43f5e";
      break;
    case "documentary":
      topColor = "#1c1917";
      midColor = "#292524";
      botColor = "#0c0a09";
      accentColor = params.moodColor || "#f59e0b";
      break;
    case "vintage":
      topColor = "#2d241e";
      midColor = "#443428";
      botColor = "#1a130f";
      accentColor = params.moodColor || "#d97706";
      break;
    case "3d-render":
      topColor = "#0f172a";
      midColor = "#312e81";
      botColor = "#090d16";
      accentColor = params.moodColor || "#06b6d4";
      break;
    case "anime":
      topColor = "#1e3a8a";
      midColor = "#701a75";
      botColor = "#0f172a";
      accentColor = params.moodColor || "#fb7185";
      break;
    case "watercolor":
      topColor = "#1e293b";
      midColor = "#334155";
      botColor = "#0f172a";
      accentColor = params.moodColor || "#a7f3d0";
      break;
    default:
      // cinematic
      topColor = "#0a0a0f";
      midColor = "#1e2238";
      botColor = "#050608";
      accentColor = params.moodColor || "#f59e0b";
      break;
  }

  // 1. Sky / Backdrop Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, topColor);
  skyGrad.addColorStop(0.5, midColor);
  skyGrad.addColorStop(1, botColor);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Celestial / Light Core (Sun, Moon, Supernova, or Nebula)
  const sunX = width * (0.3 + pseudoRand(1) * 0.4);
  const sunY = height * (0.25 + pseudoRand(2) * 0.25);
  const sunRadius = Math.min(width, height) * (0.12 + pseudoRand(3) * 0.12);

  const radialLight = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 4);
  radialLight.addColorStop(0, `${accentColor}cc`);
  radialLight.addColorStop(0.3, `${accentColor}44`);
  radialLight.addColorStop(0.7, `${accentColor}11`);
  radialLight.addColorStop(1, "transparent");
  ctx.fillStyle = radialLight;
  ctx.fillRect(0, 0, width, height);

  // Draw defined orb
  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.85;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.restore();

  // 3. Volumetric Beams / Atmospheric Light Shafts
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = accentColor;
  for (let i = 0; i < 5; i++) {
    const angle = ((pseudoRand(i * 4) - 0.5) * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(sunX + Math.cos(angle - 0.2) * width * 1.5, height);
    ctx.lineTo(sunX + Math.cos(angle + 0.2) * width * 1.5, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 4. Distant Horizon Mountain / Skyline Silhouette Range 1
  ctx.save();
  ctx.beginPath();
  const horizY1 = height * 0.65;
  ctx.moveTo(0, height);
  ctx.lineTo(0, horizY1);
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const px = (width / steps) * i;
    const py = horizY1 - pseudoRand(i + 10) * (height * 0.18);
    ctx.lineTo(px, py);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = `${midColor}cc`;
  ctx.fill();
  ctx.restore();

  // 5. Foreground Mountain / Architectural Ridge Range 2
  ctx.save();
  ctx.beginPath();
  const horizY2 = height * 0.78;
  ctx.moveTo(0, height);
  ctx.lineTo(0, horizY2);
  const fgSteps = 10;
  for (let i = 0; i <= fgSteps; i++) {
    const px = (width / fgSteps) * i;
    const py = horizY2 - pseudoRand(i + 30) * (height * 0.14);
    ctx.lineTo(px, py);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = botColor;
  ctx.fill();
  ctx.restore();

  // 6. Atmospheric Ground Mist / Water Reflection
  const mistGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
  mistGrad.addColorStop(0, "transparent");
  mistGrad.addColorStop(0.5, `${accentColor}33`);
  mistGrad.addColorStop(1, `${botColor}ee`);
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  // 7. Particle Dust / Stars / Light Embers
  ctx.save();
  const particleCount = 80;
  for (let i = 0; i < particleCount; i++) {
    const px = pseudoRand(i * 7) * width;
    const py = pseudoRand(i * 13) * height;
    const pSize = 1 + pseudoRand(i * 17) * 3;
    const pAlpha = 0.2 + pseudoRand(i * 23) * 0.6;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = pAlpha;
    ctx.fill();
  }
  ctx.restore();

  // 8. Cinematic Vignette & Edge Shading
  const vignette = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.4, width / 2, height / 2, Math.max(width, height) * 0.75);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.75)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Selects an initial high-grade visual for a scene.
 * If Unsplash theme presets are available, picks one cyclically and blends with procedural backup.
 */
export function getInitialSceneVisual(params: VisualParams): string {
  const stockList = THEME_STOCK_PRESETS[params.theme] || THEME_STOCK_PRESETS.cinematic;
  const index = (params.sceneNumber - 1) % stockList.length;
  return stockList[index] || generateProceduralSceneArtwork(params);
}
