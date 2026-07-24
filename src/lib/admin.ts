import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, deleteDoc,
  query, where, orderBy, updateDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Subject = {
  id: string;
  title: string;
  class: string;
  track: "school" | "coding";
  icon?: string;
  coverImage?: string;
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
  chapterId?: number;
  videoOrder?: number;
  order?: number;
  published?: boolean;
};

export type LessonType = "video" | "pdf" | "quiz" | "assignment" | "article" | "external_link";

export type Lesson = {
  id: string;
  chapterId: string;
  title: string;
  lessonType: LessonType;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  durationSeconds?: number;
  durationDisplay?: string;
  startTimeSeconds?: number;
  description?: string;
  whatYouLearn?: string[];
  resourcesNote?: string;
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

export type LessonNavContext = {
  lesson: Lesson;
  chapter: Chapter;
  lessonIndex: number;
  nextLessonIndex: number | null;
  totalLessonsInChapter: number;
  nextLesson: Lesson | null;
  nextLessonChapter: Chapter | null;
  prevLesson: Lesson | null;
  prevLessonChapter: Chapter | null;
  isLastLessonOfSubject: boolean;
};

export type LastWatchedEntry = {
  chapterId: string;
  chapterTitle: string;
  subjectId: string;
  subjectTitle: string;
  watchedAt: number;
  videoId?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

const cache = new Map<string, { data: any; timestamp: number }>();

async function withCache<T>(key: string, fetcher: () => Promise<T>, ttlMs = 5 * 60 * 1000): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T;
  }
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

export function clearCache() {
  cache.clear();
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

export async function getSubjects(): Promise<Subject[]> {
  return withCache("subjects", async () => {
    const snap = await getDocs(query(collection(db, "subjects"), orderBy("order", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
  });
}

export async function getSubject(id: string): Promise<Subject | null> {
  return withCache(`subject_${id}`, async () => {
    const snap = await getDoc(doc(db, "subjects", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Subject;
  });
}

export async function saveSubject(subject: Omit<Subject, "id"> & { id?: string }): Promise<string> {
  clearCache();
  const data = stripUndefined(subject);
  if (subject.id) {
    await setDoc(doc(db, "subjects", subject.id), data, { merge: true });
    return subject.id;
  }
  const ref = await addDoc(collection(db, "subjects"), data);
  await setDoc(doc(db, "subjects", ref.id), { ...data, id: ref.id }, { merge: true });
  return ref.id;
}

export async function deleteSubject(id: string): Promise<void> {
  clearCache();
  await deleteDoc(doc(db, "subjects", id));
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

export async function getChaptersBySubject(subjectId: string): Promise<Chapter[]> {
  return withCache(`chapters_subj_${subjectId}`, async () => {
    const snap = await getDocs(
      query(collection(db, "chapters"), where("subjectId", "==", subjectId), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chapter));
  });
}

export async function getChapter(chapterId: string): Promise<Chapter | null> {
  return withCache(`chapter_${chapterId}`, async () => {
    const snap = await getDoc(doc(db, "chapters", chapterId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Chapter;
  });
}

export async function getChaptersByGroupId(subjectId: string, chapterGroupId: number): Promise<Chapter[]> {
  return withCache(`chapters_grp_${subjectId}_${chapterGroupId}`, async () => {
    const all = await getChaptersBySubject(subjectId);
    return all
      .filter((c) => c.chapterId === chapterGroupId)
      .sort((a, b) => (a.videoOrder ?? a.order ?? 0) - (b.videoOrder ?? b.order ?? 0));
  });
}

export async function saveChapter(chapter: Omit<Chapter, "id"> & { id?: string }): Promise<string> {
  clearCache();
  const data = stripUndefined(chapter);
  if (chapter.id) {
    await setDoc(doc(db, "chapters", chapter.id), data, { merge: true });
    return chapter.id;
  }
  const ref = await addDoc(collection(db, "chapters"), data);
  await setDoc(doc(db, "chapters", ref.id), { ...data, id: ref.id }, { merge: true });
  return ref.id;
}

export async function deleteChapter(id: string): Promise<void> {
  clearCache();
  await deleteDoc(doc(db, "chapters", id));
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export async function getLessonsByChapter(chapterId: string): Promise<Lesson[]> {
  return withCache(`lessons_chap_${chapterId}`, async () => {
    const snap = await getDocs(
      query(collection(db, "lessons"), where("chapterId", "==", chapterId), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
  });
}

export async function getLesson(chapterId: string, lessonId: string): Promise<Lesson | null> {
  return withCache(`lesson_${lessonId}`, async () => {
    const snap = await getDoc(doc(db, "lessons", lessonId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Lesson;
  });
}

export async function saveLesson(lesson: Omit<Lesson, "id"> & { id?: string }): Promise<string> {
  clearCache();
  const now = Date.now();
  const data = stripUndefined({ ...lesson, updatedAt: now });
  if (lesson.id) {
    await setDoc(doc(db, "lessons", lesson.id), data, { merge: true });
    return lesson.id;
  }
  const ref = await addDoc(collection(db, "lessons"), { ...data, createdAt: now });
  await setDoc(doc(db, "lessons", ref.id), { ...data, id: ref.id, createdAt: now }, { merge: true });
  return ref.id;
}

export async function deleteLesson(chapterId: string, lessonId: string): Promise<void> {
  clearCache();
  await deleteDoc(doc(db, "lessons", lessonId));
}

export async function reorderLessons(chapterId: string, orderedIds: string[]): Promise<void> {
  clearCache();
  await Promise.all(
    orderedIds.map((id, idx) => updateDoc(doc(db, "lessons", id), { order: idx }))
  );
}

// ─── Navigation: build lesson nav context ─────────────────────────────────────

export async function getLessonNavContext(
  chapterId: string,
  lessonId: string
): Promise<LessonNavContext | null> {
  const chapter = await getChapter(chapterId);
  if (!chapter) return null;

  const chapterLessons = (await getLessonsByChapter(chapterId)).filter((l) => l.published);
  const lessonIndex = chapterLessons.findIndex((l) => l.id === lessonId);
  const lesson = chapterLessons[lessonIndex];
  if (!lesson) return null;

  const isLastInChapter = lessonIndex === chapterLessons.length - 1;
  const isFirstInChapter = lessonIndex === 0;

  let nextLesson: Lesson | null = chapterLessons[lessonIndex + 1] ?? null;
  let nextLessonChapter: Chapter | null = null;

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

  let prevLesson: Lesson | null = chapterLessons[lessonIndex - 1] ?? null;
  let prevLessonChapter: Chapter | null = null;

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
    nextLessonIndex: nextLesson ? (nextLessonChapter ? 0 : lessonIndex + 1) : null,
    totalLessonsInChapter: chapterLessons.length,
    nextLesson,
    nextLessonChapter,
    prevLesson,
    prevLessonChapter,
    isLastLessonOfSubject,
  };
}

// ─── Migration: legacy chapter → Lesson 1 ─────────────────────────────────────

export async function migrateLegacyChapterToLesson(chapterId: string): Promise<boolean> {
  const chapter = await getChapter(chapterId);
  if (!chapter) return false;
  if (!chapter.videoId && !chapter.duration) return false;
  const existing = await getLessonsByChapter(chapterId);
  if (existing.length > 0) return false;

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
  return withCache(`resources_${chapterId}`, async () => {
    const snap = await getDocs(
      query(collection(db, "resources"), where("chapterId", "==", chapterId), orderBy("order", "asc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Resource));
  });
}

export async function saveResource(resource: Omit<Resource, "id"> & { id?: string }): Promise<string> {
  clearCache();
  const data = stripUndefined(resource);
  if (resource.id) {
    await setDoc(doc(db, "resources", resource.id), data, { merge: true });
    return resource.id;
  }
  const ref = await addDoc(collection(db, "resources"), data);
  await setDoc(doc(db, "resources", ref.id), { ...data, id: ref.id }, { merge: true });
  return ref.id;
}

export async function deleteResource(chapterId: string, resourceId: string): Promise<void> {
  clearCache();
  await deleteDoc(doc(db, "resources", resourceId));
}

// ─── Q&A ──────────────────────────────────────────────────────────────────────

export async function getQA(chapterId: string): Promise<QAItem[]> {
  const snap = await getDocs(
    query(collection(db, "qa"), where("chapterId", "==", chapterId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QAItem));
}

export async function addQA(chapterId: string, question: string, authorUid: string): Promise<string> {
  const ref = await addDoc(collection(db, "qa"), {
    chapterId, question, answer: "", askedBy: authorUid, createdAt: Date.now(),
  });
  await updateDoc(doc(db, "qa", ref.id), { id: ref.id });
  return ref.id;
}

export async function answerQA(chapterId: string, qaId: string, answer: string): Promise<void> {
  await updateDoc(doc(db, "qa", qaId), { answer, answeredBy: "admin" });
}

export async function deleteQA(chapterId: string, qaId: string): Promise<void> {
  await deleteDoc(doc(db, "qa", qaId));
}

// ─── Discussions ──────────────────────────────────────────────────────────────

export async function getDiscussions(chapterId: string): Promise<Discussion[]> {
  const snap = await getDocs(
    query(collection(db, "discussions"), where("chapterId", "==", chapterId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Discussion));
}

export async function addDiscussion(
  chapterId: string, message: string, authorName: string, authorUid: string
): Promise<string> {
  const ref = await addDoc(collection(db, "discussions"), {
    chapterId, message, authorName, authorUid, createdAt: Date.now(),
  });
  await updateDoc(doc(db, "discussions", ref.id), { id: ref.id });
  return ref.id;
}

export async function deleteDiscussion(chapterId: string, discussionId: string): Promise<void> {
  await deleteDoc(doc(db, "discussions", discussionId));
}

// ─── User Last Watched ────────────────────────────────────────────────────────

export async function saveLastWatched(
  uid: string,
  entry: Omit<LastWatchedEntry, "watchedAt">
): Promise<void> {
  await setDoc(
    doc(db, "userLastWatched", uid, "entries", entry.chapterId),
    { ...entry, watchedAt: Date.now() }
  );
}

export async function getLastWatched(uid: string, limit = 3): Promise<LastWatchedEntry[]> {
  const snap = await getDocs(
    query(
      collection(db, "userLastWatched", uid, "entries"),
      orderBy("watchedAt", "desc")
    )
  );
  return snap.docs.slice(0, limit).map((d) => d.data() as LastWatchedEntry);
}

// ─── User Progress ────────────────────────────────────────────────────────────

export async function markChapterWatched(uid: string, subjectId: string, chapterId: string): Promise<void> {
  await setDoc(
    doc(db, "userProgress", uid, subjectId, chapterId),
    { watched: true, watchedAt: Date.now() }
  );
}

export async function getSubjectProgress(
  uid: string,
  subjectId: string
): Promise<{ watched: string[]; total: number; percent: number }> {
  const [chapters, watchedSnap] = await Promise.all([
    getChaptersBySubject(subjectId),
    getDocs(collection(db, "userProgress", uid, subjectId)),
  ]);

  const publishedChapters = chapters.filter((c) => c.published);
  const total = publishedChapters.length;

  if (total === 0) return { watched: [], total, percent: 0 };

  const watched = watchedSnap.docs.map((d) => d.id);
  const percent = Math.round((watched.length / total) * 100);

  return { watched, total, percent };
}

// ─── Admin auth ───────────────────────────────────────────────────────────────

export async function isAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists() && snap.data()?.admin === true;
}

export async function setAdmin(uid: string, value: boolean): Promise<void> {
  await setDoc(doc(db, "admins", uid), { admin: value });
}

// ─── User profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}
