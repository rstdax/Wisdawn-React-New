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
  
  if (pathname === "/" || pathname === "/onboarding") return null;

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 z-[100] px-4 pointer-events-none pb-1">
      <nav className="pointer-events-auto rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-900/5 p-1">
        <ul className="flex items-center justify-between relative">
          {items.map(({ to, label, icon: Icon }, index) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Fragment key={to}>
                <li className="flex-1 relative flex justify-center">
                  <Link
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex w-full flex-col items-center justify-center gap-1 rounded-[1.5rem] py-2.5 text-[10px] font-semibold transition-colors duration-300 z-10 ${
                      active
                        ? "text-blue-600"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-bg"
                        className="absolute inset-0 rounded-[1.5rem] bg-blue-50/80 -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute top-1.5 h-1 w-3 rounded-full bg-blue-600"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <Icon className={`mt-2 h-5 w-5 transition-all ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                    <span>{label}</span>
                  </Link>
                </li>
                {index < items.length - 1 && (
                  <div className="h-6 w-[1px] bg-slate-200 z-0" />
                )}
              </Fragment>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
