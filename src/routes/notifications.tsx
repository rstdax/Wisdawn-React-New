import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, CheckCheck, Award, BookOpen, Sparkles, Zap, Bell } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notifications — WisDawn" }] }),
});

// Mock Data for the design
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "achievement",
    title: "Level Up! 🏆",
    message: "You just reached Level 5 in Python Bootcamp. Keep up the great momentum!",
    time: "10 mins ago",
    unread: true,
    icon: Award,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    id: 2,
    type: "course",
    title: "New Lesson Available",
    message: "Chapter 4: 'Organic Chemistry' is now unlocked and ready for you to explore.",
    time: "2 hours ago",
    unread: true,
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    id: 3,
    type: "system",
    title: "App Update Completed",
    message: "We've added new interactive tests to the learning dashboard. Check them out!",
    time: "Yesterday",
    unread: false,
    icon: Sparkles,
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    id: 4,
    type: "streak",
    title: "7-Day Streak! 🔥",
    message: "Amazing consistency! You've logged in and learned for 7 days in a row.",
    time: "Yesterday",
    unread: false,
    icon: Zap,
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    id: 5,
    type: "reminder",
    title: "Don't forget to practice",
    message: "You haven't completed your daily physics quiz. Jump back in to keep your rank.",
    time: "2 days ago",
    unread: false,
    icon: Bell,
    color: "text-slate-500",
    bg: "bg-slate-100",
    border: "border-slate-200",
  }
];

function NotificationsPage() {
  const router = useRouter();

  return (
    <MobileFrame>
      {/* ── HEADER ── */}
      <header className="flex justify-between items-center px-5 pt-4 pb-4 bg-white sticky top-0 z-20 border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.history.back()} 
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 hover:bg-slate-100 transition shrink-0 -ml-2"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">Notifications</h1>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 transition shrink-0 text-slate-600 text-[11px] font-bold tracking-wide uppercase">
          <CheckCheck className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Mark all read</span>
        </button>
      </header>

      {/* ── NOTIFICATION LIST ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30">
        <div className="flex flex-col divide-y divide-slate-100 bg-white">
          {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="rounded-full bg-slate-50 p-6 mb-4 text-slate-300">
                <Bell className="h-10 w-10" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">You're all caught up!</h2>
              <p className="text-[13px] text-slate-500 text-center mt-2 max-w-[220px] leading-relaxed">
                Check back later for updates, streaks, and new course material.
              </p>
            </div>
          ) : (
            MOCK_NOTIFICATIONS.map((note) => (
              <div 
                key={note.id} 
                className={`relative flex items-start gap-4 p-5 transition-colors duration-300 cursor-pointer group ${note.unread ? "bg-blue-50/20" : "bg-white hover:bg-slate-50"}`}
              >
                {/* Unread Indicator Bar */}
                {note.unread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md" />
                )}

                {/* Icon */}
                <div className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${note.bg} ${note.border}`}>
                  <note.icon className={`h-5 w-5 ${note.color}`} />
                  {note.unread && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-[15px] truncate ${note.unread ? "font-extrabold text-slate-900" : "font-bold text-slate-800"}`}>
                      {note.title}
                    </p>
                    <span className={`text-[11px] whitespace-nowrap pt-1 ${note.unread ? "font-bold text-blue-600" : "font-medium text-slate-400"}`}>
                      {note.time}
                    </span>
                  </div>
                  <p className={`text-[13px] leading-relaxed mt-1 ${note.unread ? "text-slate-700 font-medium" : "text-slate-500"}`}>
                    {note.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MobileFrame>
  );
}