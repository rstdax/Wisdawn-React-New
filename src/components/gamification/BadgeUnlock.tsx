/**
 * BadgeUnlock — shows a badge unlock card overlay.
 * Only trigger after backend confirms badge was earned.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBadgeById } from "@/lib/badges";

type Props = {
  badgeId: string;
  show: boolean;
  onComplete?: () => void;
};

export function BadgeUnlock({ badgeId, show, onComplete }: Props) {
  const [visible, setVisible] = useState(false);
  const badge = getBadgeById(badgeId);

  useEffect(() => {
    if (show && badge) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, badge, onComplete]);

  if (!badge) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="badge-unlock"
          className="pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            className="relative z-10 w-[90vw] max-w-xs rounded-[28px] bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-center shadow-2xl border border-purple-400/30"
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            {/* Sparkle ring */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <motion.div
                className="h-16 w-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400/50 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                transition={{ repeat: 2, duration: 0.5 }}
              >
                <span className="text-4xl">{badge.icon}</span>
              </motion.div>
            </div>

            <div className="mt-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-purple-200 mb-2">
                Badge Unlocked!
              </p>
              <h3 className="text-2xl font-extrabold text-white">{badge.title}</h3>
              <p className="mt-2 text-sm font-medium text-purple-200">{badge.description}</p>
              {badge.xp_bonus > 0 && (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 px-4 py-1.5">
                  <span className="text-yellow-300 text-sm font-black">+{badge.xp_bonus} XP Bonus</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * BadgeUnlockQueue — shows multiple badge unlocks sequentially.
 */
type QueueProps = {
  badgeIds: string[];
  onAllComplete?: () => void;
};

export function BadgeUnlockQueue({ badgeIds, onAllComplete }: QueueProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (badgeIds.length === 0) return null;

  const currentBadge = badgeIds[currentIdx];
  const show = currentIdx < badgeIds.length;

  const handleComplete = () => {
    const next = currentIdx + 1;
    if (next >= badgeIds.length) {
      onAllComplete?.();
    } else {
      setCurrentIdx(next);
    }
  };

  return (
    <BadgeUnlock
      key={currentBadge}
      badgeId={currentBadge}
      show={show}
      onComplete={handleComplete}
    />
  );
}
