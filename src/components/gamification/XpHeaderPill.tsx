/**
 * XpHeaderPill — the ⭐ XP pill shown in the app header on every page.
 * Reads from the live useXP query so it updates after XP is awarded.
 */
import { useAuth } from "@/hooks/use-auth";
import { useXP } from "@/hooks/use-xp";

export function XpHeaderPill() {
  const { user, profile } = useAuth();
  const { data: xpData } = useXP(user?.uid);

  // Prefer live XP data, fall back to profile.stats.xp while loading
  const xp = xpData?.total_xp ?? profile?.stats?.xp ?? 0;

  return (
    <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 shadow-sm">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm border border-yellow-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
          className="h-3.5 w-3.5 text-amber-700 opacity-90">
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="text-[15px] font-black text-slate-800">
        {xp.toLocaleString("en-IN")}
      </span>
    </div>
  );
}
