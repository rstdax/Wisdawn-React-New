import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { 
  ArrowLeft, Search, Clock, Play, Flame, 
  ChevronRight, BookOpen, ShieldCheck, Bookmark, Sparkles
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getLastWatched, LastWatchedEntry } from "@/lib/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import wisbyReading from "@/assets/wisby-reading.png";
import wisbyThumbs from "@/assets/wisby-thumbs.png";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — WisDawn" }] }),
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

function CircularProgress({ progress, isCompleted = false }: { progress: number, isCompleted?: boolean }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center text-green-500">
        <div className="relative flex items-center justify-center">
          <svg className="w-11 h-11 transform -rotate-90">
            <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-green-500/20" />
            <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={0} className="text-green-500" strokeLinecap="round" />
          </svg>
          <span className="absolute text-[10px] font-bold">100%</span>
        </div>
        <span className="text-[9px] flex items-center gap-0.5 mt-0.5 font-medium"><ShieldCheck className="w-[10px] h-[10px]" /> Completed</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-primary">
      <div className="relative flex items-center justify-center">
        <svg className="w-11 h-11 transform -rotate-90">
          <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-primary/20" />
          <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="text-primary transition-all duration-500 ease-in-out" strokeLinecap="round" />
        </svg>
        <span className="absolute text-[10px] font-bold">{progress}%</span>
      </div>
      <span className="text-[9px] font-medium mt-0.5">Resume</span>
    </div>
  );
}

function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: lastWatched = [], isLoading } = useQuery({
    queryKey: ["lastWatchedFull", user?.uid],
    queryFn: () => (user ? getLastWatched(user.uid, 20) : Promise.resolve([])),
    enabled: !!user,
  });

  const topLesson = lastWatched.length > 0 ? lastWatched[0] : null;
  const restLessons = lastWatched.length > 1 ? lastWatched.slice(1) : [];

  const todayLessons: LastWatchedEntry[] = [];
  const yesterdayLessons: LastWatchedEntry[] = [];
  const earlierLessons: LastWatchedEntry[] = [];

  restLessons.forEach(lesson => {
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
    return lessons.map((entry, idx) => (
      <Link key={entry.chapterId + idx} to="/chapter/$id" params={{ id: entry.chapterId }} className="block mb-3 last:mb-0">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm transition hover:shadow-md">
          {entry.videoId ? (
            <div className="relative h-14 w-20 shrink-0 rounded-xl overflow-hidden bg-black/5">
              <img src={`https://img.youtube.com/vi/${entry.videoId}/mqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-medium px-1 py-0.5 rounded-sm">
                12:30
              </div>
            </div>
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground leading-tight">{entry.chapterTitle}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 font-medium">
              <BookOpen className="h-3 w-3" />
              <span className="truncate">{entry.subjectTitle}</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" />
              {new Date(entry.watchedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 pr-1">
            <CircularProgress progress={idx % 2 === 0 ? 100 : 45} isCompleted={idx % 2 === 0} />
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </div>
        </div>
      </Link>
    ));
  };

  return (
    <MobileFrame>
      <header className="flex justify-between items-center px-5 pt-4 pb-2 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.history.back()} className="grid h-9 w-9 place-items-center rounded-full active:bg-muted shrink-0 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-[19px] font-bold text-foreground tracking-tight">Continue Learning</h1>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full bg-primary/5 active:bg-primary/10 shrink-0 text-primary">
          <Search className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-background">
        {isLoading ? (
           <div className="px-5 py-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl animate-pulse" />
            ))}
           </div>
        ) : lastWatched.length === 0 ? (
          <div className="px-5 py-16 flex flex-col items-center justify-center">
            <div className="rounded-full bg-primary/10 p-5 mb-4 text-primary">
              <BookOpen className="h-10 w-10" />
            </div>
            <h2 className="text-lg font-bold text-foreground">No recent activity</h2>
            <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">Start watching a chapter to track your progress here.</p>
          </div>
        ) : (
          <>
            <div className="px-5 pt-3 pb-5 relative overflow-hidden">
              <div className="relative z-10 w-2/3">
                <h2 className="text-[20px] font-extrabold text-foreground leading-tight">
                  Keep learning, keep growing! 🚀
                </h2>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                  {lastWatched.length} lessons in progress
                </p>
              </div>
              <img
                src={wisbyReading}
                alt="Wisby reading a book"
                className="pointer-events-none absolute -right-5 -top-4 h-34 w-38 object-cover object-center mix-blend-multiply"
              />
            </div>

            <div className="px-5 pb-6 space-y-7">
              {topLesson && (
                <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-primary/5 to-transparent"></div>
                  
                  <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] bg-primary/10 w-max px-2.5 py-1 rounded-full mb-3 relative z-10">
                    <Flame className="w-3.5 h-3.5 text-orange-500" fill="currentColor" /> Continue Last Lesson
                  </div>
                  
                  <div className="flex items-start gap-3 relative z-10">
                    {topLesson.videoId ? (
                      <div className="relative h-20 w-28 shrink-0 rounded-2xl overflow-hidden shadow-sm group cursor-pointer" onClick={() => router.navigate({ to: '/chapter/$id', params: { id: topLesson.chapterId } })}>
                        <img src={`https://img.youtube.com/vi/${topLesson.videoId}/mqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
                          16:30
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 bg-white text-black p-1 rounded-full shadow-sm">
                           <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                      </div>
                    ) : (
                       <div className="grid h-20 w-28 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary font-bold">
                         <BookOpen className="w-7 h-7" />
                       </div>
                    )}
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-[15px] font-bold text-foreground leading-tight truncate">{topLesson.chapterTitle}</h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate font-medium">{topLesson.subjectTitle}</p>
                      
                      <div className="mt-3">
                        <div className="flex justify-between items-end mb-1">
                           <span className="text-[10px] text-muted-foreground w-full"></span>
                           <span className="text-[11px] font-bold text-primary">78%</span>
                        </div>
                        <Progress value={78} className="h-1.5 bg-primary/10 [&>div]:bg-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between relative z-10 pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      12 min left
                    </div>
                    
                    <Link to="/chapter/$id" params={{ id: topLesson.chapterId }}>
                      <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-5 py-2 rounded-full shadow flex items-center gap-1.5 transition active:scale-95">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        Resume
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {lastWatched.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-[17px] font-bold text-foreground mb-4">In Progress</h3>
                  
                    <div className="relative pl-0 space-y-6">
                    
                    {todayLessons.length > 0 && (
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-primary rounded-full" />
                          <h4 className="text-primary font-bold text-xs">Today</h4>
                        </div>
                        <div>
                          {renderLessonList(todayLessons)}
                        </div>
                      </div>
                    )}
                    
                    {yesterdayLessons.length > 0 && (
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-[#8b5cf6] rounded-full" />
                          <h4 className="text-[#8b5cf6] font-bold text-xs">Yesterday</h4>
                        </div>
                        <div>
                          {renderLessonList(yesterdayLessons)}
                        </div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-muted-foreground/40 rounded-full" />
                        <h4 className="text-muted-foreground font-bold text-xs">Earlier</h4>
                      </div>
                      <div>
                        {earlierLessons.length > 0 ? renderLessonList(earlierLessons) : (
                          <p className="rounded-2xl border border-dashed border-border px-4 py-3 text-xs font-medium text-muted-foreground">
                            No earlier lessons yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative mt-6 min-h-[84px] overflow-hidden rounded-2xl border border-[#E2E0FF] bg-[linear-gradient(105deg,#F0F2FF_0%,#F7F5FF_62%,#EFECFF_100%)] py-4 pl-[7.5rem] pr-5">
                <img
                  src={wisbyThumbs}
                  alt="Wisby giving a thumbs up"
                  className="pointer-events-none absolute -bottom-6 left-1 h-28 w-28 object-contain"
                />
                <Sparkles className="pointer-events-none absolute right-5 top-3 h-3 w-3 text-[#D6D0FF]" />
                <Sparkles className="pointer-events-none absolute bottom-3 right-10 h-2.5 w-2.5 text-[#D6D0FF]" />
                <div className="relative z-10">
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    You're doing amazing! <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    You're only <span className="font-semibold text-foreground">3 lessons</span> away from finishing your <span className="text-primary font-medium">Web Development course</span>.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stats Row */}
      <div className="border-t border-border/50 bg-card px-5 py-3 shrink-0 flex items-center justify-between z-10 relative shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 w-1/3">
          <div className="w-9 h-9 rounded-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground leading-none">6</div>
            <div className="text-[9px] text-muted-foreground font-medium uppercase mt-0.5">In Progress</div>
          </div>
        </div>
        
        <div className="w-px h-7 bg-border/60"></div>
        
        <div className="flex items-center gap-2 w-1/3 justify-center">
          <div className="w-9 h-9 rounded-[10px] bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground leading-none">12</div>
            <div className="text-[9px] text-muted-foreground font-medium uppercase mt-0.5">Completed</div>
          </div>
        </div>
        
        <div className="w-px h-7 bg-border/60"></div>
        
        <div className="flex items-center gap-2 w-1/3 justify-end">
          <div className="w-9 h-9 rounded-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground leading-none">4</div>
            <div className="text-[9px] text-muted-foreground font-medium uppercase mt-0.5">Bookmarked</div>
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileFrame>
  );
}
