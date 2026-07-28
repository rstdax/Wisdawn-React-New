import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode, useEffect } from "react";
import {
  ChevronRight,
  User as UserIcon,
  HelpCircle,
  Info,
  MoreHorizontal,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser, saveOnboardingData } from "@/lib/auth";
import wisbyAvatar from "../assets/jjj.jpeg";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — WisDawn" }] }),
  component: Profile,
});

function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { displayName, displayEmail, profile, loading } = useAuth();
  const [name, setName] = useState("");
  const [showMore, setShowMore] = useState(false);


  // Sync name with loaded profile — only update when profile actually loads
  useEffect(() => {
    if (!loading && displayName && displayName !== "Learner") {
      setName(displayName);
    } else if (!loading && profile?.name) {
      setName(profile.name);
    }
  }, [loading, displayName, profile]);



  const handleSignOut = async () => {
    await signOutUser();
    navigate({ to: "/" });
  };

  return (
    <MobileFrame>
      {/* MOBILE-ONLY HEADER */}
      <div className="px-5 pt-3 md:hidden">
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <p className="text-xs text-muted-foreground">Manage your profile and support</p>
      </div>

      {/* RESPONSIVE LAYOUT BODY */}
      <div className="flex-1 overflow-y-auto md:overflow-visible pb-6 px-5 md:px-0 pt-4">
        {/* DESKTOP HEADER */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <UserIcon className="h-6 w-6 text-primary" /> Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your profile, learning stats, and support
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {/* USER DETAILS CARD & MENU LIST */}
          <div className="space-y-4">
            {/* USER CARD */}
            <div className="rounded-3xl bg-primary-soft p-5 border border-primary/10">
              <div className="flex items-start gap-4">
                <img 
                  src={wisbyAvatar} 
                  alt="Profile Avatar" 
                  className="h-16 w-16 shrink-0 rounded-full object-contain border-2 border-primary/20 bg-white shadow-sm p-1" 
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-foreground">{name}</p>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">{displayEmail}</p>
                  <span className="mt-2 inline-block rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {profile?.track || "Active Learner"}
                  </span>
                </div>
                <button
                  onClick={() => navigate({ to: "/profile/edit" })}
                  className="rounded-full bg-card px-3 py-1.5 text-[10px] font-bold text-muted-foreground border border-border transition hover:bg-muted shrink-0"
                >
                  Edit Profile
                </button>
              </div>

              {/* Profile Stats Grid */}
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <Stat label="Badges" value={String(profile?.stats?.badges ?? 0)} />
                <Stat label="XP Points" value={(profile?.stats?.xp ?? 0).toLocaleString()} />
                <Stat label="Rank" value={profile?.stats?.rank ? `#${profile.stats.rank}` : "—"} />
              </div>
            </div>

            {/* SELECTION ITEMS LIST */}
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              <Item
                icon={<HelpCircle className="h-4 w-4" />}
                label="Help & Support"
                active={false}
                onClick={() => navigate({ to: "/support" })}
              />
              <Item
                icon={<Info className="h-4 w-4" />}
                label="About Us"
                active={false}
                onClick={() => navigate({ to: "/about" })}
              />
              <Item
                icon={<MoreHorizontal className="h-4 w-4" />}
                label="More"
                active={showMore}
                onClick={() => setShowMore(!showMore)}
              />
              {showMore && (
                <div className="bg-muted/10 p-3 animate-fade-in border-t border-border">
                  <button
                    onClick={handleSignOut}
                    className="block w-full rounded-xl border border-destructive/20 bg-destructive/5 py-3 text-center text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
      

    </MobileFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-2 border border-border/60">
      <p className="text-sm font-extrabold text-primary">{value}</p>
      <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{label}</p>
    </div>
  );
}

function Item({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition ${
          active
            ? "bg-primary-soft text-primary font-bold"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }`}
      >
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${active ? "bg-primary text-white" : "bg-primary-soft text-primary"}`}
        >
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </li>
  );
}




