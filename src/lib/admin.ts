import { ref, set, get, push, remove, update } from "firebase/database";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Subject = {
  id: string;
  title: string;
  class: string;
  track: "school" | "coding";
  icon?: string;
  color?: string;
  order?: number;
};

export type Chapter = {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  videoId?: string;
  startTime?: number;
  duration?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  whatYouLearn?: string[];
  resourcesNote?: string;
  chapterId?: number;    // numeric group ID: 1, 2, 3... (same chapterId = same chapter group)
  videoOrder?: number;   // order within the chapter group: 1, 2, 3...
  order?: number;        // global order for sorting
  published?: boolean;
};

export type LessonType = "video" | "pdf" | "quiz" | "assignment" | "article" | "external_link";

export type Lesson = {
  id: string;
  chapterId: string;
  title: string;
  lessonType: LessonType;
  // Video-specific
  youtubeVideoId?: string;
  youtubeUrl?: string;
  durationSeconds?: number;
  durationDisplay?: string;   // e.g. "12:34"
  startTimeSeconds?: number;
  // Content
  description?: string;
  whatYouLearn?: string[];
  resourcesNote?: string;
  // Meta
  order: number;
  isFreePreview?: boolean;
  published?: boolean;
  createdAt?: number;
  updatedAt?: number;
};

export type Resource = {
  id: string;
  chapterId: string;
  title: string;
  type: "pdf" | "video" | "test" | "link";
  size?: string;
  url?: string;
  order?: number;
};

export type QAItem = {
  id: string;
  chapterId: string;
  question: string;
  answer: string;
  askedBy?: string;
  answeredBy?: string;
  createdAt?: number;
};

export type Discussion = {
  id: string;
  chapterId: string;
  message: string;
  authorName: string;
  authorUid: string;
  createdAt?: number;
};

// Navigation helpers
export type LessonNavContext = {
  lesson: Lesson;
  chapter: Chapter;
  lessonIndex: number;       // 0-based within chapter
  totalLessonsInChapter: number;
  nextLesson: Lesson | null;
  nextLessonChapter: Chapter | null;  // if next lesson is in next chapter
  prevLesson: Lesson | null;
  prevLessonChapter: Chapter | null;
  isLastLessonOfSubject: boolean;
};

// ─── Subjects ─────────────────────────────────────────────────────────────────

export async function getSubjects(): Promise<Subject[]> {
  const snap = await get(ref(db, "subjects"));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, val]) => ({ id, ...(val as Omit<Subject, "id">) }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function saveSubject(subject: Omit<Subject, "id"> & { id?: string }): Promise<string> {
  if (subject.id) {
    await set(ref(db, `subjects/${subject.id}`), subject);
    return subject.id;
  }
  const newRef = push(ref(db, "subjects"));
  await set(newRef, { ...subject, id: newRef.key });
  return newRef.key!;
}

export async function deleteSubject(id: string): Promise<void> {
  await remove(ref(db, `subjects/${id}`));
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

export async function getChaptersBySubject(subjectId: string): Promise<Chapter[]> {
  const snap = await get(ref(db, "chapters"));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, val]) => ({ id, ...(val as Omit<Chapter, "id">) }))
    .filter((c) => c.subjectId === subjectId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getChapter(chapterId: string): Promise<Chapter | null> {
  const snap = await get(ref(db, `chapters/${chapterId}`));
  if (!snap.exists()) return null;
  return { id: chapterId, ...snap.val() };
}

// Get all chapters in the same chapterId group within a subject
export async function getChaptersByGroupId(subjectId: string, chapterGroupId: number): Promise<Chapter[]> {
  const all = await getChaptersBySubject(subjectId);
  return all
    .filter((c) => c.chapterId === chapterGroupId)
    .sort((a, b) => (a.videoOrder ?? a.order ?? 0) - (b.videoOrder ?? b.order ?? 0));
}

export async function saveChapter(chapter: Omit<Chapter, "id"> & { id?: string }): Promise<string> {
  if (chapter.id) {
    await set(ref(db, `chapters/${chapter.id}`), chapter);
    return chapter.id;
  }
  const newRef = push(ref(db, "chapters"));
  const id = newRef.key!;
  await set(newRef, { ...chapter, id });
  return id;
}

export async function deleteChapter(id: string): Promise<void> {
  await remove(ref(db, `chapters/${id}`));
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export async function getLessonsByChapter(chapterId: string): Promise<Lesson[]> {
  const snap = await get(ref(db, `lessons/${chapterId}`));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, val]) => ({ id, ...(val as Omit<Lesson, "id">) }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getLesson(chapterId: string, lessonId: string): Promise<Lesson | null> {
  const snap = await get(ref(db, `lessons/${chapterId}/${lessonId}`));
  if (!snap.exists()) return null;
  return { id: lessonId, ...(snap.val() as Omit<Lesson, "id">) };
}

export async function saveLesson(lesson: Omit<Lesson, "id"> & { id?: string }): Promise<string> {
  const path = `lessons/${lesson.chapterId}`;
  const now = Date.now();
  if (lesson.id) {
    await set(ref(db, `${path}/${lesson.id}`), { ...lesson, updatedAt: now });
    return lesson.id;
  }
  const newRef = push(ref(db, path));
  const id = newRef.key!;
  await set(newRef, { ...lesson, id, createdAt: now, updatedAt: now });
  return id;
}

export async function deleteLesson(chapterId: string, lessonId: string): Promise<void> {
  await remove(ref(db, `lessons/${chapterId}/${lessonId}`));
}

export async function reorderLessons(chapterId: string, orderedIds: string[]): Promise<void> {
  const updates: Record<string, number> = {};
  orderedIds.forEach((id, idx) => {
    updates[`lessons/${chapterId}/${id}/order`] = idx;
  });
  await update(ref(db), updates);
}

// ─── Navigation: build lesson nav context ─────────────────────────────────────

export async function getLessonNavContext(
  chapterId: string,
  lessonId: string
): Promise<LessonNavContext | null> {
  const chapter = await getChapter(chapterId);
  if (!chapter) return null;

  // Get all published lessons in this chapter
  const chapterLessons = (await getLessonsByChapter(chapterId)).filter((l) => l.published);
  const lessonIndex = chapterLessons.findIndex((l) => l.id === lessonId);
  const lesson = chapterLessons[lessonIndex];
  if (!lesson) return null;

  const isLastInChapter = lessonIndex === chapterLessons.length - 1;
  const isFirstInChapter = lessonIndex === 0;

  // Next lesson within chapter
  let nextLesson: Lesson | null = chapterLessons[lessonIndex + 1] ?? null;
  let nextLessonChapter: Chapter | null = null;

  // If last lesson in chapter → find first lesson of next chapter
  if (!nextLesson && isLastInChapter && chapter.subjectId) {
    const allChapters = (await getChaptersBySubject(chapter.subjectId)).filter((c) => c.published);
    const chapterIdx = allChapters.findIndex((c) => c.id === chapterId);
    if (chapterIdx >= 0 && chapterIdx < allChapters.length - 1) {
      const nextChapter = allChapters[chapterIdx + 1];
      const nextChapterLessons = (await getLessonsByChapter(nextChapter.id)).filter((l) => l.published);
      if (nextChapterLessons.length > 0) {
        nextLesson = nextChapterLessons[0];
        nextLessonChapter = nextChapter;
      }
    }
  }

  // Prev lesson within chapter
  let prevLesson: Lesson | null = chapterLessons[lessonIndex - 1] ?? null;
  let prevLessonChapter: Chapter | null = null;

  // If first lesson in chapter → find last lesson of prev chapter
  if (!prevLesson && isFirstInChapter && chapter.subjectId) {
    const allChapters = (await getChaptersBySubject(chapter.subjectId)).filter((c) => c.published);
    const chapterIdx = allChapters.findIndex((c) => c.id === chapterId);
    if (chapterIdx > 0) {
      const prevChapter = allChapters[chapterIdx - 1];
      const prevChapterLessons = (await getLessonsByChapter(prevChapter.id)).filter((l) => l.published);
      if (prevChapterLessons.length > 0) {
        prevLesson = prevChapterLessons[prevChapterLessons.length - 1];
        prevLessonChapter = prevChapter;
      }
    }
  }

  // Is this the absolute last lesson in the subject?
  let isLastLessonOfSubject = false;
  if (!nextLesson && chapter.subjectId) {
    const allChapters = (await getChaptersBySubject(chapter.subjectId)).filter((c) => c.published);
    const chapterIdx = allChapters.findIndex((c) => c.id === chapterId);
    isLastLessonOfSubject = chapterIdx === allChapters.length - 1 && isLastInChapter;
  }

  return {
    lesson,
    chapter,
    lessonIndex,
    totalLessonsInChapter: chapterLessons.length,
    nextLesson,
    nextLessonChapter,
    prevLesson,
    prevLessonChapter,
    isLastLessonOfSubject,
  };
}

// ─── Migration: convert legacy chapter video → Lesson 1 ───────────────────────

export async function migrateLegacyChapterToLesson(chapterId: string): Promise<boolean> {
  const chapter = await getChapter(chapterId);
  if (!chapter) return false;

  // Skip if no legacy video data
  if (!chapter.videoId && !chapter.duration) return false;

  // Check if already migrated (lessons exist)
  const existing = await getLessonsByChapter(chapterId);
  if (existing.length > 0) return false;

  // Create Lesson 1 from legacy chapter data
  await saveLesson({
    chapterId,
    title: chapter.title,
    lessonType: "video",
    youtubeVideoId: chapter.videoId ?? "",
    youtubeUrl: chapter.videoId ? `https://youtube.com/watch?v=${chapter.videoId}` : "",
    durationDisplay: chapter.duration ?? "",
    startTimeSeconds: chapter.startTime ?? 0,
    description: chapter.description ?? "",
    whatYouLearn: chapter.whatYouLearn ?? [],
    resourcesNote: chapter.resourcesNote ?? "",
    order: 0,
    published: chapter.published ?? false,
    isFreePreview: false,
  });

  return true;
}

// ─── Resources ────────────────────────────────────────────────────────────────

export async function getResources(chapterId: string): Promise<Resource[]> {
  const snap = await get(ref(db, `resources/${chapterId}`));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, val]) => ({ id, ...(val as Omit<Resource, "id">) }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function saveResource(resource: Omit<Resource, "id"> & { id?: string }): Promise<string> {
  const path = `resources/${resource.chapterId}`;
  if (resource.id) {
    await set(ref(db, `${path}/${resource.id}`), resource);
    return resource.id;
  }
  const newRef = push(ref(db, path));
  const id = newRef.key!;
  await set(newRef, { ...resource, id });
  return id;
}

export async function deleteResource(chapterId: string, resourceId: string): Promise<void> {
  await remove(ref(db, `resources/${chapterId}/${resourceId}`));
}

// ─── Q&A ──────────────────────────────────────────────────────────────────────

export async function getQA(chapterId: string): Promise<QAItem[]> {
  const snap = await get(ref(db, `qa/${chapterId}`));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, val]) => ({ id, ...(val as Omit<QAItem, "id">) }))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function addQA(chapterId: string, question: string, authorUid: string): Promise<string> {
  const newRef = push(ref(db, `qa/${chapterId}`));
  const id = newRef.key!;
  await set(newRef, { id, chapterId, question, answer: "", askedBy: authorUid, createdAt: Date.now() });
  return id;
}

export async function answerQA(chapterId: string, qaId: string, answer: string): Promise<void> {
  await update(ref(db, `qa/${chapterId}/${qaId}`), { answer, answeredBy: "admin" });
}

export async function deleteQA(chapterId: string, qaId: string): Promise<void> {
  await remove(ref(db, `qa/${chapterId}/${qaId}`));
}

// ─── Discussions ──────────────────────────────────────────────────────────────

export async function getDiscussions(chapterId: string): Promise<Discussion[]> {
  const snap = await get(ref(db, `discussions/${chapterId}`));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, val]) => ({ id, ...(val as Omit<Discussion, "id">) }))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function addDiscussion(
  chapterId: string, message: string, authorName: string, authorUid: string
): Promise<string> {
  const newRef = push(ref(db, `discussions/${chapterId}`));
  const id = newRef.key!;
  await set(newRef, { id, chapterId, message, authorName, authorUid, createdAt: Date.now() });
  return id;
}

export async function deleteDiscussion(chapterId: string, discussionId: string): Promise<void> {
  await remove(ref(db, `discussions/${chapterId}/${discussionId}`));
}

// ─── Admin auth ───────────────────────────────────────────────────────────────

export async function isAdmin(uid: string): Promise<boolean> {
  const snap = await get(ref(db, `admins/${uid}`));
  return snap.exists() && snap.val() === true;
}

export async function setAdmin(uid: string, value: boolean): Promise<void> {
  await set(ref(db, `admins/${uid}`), value);
}

// ─── User profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}
