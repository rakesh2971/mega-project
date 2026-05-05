import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Brain, Eye, Zap, Hash, RotateCcw, Play, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";

// --- Types & Constants ---
type GameType = "memory" | "stroop" | "math" | "schulte" | null;

// --- Sub-components (Minigames) ---

// 1. Memory Matrix
function MemoryMatrix({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const [bestLevel, setBestLevel] = useState(1);
  const [phase, setPhase] = useState<"observe" | "play" | "over">("observe");
  const [pattern, setPattern] = useState<number[]>([]);
  const [userSelection, setUserSelection] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cognitive_memory_best");
    if (saved) setBestLevel(parseInt(saved, 10));
  }, []);

  const gridSize = Math.min(3 + Math.floor((level - 1) / 3), 5); // 3x3, then 4x4, then 5x5
  const totalTiles = gridSize * gridSize;
  const sequenceLength = Math.min(3 + level - 1, totalTiles - 2);

  const startLevel = useCallback(() => {
    const newPattern: number[] = [];
    while (newPattern.length < sequenceLength) {
      const r = Math.floor(Math.random() * totalTiles);
      if (!newPattern.includes(r)) newPattern.push(r);
    }
    setPattern(newPattern);
    setUserSelection([]);
    setPhase("observe");

    setTimeout(() => {
      setPhase("play");
    }, 2000);
  }, [sequenceLength, totalTiles]);

  useEffect(() => {
    startLevel();
  }, [level, startLevel]);

  const handleTileClick = (index: number) => {
    if (phase !== "play") return;
    
    if (pattern.includes(index)) {
      if (!userSelection.includes(index)) {
        const newSelection = [...userSelection, index];
        setUserSelection(newSelection);
        if (newSelection.length === pattern.length) {
          const nextLevel = level + 1;
          setTimeout(() => {
            setLevel(nextLevel);
            if (nextLevel > bestLevel) {
              setBestLevel(nextLevel);
              localStorage.setItem("cognitive_memory_best", nextLevel.toString());
            }
          }, 500);
        }
      }
    } else {
      setPhase("over");
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full max-w-xl mx-auto">
      <div className="flex items-center justify-between w-full py-4 border-b border-[hsl(258_20%_90%)] mb-4">
        <button onClick={onBack} className="p-2 hover:bg-[hsl(258_20%_90%)] rounded-xl transition-colors text-[hsl(232_45%_16%)]">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)]">Memory Matrix</h2>
          <div className="flex items-center gap-1 text-xs font-bold text-[hsl(258_100%_60%)]">
            <Trophy size={12} /> Best: Lvl {bestLevel}
          </div>
        </div>
        <div className="text-sm font-bold bg-[hsl(258_100%_60%)] text-white px-4 py-1.5 rounded-full shadow-sm">Lvl {level}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="text-center mb-8 h-8">
          {phase === "observe" && <p className="text-[hsl(258_100%_60%)] font-bold text-lg animate-pulse">Memorize the pattern!</p>}
          {phase === "play" && <p className="text-[hsl(232_20%_55%)] font-semibold text-lg">Recreate the pattern</p>}
          {phase === "over" && <p className="text-red-500 font-bold text-lg">Game Over</p>}
        </div>

        <div 
          className="grid gap-3 mb-12" 
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: totalTiles }).map((_, i) => {
            const isHighlighted = (phase === "observe" && pattern.includes(i)) || userSelection.includes(i);
            const isWrong = phase === "over" && pattern.includes(i) && !userSelection.includes(i);
            
            return (
              <button
                key={i}
                onClick={() => handleTileClick(i)}
                disabled={phase !== "play"}
                className={cn(
                  "w-16 h-16 sm:w-24 sm:h-24 rounded-2xl transition-all duration-300",
                  isHighlighted 
                    ? "bg-[hsl(258_100%_60%)] shadow-lg shadow-[hsl(258_100%_60%)]/30 scale-95" 
                    : "bg-white shadow-sm border-2 border-[hsl(258_20%_90%)] hover:bg-[hsl(258_20%_96%)]",
                  isWrong && "bg-red-200 border-red-400 scale-95"
                )}
              />
            );
          })}
        </div>

        {phase === "over" && (
          <button onClick={() => { setLevel(1); startLevel(); }} className="flex items-center gap-2 px-8 py-4 bg-[hsl(258_100%_60%)] text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[hsl(258_100%_60%)]/20">
            <RotateCcw size={24} /> Play Again
          </button>
        )}
      </div>
    </div>
  );
}

// 2. Stroop Test
const COLORS = [
  { name: "RED", hex: "#ef4444" },
  { name: "BLUE", hex: "#3b82f6" },
  { name: "GREEN", hex: "#22c55e" },
  { name: "YELLOW", hex: "#eab308" }
];

function StroopTest({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [wordIdx, setWordIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("cognitive_stroop_best");
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  const generateRound = () => {
    setWordIdx(Math.floor(Math.random() * COLORS.length));
    setColorIdx(Math.floor(Math.random() * COLORS.length));
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    generateRound();
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsPlaying(false);
          setScore(s => {
            if (s > bestScore) {
              setBestScore(s);
              localStorage.setItem("cognitive_stroop_best", s.toString());
            }
            return s;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, bestScore]);

  const handleGuess = (guessedHex: string) => {
    if (!isPlaying) return;
    if (guessedHex === COLORS[colorIdx].hex) {
      setScore(s => s + 1);
    } else {
      setScore(s => Math.max(0, s - 1));
    }
    generateRound();
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full max-w-xl mx-auto">
      <div className="flex items-center justify-between w-full py-4 border-b border-[hsl(258_20%_90%)] mb-4">
        <button onClick={onBack} className="p-2 hover:bg-[hsl(258_20%_90%)] rounded-xl transition-colors text-[hsl(232_45%_16%)]">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)]">Stroop Test</h2>
          <div className="flex items-center gap-1 text-xs font-bold text-[hsl(258_100%_60%)]">
            <Trophy size={12} /> Best: {bestScore}
          </div>
        </div>
        <div className="text-sm font-bold bg-[hsl(258_100%_60%)] text-white px-4 py-1.5 rounded-full shadow-sm">{timeLeft}s</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full pb-10">
        {!isPlaying && timeLeft === 30 && (
          <div className="text-center">
            <div className="bg-white p-8 rounded-3xl border border-[hsl(258_20%_90%)] shadow-sm mb-8 max-w-sm mx-auto">
              <Eye size={48} className="mx-auto text-[hsl(258_100%_60%)] mb-4" />
              <h3 className="text-xl font-bold text-[hsl(232_45%_16%)] mb-2">How to Play</h3>
              <p className="text-[hsl(232_20%_55%)]">Click the button that matches the <span className="font-bold text-[hsl(232_45%_16%)]">INK COLOR</span>, ignoring what the word says.</p>
            </div>
            <button onClick={startGame} className="flex items-center gap-2 px-8 py-4 bg-[hsl(258_100%_60%)] text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all mx-auto shadow-xl shadow-[hsl(258_100%_60%)]/20">
              <Play size={24} fill="currentColor" /> Start Game
            </button>
          </div>
        )}

        {isPlaying && (
          <div className="w-full max-w-md">
            <div className="text-center mb-16 h-32 flex items-center justify-center">
              <h1 className="text-7xl md:text-8xl font-black tracking-widest uppercase transition-colors drop-shadow-sm" style={{ color: COLORS[colorIdx].hex }}>
                {COLORS[wordIdx].name}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              {COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => handleGuess(c.hex)}
                  className="py-8 rounded-2xl text-white font-bold text-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  style={{ backgroundColor: c.hex }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div className="text-center bg-white p-10 rounded-3xl border border-[hsl(258_20%_90%)] shadow-sm max-w-sm w-full mx-auto">
            <h3 className="text-3xl font-heading font-bold text-[hsl(232_45%_16%)] mb-2">Time's Up!</h3>
            <p className="text-xl text-[hsl(232_20%_55%)] mb-8">Score: <span className="text-[hsl(258_100%_60%)] font-black text-4xl ml-2">{score}</span></p>
            <button onClick={startGame} className="flex items-center justify-center w-full gap-2 px-6 py-4 bg-[hsl(258_100%_60%)] text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[hsl(258_100%_60%)]/20">
              <RotateCcw size={24} /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 3. Speed Math
function SpeedMath({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cognitive_math_best");
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  const generateRound = () => {
    const isAdd = Math.random() > 0.5;
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    
    let ans = 0;
    if (isAdd) {
      setQuestion(`${a} + ${b}`);
      ans = a + b;
    } else {
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      setQuestion(`${big} - ${small}`);
      ans = big - small;
    }
    
    setAnswer(ans);

    const opts = new Set<number>([ans]);
    while (opts.size < 4) {
      opts.add(ans + Math.floor(Math.random() * 11) - 5);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    generateRound();
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsPlaying(false);
          setScore(s => {
            if (s > bestScore) {
              setBestScore(s);
              localStorage.setItem("cognitive_math_best", s.toString());
            }
            return s;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, bestScore]);

  const handleGuess = (val: number) => {
    if (!isPlaying) return;
    if (val === answer) {
      setScore(s => s + 1);
    } else {
      setScore(s => Math.max(0, s - 1));
    }
    generateRound();
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full max-w-xl mx-auto">
      <div className="flex items-center justify-between w-full py-4 border-b border-[hsl(258_20%_90%)] mb-4">
        <button onClick={onBack} className="p-2 hover:bg-[hsl(258_20%_90%)] rounded-xl transition-colors text-[hsl(232_45%_16%)]">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)]">Speed Math</h2>
          <div className="flex items-center gap-1 text-xs font-bold text-[hsl(258_100%_60%)]">
            <Trophy size={12} /> Best: {bestScore}
          </div>
        </div>
        <div className="text-sm font-bold bg-[hsl(258_100%_60%)] text-white px-4 py-1.5 rounded-full shadow-sm">{timeLeft}s</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full pb-10">
        {!isPlaying && timeLeft === 30 && (
          <div className="text-center">
            <div className="bg-white p-8 rounded-3xl border border-[hsl(258_20%_90%)] shadow-sm mb-8 max-w-sm mx-auto">
              <Zap size={48} className="mx-auto text-[hsl(258_100%_60%)] mb-4" />
              <h3 className="text-xl font-bold text-[hsl(232_45%_16%)] mb-2">How to Play</h3>
              <p className="text-[hsl(232_20%_55%)]">Solve as many simple math problems as you can before the 30 seconds run out!</p>
            </div>
            <button onClick={startGame} className="flex items-center gap-2 px-8 py-4 bg-[hsl(258_100%_60%)] text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all mx-auto shadow-xl shadow-[hsl(258_100%_60%)]/20">
              <Play size={24} fill="currentColor" /> Start Game
            </button>
          </div>
        )}

        {isPlaying && (
          <div className="w-full max-w-md">
            <div className="text-center mb-12 h-32 flex items-center justify-center">
              <h1 className="text-7xl md:text-8xl font-black text-[hsl(232_45%_16%)] tracking-widest">{question}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleGuess(opt)}
                  className="py-8 rounded-2xl bg-white border-2 border-[hsl(258_20%_90%)] text-[hsl(232_45%_16%)] font-black text-3xl hover:border-[hsl(258_100%_60%)] hover:text-[hsl(258_100%_60%)] active:scale-95 transition-all shadow-sm hover:shadow-md"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div className="text-center bg-white p-10 rounded-3xl border border-[hsl(258_20%_90%)] shadow-sm max-w-sm w-full mx-auto">
            <h3 className="text-3xl font-heading font-bold text-[hsl(232_45%_16%)] mb-2">Time's Up!</h3>
            <p className="text-xl text-[hsl(232_20%_55%)] mb-8">Score: <span className="text-[hsl(258_100%_60%)] font-black text-4xl ml-2">{score}</span></p>
            <button onClick={startGame} className="flex items-center justify-center w-full gap-2 px-6 py-4 bg-[hsl(258_100%_60%)] text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[hsl(258_100%_60%)]/20">
              <RotateCcw size={24} /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 4. Schulte Table
function SchulteTable({ onBack }: { onBack: () => void }) {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [timeMs, setTimeMs] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cognitive_schulte_best");
    if (saved) setBestTime(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    const nums = Array.from({ length: 25 }, (_, i) => i + 1);
    setNumbers(nums.sort(() => Math.random() - 0.5));
    setNextExpected(1);
    setTimeMs(0);
    setIsPlaying(true);
    setIsWon(false);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeMs(t => t + 10);
    }, 10);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePick = (num: number) => {
    if (!isPlaying) return;
    if (num === nextExpected) {
      if (num === 25) {
        setIsPlaying(false);
        setIsWon(true);
        if (bestTime === null || timeMs < bestTime) {
          setBestTime(timeMs);
          localStorage.setItem("cognitive_schulte_best", timeMs.toString());
        }
      } else {
        setNextExpected(num + 1);
      }
    }
  };

  const displayTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const msRemainder = Math.floor((ms % 1000) / 10);
    return `${s}.${msRemainder.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full max-w-xl mx-auto">
      <div className="flex items-center justify-between w-full py-4 border-b border-[hsl(258_20%_90%)] mb-4">
        <button onClick={onBack} className="p-2 hover:bg-[hsl(258_20%_90%)] rounded-xl transition-colors text-[hsl(232_45%_16%)]">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)]">Schulte Table</h2>
          <div className="flex items-center gap-1 text-xs font-bold text-[hsl(258_100%_60%)]">
            <Trophy size={12} /> Best: {bestTime !== null ? displayTime(bestTime) : "--"}
          </div>
        </div>
        <div className="text-sm font-bold bg-[hsl(258_100%_60%)] text-white px-4 py-1.5 rounded-full shadow-sm">{displayTime(timeMs)}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full pb-10">
        {!isPlaying && !isWon && (
          <div className="text-center">
            <div className="bg-white p-8 rounded-3xl border border-[hsl(258_20%_90%)] shadow-sm mb-8 max-w-sm mx-auto">
              <Hash size={48} className="mx-auto text-[hsl(258_100%_60%)] mb-4" />
              <h3 className="text-xl font-bold text-[hsl(232_45%_16%)] mb-2">How to Play</h3>
              <p className="text-[hsl(232_20%_55%)]">Find and click the numbers in ascending order from <span className="font-bold text-[hsl(232_45%_16%)]">1 to 25</span> as fast as you can.</p>
            </div>
            <button onClick={startGame} className="flex items-center gap-2 px-8 py-4 bg-[hsl(258_100%_60%)] text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all mx-auto shadow-xl shadow-[hsl(258_100%_60%)]/20">
              <Play size={24} fill="currentColor" /> Start Game
            </button>
          </div>
        )}

        {(isPlaying || isWon) && (
          <div className="grid grid-cols-5 gap-3 w-full max-w-md mx-auto mb-4">
            {numbers.map((n) => {
              const isFound = n < nextExpected;
              return (
                <button
                  key={n}
                  onClick={() => handlePick(n)}
                  className={cn(
                    "aspect-square rounded-2xl text-xl sm:text-2xl font-black transition-all flex items-center justify-center",
                    isFound 
                      ? "bg-[hsl(258_20%_90%)] text-transparent shadow-inner" 
                      : "bg-white border-2 border-[hsl(258_20%_90%)] text-[hsl(232_45%_16%)] shadow-sm hover:border-[hsl(258_100%_60%)] hover:text-[hsl(258_100%_60%)] active:scale-95 hover:shadow-md"
                  )}
                  disabled={isFound || !isPlaying}
                >
                  {isFound ? "" : n}
                </button>
              )
            })}
          </div>
        )}

        {isWon && (
          <div className="text-center bg-white p-8 rounded-3xl border border-[hsl(258_20%_90%)] shadow-sm max-w-sm w-full mx-auto mt-4">
            <h3 className="text-3xl font-heading font-bold text-[hsl(232_45%_16%)] mb-2">Excellent!</h3>
            <p className="text-xl text-[hsl(232_20%_55%)] mb-8">Time: <span className="text-[hsl(258_100%_60%)] font-black text-4xl ml-2">{displayTime(timeMs)}</span></p>
            <button onClick={startGame} className="flex items-center justify-center w-full gap-2 px-6 py-4 bg-[hsl(258_100%_60%)] text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[hsl(258_100%_60%)]/20">
              <RotateCcw size={24} /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Hub Component ---

export default function Cognitive() {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  const GAMES = [
    {
      id: "memory" as const,
      title: "Memory Matrix",
      desc: "Remember the glowing tiles",
      icon: Brain,
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: "stroop" as const,
      title: "Stroop Test",
      desc: "Match colors, ignore words",
      icon: Eye,
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "math" as const,
      title: "Speed Math",
      desc: "Solve fast equations",
      icon: Zap,
      color: "bg-amber-100 text-amber-700",
    },
    {
      id: "schulte" as const,
      title: "Number Hunt",
      desc: "Find 1 to 25 rapidly",
      icon: Hash,
      color: "bg-emerald-100 text-emerald-700",
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[hsl(258_30%_98%)] relative p-6">
      
      {activeGame === null ? (
        <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pt-4">
            <Link to="/productivity" className="p-2 hover:bg-[hsl(258_20%_90%)] rounded-xl transition-colors text-[hsl(232_45%_25%)]">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold text-[hsl(232_45%_16%)]">
                Cognitive Training
              </h1>
              <p className="text-sm text-[hsl(232_20%_55%)] font-medium">Keep your brain sharp</p>
            </div>
          </div>

          {/* Hub Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {GAMES.map((game) => {
              const Icon = game.icon;
              return (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className="bg-white p-8 sm:p-10 rounded-3xl border border-[hsl(258_20%_90%)] shadow-sm hover:shadow-lg hover:border-[hsl(258_100%_60%)] hover:-translate-y-1 transition-all flex flex-col items-start gap-6 text-left group w-full"
                >
                  <div className={cn("p-5 rounded-2xl", game.color)}>
                    <Icon size={36} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[hsl(232_45%_16%)] text-2xl group-hover:text-[hsl(258_100%_60%)] transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-base text-[hsl(232_20%_55%)] mt-2 font-medium">
                      {game.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Active Game View */
        <div className="flex-1 flex flex-col">
          {activeGame === "memory" && <MemoryMatrix onBack={() => setActiveGame(null)} />}
          {activeGame === "stroop" && <StroopTest onBack={() => setActiveGame(null)} />}
          {activeGame === "math" && <SpeedMath onBack={() => setActiveGame(null)} />}
          {activeGame === "schulte" && <SchulteTable onBack={() => setActiveGame(null)} />}
        </div>
      )}

    </div>
  );
}
