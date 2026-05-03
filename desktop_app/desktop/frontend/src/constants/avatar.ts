// ── Avatar Rendering Constants ────────────────────────────────────────────────
// Tune visual parameters here — not inside component or hook files.

/** Path to the Kasane Teto Live2D model (relative to /public) */
export const MODEL_PATH = "/live2D/models/teto/teto.model3.json";

/** Canvas width for the home sidebar panel (px) */
export const CANVAS_W = 320;

/** Canvas height for the home sidebar panel (px) */
export const CANVAS_H = 360;

/** Default canvas width for the float window */
export const FLOAT_CANVAS_W = 380;

/** Default canvas height for the float window */
export const FLOAT_CANVAS_H = 520;

/** PIXI scale multiplier — fills the canvas with the model */
export const FLOAT_SCALE = 2.3;

/** Horizontal centering nudge (negative = shift left) */
export const FLOAT_OFFSET_X = -230;

/** Fraction of canvas height to shift the model upward so face is visible */
export const FLOAT_OFFSET_Y_RATIO = 0.18;

/** Tailwind glow colour per mood — used by Live2DAvatar */
export const MOOD_GLOW: Record<string, string> = {
  neutral:   "bg-[hsl(258_100%_65%)]",
  happy:     "bg-pink-400",
  excited:   "bg-yellow-400",
  focused:   "bg-blue-500",
  concerned: "bg-purple-400",
  sad:       "bg-purple-500",
  nervous:   "bg-orange-400",
};
