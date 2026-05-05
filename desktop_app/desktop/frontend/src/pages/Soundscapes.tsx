import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Play, Pause, Volume2, CloudRain, Trees, Wind, Waves, Brain, Activity, Headphones, Music, BookOpen, Clock, Heart, Move, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

// Placeholder URLs. Replace with local paths like "/sounds/piano.mp3" later.
const CATEGORIES = [
  {
    title: "Nature Sounds",
    sounds: [
      { id: "rain", title: "Heavy Rain", icon: CloudRain, url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg", bg: "from-blue-600 to-indigo-900" },
      { id: "waves", title: "Ocean Waves", icon: Waves, url: "https://actions.google.com/sounds/v1/water/ocean_waves_crashing.ogg", bg: "from-cyan-500 to-blue-800" },
      { id: "wind", title: "Mountain Wind", icon: Wind, url: "https://actions.google.com/sounds/v1/weather/strong_wind_blowing.ogg", bg: "from-slate-600 to-gray-900" },
      { id: "river", title: "Forest River", icon: Trees, url: "https://actions.google.com/sounds/v1/water/river_stream.ogg", bg: "from-emerald-600 to-teal-900" }
    ]
  },
  {
    title: "Binaural Beats",
    sounds: [
      { id: "alpha", title: "Alpha (Focus)", icon: Brain, url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg", bg: "from-purple-600 to-indigo-900" },
      { id: "beta", title: "Beta (Alert)", icon: Activity, url: "https://actions.google.com/sounds/v1/water/ocean_waves_crashing.ogg", bg: "from-rose-600 to-red-900" },
      { id: "theta", title: "Theta (Create)", icon: Headphones, url: "https://actions.google.com/sounds/v1/weather/strong_wind_blowing.ogg", bg: "from-fuchsia-600 to-purple-900" },
      { id: "delta", title: "Delta (Sleep)", icon: Music, url: "https://actions.google.com/sounds/v1/water/river_stream.ogg", bg: "from-indigo-700 to-blue-950" }
    ]
  },
  {
    title: "Classical Music",
    sounds: [
      { id: "piano", title: "Piano Focus", icon: Music, url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg", bg: "from-amber-600 to-orange-900" },
      { id: "cello", title: "Cello Ambience", icon: Music, url: "https://actions.google.com/sounds/v1/water/ocean_waves_crashing.ogg", bg: "from-red-800 to-stone-900" },
      { id: "strings", title: "Soft Strings", icon: BookOpen, url: "https://actions.google.com/sounds/v1/weather/strong_wind_blowing.ogg", bg: "from-yellow-600 to-amber-900" },
      { id: "symphony", title: "Deep Symphony", icon: Headphones, url: "https://actions.google.com/sounds/v1/water/river_stream.ogg", bg: "from-stone-700 to-zinc-950" }
    ]
  },
  {
    title: "Slowed Breathing",
    sounds: [
      { id: "box", title: "Box Breathing", icon: Clock, url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg", bg: "from-teal-600 to-emerald-900" },
      { id: "478", title: "4-7-8 Guide", icon: Heart, url: "https://actions.google.com/sounds/v1/water/ocean_waves_crashing.ogg", bg: "from-sky-600 to-indigo-900" },
      { id: "exhale", title: "Deep Exhales", icon: Wind, url: "https://actions.google.com/sounds/v1/weather/strong_wind_blowing.ogg", bg: "from-cyan-700 to-blue-900" },
      { id: "resonance", title: "Resonance", icon: Move, url: "https://actions.google.com/sounds/v1/water/river_stream.ogg", bg: "from-violet-600 to-purple-900" }
    ]
  }
];

export default function Soundscapes() {
  const [activeTrack, setActiveTrack] = useState(CATEGORIES[0].sounds[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Handle track change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = activeTrack.url;
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [activeTrack, isPlaying]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[hsl(258_30%_98%)] relative">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between z-10 sticky top-0 bg-white/50 backdrop-blur-xl border-b border-[hsl(258_20%_90%)]">
        <div className="flex items-center gap-4">
          <Link to="/productivity" className="p-2 hover:bg-[hsl(258_20%_90%)] rounded-xl transition-colors text-[hsl(232_45%_25%)]">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)] tracking-wide">
              Focus Soundscapes
            </h1>
            <p className="text-xs text-[hsl(232_20%_55%)] font-medium">Ambient noise for deep concentration</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="flex flex-col gap-8 py-8">
          {CATEGORIES.map((category) => (
            <div key={category.title} className="flex flex-col">
              {/* Category Header */}
              <div className="px-6 flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-[hsl(232_45%_16%)] tracking-wide">{category.title}</h2>
                <button className="text-xs font-semibold text-[hsl(232_20%_55%)] hover:text-[hsl(232_45%_16%)] transition-colors flex items-center">
                  All <ChevronRight size={14} className="ml-0.5" />
                </button>
              </div>

              {/* Horizontal Scroll Row */}
              <div className="flex overflow-x-auto gap-4 px-6 pb-4 scrollbar-hide snap-x">
                {category.sounds.map((sound) => {
                  const isActive = activeTrack.id === sound.id;
                  const Icon = sound.icon;
                  
                  return (
                    <button
                      key={sound.id}
                      onClick={() => setActiveTrack(sound)}
                      className={cn(
                        "relative flex-none w-36 h-52 rounded-2xl overflow-hidden transition-all snap-start group text-left",
                        isActive ? "ring-2 ring-[hsl(258_100%_60%)] ring-offset-2 ring-offset-[hsl(258_30%_98%)] scale-[0.98]" : "hover:scale-105 shadow-sm"
                      )}
                    >
                      {/* Gradient Background mimicking poster */}
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity", sound.bg)} />
                      
                      {/* Icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon size={48} className="text-white/30 group-hover:text-white/50 transition-colors duration-500" strokeWidth={1} />
                      </div>

                      {/* Text content at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="font-heading font-bold text-sm text-white drop-shadow-md">
                          {sound.title}
                        </span>
                      </div>

                      {/* Active Indicator overlay */}
                      {isActive && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Now Playing Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[hsl(258_20%_90%)] p-5 shadow-2xl z-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Active Track Info */}
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br", activeTrack.bg)}>
              <activeTrack.icon size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-heading font-bold text-[hsl(232_45%_16%)] tracking-wide">{activeTrack.title}</p>
              
              {/* Visualizer bars */}
              <div className="flex items-center gap-1 mt-1.5 h-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1 bg-[hsl(258_100%_60%)] rounded-full transition-all duration-300",
                      isPlaying ? "animate-pulse" : "h-1"
                    )}
                    style={{ 
                      height: isPlaying ? `${Math.max(40, Math.random() * 100)}%` : '4px',
                      animationDelay: `${i * 150}ms`,
                      animationDuration: '800ms'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Play Controls */}
          <div className="flex items-center justify-center w-full md:w-1/3">
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(258_100%_60%)] to-[hsl(258_100%_50%)] flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-end gap-3 w-full md:w-1/3">
            <Volume2 className="text-[hsl(232_20%_55%)]" size={20} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-[hsl(258_20%_90%)] rounded-full appearance-none cursor-pointer accent-[hsl(258_100%_60%)] hover:accent-[hsl(258_100%_50%)] transition-all"
            />
          </div>
          
        </div>
      </div>
      
      {/* Global style to hide scrollbar for horizontal lists */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
