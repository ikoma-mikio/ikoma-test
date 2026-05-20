import { BarChart3, BriefcaseBusiness, GraduationCap, Microscope } from "lucide-react";
import type { Goal, GoalCategory } from "../lib/types";

type GoalSelectorProps = {
  goals: Goal[];
  selectedGoalId: string;
  onSelect: (goalId: string) => void;
};

const categoryLabel: Record<GoalCategory, string> = {
  lab: "研究室",
  career: "進路",
  graduate_school: "大学院",
};

const categoryIcon = {
  lab: Microscope,
  career: BriefcaseBusiness,
  graduate_school: GraduationCap,
};

export function GoalSelector({ goals, selectedGoalId, onSelect }: GoalSelectorProps) {
  return (
    <section className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-slate-700" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-900">目標ルート</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {goals.map((goal) => {
          const Icon = categoryIcon[goal.category];
          const selected = goal.id === selectedGoalId;

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => onSelect(goal.id)}
              aria-pressed={selected}
              title={goal.description}
              className={[
                "flex min-h-20 items-start gap-3 rounded-md border px-3 py-3 text-left transition",
                selected
                  ? "border-sky-500 bg-sky-50 text-sky-950 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <span
                className={[
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md",
                  selected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium text-slate-500">
                  {categoryLabel[goal.category]}
                </span>
                <span className="mt-1 block text-sm font-semibold leading-snug">{goal.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
