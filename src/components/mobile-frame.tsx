import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Home,
  BookOpen,
  ClipboardCheck,
  Trophy,
  User,
  Bell,
  Search,
  Menu,
  Code2,
  GraduationCap,
  Award,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Wisby } from "@/components/wisby";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser } from "@/lib/auth";

type SubItem = {
  to: string;
  label: string;
  badge?: number;
};

type MenuItem = {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  to?: string;
  subItems?: SubItem[];
};

export function MobileFrame({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const search = location.search as Record<string, string | undefined>;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { initials, displayName, profile, loading } = useAuth();

  const handleLogOut = async () => {
    await signOutUser();
    navigate({ to: "/" });
  };

  const isAuthRoute = pathname === "/" || pathname === "/onboarding";

  const sidebarItems: MenuItem[] = [
    {
      label: "Home",
      icon: Home,
      subItems: [
        { to: "/home", label: "School Academy" },
        { to: "/home?track=coding", label: "Coding Bootcamp" },
      ],
    },
    {
      label: "Learn",
      icon: BookOpen,
      subItems: [
        { to: "/learn", label: "Subject Lessons" },
        { to: "/learn?tab=courses", label: "Courses" },
      ],
    },
    { to: "/tests", label: "Practice", icon: ClipboardCheck },
    { to: "/rankings", label: "Rankings", icon: Trophy },
    {
      label: "Profile",
      icon: User,
      subItems: [
        { to: "/profile", label: "View Profile" },
        { to: "/profile?tab=Downloads", label: "Downloads" },
        { to: "/profile?tab=Achievements", label: "Achievements" },
        { to: "/profile?tab=messages", label: "Messages", badge: 3 },
        { to: "/profile?tab=help", label: "Help & Support" },
        { to: "/profile?tab=Settings", label: "Settings" },
      ],
    },
  ];

  // Active status checker for individual sub-items or direct links
  const isSubItemActive = (to: string) => {
    const [toPath, toQuery] = to.split("?");
    if (pathname !== toPath) return false;

    if (!toQuery) {
      if (pathname === "/home" && search?.track === "coding") return false;
      if (pathname === "/learn" && search?.track === "coding") return false;
      if (pathname === "/learn" && search?.tab === "courses") return false;
      if (pathname === "/profile" && search?.tab) return false;
      return true;
    }

    if (toQuery.includes("track=")) {
      const trackParam = toQuery.includes("track=coding") ? "coding" : "school";
      return search?.track === trackParam;
    }

    if (toQuery.includes("tab=")) {
      const tabName = toQuery.split("tab=")[1];
      return search?.tab?.toLowerCase() === tabName.toLowerCase();
    }

    return true;
  };

  const isParentActive = (item: MenuItem) => {
    if (item.to) {
      return pathname === item.to;
    }
    return item.subItems?.some((sub) => isSubItemActive(sub.to)) ?? false;
  };

  // Initialize open state for accordion menus based on active items
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initialOpen: Record<string, boolean> = {};
    sidebarItems.forEach((item) => {
      if (item.subItems) {
        initialOpen[item.label] = item.subItems.some((sub) => {
          const [toPath, toQuery] = sub.to.split("?");
          if (pathname !== toPath) return false;
          if (!toQuery) {
            if (pathname === "/home" && search?.track === "coding") return false;
            if (pathname === "/learn" && search?.track === "coding") return false;
            if (pathname === "/learn" && search?.tab === "courses") return false;
            if (pathname === "/profile" && search?.tab) return false;
            return true;
          }
          if (toQuery.includes("track=")) {
            const trackParam = toQuery.includes("track=coding") ? "coding" : "school";
            return search?.track === trackParam;
          }
          if (toQuery.includes("tab=")) {
            const tabName = toQuery.split("tab=")[1];
            return search?.tab?.toLowerCase() === tabName.toLowerCase();
          }
          return true;
        });
      }
    });
    return initialOpen;
  });

  const toggleMenu = (label: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenMenus((prev) => ({ ...prev, [label]: true }));
      return;
    }
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  if (isAuthRoute) {
    return (
      <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(117,95,255,0.08),rgba(255,255,255,0.92))]">
        {/* On desktop/tablet, show full bleed */}
        <div className="hidden md:block min-h-screen w-full">{children}</div>
        {/* On mobile, show centered frame */}
        <div className="md:hidden mx-auto flex min-h-screen w-full max-w-110 flex-col border-x border-border/70 bg-background shadow-[0_25px_80px_-32px_rgba(15,23,42,0.35)]">
          <div className="flex min-h-screen flex-1 flex-col">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(117,95,255,0.08),rgba(255,255,255,0.92))]">
      {/* WIDESCREEN DESKTOP & TABLET LAYOUT (md and up) */}
      <div className="hidden md:flex min-h-screen w-full">
        {/* Left Sidebar */}
        <aside
          className={`border-r border-border bg-card flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Logo */}
          <div
            className={`p-6 flex items-center transition-all duration-300 ${
              isCollapsed ? "justify-center" : "gap-2"
            }`}
          >
            {isCollapsed ? (
              <Wisby variant="logo" className="w-10 h-10 object-cover rounded-full shadow-xs" />
            ) : (
              <Wisby variant="logo" className="w-36" />
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            {sidebarItems.map((item) => {
              const active = isParentActive(item);
              const isOpen = openMenus[item.label];

              if (item.subItems) {
                return (
                  <div key={item.label} className="space-y-0.5">
                    {/* Collapsible Accordion Header */}
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isCollapsed ? "justify-center" : ""
                      } ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div
                        className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronRight
                          className={`h-4 w-4 transition-transform duration-200 text-muted-foreground ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* Accordion Sub-items */}
                    {isOpen && !isCollapsed && (
                      <div className="pl-5 ml-6 border-l border-border/80 space-y-0.5 mt-0.5">
                        {item.subItems.map((sub) => {
                          const subActive = isSubItemActive(sub.to);
                          return (
                            <Link
                              key={sub.label}
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              to={sub.to as any}
                              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                subActive
                                  ? "bg-primary text-primary-foreground shadow-xs shadow-primary/10"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <span>{sub.label}</span>
                              {sub.badge && (
                                <span className="bg-destructive text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold scale-90">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Simple Direct Link
              return (
                <Link
                  key={item.label}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  to={item.to as any}
                  className={`flex items-center rounded-xl text-sm font-semibold transition-all ${
                    isCollapsed ? "justify-center p-3" : "justify-between px-4 py-2.5"
                  } ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer banner */}
          <div className="p-4 border-t border-border space-y-3">
            {!isCollapsed && (
              <div className="rounded-2xl bg-primary-soft p-4 relative overflow-hidden">
                <p className="text-xs font-bold text-foreground max-w-[65%]">
                  Let's build something amazing!
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-[60%] font-medium">
                  Consistency today, mastery tomorrow.
                </p>
                <Wisby variant="thumbs" className="absolute -bottom-3 -right-3 h-16 w-16" />
              </div>
            )}
            <button
              onClick={handleLogOut}
              className={`flex items-center rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all w-full ${
                isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-2.5"
              }`}
              title={isCollapsed ? "Log Out" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isCollapsed ? "pl-20" : "pl-64"
          }`}
        >
          {/* Top Header */}
          <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 hover:bg-muted rounded-full transition"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for lessons, topics or courses..."
                  className="w-full bg-muted/50 border border-border/80 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-muted rounded-full transition">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
              </button>

              <Link
                to="/profile"
                className="flex items-center gap-3 hover:bg-muted/50 p-1.5 rounded-full pr-3 transition"
              >
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                  {loading ? "…" : initials}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold leading-none">{loading ? "Loading…" : displayName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{profile?.cls || ""}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
              </Link>
            </div>
          </header>

          {/* Main Workspace Body */}
          <main className="flex-1 p-8 bg-slate-50/50">{children}</main>
        </div>
      </div>

      {/* MOBILE LAYOUT (less than md) */}
      <div className="md:hidden mx-auto flex min-h-screen w-full max-w-110 flex-col border-x border-border/70 bg-background shadow-[0_25px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
