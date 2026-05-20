import type { Course, CourseRelation, CourseStatus, Goal } from "./types";

export function buildCourseMap(courses: Course[]) {
  return new Map(courses.map((course) => [course.id, course]));
}

export function collectRouteCourseIds(goal: Goal, courses: Course[]) {
  const courseMap = buildCourseMap(courses);
  const routeIds = new Set(goal.keyCourses);
  const stack = [...goal.keyCourses];

  while (stack.length > 0) {
    const courseId = stack.pop();
    if (!courseId) {
      continue;
    }

    const course = courseMap.get(courseId);
    if (!course) {
      continue;
    }

    for (const prerequisiteId of course.prerequisites) {
      if (!routeIds.has(prerequisiteId)) {
        routeIds.add(prerequisiteId);
        stack.push(prerequisiteId);
      }
    }
  }

  return routeIds;
}

export function getMissingPrerequisiteIds(routeIds: Set<string>, courses: Course[], completedIds: Set<string>) {
  const missingIds = new Set<string>();

  for (const course of courses) {
    if (!routeIds.has(course.id) || completedIds.has(course.id)) {
      continue;
    }

    for (const prerequisiteId of course.prerequisites) {
      if (!completedIds.has(prerequisiteId)) {
        missingIds.add(prerequisiteId);
      }
    }
  }

  return missingIds;
}

export function isCourseBlocked(course: Course, completedIds: Set<string>) {
  return course.prerequisites.some((prerequisiteId) => !completedIds.has(prerequisiteId));
}

export function getCourseStatus(
  course: Course,
  routeIds: Set<string>,
  completedIds: Set<string>,
): CourseStatus {
  if (completedIds.has(course.id)) {
    return "completed";
  }

  if (routeIds.has(course.id) && isCourseBlocked(course, completedIds)) {
    return "blocked";
  }

  if (routeIds.has(course.id)) {
    return "route";
  }

  if (!isCourseBlocked(course, completedIds)) {
    return "available";
  }

  return "neutral";
}

export function getNextCourses(routeIds: Set<string>, courses: Course[], completedIds: Set<string>) {
  return courses
    .filter((course) => routeIds.has(course.id))
    .filter((course) => !completedIds.has(course.id))
    .filter((course) => !isCourseBlocked(course, completedIds))
    .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name, "ja"));
}

export function getRelatedRelations(courseId: string, relations: CourseRelation[]) {
  return relations.filter((relation) => relation.from === courseId || relation.to === courseId);
}
