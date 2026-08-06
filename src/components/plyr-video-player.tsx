import { useEffect, useRef } from "react";

// Plyr types for TypeScript
declare global {
  interface Window {
    Plyr: any;
  }
}

type PlyrVideoPlayerProps = {
  videoId: string;
  startTime?: number;
  className?: string;
};

export function PlyrVideoPlayer({ videoId, startTime = 0, className = "" }: PlyrVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !videoId) return;

    // Load Plyr CSS if not already loaded
    if (!document.getElementById("plyr-css")) {
      const link = document.createElement("link");
      link.id = "plyr-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.plyr.io/3.7.8/plyr.css";
      document.head.appendChild(link);
    }

    // Load Plyr JS if not already loaded
    if (!window.Plyr) {
      const script = document.createElement("script");
      script.src = "https://cdn.plyr.io/3.7.8/plyr.js";
      script.onload = () => initializePlayer();
      document.body.appendChild(script);
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      if (!containerRef.current || playerRef.current) return;

      const playerElement = containerRef.current.querySelector("#plyr-player");
      if (!playerElement) return;

      // Initialize Plyr
      playerRef.current = new window.Plyr(playerElement, {
        ratio: "16:9",
        seekTime: 5,
        captions: { active: false, update: true },
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "captions",
          "settings",
          "fullscreen",
        ],
        settings: ["captions", "quality", "speed", "loop"],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        youtube: {
          noCookie: false,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          cc_load_policy: 0,
        },
      });

      // Smart Hold Logic: Keep controls visible when paused
      let hideTimeout: ReturnType<typeof setTimeout>;

      playerRef.current.on("pause", () => {
        clearTimeout(hideTimeout);
        playerRef.current.elements.container.classList.add("force-show-controls");
      });

      playerRef.current.on("play", () => {
        hideTimeout = setTimeout(() => {
          playerRef.current.elements.container.classList.remove("force-show-controls");
        }, 5000);
      });

      // If startTime is provided, seek to that time when ready
      if (startTime > 0) {
        playerRef.current.on("ready", () => {
          playerRef.current.currentTime = startTime;
        });
      }
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startTime]);

  return (
    <div ref={containerRef} className={`video-container ${className}`}>
      <style jsx>{`
        .video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
        }

        .plyr {
          height: 100%;
        }

        :root {
          --plyr-color-main: #007aff;
        }

        /* 1. SOLID BACKGROUND - Forces the bottom control bar to be completely black */
        .plyr__controls {
          background: #000000 !important;
          padding-bottom: 15px !important;
          padding-top: 15px !important;
          transition: opacity 0.3s ease !important;
        }

        /* 2. THE "SMART HOLD" CSS OVERRIDE */
        .plyr.force-show-controls .plyr__controls {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }

        /* 3. MASK THE CENTER YOUTUBE PLAY BUTTON */
        .plyr__control--overlaid {
          transform: translate(-50%, -50%) scale(1.5) !important;
          background: rgba(0, 122, 255, 0.95) !important;
          backdrop-filter: blur(5px);
        }

        .plyr__control--overlaid:hover {
          transform: translate(-50%, -50%) scale(1.6) !important;
          background: rgba(0, 122, 255, 1) !important;
        }
      `}</style>

      <div className="plyr__video-embed" id="plyr-player">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?origin=${
            typeof window !== "undefined" ? window.location.origin : ""
          }&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1&cc_load_policy=0${
            startTime ? `&start=${startTime}` : ""
          }`}
          allowFullScreen
          allow="autoplay"
        />
      </div>
    </div>
  );
}
