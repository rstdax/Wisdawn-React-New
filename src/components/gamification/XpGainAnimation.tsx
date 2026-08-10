
import { useEffect, useRef, useState } from "react";

// ── Ensure lottie-player web component is loaded once ────────────────────────
let lottieScriptLoaded = false;
function ensureLottieScript() {
  if (lottieScriptLoaded || document.querySelector('script[data-lottie-player]')) {
    lottieScriptLoaded = true;
    return;
  }
  const script = document.createElement("script");
  script.src = "https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js";
  script.setAttribute("data-lottie-player", "true");
  document.head.appendChild(script);
  lottieScriptLoaded = true;
}

const FRAMES = [
  { src: "/xpanimation/frame1.png",  duration: 160 },
  { src: "/xpanimation/frame2.png",  duration: 160 },
  { src: "/xpanimation/frame3.png",  duration: 180 },
  { src: "/xpanimation/frame4.png",  duration: 180 },
  { src: "/xpanimation/frame5.png",  duration: 220 },
  { src: "/xpanimation/frame6.png",  duration: 220 },
  { src: "/xpanimation/frame7.png",  duration: 220 },
  { src: "/xpanimation/frame8.png",  duration: 220 },
  { src: "/xpanimation/frame9.png",  duration: 200 },
  { src: "/xpanimation/frame10.png", duration: 240 },
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Props = {
  xpEarned: number;
  show: boolean;
  onComplete?: () => void;
};

export function XpGainAnimation({ xpEarned, show, onComplete }: Props) {
  const [active, setActive] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [showChar, setShowChar] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [score, setScore] = useState(0);
  const [scorePop, setScorePop] = useState(false);
  const [coinVisible, setCoinVisible] = useState(false);

  const coinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isRunning = useRef(false);

  useEffect(() => {
    ensureLottieScript();
  }, []);

  useEffect(() => {
    if (show && xpEarned > 0 && !isRunning.current) {
      isRunning.current = true;
      setActive(true);
      runAnimation();
    }
  }, [show, xpEarned]);

  async function runAnimation() {
    setScore(0);
    setFrameIdx(0);
    setShowChar(false);
    setShowParty(false);
    setCoinVisible(false);

    try {
      const audio = new Audio("/xpanimation/soundeffect.wav");
      audio.volume = 0.55;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}

    setShowParty(true);
    setShowChar(true);
    setCoinVisible(true);

    await sleep(50); 

    // NOTE: Make sure an element with ID "xp-header-pill" exists in your app's header!
    const pill = document.getElementById("xp-header-pill");
    const iconEl = pill?.querySelector(".xp-star-icon");
    const rect = (iconEl ?? pill)?.getBoundingClientRect();
    const targetX = rect ? rect.left + rect.width / 2 : window.innerWidth - 60;
    const targetY = rect ? rect.top + rect.height / 2 : 44;

    setTimeout(() => {
      coinRefs.current.forEach((coin, index) => {
        if (!coin) return;
        const delay = index * 0.1;
        const flightMs = (0.7 + delay) * 1000;

        coin.style.transition = `
          top 0.7s ease-in ${delay}s,
          left 0.7s ease-out ${delay}s,
          transform 0.7s ease-in-out ${delay}s
        `;
        coin.style.top = `${targetY}px`;
        coin.style.left = `${targetX}px`;
        coin.style.transform = `translate(-50%, -50%) scale(0.25)`;

        setTimeout(() => {
          if (coin) coin.style.display = "none";
          setScore((s) => s + 1);
          setScorePop(true);
          setTimeout(() => setScorePop(false), 320);
        }, flightMs);
      });
    }, 400);

    for (let i = 0; i < FRAMES.length; i++) {
      setFrameIdx(i);
      await sleep(FRAMES[i].duration);
    }

    setShowChar(false);
    setShowParty(false);

    await sleep(500);
    setActive(false);
    isRunning.current = false;
    onComplete?.();
  }

  if (!active) return null;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight * 0.48;
  const COIN_OFFSETS = [0, -10, -20, -30, -40]; 

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }} aria-hidden="true">
      {showParty && (
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          {/* @ts-ignore */}
          <lottie-player src="/xpanimation/partyanimation.json" background="transparent" speed="1" loop autoplay style={{ width: "100%", height: "100%" }} />
        </div>
      )}

      {showChar && (
        <img
          src={FRAMES[frameIdx].src}
          alt=""
          className="absolute"
          style={{
            zIndex: 2,
            top: centerY,
            left: centerX,
            transform: "translate(-50%, -50%)",
            width: 200,
            height: 200,
            objectFit: "contain",
            animation: "xp-emerge 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        />
      )}

      {showChar && (
        <div
          className="absolute flex items-center gap-2 rounded-full px-5 py-2.5 border-2 border-yellow-300"
          style={{
            zIndex: 3,
            top: centerY - 130,
            left: centerX,
            // FIX: Removed translateX(-50%) to match the keyframe's final state properly
            transform: "translate(-50%, 0)", 
            background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
            boxShadow: "0 8px 32px rgba(245,158,11,0.45)",
            animation: "xp-label-emerge 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        >
          {/* SVG omitted for brevity... */}
          <span
            className="text-2xl font-black text-amber-900"
            style={scorePop ? { display: "inline-block", animation: "xp-score-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" } : { display: "inline-block" }}
          >
            +{xpEarned} XP
          </span>
        </div>
      )}

      {coinVisible && COIN_OFFSETS.map((offsetY, i) => (
        <div
          key={i}
          ref={(el) => { coinRefs.current[i] = el; }}
          className="xp-coin" // Added class
          style={{
            position: "fixed",
            width: 80,
            height: 80,
            zIndex: 9999,
            // FIX: Use CSS variables so React doesn't track/overwrite top, left, and transform
            "--start-y": `${centerY + offsetY}px`,
            "--start-x": `${centerX}px`,
          } as React.CSSProperties}
        >
          {/* @ts-ignore */}
          <lottie-player src="/xpanimation/coin.json" background="transparent" speed="1" loop autoplay style={{ width: "100%", height: "100%" }} />
        </div>
      ))}

      <style>{`
        /* FIX: Read from CSS variables to set initial position natively */
        .xp-coin {
          top: var(--start-y);
          left: var(--start-x);
          transform: translate(-50%, -50%) scale(1.3);
        }

        @keyframes xp-emerge {
          from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          to   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        /* FIX: Dedicated keyframe for the label so it doesn't jump */
        @keyframes xp-label-emerge {
          from { transform: translate(-50%, 0) scale(0); opacity: 0; }
          to   { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }

        @keyframes xp-score-pop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.6); color: #FF5722; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}