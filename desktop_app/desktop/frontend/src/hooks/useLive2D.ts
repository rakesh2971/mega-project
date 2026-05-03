import { useEffect, useRef, useState, useCallback } from "react";
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";
import type { AvatarMood, UseLive2DOptions, UseLive2DReturn } from "@/types/avatar";
import {
  MOOD_TO_EXPRESSION,
  LIP_SYNC_PARAM,
  EYE_BLINK_PARAMS,
  HEAD_PARAMS,
  BREATH_PARAM,
  MOUTH_FORM_PARAM,
} from "@/constants/live2d";
import { FLOAT_CANVAS_W, FLOAT_CANVAS_H, FLOAT_SCALE, FLOAT_OFFSET_X, FLOAT_OFFSET_Y_RATIO } from "@/constants/avatar";

// Register PIXI Ticker once, lazily inside useEffect (after Cubism Core script runs)
let _tickerRegistered = false;
function ensureTickerRegistered() {
  if (_tickerRegistered) return;
  Live2DModel.registerTicker(PIXI.Ticker as any);
  _tickerRegistered = true;
}

// Types are defined in @/types/avatar — imported above

// ── Safe parameter setter ─────────────────────────────────────────────────

function safeSetParam(model: Live2DModel, id: string, value: number) {
  try {
    (model.internalModel as any).coreModel.setParameterValueById(id, value);
  } catch { /* parameter may not exist — ignore */ }
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useLive2D({
  containerRef,
  modelPath,
  mood,
  isSpeaking,
  lipSyncValue = 0,
  width = FLOAT_CANVAS_W,
  height = FLOAT_CANVAS_H,
}: UseLive2DOptions): UseLive2DReturn {
  const [isReady, setIsReady]     = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const appRef          = useRef<PIXI.Application | null>(null);
  const modelRef        = useRef<Live2DModel | null>(null);
  const blinkTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathPhaseRef  = useRef(0);
  const currentExprRef  = useRef("");
  const lipAnimFrameRef = useRef<number | null>(null);
  const lipPhaseRef     = useRef(0);

  // ── Auto-blink ────────────────────────────────────────────────────────

  const scheduleBlink = useCallback(() => {
    const delay = 3000 + Math.random() * 4000;
    blinkTimerRef.current = setTimeout(() => {
      const model = modelRef.current;
      if (!model) return;
      EYE_BLINK_PARAMS.forEach((id) => safeSetParam(model, id, 0));
      setTimeout(() => {
        const m = modelRef.current;
        if (m) EYE_BLINK_PARAMS.forEach((id) => safeSetParam(m, id, 1));
        scheduleBlink();
      }, 150);
    }, delay);
  }, []);

  // ── Init: PIXI creates its OWN canvas inside our container div ────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const init = async () => {
      try {
        ensureTickerRegistered();
        setIsLoading(true);
        setError(null);

        // PIXI creates and manages its own <canvas> — avoids React canvas conflicts
        const app = new PIXI.Application({
          width,
          height,
          backgroundAlpha: 0,   // PIXI v6.0+ API (transparent was deprecated)
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        appRef.current = app;

        // Mount PIXI's canvas into our container div
        const pixiCanvas = app.view as HTMLCanvasElement;
        pixiCanvas.style.position = "absolute";
        pixiCanvas.style.top      = "0";
        pixiCanvas.style.left     = "0";
        pixiCanvas.style.width    = "100%";
        pixiCanvas.style.height   = "100%";
        container.appendChild(pixiCanvas);

        // Load model
        const model = await Live2DModel.from(modelPath, { autoInteract: false });

        if (cancelled) {
          app.destroy(true, { children: true });
          return;
        }

        modelRef.current = model;
        app.stage.addChild(model as unknown as PIXI.DisplayObject);

        // Scale & centre — constants from @/constants/avatar for easy tuning
        const scaleX = app.renderer.width  / model.width;
        const scaleY = app.renderer.height / model.height;
        const scale  = Math.min(scaleX, scaleY) * FLOAT_SCALE;
        model.scale.set(scale);
        model.x = (app.renderer.width  - model.width  * scale) / 2 + FLOAT_OFFSET_X;
        model.y = (app.renderer.height - model.height * scale) / 2
                - app.renderer.height * FLOAT_OFFSET_Y_RATIO;

        // Idle motion
        try { (model as any).motion("Idle"); } catch { /* ok */ }

        // Breathing + mouth-form ticker
        app.ticker.add(() => {
          const m = modelRef.current;
          if (!m) return;
          breathPhaseRef.current += 0.008;
          safeSetParam(m, BREATH_PARAM, (Math.sin(breathPhaseRef.current) + 1) / 2);
          safeSetParam(m, MOUTH_FORM_PARAM, 0.3);
        });

        setIsReady(true);
        setIsLoading(false);
        scheduleBlink();
      } catch (err) {
        if (!cancelled) {
          console.error("[useLive2D] model load failed:", err);
          setError(`Failed to load avatar: ${String(err)}`);
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
      if (lipAnimFrameRef.current) cancelAnimationFrame(lipAnimFrameRef.current);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      modelRef.current = null;
      setIsReady(false);
      setIsLoading(true);
    };
  }, [modelPath, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mouse → head tracking ─────────────────────────────────────────────

  useEffect(() => {
    if (!isReady) return;
    const container = containerRef.current;
    if (!container) return;

    const onMouseMove = (e: MouseEvent) => {
      const model = modelRef.current;
      if (!model) return;
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left)  / rect.width  - 0.5;
      const ny = (e.clientY - rect.top)   / rect.height - 0.5;
      safeSetParam(model, HEAD_PARAMS.angleX,  nx *  60);
      safeSetParam(model, HEAD_PARAMS.angleY, -ny *  40);
      safeSetParam(model, HEAD_PARAMS.angleZ,  nx * -20);
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mood → expression ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isReady || !modelRef.current) return;
    const exprName = MOOD_TO_EXPRESSION[mood as AvatarMood] ?? "Dark_Eye";
    if (currentExprRef.current === exprName) return;
    currentExprRef.current = exprName;
    try { modelRef.current.expression(exprName); } catch {}
  }, [mood, isReady]);

  // ── Lip sync ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isReady) return;

    if (isSpeaking) {
      if (lipSyncValue > 0) {
        safeSetParam(modelRef.current!, LIP_SYNC_PARAM, lipSyncValue);
        return;
      }
      const animate = () => {
        lipPhaseRef.current += 0.12;
        if (modelRef.current)
          safeSetParam(modelRef.current, LIP_SYNC_PARAM, Math.abs(Math.sin(lipPhaseRef.current)) * 0.85);
        lipAnimFrameRef.current = requestAnimationFrame(animate);
      };
      lipAnimFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (lipAnimFrameRef.current) { cancelAnimationFrame(lipAnimFrameRef.current); lipAnimFrameRef.current = null; }
      if (modelRef.current) safeSetParam(modelRef.current, LIP_SYNC_PARAM, 0);
    }

    return () => {
      if (lipAnimFrameRef.current) { cancelAnimationFrame(lipAnimFrameRef.current); lipAnimFrameRef.current = null; }
    };
  }, [isSpeaking, lipSyncValue, isReady]);

  // ── Imperative API ────────────────────────────────────────────────────

  const playExpression = useCallback((name: string) => {
    try { modelRef.current?.expression(name); } catch {}
  }, []);

  const playMotion = useCallback((group: string, index = 0) => {
    try { (modelRef.current as any)?.motion(group, index); } catch {}
  }, []);

  const setParameter = useCallback((id: string, value: number) => {
    if (modelRef.current) safeSetParam(modelRef.current, id, value);
  }, []);

  return { isReady, isLoading, error, playExpression, playMotion, setParameter };
}
