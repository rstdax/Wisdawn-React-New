import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, ClipboardCheck, Trophy, User } from "lucide-react";
import { Fragment } from "react";
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
    <div className="md:hidden fixed bottom-4 left-0 right-0 z-[100] px-3 pointer-events-none">
      <nav className="pointer-events-auto rounded-[1.75rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5 p-1">
        <ul className="flex items-center justify-between relative">
          {items.map(({ to, label, icon: Icon }, index) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Fragment key={to}>
                <li className="flex-1 relative flex justify-center">
                  <Link
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex w-full h-[60px] flex-col items-center justify-center gap-0.5 rounded-[1rem] transition-colors duration-300 z-10 ${
                      active
                        ? "text-primary"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-bg"
                        className="absolute inset-0 rounded-[1.25rem] bg-primary-soft -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute top-2 h-[3px] w-4 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <Icon 
                      className={`h-[20px] w-[20px] transition-all ${
                        active ? "fill-primary text-primary mt-0.5" : "stroke-2 mb-0"
                      }`} 
                    />
                    <span className="text-[10px] font-medium">{label}</span>
                  </Link>
                </li>
                {index < items.length - 1 && (
                  <div className="h-8 w-[1px] bg-slate-200/80 shrink-0 z-0" />
                )}
              </Fragment>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
