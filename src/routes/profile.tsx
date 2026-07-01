import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Bell,
  Download,
  Bookmark,
  Award,
  Settings,
  HelpCircle,
  Info,
  ChevronRight,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — WisDawn" }] }),
  component: Profile,
});

function Profile() {
  return (
    <MobileFrame>
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-6">
        <div className="rounded-3xl bg-primary-soft p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground">
              RK
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold">Rahul Kumar</p>
              <p className="truncate text-xs text-muted-foreground">rahulkumar@email.com</p>
              <span className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Active Learner
              </span>
            </div>
            <button className="rounded-full bg-card px-3 py-1.5 text-[11px] font-semibold">
              Edit Profile
            </button>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2 text-center">
            <Stat label="Courses" value="12" />
            <Stat label="Badges" value="8" />
            <Stat label="XP Points" value="5,240" />
            <Stat label="Rank" value="#12" />
          </div>
        </div>

        <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          <Item icon={<Bell className="h-4 w-4" />} label="Study Reminders" />
          <Item icon={<Download className="h-4 w-4" />} label="Downloads" />
          <Item icon={<Bookmark className="h-4 w-4" />} label="Bookmarks" />
          <Item icon={<Award className="h-4 w-4" />} label="Achievements" />
          <Item icon={<Settings className="h-4 w-4" />} label="Settings" />
          <Item icon={<HelpCircle className="h-4 w-4" />} label="Help & Support" />
          <Item icon={<Info className="h-4 w-4" />} label="About WisDawn" />
        </ul>

        <Link
          to="/"
          className="mt-5 block rounded-2xl border border-border bg-card py-3 text-center text-sm font-semibold text-destructive"
        >
          Sign out
        </Link>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-2">
      <p className="text-base font-extrabold text-primary">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
function Item({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <li>
      <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </li>
  );
}
