/**
 * SilentContentXp — invisible background component.
 *
 * Renders NOTHING to the screen.
 * Manages the content session and timer entirely in the background.
 * When the Cloud Function confirms XP is awarded, shows the XP animation.
 * When new badges are unlocked, shows the badge unlock animation.
 */

import { useState } from "react";
import { useContentSession } from "@/hooks/use-content-session";
import { useInvalidateXP } from "@/hooks/use-xp";
import { XpGainAnimation } from "./XpGainAnimation";
import { BadgeUnlockQueue } from "./BadgeUnlock";
import type { ClaimXpResult } from "@/lib/xp";

type Props = {
  uid: string | null | undefined;
  contentId: string;
  contentType: string;
  xpReward?: number;
  minReadTimeSeconds?: number;
};

export function SilentContentXp({
  uid,
  contentId,
  contentType,
  xpReward,
  minReadTimeSeconds,
}: Props) {
  const invalidateXP = useInvalidateXP();
  const [showAnim, setShowAnim] = useState(false);
  const [animXP, setAnimXP] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const handleClaimed = (result: ClaimXpResult) => {
    if (result.success && result.xp_earned > 0) {
      setAnimXP(result.xp_earned);
      setShowAnim(true);
    }
    if (result.new_badges && result.new_badges.length > 0) {
      setNewBadges(result.new_badges);
    }
    if (uid) invalidateXP(uid);
  };

  // All logic runs invisibly — no UI returned from this hook
  useContentSession({
    uid,
    contentId,
    contentType,
    xpReward,
    minReadTimeSeconds,
    onXpClaimed: handleClaimed,
  });

  // Render ONLY the animations (they use fixed/absolute positioning, not inline)
  return (
    <>
      <XpGainAnimation
        xpEarned={animXP}
        show={showAnim}
        onComplete={() => setShowAnim(false)}
      />
      {newBadges.length > 0 && (
        <BadgeUnlockQueue
          badgeIds={newBadges}
          onAllComplete={() => setNewBadges([])}
        />
      )}
    </>
  );
}

// Keep the old name as an alias so the existing import in chapter.$id.tsx keeps working
export { SilentContentXp as ContentXpTimer };
