/**
 * useContentSession — silently manages the XP session in the background.
 *
 * NO visible UI. The hook:
 *  1. Checks if content already completed — if so, does nothing
 *  2. Creates/reuses exactly ONE deterministic session per user+content
 *  3. Tracks elapsed time internally (NOT shown to user)
 *  4. When elapsed >= minTime, automatically calls claimContentXP() ONCE
 *  5. Returns only the result so the parent can show XP animation
 *
 * React StrictMode double-invoke protection:
 *  - Module-level guard prevents concurrent init for same uid+contentId
 *  - createContentSession uses deterministic doc ID (setDoc, not addDoc)
 *  - isMounted ref prevents stale async callbacks from acting after unmount
 *  - isClaimTriggered ref prevents double-claim within same session
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  createContentSession,
  claimContentXP,
  isContentCompleted,
  getContentDefaults,
  type ClaimXpResult,
} from "@/lib/xp";

type Options = {
  uid: string | null | undefined;
  contentId: string;
  contentType: string;
  xpReward?: number;
  minReadTimeSeconds?: number;
  onXpClaimed?: (result: ClaimXpResult) => void;
};

type Return = {
  claimResult: ClaimXpResult | null;
};

// ─── Module-level init guard ──────────────────────────────────────────────────
// Prevents React StrictMode double-invoke (mount → unmount → remount) from
// triggering two concurrent init() calls for the same user+content.
const _initInProgress = new Set<string>();

export function useContentSession({
  uid,
  contentId,
  contentType,
  minReadTimeSeconds,
  onXpClaimed,
}: Options): Return {
  const defaults = getContentDefaults(contentType);
  const resolvedMinTime = minReadTimeSeconds ?? defaults.min_read_time_seconds;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<ClaimXpResult | null>(null);

  // Prevent double-claim within same session lifetime
  const isClaimTriggered = useRef(false);
  // Prevent stale async callbacks from acting after unmount
  const isMounted = useRef(false);

  // ── Init: check completion → create/reuse session ──────────────────────────
  useEffect(() => {
    if (!uid || !contentId) return;

    isMounted.current = true;
    const guardKey = `${uid}_${contentId}`;

    // Module-level guard: if this exact key is already initializing, skip
    if (_initInProgress.has(guardKey)) {
      console.log("[XP System] Init already in progress, skipping duplicate:", guardKey);
      return;
    }

    _initInProgress.add(guardKey);

    const init = async () => {
      try {
        console.log(
          `[XP System] Initializing session for content (${contentType}):`,
          contentId,
          "Required time:", resolvedMinTime, "s"
        );

        // Check if user already completed this content
        const alreadyDone = await isContentCompleted(uid, contentId);
        if (!isMounted.current) return;

        if (alreadyDone) {
          console.log("[XP System] Content already completed, no session needed:", contentId);
          isClaimTriggered.current = true; // block timer
          return;
        }

        // createContentSession is idempotent — deterministic doc ID per uid+contentId
        const sid = await createContentSession(uid, contentId, contentType);
        if (!isMounted.current) return;

        setSessionId(sid);
      } catch (err) {
        console.error("[useContentSession] init error:", err);
      } finally {
        _initInProgress.delete(guardKey);
      }
    };

    init();

    return () => {
      isMounted.current = false;
      // Note: do NOT delete from _initInProgress here — the async init() may still
      // be running and needs to complete so the session is properly created/reused.
      // The finally block in init() handles cleanup.
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, contentId]);
  // Intentionally omit contentType/resolvedMinTime — session is keyed by uid+contentId only.
  // contentType is used only during initial creation; changing it mid-view is not a use case.

  // ── Claim — called internally, never exposed as a button ───────────────────
  const triggerClaim = useCallback(
    async (sid: string) => {
      if (isClaimTriggered.current) return;
      isClaimTriggered.current = true; // set BEFORE async call to prevent race
      console.log("[XP System] Required view time reached! Claiming XP for content:", contentId);

      try {
        const result = await claimContentXP(sid, contentId);
        console.log("[XP System] Claim result:", result);
        if (!isMounted.current) return;
        setClaimResult(result);
        if (result.success) onXpClaimed?.(result);
      } catch (err) {
        console.error("[useContentSession] claim error:", err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contentId]
    // onXpClaimed intentionally omitted — it's a callback prop that may change
    // between renders; including it would reset the timer on every render.
  );

  // ── Timer — runs silently after session established ─────────────────────────
  useEffect(() => {
    if (!sessionId || isClaimTriggered.current) return;

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      if (elapsed % 15 === 0) {
        console.log(`[XP System] Viewing progress: ${elapsed}/${resolvedMinTime}s`);
      }
      if (elapsed >= resolvedMinTime) {
        clearInterval(interval);
        triggerClaim(sessionId);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, resolvedMinTime, triggerClaim]);

  return { claimResult };
}
