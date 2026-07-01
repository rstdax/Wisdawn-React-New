import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, ClipboardCheck, Trophy, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/tests", label: "Tests", icon: ClipboardCheck },
  { to: "/rankings", label: "Rankings", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky bottom-0 z-20 mt-auto border-t border-border/70 bg-background/95 backdrop-blur-xl">
      <ul className="grid grid-cols-5 gap-1 px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
