import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";

const items = [
  { to: "/home", label: "Home", name: "Home" },
  { to: "/learn", label: "Learn", name: "Learn" },
  { to: "/tests", label: "Tests", name: "Tests" },
  { to: "/rankings", label: "Rankings", name: "Rankings" },
  { to: "/profile", label: "Profile", name: "Profile" },
] as const;

const ACTIVE_COLOR = "#3B66F5";
const INACTIVE_COLOR = "#8CA0B8";

// Redesigned Icon Set: Geometric, sleek, and slightly futuristic.
// The active state fills with a soft tint and morphs the core shapes.
function AppIcon({ name, active, className }: { name: string; active: boolean; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const strokeColor = active ? ACTIVE_COLOR : "currentColor";
  const fillColor = active ? ACTIVE_COLOR : "none";
  const fillOp = active ? 0.2 : 0;

  switch (name) {
    case "Home":
      return (
        <svg {...common}>
          <path
            d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
            fill={fillColor}
            fillOpacity={fillOp}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path
            d="M9 21V12h6v9"
            stroke={strokeColor}
            strokeWidth="1.8"
            fill={active ? ACTIVE_COLOR : "none"}
            fillOpacity={active ? 0.4 : 0}
          />
        </svg>
      );
    case "Learn":
      return (
        <svg {...common}>
          <path
            d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path
            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
            fill={fillColor}
            fillOpacity={fillOp}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          {active && (
            <path
              d="M9 7h6M9 11h4"
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      );
    case "Tests":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            fill={fillColor}
            fillOpacity={fillOp}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path
            d="M8 12l3 3 5-6"
            stroke={strokeColor}
            strokeWidth={active ? "2.2" : "1.8"}
          />
        </svg>
      );
    case "Rankings":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="14"
            width="5"
            height="7"
            rx="1"
            fill={fillColor}
            fillOpacity={fillOp}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <rect
            x="9.5"
            y="3"
            width="5"
            height="18"
            rx="1"
            fill={fillColor}
            fillOpacity={fillOp}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <rect
            x="16"
            y="9"
            width="5"
            height="12"
            rx="1"
            fill={fillColor}
            fillOpacity={fillOp}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
        </svg>
      );
    case "Profile":
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="7"
            r="4"
            fill={fillColor}
            fillOpacity={fillOp}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <path
            d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"
            fill={fillColor}
            fillOpacity={fillOp}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function BottomNav() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      // Depending on where the scroll happens, we check both the target's scrollTop and window's scrollY
      const currentScrollY = target.scrollTop !== undefined ? target.scrollTop : window.scrollY;

      if (currentScrollY === undefined) return;

      // Hides when scrolling down, shows when scrolling up (like YouTube)
      if (currentScrollY > lastScrollY.current + 5 && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    // Use capture phase to catch scrolls even if they happen in a nested overflow-y-auto container
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && window.navigator?.vibrate) {
      window.navigator.vibrate(40);
    }
  };

  // Excluded routes where the nav shouldn't appear
  if (
    pathname === "/" ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/chapter/")
  ) {
    return null;
  }

  const activeIndex = items.findIndex(({ to }) => pathname === to || pathname.startsWith(to + "/"));

  return (
    <div 
      className={`md:hidden fixed inset-x-0 bottom-0 z-[100] pb-[env(safe-area-inset-bottom)] w-full transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <nav className="w-full bg-white border-t border-[#EEF1F6] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] px-2">
        <ul className="relative flex items-stretch justify-between w-full h-[72px]">
          {items.map(({ to, label, name }, index) => {
            const active = index === activeIndex;
            return (
              <li key={to} className="relative flex-1 flex justify-center items-center">
                {/* 
                  Venom-style indicator wrapped inside the list item. 
                  Framer Motion's layoutId interpolates the bounding box across the DOM nodes,
                  causing it to stretch lengthwise during the transition naturally.
                  Low damping and higher mass give it that fluid "jelly" lunge.
                */}
                {active && (
                  <motion.div
                    layoutId="venom-indicator"
                    className="absolute inset-y-1 inset-x-2 rounded-2xl bg-[#3B66F5]/10 pointer-events-none"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                      mass: 1.2,
                    }}
                  />
                )}

                <Link
                  to={to}
                  onClick={triggerHaptic}
                  aria-current={active ? "page" : undefined}
                  className="relative flex w-full h-full flex-col items-center justify-center gap-[4px] z-10"
                  style={{ color: active ? ACTIVE_COLOR : INACTIVE_COLOR }}
                >
                  <motion.div
                    animate={{
                      scale: active ? 1.15 : 1,
                      y: active ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <AppIcon name={name} active={active} className="h-[24px] w-[24px]" />
                  </motion.div>

                  <span
                    className="text-[11px] leading-none transition-colors duration-200"
                    style={{
                      fontWeight: active ? 700 : 500,
                      color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
                    }}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}