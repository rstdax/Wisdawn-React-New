/**
 * BadgeCard — displays a single badge (earned or locked).
 */

import type { BadgeDefinition } from "@/lib/badges";

type Props = {
  badge: BadgeDefinition;
  earned?: boolean;
};

export function BadgeCard({ badge, earned = false }: Props) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
        earned
          ? "border-purple-200 bg-gradient-to-b from-purple-50 to-indigo-50"
          : "border-slate-100 bg-slate-50 opacity-50 grayscale"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-3xl ${
          earned ? "bg-gradient-to-br from-purple-100 to-indigo-100 shadow-sm" : "bg-slate-100"
        }`}
      >
        {badge.icon}
      </div>
      <div>
        <p className="text-[13px] font-bold text-slate-900 leading-tight">{badge.title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{badge.description}</p>
        {badge.xp_bonus > 0 && earned && (
          <span className="mt-1.5 inline-block text-[10px] font-extrabold text-purple-600 bg-purple-100 rounded-full px-2 py-0.5">
            +{badge.xp_bonus} XP
          </span>
        )}
      </div>
    </div>
  );
}
