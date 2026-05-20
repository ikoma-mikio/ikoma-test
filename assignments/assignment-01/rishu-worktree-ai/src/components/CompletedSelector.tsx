import { CheckSquare, Square } from "lucide-react";
import type { Course, CourseArea } from "../lib/types";

type CompletedSelectorProps = {
  courses: Course[];
  completedCourseIds: Set<string>;
  onToggle: (courseId: string) => void;
};

const areaOrder: CourseArea[] = ["教養・基礎", "情報", "社会", "人間", "領域横断"];

const areaSwatch: Record<CourseArea, string> = {
  "教養・基礎": "bg-slate-500",
  情報: "bg-sky-500",
  社会: "bg-rose-500",
  人間: "bg-amber-500",
  領域横断: "bg-emerald-500",
};

export function CompletedSelector({ courses, completedCourseIds, onToggle }: CompletedSelectorProps) {
  const sortedCourses = [...courses].sort((a, b) => {
    const areaDiff = areaOrder.indexOf(a.area) - areaOrder.indexOf(b.area);
    return areaDiff || a.year - b.year || a.name.localeCompare(b.name, "ja");
  });

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">取得済み授業</h2>
        <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
          {completedCourseIds.size}/{courses.length}
        </span>
      </div>
      <div className="max-h-[420px] space-y-1 overflow-auto p-3 graph-scrollbar">
        {sortedCourses.map((course) => {
          const checked = completedCourseIds.has(course.id);

          return (
            <label
              key={course.id}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 transition",
                checked
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onToggle(course.id)}
              />
              {checked ? (
                <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              ) : (
                <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${areaSwatch[course.area]}`} />
                  <span className="truncate text-sm font-medium text-slate-800">{course.name}</span>
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {course.year}年 / {course.semester}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
