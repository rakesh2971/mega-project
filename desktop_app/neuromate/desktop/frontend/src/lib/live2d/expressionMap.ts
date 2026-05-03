// ── Live2D Expression Map (re-export facade) ──────────────────────────────────
// All constants now live in @/constants/live2d — this file re-exports them
// for backward compatibility with any code still importing from this path.

export type { AvatarMood } from "@/types/avatar";

export {
  MOOD_TO_EXPRESSION,
  LIP_SYNC_PARAM,
  EYE_BLINK_PARAMS,
  HEAD_PARAMS,
  BREATH_PARAM,
  MOUTH_FORM_PARAM,
} from "@/constants/live2d";
