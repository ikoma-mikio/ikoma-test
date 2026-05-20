import { useMemo, useState, type ReactNode } from "react";
import { Database, GitBranch, Route, ShieldAlert } from "lucide-react";
import { AiAdvisorPanel } from "./components/AiAdvisorPanel";
import { CompletedSelector } from "./components/CompletedSelector";
import { CourseDetailPanel } from "./components/CourseDetailPanel";
import { CourseGraph } from "./components/CourseGraph";
import { GoalSelector } from "./components/GoalSelector";
import { PlanPreview } from "./components/PlanPreview";
import coursesData from "./data/courses.json";
import goalsData from "./data/goals.json";
import relationsData from "./data/relations.json";
import {
  buildCourseMap,
  collectRouteCourseIds,
  getCourseStatus,
  getMissingPrerequisiteIds,
  getNextCourses,
  getRelatedRelations,
} from "./lib/routePlanner";
import type { Course, CourseRelation, Goal } from "./lib/types";

const courses = coursesData as Course[];
const goals = goalsData as Goal[];
const relations = relationsData as CourseRelation[];

const defaultCompletedCourseIds = [
  "core_intro",
  "core_academic",
  "core_stats_basic",
  "info_programming",
];

function App() {
  const [selectedGoalId, setSelectedGoalId] = useState("goal_data_lab");
  const [selectedCourseId, setSelectedCourseId] = useState("info_data_analysis");
  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>(defaultCompletedCourseIds);

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0];
  const courseMap = useMemo(() => buildCourseMap(courses), []);
  const completedCourseIdSet = useMemo(() => new Set(completedCourseIds), [completedCourseIds]);
  const routeCourseIds = useMemo(() => collectRouteCourseIds(selectedGoal, courses), [selectedGoal]);
  const missingPrerequisiteIds = useMemo(
    () => getMissingPrerequisiteIds(routeCourseIds, courses, completedCourseIdSet),
    [routeCourseIds, completedCourseIdSet],
  );
  const nextCourses = useMemo(
    () => getNextCourses(routeCourseIds, courses, completedCourseIdSet),
    [routeCourseIds, completedCourseIdSet],
  );

  const selectedCourse = courseMap.get(selectedCourseId) ?? courses[0];
  const selectedCourseStatus = getCourseStatus(selectedCourse, routeCourseIds, completedCourseIdSet);
  const selectedCourseRelations = getRelatedRelations(selectedCourse.id, relations);
  const completedRouteCount = [...routeCourseIds].filter((courseId) => completedCourseIdSet.has(courseId)).length;
  const routeCompletionPercent = Math.round((completedRouteCount / routeCourseIds.size) * 100);

  function handleSelectGoal(goalId: string) {
    const nextGoal = goals.find((goal) => goal.id === goalId);
    setSelectedGoalId(goalId);
    if (nextGoal?.keyCourses[0]) {
      setSelectedCourseId(nextGoal.keyCourses[0]);
    }
  }

  function handleToggleCompleted(courseId: string) {
    setCompletedCourseIds((current) =>
      current.includes(courseId)
        ? current.filter((currentCourseId) => currentCourseId !== courseId)
        : [...current, courseId],
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1680px] px-5 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-sky-700">青山学院大学 社会情報学部 MVP</p>
              <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
                履修ワークツリーAI
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                代表デモ: 1年次の基礎科目を取得済みの学生が、データ分析系研究室に向けて2年次以降の優先授業を決める。
              </p>
            </div>
            <div className="lg:min-w-[720px]">
              <div className="grid gap-2 sm:grid-cols-4">
                <Metric icon={<Database className="h-4 w-4" />} label="授業データ" value={`${courses.length}科目`} />
                <Metric icon={<GitBranch className="h-4 w-4" />} label="授業間リンク" value={`${relations.length}本`} />
                <Metric
                  icon={<Route className="h-4 w-4" />}
                  label="ルート進捗"
                  value={`${completedRouteCount}/${routeCourseIds.size}`}
                />
                <Metric
                  icon={<ShieldAlert className="h-4 w-4" />}
                  label="先に埋める授業"
                  value={`${missingPrerequisiteIds.size}件`}
                />
              </div>
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                  <span>選択ルートの完了率</span>
                  <span>{routeCompletionPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${routeCompletionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <GoalSelector goals={goals} selectedGoalId={selectedGoalId} onSelect={handleSelectGoal} />

      <div className="mx-auto grid max-w-[1680px] gap-5 px-5 py-5 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
        <aside className="space-y-5">
          <CompletedSelector
            courses={courses}
            completedCourseIds={completedCourseIdSet}
            onToggle={handleToggleCompleted}
          />
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">選択中の目標</h2>
            <p className="mt-2 text-base font-bold text-slate-950">{selectedGoal.name}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{selectedGoal.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedGoal.recommendedAreas.map((area) => (
                <span key={area} className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {area}
                </span>
              ))}
            </div>
          </section>
        </aside>

        <div className="min-w-0">
          <CourseGraph
            courses={courses}
            relations={relations}
            routeCourseIds={routeCourseIds}
            completedCourseIds={completedCourseIdSet}
            selectedCourseId={selectedCourse.id}
            onSelectCourse={setSelectedCourseId}
          />
        </div>

        <aside className="space-y-5">
          <CourseDetailPanel
            course={selectedCourse}
            courseMap={courseMap}
            relations={selectedCourseRelations}
            status={selectedCourseStatus}
            completedCourseIds={completedCourseIdSet}
          />
          <AiAdvisorPanel
            goal={selectedGoal}
            courseMap={courseMap}
            nextCourses={nextCourses}
            missingPrerequisiteIds={missingPrerequisiteIds}
          />
          <PlanPreview goal={selectedGoal} courseMap={courseMap} completedCourseIds={completedCourseIdSet} />
        </aside>
      </div>
    </main>
  );
}

type MetricProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="text-slate-600">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-slate-950">{value}</div>
    </div>
  );
}

export default App;
