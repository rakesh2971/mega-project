import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Play, Square } from "lucide-react";
import { cn } from "@/lib/cn";

type BreathingTechnique = "box" | "478";

interface Phase {
  label: string;
  duration: number;
  action: "inhale" | "hold" | "exhale";
}

const TECHNIQUES: Record<BreathingTechnique, Phase[]> = {
  box: [
    { label: "Inhale", duration: 4, action: "inhale" },
    { label: "Hold", duration: 4, action: "hold" },
    { label: "Exhale", duration: 4, action: "exhale" },
    { label: "Hold", duration: 4, action: "hold" },
  ],
  "478": [
    { label: "Inhale", duration: 4, action: "inhale" },
    { label: "Hold", duration: 7, action: "hold" },
    { label: "Exhale", duration: 8, action: "exhale" },
  ],
};

export default function Breathing() {
  const [technique, setTechnique] = useState<BreathingTechnique>("box");
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TECHNIQUES["box"][0].duration);

  const activePhases = TECHNIQUES[technique];
  const currentPhase = activePhases[phaseIndex];

  // Handle technique change
  useEffect(() => {
    setIsRunning(false);
    setPhaseIndex(0);
    setTimeLeft(TECHNIQUES[technique][0].duration);
  }, [technique]);

  // Main timer loop
  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase
            const nextIndex = (phaseIndex + 1) % activePhases.length;
            setPhaseIndex(nextIndex);
            return activePhases[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, phaseIndex, activePhases]);

  const toggleTimer = () => {
    if (!isRunning && timeLeft === 0) {
      setPhaseIndex(0);
      setTimeLeft(activePhases[0].duration);
    }
    setIsRunning(!isRunning);
  };

  // Determine scale based on action
  // We use CSS transition for the scaling to make it smooth over the duration of the phase.
  let scale = 1;
  const hasNotStarted = !isRunning && phaseIndex === 0 && timeLeft === activePhases[0].duration;

  if (hasNotStarted) {
    scale = 1;
  } else if (currentPhase.action === "inhale") {
    scale = 1.5;
  } else if (currentPhase.action === "exhale") {
    scale = 1;
  } else if (currentPhase.action === "hold") {
    // If it's the hold after inhale (box breathing index 1, or 478 index 1), keep it large
    // If it's the hold after exhale (box breathing index 3), keep it small
    if (phaseIndex === 1) scale = 1.5;
    if (phaseIndex === 3) scale = 1;
  }

  // Determine animation class
  // If running, we transition smoothly over the phase duration.
  // We need to apply transition duration matching the phase duration.
  const transitionDuration = isRunning ? `${currentPhase.duration}s` : "0.5s";

  let instructionText = "";
  if (!isRunning) {
    instructionText = technique === "box" 
      ? "Best for resetting focus, reducing stress, and grounding yourself."
      : "Best for deep relaxation and falling asleep.";
  } else {
    if (technique === "box") {
      if (phaseIndex === 0) instructionText = "Breathe in slowly and deeply through your nose.";
      else if (phaseIndex === 1) instructionText = "Hold your lungs full and stay relaxed.";
      else if (phaseIndex === 2) instructionText = "Exhale smoothly and fully through your mouth.";
      else if (phaseIndex === 3) instructionText = "Hold your lungs empty before the next breath.";
    } else {
      if (phaseIndex === 0) instructionText = "Breathe in quietly and deeply through your nose.";
      else if (phaseIndex === 1) instructionText = "Hold your breath to let oxygen circulate.";
      else if (phaseIndex === 2) instructionText = "Exhale completely and slowly through your mouth, making a whoosh sound.";
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[hsl(258_30%_98%)] relative">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-[hsl(258_20%_90%)] bg-white/50 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-4">
          <Link to="/productivity" className="p-2 hover:bg-[hsl(258_20%_90%)] rounded-xl transition-colors">
            <ChevronLeft className="text-[hsl(232_45%_25%)]" size={20} />
          </Link>
          <h1 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)]">
            Breathing Exercise
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Glow background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(258_100%_60%)]/5 to-transparent pointer-events-none" />

        {/* Technique Selector */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-[hsl(258_20%_90%)] shadow-sm z-10 mb-16">
          <button
            onClick={() => setTechnique("box")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all",
              technique === "box" 
                ? "bg-white shadow-sm border border-[hsl(258_20%_90%)] text-[hsl(258_100%_60%)]"
                : "text-[hsl(232_20%_55%)] hover:text-[hsl(232_45%_16%)]"
            )}
          >
            Box Breathing
          </button>
          <button
            onClick={() => setTechnique("478")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all",
              technique === "478" 
                ? "bg-white shadow-sm border border-[hsl(258_20%_90%)] text-[hsl(258_100%_60%)]"
                : "text-[hsl(232_20%_55%)] hover:text-[hsl(232_45%_16%)]"
            )}
          >
            4-7-8 Technique
          </button>
        </div>

        {/* Breathing Visualizer */}
        <div className="relative flex items-center justify-center z-10 w-64 h-64 mb-12">
          {/* Animated Circle */}
          <div 
            className={cn(
              "absolute rounded-full bg-gradient-to-br from-purple-300 to-indigo-400 opacity-20",
              "transition-transform ease-linear"
            )}
            style={{ 
              width: "200px", 
              height: "200px", 
              transform: `scale(${scale})`,
              transitionDuration: isRunning ? transitionDuration : "0.5s" 
            }}
          />
          <div 
            className={cn(
              "absolute rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 opacity-40 shadow-xl",
              "transition-transform ease-linear"
            )}
            style={{ 
              width: "160px", 
              height: "160px", 
              transform: `scale(${scale})`,
              transitionDuration: isRunning ? transitionDuration : "0.5s" 
            }}
          />

          {/* Text Content inside circle */}
          <div className="absolute flex flex-col items-center justify-center z-20">
            <span className="text-2xl font-heading font-bold text-[hsl(258_100%_40%)] tracking-wide">
              {isRunning ? currentPhase.label : "Ready"}
            </span>
            <span className="text-5xl font-heading font-bold text-[hsl(232_45%_16%)] mt-2">
              {isRunning ? timeLeft : ""}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="text-center z-10 max-w-sm mb-12 h-10 flex items-center justify-center">
          <p className="text-sm font-medium text-[hsl(232_20%_55%)] transition-opacity duration-300">
            {instructionText}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 z-10">
          <button
            onClick={toggleTimer}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95",
              isRunning 
                ? "bg-white border-2 border-[hsl(258_20%_90%)] text-[hsl(232_45%_16%)]" 
                : "text-white bg-linear-to-br from-[hsl(258_100%_60%)] to-[hsl(258_100%_50%)]"
            )}
          >
            {isRunning ? <Square size={28} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
}
