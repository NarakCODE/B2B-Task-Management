# Backend API Reference

Base path: `/api`

All endpoints except auth/webhooks require authentication via cookie session (Passport).

---

## Phase 1 — Delivery Workflow

### Workflow States

Base path: `/api/workflow`

| Method | Path                                 | Description                                            |
| ------ | ------------------------------------ | ------------------------------------------------------ |
| POST   | `/workspace/:workspaceId/create`     | Create custom workflow for workspace or project        |
| PUT    | `/:id/workspace/:workspaceId/update` | Update workflow states                                 |
| GET    | `/workspace/:workspaceId/all`        | List all workflows in workspace                        |
| GET    | `/workspace/:workspaceId/default`    | Get or create default workflow (query: `?project=xxx`) |
| GET    | `/:id/workspace/:workspaceId`        | Get workflow by ID                                     |
| DELETE | `/:id/workspace/:workspaceId/delete` | Delete workflow                                        |

**POST body:**

```json
{
  "project": "optional-project-id-or-null",
  "states": [
    {
      "name": "In Progress",
      "category": "IN_PROGRESS",
      "color": "#eab308",
      "order": 2,
      "isDefault": false
    }
  ]
}
```

Categories: `BACKLOG`, `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`
Task status validation automatically coerces invalid statuses to the default workflow state.

### Backlog Ordering

Added to `/api/task`:

| Method | Path                              | Description                                |
| ------ | --------------------------------- | ------------------------------------------ |
| PUT    | `/workspace/:workspaceId/reorder` | Batch-update `sortOrder` for tasks         |
| GET    | `/workspace/:workspaceId/backlog` | List tasks with `sprint: null` (paginated) |

**PUT body:**

```json
{
  "tasks": [
    { "taskId": "...", "sortOrder": 0 },
    { "taskId": "...", "sortOrder": 1 }
  ]
}
```

**GET `/backlog` query params:** `projectId`, `status`, `priority`, `assignedTo`, `keyword`, `taskType`, `pageSize`, `pageNumber`

### Epics

Base path: `/api/epic`

| Method | Path                                                | Description               |
| ------ | --------------------------------------------------- | ------------------------- |
| POST   | `/project/:projectId/workspace/:workspaceId/create` | Create epic               |
| GET    | `/project/:projectId/workspace/:workspaceId/all`    | List epics by project     |
| GET    | `/:id/workspace/:workspaceId`                       | Get epic by ID            |
| PUT    | `/:id/workspace/:workspaceId/update`                | Update epic               |
| DELETE | `/:id/workspace/:workspaceId/delete`                | Delete epic               |
| GET    | `/:id/workspace/:workspaceId/tasks`                 | List tasks linked to epic |
| GET    | `/:id/workspace/:workspaceId/progress`              | Epic progress analytics   |

**POST body:**

```json
{
  "name": "Billing System Overhaul",
  "description": "Refactor billing to support new pricing tiers",
  "status": "OPEN",
  "owner": "user-id-or-null",
  "startDate": "2026-01-01",
  "targetDate": "2026-03-01"
}
```

Epic statuses: `OPEN`, `IN_PROGRESS`, `DONE`

---

## Phase 2 — GitHub Engineering Flow

### Pull Requests

Base path: `/api/pull-request`

| Method | Path                                             | Auth   | Description                                     |
| ------ | ------------------------------------------------ | ------ | ----------------------------------------------- |
| POST   | `/github/webhook/:workspaceId`                   | Public | GitHub webhook receiver for PR events           |
| GET    | `/workspace/:workspaceId/all`                    | Yes    | List workspace PRs (`?status=OPEN&pageSize=10`) |
| GET    | `/:id/workspace/:workspaceId/task`               | Yes    | List PRs linked to a task                       |
| GET    | `/project/:projectId/workspace/:workspaceId/all` | Yes    | List PRs by project                             |
| POST   | `/workspace/:workspaceId/generate-branch`        | Yes    | Generate branch name from task code + title     |

**POST `/generate-branch` body:**

```json
{
  "taskCode": "task-abc",
  "title": "Add billing filter"
}
```

Returns: `"feature/task-abc-add-billing-filter"`

**Webhook behavior:** Parses `task-xxx` codes from branch names, PR titles, and PR descriptions. Auto-transitions linked tasks: TODO→IN_PROGRESS on open, IN_REVIEW→DONE on merge.

### Deployments

Base path: `/api/deployment`

| Method | Path                                             | Auth   | Description                                            |
| ------ | ------------------------------------------------ | ------ | ------------------------------------------------------ |
| POST   | `/webhook/:workspaceId`                          | Public | Deployment webhook receiver                            |
| POST   | `/workspace/:workspaceId/create`                 | Yes    | Manually create deployment                             |
| GET    | `/workspace/:workspaceId/all`                    | Yes    | List workspace deployments (`?environment=PRODUCTION`) |
| GET    | `/project/:projectId/workspace/:workspaceId/all` | Yes    | List deployments by project                            |
| GET    | `/:id/workspace/:workspaceId`                    | Yes    | Get deployment with linked PRs                         |

Environments: `PRODUCTION`, `STAGING`, `DEVELOPMENT`
Statuses: `PENDING`, `IN_PROGRESS`, `SUCCESS`, `FAILED`, `ROLLED_BACK`

---

## Phase 3 — Planning & Capacity

### Releases

Base path: `/api/release`

| Method | Path                                                | Description                                    |
| ------ | --------------------------------------------------- | ---------------------------------------------- |
| POST   | `/project/:projectId/workspace/:workspaceId/create` | Create release                                 |
| GET    | `/project/:projectId/workspace/:workspaceId/all`    | List releases by project                       |
| GET    | `/:id/workspace/:workspaceId`                       | Get release by ID                              |
| PUT    | `/:id/workspace/:workspaceId/update`                | Update release                                 |
| DELETE | `/:id/workspace/:workspaceId/delete`                | Delete release                                 |
| GET    | `/:id/workspace/:workspaceId/tasks`                 | List tasks in release                          |
| GET    | `/:id/workspace/:workspaceId/release-notes`         | Generate release notes (tasks grouped by type) |
| GET    | `/:id/workspace/:workspaceId/analytics`             | Release completion stats                       |

Statuses: `PLANNED`, `IN_PROGRESS`, `RELEASED`, `CANCELLED`

### Milestones

Base path: `/api/milestone`

| Method | Path                                                | Description                            |
| ------ | --------------------------------------------------- | -------------------------------------- |
| POST   | `/project/:projectId/workspace/:workspaceId/create` | Create milestone                       |
| GET    | `/project/:projectId/workspace/:workspaceId/all`    | List milestones by project             |
| GET    | `/:id/workspace/:workspaceId`                       | Get milestone by ID                    |
| PUT    | `/:id/workspace/:workspaceId/update`                | Update milestone                       |
| DELETE | `/:id/workspace/:workspaceId/delete`                | Delete milestone                       |
| GET    | `/:id/workspace/:workspaceId/progress`              | Milestone progress + overdue detection |
| POST   | `/:id/workspace/:workspaceId/link-epics`            | Link epics to milestone                |

**POST `/link-epics` body:**

```json
{ "epicIds": ["epic-id-1", "epic-id-2"] }
```

Statuses: `OPEN`, `IN_PROGRESS`, `COMPLETED`

### Capacity Planning

Base path: `/api/capacity`

| Method | Path                                       | Description                                   |
| ------ | ------------------------------------------ | --------------------------------------------- |
| POST   | `/workspace/:workspaceId/set`              | Set capacity for sprint+member                |
| POST   | `/workspace/:workspaceId/bulk`             | Bulk set capacities                           |
| GET    | `/workspace/:workspaceId/sprint/:sprintId` | Sprint capacity with over-allocation warnings |

**POST body:**

```json
{
  "sprint": "sprint-id",
  "member": "user-id",
  "availableHours": 40,
  "plannedStoryPoints": 8
}
```

**GET response includes:**

```json
{
  "memberStats": [
    {
      "member": { "_id": "...", "name": "..." },
      "plannedStoryPoints": 8,
      "actualStoryPoints": 10,
      "isOverAllocated": true,
      "warnings": ["Assigned story points exceed planned capacity"]
    }
  ],
  "totals": { "totalPlanned": 8, "totalActual": 10, "totalCompleted": 6 }
}
```

---

## Phase 4 — Engineering Metrics

### Analytics

Base path: `/api/analytics`

| Method | Path                                              | Description                                  |
| ------ | ------------------------------------------------- | -------------------------------------------- |
| GET    | `/workspace/:workspaceId/cycle-time`              | Lead time from activity logs                 |
| GET    | `/workspace/:workspaceId/sprint/:sprintId/health` | Sprint health burndown + scope changes       |
| GET    | `/workspace/:workspaceId/velocity`                | Historical velocity (`?sprintCount=5`)       |
| GET    | `/workspace/:workspaceId/engineering`             | Dashboard: throughput, PRs, blocked, overdue |

**Cycle time filters:** `projectId`, `taskId`, `assigneeId`, `sprintId`, `startDate`, `endDate`

**Engineering dashboard response:**

```json
{
  "throughput": { "totalTasks": 100, "completedLast30Days": 20, "completionRate": 20 },
  "activePRs": 5,
  "blockedTasks": 3,
  "overdueReview": 2,
  "recentDeployments": [...]
}
```

---

## Phase 5 — Quality & Incidents

### Task Reviews

Base path: `/api/review`

| Method | Path                                      | Description                                |
| ------ | ----------------------------------------- | ------------------------------------------ |
| POST   | `/task/:id/workspace/:workspaceId/create` | Create review for task                     |
| POST   | `/:id/workspace/:workspaceId/approve`     | Approve review                             |
| POST   | `/:id/workspace/:workspaceId/reject`      | Reject review with optional comment        |
| GET    | `/task/:id/workspace/:workspaceId`        | Get review for task                        |
| GET    | `/workspace/:workspaceId/all`             | List workspace reviews (`?status=PENDING`) |

**POST `/create` body:**

```json
{
  "reviewers": ["user-id-1", "user-id-2"],
  "requiredApprovals": 1
}
```

Statuses: `PENDING`, `APPROVED`, `CHANGES_REQUESTED`

### Definition of Done

Base path: `/api/dod`

| Method | Path                                                   | Description                              |
| ------ | ------------------------------------------------------ | ---------------------------------------- |
| POST   | `/template/workspace/:workspaceId/create`              | Create DoD template                      |
| GET    | `/template/workspace/:workspaceId/all`                 | List templates (`?projectId=&taskType=`) |
| POST   | `/task/:id/workspace/:workspaceId/attach`              | Attach template to task                  |
| PATCH  | `/task/:id/workspace/:workspaceId/item/:itemId/toggle` | Toggle DoD item completion               |
| GET    | `/task/:id/workspace/:workspaceId`                     | Get task DoD checklist                   |

**POST template body:**

```json
{
  "name": "Feature Checklist",
  "items": [
    { "description": "Code reviewed", "isRequired": true },
    { "description": "Tests pass", "isRequired": true },
    { "description": "Docs updated", "isRequired": false }
  ]
}
```

### Incidents

Base path: `/api/incident`

| Method | Path                                 | Description                                      |
| ------ | ------------------------------------ | ------------------------------------------------ |
| POST   | `/workspace/:workspaceId/create`     | Report incident                                  |
| GET    | `/workspace/:workspaceId/all`        | List incidents (`?severity=&status=&projectId=`) |
| GET    | `/:id/workspace/:workspaceId`        | Get incident by ID                               |
| PUT    | `/:id/workspace/:workspaceId/update` | Update incident (status, rootCause, owner)       |

Severities: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
Statuses: `DETECTED`, `INVESTIGATING`, `MITIGATED`, `RESOLVED`, `CLOSED`

Critical/high incidents auto-send Slack notifications.

---

## Phase 6 — B2B Governance

### Audit Export

Base path: `/api/audit`

| Method | Path                             | Description                                                |
| ------ | -------------------------------- | ---------------------------------------------------------- |
| GET    | `/workspace/:workspaceId/export` | Export activity logs (`?format=csv` for CSV, default JSON) |

**Filters:** `userId`, `projectId`, `taskId`, `actionType`, `startDate`, `endDate`

Requires `MANAGE_WORKSPACE_SETTINGS` permission.

---

## Phase 7 — Automation & Standups

### Automation Rules

Base path: `/api/automation`

| Method | Path                                 | Description                         |
| ------ | ------------------------------------ | ----------------------------------- |
| POST   | `/workspace/:workspaceId/create`     | Create automation rule              |
| GET    | `/workspace/:workspaceId/all`        | List rules (`?projectId=&trigger=`) |
| PUT    | `/:id/workspace/:workspaceId/update` | Update rule                         |
| DELETE | `/:id/workspace/:workspaceId/delete` | Delete rule                         |

**POST body:**

```json
{
  "name": "Auto-close on PR merge",
  "trigger": "PR_MERGED",
  "conditions": null,
  "actions": [
    { "type": "CHANGE_STATUS", "params": { "status": "DONE" } },
    { "type": "NOTIFY_SLACK", "params": { "message": "Task completed via PR!" } }
  ],
  "project": null
}
```

Triggers: `TASK_CREATED`, `TASK_STATUS_CHANGED`, `PR_OPENED`, `PR_MERGED`, `DUE_DATE_MISSED`, `INCIDENT_SEVERITY_CHANGED`
Actions: `ASSIGN_USER`, `CHANGE_STATUS`, `NOTIFY_SLACK`, `CREATE_COMMENT`, `SET_PRIORITY`

### Async Standups

Base path: `/api/standup`

| Method | Path                                  | Description                                 |
| ------ | ------------------------------------- | ------------------------------------------- |
| POST   | `/workspace/:workspaceId/create`      | Create standup config                       |
| GET    | `/workspace/:workspaceId/all`         | List workspace standups (`?projectId=`)     |
| POST   | `/:id/workspace/:workspaceId/update`  | Submit standup update                       |
| GET    | `/:id/workspace/:workspaceId/updates` | Get updates for a date (`?date=2026-06-20`) |
| GET    | `/:id/workspace/:workspaceId/summary` | Today's team summary                        |

**POST update body:**

```json
{
  "yesterday": "Finished billing module",
  "today": "Start testing",
  "blockers": "Waiting on API review",
  "linkedTasks": ["task-id-1"]
}
```

BLocker submissions auto-trigger Slack notifications.

---

## Task Model — New Fields

When creating/updating tasks, these new fields are available:

```json
{
  "epic": "epic-id-or-null",
  "release": "release-id-or-null",
  "milestone": "milestone-id-or-null",
  "sortOrder": 0
}
```

The `GET /api/task/workspace/:workspaceId/all` endpoint now also supports `?epic=` filter.

---

## Suggested Frontend Implementation Order

1. **Workflow states** — fetch `/default` to get workflow, render status as colored states
2. **Backlog** — add a "Backlog" view using `/backlog` with drag-drop reorder calling `/reorder`
3. **Epics** — create/list epics, show progress bar, add epic filter to task list
4. **PRs & Deployments** — show linked PRs on task detail, branch name copy button
5. **Releases** — release management UI, release notes page
6. **Milestones** — milestone timeline view
7. **Capacity** — sprint planning view with allocation bars
8. **Engineering metrics** — dashboard widgets
9. **Reviews & DoD** — review approval flow, checklist on task detail
10. **Incidents** — incident tracking UI
11. **Automation rules** — rule builder UI
12. **Standups** — daily standup form, team summary view
13. **Audit export** — admin panel button
