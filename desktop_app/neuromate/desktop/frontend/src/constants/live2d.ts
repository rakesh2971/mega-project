// ── Live2D Model Parameter Constants ─────────────────────────────────────────
// Parameter IDs sourced from VTube Studio JSON (重音テト.vtube.json ParameterSettings).
// Expression names match the ASCII-renamed .exp3.json filenames exactly.

import type { AvatarMood } from "@/types/avatar";

/** Mouth open — drives lip sync (range 0–1). */
export const LIP_SYNC_PARAM = "ParamMouthOpenY";

/** Breathing cycle parameter (range 0–1, driven by sine wave). */
export const BREATH_PARAM = "ParamBreath";

/** Mouth form (smile ↔ frown, range -1 to +1). */
export const MOUTH_FORM_PARAM = "ParamMouthForm";

/** Eye openness — used for auto-blink (range 0 = closed, 1 = open). */
export const EYE_BLINK_PARAMS = ["ParamEyeLOpen", "ParamEyeROpen"] as const;

/** Head angle inputs (range roughly -30 to +30). */
export const HEAD_PARAMS = {
  angleX: "ParamAngleXIN", // left ↔ right
  angleY: "ParamAngleYIN", // up ↔ down
  angleZ: "ParamAngleZIN", // tilt
} as const;

/** Maps every AvatarMood to its corresponding expression filename (no extension). */
export const MOOD_TO_EXPRESSION: Record<AvatarMood, string> = {
  neutral:   "Dark_Eye",  // calm, composed dark eyes
  happy:     "Blush",     // rosy-cheeked happy
  excited:   "Star_Eye",  // star-struck, amazed
  focused:   "Dark_Face", // intense, concentrating
  concerned: "Cry",       // worried / teary eyes
  sad:       "Cry",       // same as concerned
  nervous:   "Sweat",     // nervous sweat drops
};
