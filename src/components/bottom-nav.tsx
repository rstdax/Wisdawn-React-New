import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, ClipboardCheck, Trophy, User } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/tests", label: "Tests", icon: ClipboardCheck },
  { to: "/rankings", label: "Rankings", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      // Get scroll position from either a scrolling div container or the main window
      const currentScrollY = target.scrollTop !== undefined ? target.scrollTop : window.scrollY;
      
      if (currentScrollY === undefined) return;

      // Ensure we only trigger hiding/showing if the user scrolled more than 5px
      // This prevents horizontal carousels or micro-jitters from triggering the animation
      if (currentScrollY > lastScrollY.current + 5 && currentScrollY > 50) {
        setIsVisible(false); // Scrolling Down -> Hide
      } else if (currentScrollY < lastScrollY.current - 5) {
        setIsVisible(true);  // Scrolling Up -> Show
      }
      
      lastScrollY.current = currentScrollY;
    };

    // 'capture: true' guarantees we catch the scroll event even if it's happening inside a nested layout div!
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  if (
    pathname === "/" ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/chapter/")
  ) {
    return null;
  }

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 w-full z-[100] bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] transition-transform duration-300 ease-in-out ${
      isVisible ? "translate-y-0" : "translate-y-full"
    }`}>
      <ul className="flex items-center justify-between w-full">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to} className="flex-1 relative flex justify-center">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`relative flex w-full h-[64px] flex-col items-center justify-center gap-1 transition-colors duration-300 z-10 ${
                  active
                    ? "text-primary"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {/* Top Active Indicator Line */}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-b-md bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                
                {/* Icon */}
                <Icon 
                  className={`h-[22px] w-[22px] transition-all ${
                    active ? "fill-primary text-primary" : "stroke-[1.5px]"
                  }`} 
                />
                
                {/* Label */}
                <span className={`text-[10px] transition-all ${active ? "font-bold" : "font-medium"}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}