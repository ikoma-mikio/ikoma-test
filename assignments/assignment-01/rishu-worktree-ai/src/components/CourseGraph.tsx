import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  LockKeyhole,
  Maximize2,
  Network,
  Route,
  X,
} from "lucide-react";
import type { Course, CourseArea, CourseRelation, CourseStatus, RelationType } from "../lib/types";
import { getCourseStatus } from "../lib/routePlanner";

type CourseGraphProps = {
  courses: Course[];
  relations: CourseRelation[];
  routeCourseIds: Set<string>;
  completedCourseIds: Set<string>;
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
};

const areaTone: Record<CourseArea, { dot: string; badge: string; border: string }> = {
  "教養・基礎": {
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700",
    border: "border-slate-200",
  },
  情報: {
    dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-800",
    border: "border-sky-200",
  },
  社会: {
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-800",
    border: "border-rose-200",
  },
  人間: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800",
    border: "border-amber-200",
  },
  領域横断: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-200",
  },
};

const statusLabel: Record<CourseStatus, string> = {
  completed: "取得済み",
  route: "目標ルート",
  blocked: "条件未達",
  available: "履修候補",
  neutral: "関連外",
};

const yearLabels = [1, 2, 3, 4];

const treeSize = {
  width: 1040,
  height: 620,
};

const relationStroke: Record<RelationType, string> = {
  prerequisite: "#334155",
  related: "#64748b",
  applied: "#0f766e",
  lab: "#2563eb",
  career: "#be123c",
};

function semesterRank(semester: string) {
  if (semester.includes("前期")) {
    return 1;
  }
  if (semester.includes("後期")) {
    return 2;
  }
  if (semester.includes("通年")) {
    return 3;
  }
  return 4;
}

function getConditionStatus(course: Course, completedCourseIds: Set<string>) {
  if (course.prerequisites.length === 0) {
    return "none";
  }

  return course.prerequisites.every((courseId) => completedCourseIds.has(courseId)) ? "satisfied" : "missing";
}

function statusClass(status: CourseStatus) {
  return {
    completed: "border-emerald-300 bg-emerald-50",
    route: "border-amber-300 bg-amber-50",
    blocked: "border-amber-300 bg-amber-50",
    available: "border-sky-200 bg-white",
    neutral: "border-slate-200 bg-white",
  }[status];
}

function statusBadgeClass(status: CourseStatus) {
  return {
    completed: "bg-emerald-100 text-emerald-800",
    route: "bg-amber-100 text-amber-900",
    blocked: "bg-amber-100 text-amber-900",
    available: "bg-sky-100 text-sky-800",
    neutral: "bg-slate-100 text-slate-600",
  }[status];
}

export function CourseGraph({
  courses,
  relations,
  routeCourseIds,
  completedCourseIds,
  selectedCourseId,
  onSelectCourse,
}: CourseGraphProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "board">("tree");
  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const routeCourses = useMemo(
    () =>
      courses
        .filter((course) => routeCourseIds.has(course.id))
        .sort(
          (a, b) =>
            a.year - b.year ||
            semesterRank(a.semester) - semesterRank(b.semester) ||
            a.name.localeCompare(b.name, "ja"),
        ),
    [courses, routeCourseIds],
  );
  const selectedCourse = courseMap.get(selectedCourseId) ?? routeCourses[0] ?? courses[0];
  const selectedPrerequisites = selectedCourse.prerequisites
    .map((courseId) => courseMap.get(courseId))
    .filter((value): value is Course => Boolean(value));
  const routeRelationCount = relations.filter(
    (relation) => routeCourseIds.has(relation.from) && routeCourseIds.has(relation.to),
  ).length;

  return (
    <>
      <section className="rounded-md border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">履修ワークツリー</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              選択した目標ルートだけを、枝分かれ図として表示しています。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              大きく表示
            </button>
          </div>
        </div>

        <ConditionSummary
          course={selectedCourse}
          prerequisites={selectedPrerequisites}
          completedCourseIds={completedCourseIds}
        />

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <SmallMetric label="ルート上の授業" value={`${routeCourses.length}科目`} />
            <SmallMetric label="ルート上のリンク" value={`${routeRelationCount}本`} />
            <SmallMetric
              label="条件未達"
              value={`${routeCourses.filter((course) => getConditionStatus(course, completedCourseIds) === "missing").length}科目`}
            />
          </div>
        </div>

        {viewMode === "tree" ? (
          <RouteTree
            routeCourses={routeCourses}
            relations={relations}
            courseMap={courseMap}
            completedCourseIds={completedCourseIds}
            routeCourseIds={routeCourseIds}
            selectedCourseId={selectedCourseId}
            onSelectCourse={onSelectCourse}
          />
        ) : (
          <RouteBoard
            routeCourses={routeCourses}
            courseMap={courseMap}
            completedCourseIds={completedCourseIds}
            routeCourseIds={routeCourseIds}
            selectedCourseId={selectedCourseId}
            onSelectCourse={onSelectCourse}
          />
        )}
      </section>

      {expanded ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <h2 className="text-base font-bold">履修ワークツリー 大きく表示</h2>
              <p className="mt-1 text-xs text-slate-300">
                枝分かれ図と年次カードを切り替えて確認できます。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeToggle viewMode={viewMode} onChange={setViewMode} dark />
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                閉じる
              </button>
            </div>
          </div>

          <div className="border-b border-white/10 bg-slate-900/80 px-4 py-3">
            <ConditionSummary
              course={selectedCourse}
              prerequisites={selectedPrerequisites}
              completedCourseIds={completedCourseIds}
              dark
            />
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="mx-auto max-w-6xl rounded-md bg-white text-slate-950 shadow-2xl">
              {viewMode === "tree" ? (
                <RouteTree
                  routeCourses={routeCourses}
                  relations={relations}
                  courseMap={courseMap}
                  completedCourseIds={completedCourseIds}
                  routeCourseIds={routeCourseIds}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={onSelectCourse}
                  large
                />
              ) : (
                <RouteBoard
                  routeCourses={routeCourses}
                  courseMap={courseMap}
                  completedCourseIds={completedCourseIds}
                  routeCourseIds={routeCourseIds}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={onSelectCourse}
                  large
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type ConditionSummaryProps = {
  course: Course;
  prerequisites: Course[];
  completedCourseIds: Set<string>;
  dark?: boolean;
};

function ConditionSummary({ course, prerequisites, completedCourseIds, dark = false }: ConditionSummaryProps) {
  const conditionStatus = getConditionStatus(course, completedCourseIds);
  const conditionLabel =
    conditionStatus === "none" ? "条件なし" : conditionStatus === "satisfied" ? "条件クリア" : "条件未達";

  return (
    <div className={dark ? "" : "border-b border-slate-200 bg-white px-4 py-3"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={dark ? "text-xs font-semibold text-slate-300" : "text-xs font-semibold text-slate-500"}>
            選択中の授業
          </div>
          <div className={dark ? "mt-1 text-sm font-bold text-white" : "mt-1 text-sm font-bold text-slate-950"}>
            {course.name}
          </div>
        </div>
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold",
            dark
              ? conditionStatus === "missing"
                ? "border-amber-300/60 bg-amber-300/15 text-amber-100"
                : "border-emerald-300/50 bg-emerald-300/15 text-emerald-100"
              : conditionStatus === "missing"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-800",
          ].join(" ")}
        >
          {conditionStatus === "missing" ? (
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {conditionLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {prerequisites.length > 0 ? (
          prerequisites.map((item) => {
            const completed = completedCourseIds.has(item.id);

            return (
              <span
                key={item.id}
                className={[
                  "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold",
                  dark
                    ? completed
                      ? "bg-emerald-300/15 text-emerald-100"
                      : "bg-amber-300/15 text-amber-100"
                    : completed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900",
                ].join(" ")}
              >
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                {item.name}
                <span className={dark ? "text-slate-300" : "text-slate-500"}>
                  {completed ? "取得済み" : "未取得"}
                </span>
              </span>
            );
          })
        ) : (
          <span className={dark ? "text-xs text-slate-300" : "text-xs text-slate-500"}>
            MVP登録データ上、この授業の前提科目はありません。
          </span>
        )}
      </div>
    </div>
  );
}

type ViewModeToggleProps = {
  viewMode: "tree" | "board";
  onChange: (mode: "tree" | "board") => void;
  dark?: boolean;
};

function ViewModeToggle({ viewMode, onChange, dark = false }: ViewModeToggleProps) {
  return (
    <div
      className={[
        "inline-flex rounded-md border p-0.5 text-xs font-semibold",
        dark ? "border-white/20 bg-white/10" : "border-slate-200 bg-slate-100",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onChange("tree")}
        className={[
          "inline-flex h-7 items-center gap-1.5 rounded px-2.5 transition",
          viewMode === "tree"
            ? dark
              ? "bg-white text-slate-950"
              : "bg-white text-sky-800 shadow-sm"
            : dark
              ? "text-slate-200 hover:bg-white/10"
              : "text-slate-600 hover:bg-white/70",
        ].join(" ")}
      >
        <Network className="h-3.5 w-3.5" aria-hidden="true" />
        ワークツリー図
      </button>
      <button
        type="button"
        onClick={() => onChange("board")}
        className={[
          "inline-flex h-7 items-center gap-1.5 rounded px-2.5 transition",
          viewMode === "board"
            ? dark
              ? "bg-white text-slate-950"
              : "bg-white text-sky-800 shadow-sm"
            : dark
              ? "text-slate-200 hover:bg-white/10"
              : "text-slate-600 hover:bg-white/70",
        ].join(" ")}
      >
        <Route className="h-3.5 w-3.5" aria-hidden="true" />
        年次カード
      </button>
    </div>
  );
}

type RouteTreeProps = {
  routeCourses: Course[];
  relations: CourseRelation[];
  courseMap: Map<string, Course>;
  completedCourseIds: Set<string>;
  routeCourseIds: Set<string>;
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  large?: boolean;
};

function RouteTree({
  routeCourses,
  relations,
  courseMap,
  completedCourseIds,
  routeCourseIds,
  selectedCourseId,
  onSelectCourse,
  large = false,
}: RouteTreeProps) {
  const positions = useMemo(() => buildTreePositions(routeCourses), [routeCourses]);
  const edgeMap = new Map<string, { from: Course; to: Course; type: RelationType }>();

  for (const relation of relations) {
    const from = courseMap.get(relation.from);
    const to = courseMap.get(relation.to);
    if (from && to && routeCourseIds.has(from.id) && routeCourseIds.has(to.id)) {
      edgeMap.set(`${from.id}-${to.id}`, { from, to, type: relation.type });
    }
  }

  for (const course of routeCourses) {
    for (const prerequisiteId of course.prerequisites) {
      const prerequisite = courseMap.get(prerequisiteId);
      if (prerequisite && routeCourseIds.has(prerequisite.id)) {
        edgeMap.set(`${prerequisite.id}-${course.id}`, {
          from: prerequisite,
          to: course,
          type: "prerequisite",
        });
      }
    }
  }

  const edges = [...edgeMap.values()].filter((edge) => positions.has(edge.from.id) && positions.has(edge.to.id));

  return (
    <div className="graph-scrollbar overflow-auto bg-slate-50 p-4">
      <div
        className="relative overflow-hidden rounded-md border border-slate-200 bg-white"
        style={{ width: treeSize.width, height: treeSize.height }}
      >
        <svg
          className="absolute inset-0"
          width={treeSize.width}
          height={treeSize.height}
          role="img"
          aria-label="目標ルートのワークツリー図"
        >
          <defs>
            <marker id={large ? "tree-arrow-large" : "tree-arrow"} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
          </defs>
          <rect width={treeSize.width} height={treeSize.height} fill="#f8fafc" />
          <ellipse cx="260" cy="250" rx="230" ry="165" fill="rgba(56,189,248,0.16)" stroke="#38bdf8" strokeOpacity="0.45" strokeWidth="2" />
          <ellipse cx="610" cy="250" rx="235" ry="165" fill="rgba(251,113,133,0.13)" stroke="#fb7185" strokeOpacity="0.42" strokeWidth="2" />
          <ellipse cx="525" cy="410" rx="260" ry="145" fill="rgba(52,211,153,0.14)" stroke="#34d399" strokeOpacity="0.42" strokeWidth="2" />
          <text x="158" y="92" fill="#0284c7" fontSize="18" fontWeight="700" opacity="0.7">
            情報
          </text>
          <text x="740" y="94" fill="#e11d48" fontSize="18" fontWeight="700" opacity="0.7">
            社会
          </text>
          <text x="482" y="536" fill="#059669" fontSize="18" fontWeight="700" opacity="0.7">
            領域横断
          </text>
          {yearLabels.map((year) => (
            <g key={year}>
              <line x1={yearToX(year)} y1="70" x2={yearToX(year)} y2="565" stroke="#cbd5e1" strokeDasharray="4 6" />
              <text x={yearToX(year)} y="42" textAnchor="middle" fill="#334155" fontSize="16" fontWeight="800">
                {year}年
              </text>
            </g>
          ))}
          {edges.map((edge) => {
            const from = positions.get(edge.from.id);
            const to = positions.get(edge.to.id);
            if (!from || !to) {
              return null;
            }

            const midX = (from.x + to.x) / 2;

            return (
              <path
                key={`${edge.from.id}-${edge.to.id}-${edge.type}`}
                d={`M ${from.x + 74} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x - 74} ${to.y}`}
                fill="none"
                stroke={relationStroke[edge.type]}
                strokeWidth={edge.type === "prerequisite" ? 3 : 2}
                strokeOpacity={edge.type === "prerequisite" ? 0.75 : 0.42}
                markerEnd={edge.type === "prerequisite" ? `url(#${large ? "tree-arrow-large" : "tree-arrow"})` : undefined}
              />
            );
          })}
        </svg>

        {routeCourses.map((course) => {
          const position = positions.get(course.id);
          if (!position) {
            return null;
          }

          return (
            <TreeNode
              key={course.id}
              course={course}
              completedCourseIds={completedCourseIds}
              routeCourseIds={routeCourseIds}
              selected={course.id === selectedCourseId}
              onSelect={() => onSelectCourse(course.id)}
              x={position.x}
              y={position.y}
            />
          );
        })}
      </div>
    </div>
  );
}

function yearToX(year: number) {
  return {
    1: 130,
    2: 390,
    3: 650,
    4: 910,
  }[year] ?? 910;
}

function buildTreePositions(routeCourses: Course[]) {
  const positions = new Map<string, { x: number; y: number }>();

  for (const year of yearLabels) {
    const coursesInYear = routeCourses.filter((course) => course.year === year);
    const availableHeight = 430;
    const startY = coursesInYear.length <= 1 ? 300 : 105;
    const gap = coursesInYear.length <= 1 ? 0 : availableHeight / (coursesInYear.length - 1);

    coursesInYear.forEach((course, index) => {
      positions.set(course.id, {
        x: yearToX(year),
        y: startY + gap * index,
      });
    });
  }

  return positions;
}

type TreeNodeProps = {
  course: Course;
  completedCourseIds: Set<string>;
  routeCourseIds: Set<string>;
  selected: boolean;
  onSelect: () => void;
  x: number;
  y: number;
};

function TreeNode({ course, completedCourseIds, routeCourseIds, selected, onSelect, x, y }: TreeNodeProps) {
  const status = getCourseStatus(course, routeCourseIds, completedCourseIds);
  const conditionStatus = getConditionStatus(course, completedCourseIds);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "absolute z-10 w-[148px] -translate-x-1/2 -translate-y-1/2 rounded-md border px-2.5 py-2 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50",
        statusClass(status),
        selected ? "ring-2 ring-sky-500 ring-offset-2" : "",
      ].join(" ")}
      style={{ left: x, top: y }}
      title={`${course.name} / ${course.area}`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${areaTone[course.area].dot}`} />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold text-slate-500">{course.semester}</span>
          <span className="line-clamp-2 block text-xs font-bold leading-snug text-slate-950">{course.name}</span>
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${statusBadgeClass(status)}`}>
          {statusLabel[status]}
        </span>
        {conditionStatus !== "none" ? (
          <span
            className={[
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold",
              conditionStatus === "missing" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800",
            ].join(" ")}
          >
            <LockKeyhole className="h-2.5 w-2.5" aria-hidden="true" />
            条件
          </span>
        ) : null}
      </div>
    </button>
  );
}

type RouteBoardProps = {
  routeCourses: Course[];
  courseMap: Map<string, Course>;
  completedCourseIds: Set<string>;
  routeCourseIds: Set<string>;
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  large?: boolean;
};

function RouteBoard({
  routeCourses,
  courseMap,
  completedCourseIds,
  routeCourseIds,
  selectedCourseId,
  onSelectCourse,
  large = false,
}: RouteBoardProps) {
  return (
    <div className="graph-scrollbar overflow-auto bg-slate-50 p-4">
      <div className="min-w-[1040px]">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-100 ring-1 ring-emerald-500" />
            取得済み
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-100 ring-1 ring-amber-400" />
            これから取る授業
          </span>
          <span className="inline-flex items-center gap-1.5">
            <LockKeyhole className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            履修条件あり
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Route className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            左から右へ進む
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {yearLabels.map((year) => {
            const yearCourses = routeCourses.filter((course) => course.year === year);

            return (
              <section key={year} className="rounded-md border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-slate-100 px-3 py-2">
                  <div className="text-sm font-bold text-slate-950">{year}年</div>
                  <div className="text-xs text-slate-500">{yearCourses.length}科目</div>
                </div>
                <div className={large ? "space-y-3 p-3" : "space-y-2 p-3"}>
                  {yearCourses.map((course) => (
                    <RouteCourseCard
                      key={course.id}
                      course={course}
                      courseMap={courseMap}
                      completedCourseIds={completedCourseIds}
                      routeCourseIds={routeCourseIds}
                      selected={course.id === selectedCourseId}
                      onSelect={() => onSelectCourse(course.id)}
                      large={large}
                    />
                  ))}
                  {yearCourses.length === 0 ? (
                    <div className="rounded-md border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                      この年次の登録なし
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type RouteCourseCardProps = {
  course: Course;
  courseMap: Map<string, Course>;
  completedCourseIds: Set<string>;
  routeCourseIds: Set<string>;
  selected: boolean;
  onSelect: () => void;
  large: boolean;
};

function RouteCourseCard({
  course,
  courseMap,
  completedCourseIds,
  routeCourseIds,
  selected,
  onSelect,
  large,
}: RouteCourseCardProps) {
  const status = getCourseStatus(course, routeCourseIds, completedCourseIds);
  const prerequisites = course.prerequisites
    .map((courseId) => courseMap.get(courseId))
    .filter((value): value is Course => Boolean(value));
  const missingPrerequisites = prerequisites.filter((item) => !completedCourseIds.has(item.id));
  const conditionStatus = getConditionStatus(course, completedCourseIds);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "block w-full rounded-md border p-3 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50",
        statusClass(status),
        selected ? "ring-2 ring-sky-500 ring-offset-2" : "",
        areaTone[course.area].border,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${areaTone[course.area].dot}`} />
            <span className="truncate text-xs font-bold text-slate-500">{course.semester}</span>
          </div>
          <div className={large ? "mt-1 text-base font-bold text-slate-950" : "mt-1 text-sm font-bold text-slate-950"}>
            {course.name}
          </div>
        </div>
        <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-bold ${statusBadgeClass(status)}`}>
          {statusLabel[status]}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`rounded px-2 py-1 text-[11px] font-semibold ${areaTone[course.area].badge}`}>
          {course.area}
        </span>
        {course.workload === "high" ? (
          <span className="rounded bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-800">
            負担重め
          </span>
        ) : null}
        {conditionStatus !== "none" ? (
          <span
            className={[
              "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold",
              conditionStatus === "missing" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800",
            ].join(" ")}
          >
            <LockKeyhole className="h-3 w-3" aria-hidden="true" />
            {conditionStatus === "missing" ? "条件未達" : "条件OK"}
          </span>
        ) : null}
      </div>

      {prerequisites.length > 0 ? (
        <div className="mt-2 border-t border-slate-200 pt-2">
          <div className="mb-1 text-[11px] font-bold text-slate-500">先に必要</div>
          <div className="flex flex-wrap gap-1.5">
            {prerequisites.map((item) => {
              const completed = completedCourseIds.has(item.id);

              return (
                <span
                  key={item.id}
                  className={[
                    "rounded px-2 py-1 text-[11px] font-semibold",
                    completed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900",
                  ].join(" ")}
                >
                  {item.name}
                </span>
              );
            })}
          </div>
          {missingPrerequisites.length > 0 ? (
            <div className="mt-2 text-[11px] font-semibold text-amber-800">
              未取得: {missingPrerequisites.map((item) => item.name).join(" / ")}
            </div>
          ) : null}
        </div>
      ) : null}
    </button>
  );
}

type SmallMetricProps = {
  label: string;
  value: string;
};

function SmallMetric({ label, value }: SmallMetricProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-base font-bold text-slate-950">{value}</div>
    </div>
  );
}
