/**
 * useContentSession — silently manages the XP session in the background.
 *
 * NO visible UI. The hook:
 *  1. Creates a content session on mount
 *  2. Tracks elapsed time internally (NOT shown to user)
 *  3. When elapsed >= minTime, automatically calls claimContentXP() ONCE
 *  4. Returns only the result so the parent can show XP animation
 *
 * The Firebase Cloud Function is the real authority — the frontend timer
 * only determines WHEN to attempt the claim, not whether XP is awarded.
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

export function useContentSession({
  uid,
  contentId,
  contentType,
  xpReward,
  minReadTimeSeconds,
  onXpClaimed,
}: Options): Return {
  const defaults = getContentDefaults(contentType);
  const resolvedMinTime = minReadTimeSeconds ?? defaults.min_read_time_seconds;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<ClaimXpResult | null>(null);

  // Guards — prevent double-claim within same session
  const isClaimTriggered = useRef(false);
  const isMounted = useRef(true);

  // Init: check duplicate, then create session
  useEffect(() => {
    if (!uid || !contentId) return;
    isMounted.current = true;

    const init = async () => {
      try {
        console.log(`[XP System] Initializing session for content (${contentType}):`, contentId, "Required time:", resolvedMinTime, "s");
        const alreadyDone = await isContentCompleted(uid, contentId);
        if (!isMounted.current) return;
        if (alreadyDone) {
          console.log("[XP System] Content already completed previously by user:", contentId);
          isClaimTriggered.current = true;
          return;
        }
        const sid = await createContentSession(uid, contentId, contentType);
        if (isMounted.current) {
          console.log("[XP System] Active content session created:", sid);
          setSessionId(sid);
        }
      } catch (err) {
        console.error("[useContentSession] init error:", err);
      }
    };

    init();

    return () => {
      isMounted.current = false;
    };
  }, [uid, contentId, contentType, resolvedMinTime]);

  // Claim function — called internally, never exposed as a button
  const triggerClaim = useCallback(
    async (sid: string) => {
      if (isClaimTriggered.current) return;
      isClaimTriggered.current = true; // Set BEFORE request to prevent race
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
    [contentId, uid, onXpClaimed]
  );

  // Timer — runs silently in background, triggers claim automatically
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
