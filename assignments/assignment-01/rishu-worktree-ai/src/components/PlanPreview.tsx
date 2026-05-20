import { CalendarDays } from "lucide-react";
import type { Course, Goal } from "../lib/types";

type PlanPreviewProps = {
  goal: Goal;
  courseMap: Map<string, Course>;
  completedCourseIds: Set<string>;
};

export function PlanPreview({ goal, courseMap, completedCourseIds }: PlanPreviewProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-700" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-900">4年間の履修見通し</h2>
        </div>
      </div>
      <div className="space-y-3 p-4">
        {goal.fourYearPlan.map((term) => (
          <div key={term.label} className="grid grid-cols-[88px_1fr] gap-3 rounded-md bg-slate-50 p-3">
            <div className="text-sm font-bold text-slate-900">{term.label}</div>
            <div className="flex flex-wrap gap-2">
              {term.courseIds.map((courseId) => {
                const course = courseMap.get(courseId);
                const completed = completedCourseIds.has(courseId);

                return (
                  <span
                    key={courseId}
                    className={[
                      "rounded px-2 py-1 text-xs font-semibold",
                      completed
                        ? "bg-emerald-100 text-emerald-800"
                        : "border border-slate-200 bg-white text-slate-700",
                    ].join(" ")}
                  >
                    {course?.name ?? courseId}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
