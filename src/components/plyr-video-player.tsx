import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { Plyr: any; }
}

type PlyrVideoPlayerProps = {
  videoId: string;
  startTime?: number;
  className?: string;
};

const QUALITY_LEVELS = [
  { label: "Auto", value: "default" },
  { label: "1080p HD", value: "hd1080" },
  { label: "720p HD", value: "hd720" },
  { label: "480p", value: "large" },
  { label: "360p", value: "medium" },
  { label: "240p", value: "small" },
  { label: "144p", value: "tiny" },
];

export function PlyrVideoPlayer({ videoId, startTime = 0, className = "" }: PlyrVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const instanceId = useRef(`plyr-${Math.random().toString(36).slice(2, 8)}`);
  const hdBtnRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedQuality, setSelectedQuality] = useState("default");
  const [availableQualities, setAvailableQualities] = useState(QUALITY_LEVELS);

  const applyQuality = (value: string) => {
    setSelectedQuality(value);
    // Hide dropdown
    if (dropdownRef.current) dropdownRef.current.style.display = "none";
    // Update button label
    const label = QUALITY_LEVELS.find(q => q.value === value)?.label ?? "Auto";
    if (hdBtnRef.current) {
      hdBtnRef.current.textContent = value === "default" ? "HD" : label.replace(" HD", "");
    }
    // Apply to YouTube
    const ytPlayer = playerRef.current?.embed;
    if (!ytPlayer) return;
    try {
      ytPlayer.setPlaybackQualityRange?.(value, value);
      ytPlayer.setPlaybackQuality?.(value);
    } catch (_) {}
  };

  useEffect(() => {
    if (!containerRef.current || !videoId) return;

    if (!document.getElementById("plyr-css")) {
      const link = document.createElement("link");
      link.id = "plyr-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.plyr.io/3.7.8/plyr.css";
      document.head.appendChild(link);
    }

    const injectHdButton = () => {
      if (!containerRef.current) return;
      // Remove previous
      containerRef.current.querySelector("#custom-hd-btn-wrap")?.remove();

      const fullscreenBtn = containerRef.current.querySelector('.plyr__controls [data-plyr="fullscreen"]');
      if (!fullscreenBtn?.parentElement) return;

      // Wrapper
      const wrap = document.createElement("div");
      wrap.id = "custom-hd-btn-wrap";
      wrap.style.cssText = "position:relative;display:flex;align-items:center;";

      // HD Button
      const btn = document.createElement("button");
      btn.id = "custom-hd-btn";
      btn.type = "button";
      btn.textContent = "HD";
      btn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 3px;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 5px;
        cursor: pointer;
        letter-spacing: 0.3px;
        line-height: 1.4;
        white-space: nowrap;
      `;
      hdBtnRef.current = btn;

      // Dropdown
      const dropdown = document.createElement("div");
      dropdown.style.cssText = `
        display: none;
        position: absolute;
        bottom: 130%;
        right: 0;
        background: rgba(20,20,20,0.97);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        overflow-y: auto;
        max-height: 220px;
        min-width: 130px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        z-index: 9999;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.2) transparent;
      `;
      dropdownRef.current = dropdown;

      const renderDropdown = (qualities: typeof QUALITY_LEVELS) => {
        dropdown.innerHTML = "";
        qualities.forEach(q => {
          const item = document.createElement("button");
          item.type = "button";
          item.style.cssText = `
            display: flex; align-items: center; justify-content: space-between;
            width: 100%; padding: 9px 14px;
            background: transparent; border: none;
            color: ${selectedQuality === q.value ? "#007aff" : "#fff"};
            font-size: 12px; font-weight: ${selectedQuality === q.value ? 700 : 500};
            cursor: pointer; text-align: left; gap: 8px;
          `;
          item.innerHTML = `<span>${q.label}</span>${selectedQuality === q.value ? '<span style="color:#007aff">●</span>' : ""}`;
          item.onclick = (e) => { e.stopPropagation(); applyQuality(q.value); };
          dropdown.appendChild(item);
        });
      };

      renderDropdown(QUALITY_LEVELS);

      btn.onclick = (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
      };

      // Close on outside click
      document.addEventListener("click", () => {
        if (dropdownRef.current) dropdownRef.current.style.display = "none";
      });

      wrap.appendChild(btn);
      wrap.appendChild(dropdown);
      fullscreenBtn.parentElement.insertBefore(wrap, fullscreenBtn);

      // Fetch available qualities after 2s
      setTimeout(() => {
        const ytPlayer = playerRef.current?.embed;
        if (!ytPlayer) return;
        try {
          const levels: string[] = ytPlayer.getAvailableQualityLevels?.() ?? [];
          if (levels.length > 0) {
            const filtered = QUALITY_LEVELS.filter(q => q.value === "default" || levels.includes(q.value));
            if (filtered.length > 1) {
              setAvailableQualities(filtered);
              renderDropdown(filtered);
            }
          }
        } catch (_) {}
      }, 2000);
    };

    const init = () => {
      if (!containerRef.current) return;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }

      const el = containerRef.current.querySelector(`#${instanceId.current}`);
      if (!el) return;
      // Ensure element has the id set (in case DOM wasn't ready)
      el.id = instanceId.current;

      playerRef.current = new window.Plyr(el, {
        ratio: "16:9",
        seekTime: 5,
        captions: { active: false, update: true },
        controls: ["play-large", "play", "progress", "current-time", "settings", "fullscreen"],
        settings: ["speed"],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1, cc_load_policy: 0 },
      });

      let hideTimeout: ReturnType<typeof setTimeout>;
      playerRef.current.on("pause", () => {
        clearTimeout(hideTimeout);
        playerRef.current?.elements?.container?.classList.add("force-show-controls");
      });
      playerRef.current.on("play", () => {
        hideTimeout = setTimeout(() => {
          playerRef.current?.elements?.container?.classList.remove("force-show-controls");
        }, 5000);
      });

      playerRef.current.on("ready", () => {
        if (startTime > 0) playerRef.current.currentTime = startTime;
        // Inject HD button after Plyr renders controls
        setTimeout(injectHdButton, 300);
      });
    };

    if (!window.Plyr) {
      const script = document.createElement("script");
      script.src = "https://cdn.plyr.io/3.7.8/plyr.js";
      script.onload = init;
      document.body.appendChild(script);
    } else {
      init();
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, [videoId, startTime]);

  const src = `https://www.youtube.com/embed/${videoId}?origin=${
    typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : ""
  }&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1&cc_load_policy=0${
    startTime ? `&start=${startTime}` : ""
  }`;

  return (
    <div ref={containerRef} className={`plyr-wrapper ${className}`}>
      <style>{`
        .plyr-wrapper { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; }
        .plyr-wrapper .plyr { height: 100%; }
        :root { --plyr-color-main: #007aff; }
        .plyr__controls {
          background: #000 !important;
          padding-bottom: 15px !important;
          padding-top: 15px !important;
          transition: opacity 0.3s ease !important;
        }
        .plyr.force-show-controls .plyr__controls {
          opacity: 1 !important; visibility: visible !important;
          pointer-events: auto !important; transform: translateY(0) !important;
        }
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

      <div className="plyr__video-embed" id={instanceId.current}>
        <iframe src={src} allowFullScreen allow="autoplay" title="Video Player" />
      </div>
    </div>
  );
}
