export const WorkflowCategoryEnum = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  DONE: "DONE",
} as const

export type WorkflowCategoryEnumType = keyof typeof WorkflowCategoryEnum
