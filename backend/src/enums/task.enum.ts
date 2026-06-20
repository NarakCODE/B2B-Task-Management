export const TaskStatusEnum = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const;

export const TaskPriorityEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export const TaskTypeEnum = {
  FEATURE: "FEATURE",
  BUG: "BUG",
  CHORE: "CHORE",
  REFACTOR: "REFACTOR",
} as const;

export type TaskStatusEnumType = keyof typeof TaskStatusEnum;
export type TaskPriorityEnumType = keyof typeof TaskPriorityEnum;
export type TaskTypeEnumType = keyof typeof TaskTypeEnum;
