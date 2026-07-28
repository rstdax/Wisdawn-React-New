import { getChaptersBySubject } from "@/lib/admin";

export async function getCourseIntroChapterId(subjectId: string): Promise<string | null> {
  const chapters = (await getChaptersBySubject(subjectId)).filter((chapter) => chapter.published);
  return chapters[0]?.id ?? null;
}
