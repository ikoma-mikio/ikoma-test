export type CourseArea = "情報" | "社会" | "人間" | "教養・基礎" | "領域横断";

export type Workload = "low" | "medium" | "high";

export type RelationType =
  | "prerequisite"
  | "related"
  | "applied"
  | "lab"
  | "career";

export type GoalCategory = "lab" | "career" | "graduate_school";

export type Course = {
  id: string;
  name: string;
  area: CourseArea;
  year: number;
  semester: string;
  description: string;
  prerequisites: string[];
  relatedGoals: string[];
  workload: Workload;
  officialNote?: string;
  graph: {
    x: number;
    y: number;
  };
};

export type CourseRelation = {
  from: string;
  to: string;
  type: RelationType;
  reason: string;
  importance: number;
};

export type AiAdvice = {
  summary: string;
  recommendedCourseIds: string[];
  missingPrerequisiteIds: string[];
  explanation: string;
  cautions: string[];
};

export type PlanTerm = {
  label: string;
  courseIds: string[];
};

export type Goal = {
  id: string;
  name: string;
  category: GoalCategory;
  description: string;
  keyCourses: string[];
  recommendedAreas: CourseArea[];
  fourYearPlan: PlanTerm[];
  mockAdvice: AiAdvice;
};

export type CourseStatus = "completed" | "route" | "blocked" | "available" | "neutral";
