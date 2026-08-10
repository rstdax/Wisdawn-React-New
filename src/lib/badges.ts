/**
 * Badge master data — 22 badges as per specification.
 * Actual badge awarding happens server-side in Cloud Functions.
 * This file provides the UI with badge metadata for display.
 */

export type BadgeDefinition = {
  id: string;
  title: string;
  category: "xp" | "pdf_material" | "video" | "test" | "subject_mastery" | "consistency";
  description: string;
  icon: string; // emoji
  xp_bonus: number;
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ── Category A: XP Milestones ──────────────────────────────────────────
  {
    id: "novice_explorer",
    title: "Novice Explorer",
    category: "xp",
    description: "Earn your first 100 XP",
    icon: "🌱",
    xp_bonus: 0,
  },
  {
    id: "rising_scholar",
    title: "Rising Scholar",
    category: "xp",
    description: "Reach 1,000 XP",
    icon: "📚",
    xp_bonus: 25,
  },
  {
    id: "knowledge_seeker",
    title: "Knowledge Seeker",
    category: "xp",
    description: "Reach 2,500 XP",
    icon: "🔭",
    xp_bonus: 50,
  },
  {
    id: "master_mind",
    title: "Master Mind",
    category: "xp",
    description: "Reach 5,000 XP",
    icon: "🧠",
    xp_bonus: 100,
  },
  {
    id: "state_legend",
    title: "State Legend",
    category: "xp",
    description: "Reach 10,000 XP",
    icon: "👑",
    xp_bonus: 200,
  },

  // ── Category B: PDF / Material ─────────────────────────────────────────
  {
    id: "first_page_turned",
    title: "First Page Turned",
    category: "pdf_material",
    description: "Complete your first PDF or Material",
    icon: "📄",
    xp_bonus: 10,
  },
  {
    id: "avid_reader",
    title: "Avid Reader",
    category: "pdf_material",
    description: "Complete 10 PDF or Material items",
    icon: "📖",
    xp_bonus: 25,
  },
  {
    id: "library_worm",
    title: "Library Worm",
    category: "pdf_material",
    description: "Complete 50 PDF or Material items",
    icon: "🐛",
    xp_bonus: 75,
  },
  {
    id: "deep_focus",
    title: "Deep Focus",
    category: "pdf_material",
    description: "Complete 5 PDFs or Materials with min read time ≥ 300 seconds",
    icon: "🎯",
    xp_bonus: 30,
  },

  // ── Category C: Video ──────────────────────────────────────────────────
  {
    id: "first_frame",
    title: "First Frame",
    category: "video",
    description: "Complete your first video",
    icon: "🎬",
    xp_bonus: 10,
  },
  {
    id: "binge_learner",
    title: "Binge Learner",
    category: "video",
    description: "Complete 10 videos",
    icon: "📺",
    xp_bonus: 25,
  },
  {
    id: "visual_master",
    title: "Visual Master",
    category: "video",
    description: "Complete 30 videos",
    icon: "🎥",
    xp_bonus: 75,
  },

  // ── Category D: Tests ──────────────────────────────────────────────────
  {
    id: "test_taker",
    title: "Test Taker",
    category: "test",
    description: "Complete your first practice test",
    icon: "✏️",
    xp_bonus: 15,
  },
  {
    id: "bullseye",
    title: "Bullseye",
    category: "test",
    description: "Score 100% on any practice test",
    icon: "🎯",
    xp_bonus: 50,
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    category: "test",
    description: "Score > 90% AND complete in less than half the allowed time",
    icon: "⚡",
    xp_bonus: 40,
  },
  {
    id: "test_titan",
    title: "Test Titan",
    category: "test",
    description: "Complete 15 tests AND average score > 80%",
    icon: "🏆",
    xp_bonus: 100,
  },

  // ── Category E: Subject / Category Mastery ─────────────────────────────
  {
    id: "chemistry_catalyst",
    title: "Chemistry Catalyst",
    category: "subject_mastery",
    description: "Complete all required materials and tests in Class 10 Chemistry",
    icon: "⚗️",
    xp_bonus: 150,
  },
  {
    id: "code_cadet",
    title: "Code Cadet",
    category: "subject_mastery",
    description: "Complete 5 Coding tests",
    icon: "💻",
    xp_bonus: 50,
  },
  {
    id: "code_master",
    title: "Code Master",
    category: "subject_mastery",
    description: "Earn at least 2,000 XP from Coding activities",
    icon: "🚀",
    xp_bonus: 100,
  },

  // ── Category F: Consistency ────────────────────────────────────────────
  {
    id: "streak_starter",
    title: "Streak Starter",
    category: "consistency",
    description: "Study for 3 consecutive days",
    icon: "🔥",
    xp_bonus: 20,
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    category: "consistency",
    description: "Study for 7 consecutive days",
    icon: "⚡",
    xp_bonus: 50,
  },
  {
    id: "night_owl",
    title: "Night Owl",
    category: "consistency",
    description: "Complete a lesson or test between 10:00 PM and 4:00 AM (IST)",
    icon: "🦉",
    xp_bonus: 15,
  },
];

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === id);
}

export function getBadgesByIds(ids: string[]): BadgeDefinition[] {
  return ids.map((id) => getBadgeById(id)).filter(Boolean) as BadgeDefinition[];
}
