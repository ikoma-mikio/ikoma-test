import { Bot, Sparkles } from "lucide-react";
import type { Course, Goal } from "../lib/types";

type AiAdvisorPanelProps = {
  goal: Goal;
  courseMap: Map<string, Course>;
  nextCourses: Course[];
  missingPrerequisiteIds: Set<string>;
};

export function AiAdvisorPanel({ goal, courseMap, nextCourses, missingPrerequisiteIds }: AiAdvisorPanelProps) {
  const advice = goal.mockAdvice;
  const evidenceIds = new Set([...goal.keyCourses, ...advice.recommendedCourseIds]);
  const evidenceCourses = [...evidenceIds]
    .map((courseId) => courseMap.get(courseId))
    .filter((value): value is Course => Boolean(value));
  const missingCourses = [...missingPrerequisiteIds]
    .map((courseId) => courseMap.get(courseId))
    .filter((value): value is Course => Boolean(value));

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-slate-700" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-900">AI相談（根拠付き）</h2>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-md border border-sky-100 bg-sky-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-sky-950">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {advice.summary}
          </div>
          <p className="text-sm leading-6 text-slate-700">{advice.explanation}</p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">次に取りやすい授業</h3>
          <div className="flex flex-wrap gap-2">
            {nextCourses.slice(0, 4).map((course) => (
              <span key={course.id} className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                {course.name}
              </span>
            ))}
            {nextCourses.length === 0 ? (
              <span className="text-sm text-slate-500">目標ルート上の未取得授業は前提確認が必要です。</span>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">先に埋める授業</h3>
          <div className="flex flex-wrap gap-2">
            {missingCourses.map((course) => (
              <span key={course.id} className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {course.name}
              </span>
            ))}
            {missingCourses.length === 0 ? (
              <span className="text-sm text-slate-500">選択中の取得済み授業では大きな前提不足はありません。</span>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">根拠に使った授業</h3>
          <div className="flex flex-wrap gap-2">
            {evidenceCourses.map((course) => (
              <span key={course.id} className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700">
                {course.name}
              </span>
            ))}
          </div>
        </div>

        {advice.cautions.map((caution) => (
          <p key={caution} className="rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
            {caution}
          </p>
        ))}
      </div>
    </section>
  );
}
