import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getLastWatched } from "@/lib/admin";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — WisDawn" }] }),
});

function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: lastWatched = [], isLoading } = useQuery({
    queryKey: ["lastWatchedFull", user?.uid],
    queryFn: () => (user ? getLastWatched(user.uid, 10) : Promise.resolve([])),
    enabled: !!user,
  });

  return (
    <MobileFrame>
      <header className="flex items-center gap-3 px-5 pt-4 pb-2 border-b border-border bg-card">
        <button onClick={() => router.history.back()} className="grid h-9 w-9 place-items-center rounded-full active:bg-muted shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">Continue Learning</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl animate-pulse" />
            ))
          ) : lastWatched.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">No recent activity.</p>
              <p className="text-xs text-muted-foreground mt-1">Start watching a chapter to track your progress here.</p>
            </div>
          ) : (
            lastWatched.map((entry) => (
              <Link key={entry.chapterId} to="/chapter/$id" params={{ id: entry.chapterId }} className="block">
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-sm">
                  {entry.videoId ? (
                    <div className="relative h-14 w-24 shrink-0 rounded-xl overflow-hidden bg-black/5">
                      <img src={`https://img.youtube.com/vi/${entry.videoId}/mqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary font-bold text-2xl">
                      📖
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-foreground">{entry.chapterTitle}</p>
                    <p className="truncate text-sm text-muted-foreground mt-0.5">{entry.subjectTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(entry.watchedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
