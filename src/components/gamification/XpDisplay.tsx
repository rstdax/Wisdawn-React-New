/**
 * XpDisplay — shows current XP from live React Query data.
 * Drop-in replacement for the existing profile.stats.xp display.
 */

import { useXP } from "@/hooks/use-xp";

type Props = {
  uid: string | null | undefined;
  fallback?: number;
  className?: string;
};

export function XpDisplay({ uid, fallback = 0, className = "" }: Props) {
  const { data } = useXP(uid);
  const xp = data?.total_xp ?? fallback;
  return (
    <span className={className}>
      {xp.toLocaleString("en-IN")}
    </span>
  );
}
