import { AlertTriangle, BookOpen, CheckCircle2, Link2, Lock, Unlock } from "lucide-react";
import type { Course, CourseRelation, CourseStatus, RelationType } from "../lib/types";

type CourseDetailPanelProps = {
  course: Course;
  courseMap: Map<string, Course>;
  relations: CourseRelation[];
  status: CourseStatus;
  completedCourseIds: Set<string>;
};

const workloadLabel: Record<Course["workload"], string> = {
  low: "軽め",
  medium: "標準",
  high: "重め",
};

const statusLabel: Record<CourseStatus, string> = {
  completed: "取得済み",
  route: "目標ルート",
  blocked: "条件未達",
  available: "履修候補",
  neutral: "関連外",
};

const relationLabel: Record<RelationType, string> = {
  prerequisite: "前提",
  related: "関連",
  applied: "応用",
  lab: "研究室",
  career: "進路",
};

function statusClass(status: CourseStatus) {
  return {
    completed: "bg-emerald-100 text-emerald-800",
    route: "bg-amber-100 text-amber-800",
    blocked: "bg-slate-200 text-slate-700",
    available: "bg-sky-100 text-sky-800",
    neutral: "bg-slate-100 text-slate-600",
  }[status];
}

export function CourseDetailPanel({
  course,
  courseMap,
  relations,
  status,
  completedCourseIds,
}: CourseDetailPanelProps) {
  const prerequisites = course.prerequisites
    .map((courseId) => courseMap.get(courseId))
    .filter((value): value is Course => Boolean(value));
  const prerequisitesSatisfied = prerequisites.every((item) => completedCourseIds.has(item.id));

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-slate-700" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-900">授業詳細</h2>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>
              {statusLabel[status]}
            </span>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              {course.area}
            </span>
          </div>
          <h3 className="text-lg font-bold leading-snug text-slate-950">{course.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {course.year}年 / {course.semester} / 負担感: {workloadLabel[course.workload]}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{course.description}</p>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {prerequisitesSatisfied ? (
                <Unlock className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              ) : (
                <Lock className="h-4 w-4 text-amber-700" aria-hidden="true" />
              )}
              MVP登録データ上の履修条件
            </div>
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-bold",
                prerequisites.length === 0 || prerequisitesSatisfied
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-900",
              ].join(" ")}
            >
              {prerequisites.length === 0 || prerequisitesSatisfied ? (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {prerequisites.length === 0 ? "条件なし" : prerequisitesSatisfied ? "条件クリア" : "条件未達"}
            </span>
          </div>
          {prerequisites.length > 0 ? (
            <div className="space-y-2">
              {prerequisites.map((item) => {
                const completed = completedCourseIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={[
                      "flex flex-wrap items-center justify-between gap-2 rounded-md border bg-white px-3 py-2",
                      completed ? "border-emerald-100" : "border-amber-100",
                    ].join(" ")}
                  >
                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                    <span
                      className={[
                        "rounded px-2 py-1 text-xs font-bold",
                        completed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900",
                      ].join(" ")}
                    >
                      {completed ? "取得済み" : "未取得"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">このMVPデータでは、この授業の前提科目は登録されていません。</p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            {prerequisitesSatisfied ? (
              <Unlock className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            ) : (
              <Lock className="h-4 w-4 text-slate-500" aria-hidden="true" />
            )}
            前提として推奨
          </div>
          {prerequisites.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {prerequisites.map((item) => (
                <span
                  key={item.id}
                  className={[
                    "rounded px-2 py-1 text-xs font-medium",
                    completedCourseIds.has(item.id)
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700",
                  ].join(" ")}
                >
                  {item.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">登録データ上、前提授業はありません。</p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Link2 className="h-4 w-4 text-slate-700" aria-hidden="true" />
            授業間リンク
          </div>
          <div className="space-y-2">
            {relations.slice(0, 5).map((relation) => {
              const pairId = relation.from === course.id ? relation.to : relation.from;
              const pair = courseMap.get(pairId);

              return (
                <div key={`${relation.from}-${relation.to}-${relation.type}`} className="rounded-md bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                      {relationLabel[relation.type]}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{pair?.name ?? pairId}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{relation.reason}</p>
                </div>
              );
            })}
            {relations.length === 0 ? (
              <p className="text-sm text-slate-500">登録データ上、関連リンクはありません。</p>
            ) : null}
          </div>
        </div>

        {course.officialNote ? <p className="text-xs leading-5 text-slate-500">{course.officialNote}</p> : null}
      </div>
    </section>
  );
}
