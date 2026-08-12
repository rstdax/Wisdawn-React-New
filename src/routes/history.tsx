import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Search, Play, FileText, Calendar, BookOpen } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getLastWatched, type LastWatchedEntry } from "@/lib/admin";
import { Skeleton } from "@/components/ui/skeleton";
import wisbyReading from "@/assets/wisby-reading.png";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History - WisDawn" }] }),
});

function isToday(date: Date) {
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
}

function isYesterday(date: Date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() && 
         date.getMonth() === yesterday.getMonth() && 
         date.getFullYear() === yesterday.getFullYear();
}

function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: lastWatched = [], isLoading } = useQuery({
    queryKey: ["lastWatchedFull", user?.uid],
    queryFn: () => (user ? getLastWatched(user.uid, 20) : Promise.resolve([])),
    enabled: !!user,
  });

  const todayLessons: LastWatchedEntry[] = [];
  const yesterdayLessons: LastWatchedEntry[] = [];
  const earlierLessons: LastWatchedEntry[] = [];

  // Categorize lessons by date
  lastWatched.forEach(lesson => {
    const d = new Date(lesson.watchedAt);
    if (isToday(d)) {
      todayLessons.push(lesson);
    } else if (isYesterday(d)) {
      yesterdayLessons.push(lesson);
    } else {
      earlierLessons.push(lesson);
    }
  });

  const renderLessonList = (lessons: LastWatchedEntry[]) => {
    return (
      <div className="flex flex-col divide-y divide-slate-100">
        {lessons.map((entry) => {
          const isVideo = !!entry.videoId;

          return (
            <Link key={entry.chapterId} to="/chapter/$id" params={{ id: entry.chapterId }} className="flex items-center gap-3 md:gap-4 py-4 group">
              
              {/* 1. Left Large Icon / Thumbnail (Neutralized) */}
              {isVideo ? (
                <div className="relative h-16 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50">
                  <img src={`https://img.youtube.com/vi/${entry.videoId}/mqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              ) : (
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 transition-colors duration-300 group-hover:bg-primary/10/50">
                  <FileText className="h-7 w-7 text-slate-300 group-hover:text-blue-500 transition-colors duration-300" />
                </div>
              )}
              
              {/* 2. Middle Content */}
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-400 transition-colors duration-300 group-hover:bg-blue-100 group-hover:text-primary">
                    {isVideo ? <Play className="h-3 w-3 fill-current translate-x-[0.5px]" /> : <FileText className="h-3 w-3" />}
                  </div>
                  <p className="truncate text-[15px] font-bold text-slate-800 transition-colors duration-300 group-hover:text-primary">
                    {entry.chapterTitle}
                  </p>
                </div>
                <p className="truncate text-[13px] font-medium text-slate-500 mt-1">{entry.subjectTitle}</p>
                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <p className="text-[11px] font-semibold">
                    {new Date(entry.watchedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>

              {/* 3. Right Action Button (Neutralized until hovered) */}
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:text-white group-hover:scale-105">
                <Play className="h-4 w-4 fill-current translate-x-[1px]" />
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <MobileFrame>
      <header className="flex justify-between items-center px-5 pt-4 pb-4 bg-white sticky top-0 z-20 border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.history.back()} className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 hover:bg-slate-100 transition shrink-0 -ml-2">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">History</h1>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 hover:bg-slate-100 transition shrink-0 text-slate-700">
          <Search className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-white px-5 pb-24">
        {/* Welcome Header */}
        <div className="pt-6 pb-2 relative overflow-hidden">
          <div className="relative z-10 w-2/3">
            <h2 className="text-[22px] font-extrabold text-slate-900 leading-tight tracking-tight">
              Keep learning, keep growing!
            </h2>
            <p className="text-[13px] text-slate-500 mt-1.5 font-medium">
              {lastWatched.length} lessons in progress
            </p>
          </div>
          <img
            src={wisbyReading}
            alt="Wisby reading a book"
            className="pointer-events-none absolute -right-5 -top-4 h-36 w-auto object-contain mix-blend-multiply opacity-90"
          />
        </div>

        {/* Dynamic Lists */}
        {isLoading ? (
           <div className="pt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl animate-pulse" />
            ))}
           </div>
        ) : lastWatched.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="rounded-full bg-slate-50 p-6 mb-4 text-slate-300">
              <BookOpen className="h-10 w-10" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No recent activity</h2>
            <p className="text-[13px] text-slate-500 text-center mt-2 max-w-[200px] leading-relaxed">
              Start watching a chapter to track your progress here.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            {todayLessons.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Today</h3>
                {renderLessonList(todayLessons)}
              </div>
            )}
            
            {yesterdayLessons.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yesterday</h3>
                {renderLessonList(yesterdayLessons)}
              </div>
            )}
            
            {earlierLessons.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Earlier</h3>
                {renderLessonList(earlierLessons)}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </MobileFrame>
  );
}
