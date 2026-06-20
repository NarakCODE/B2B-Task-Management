"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DataGrid,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
} from "@/components/reui/data-grid"
import { DataTableColumnHeader } from "@/components/workspace/task/table/table-column-header"
import useWorkspaceId from "@/hooks/use-workspace-id"
import { getAllTasksQueryFn } from "@/lib/api"
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformStatusEnum,
} from "@/lib/helper"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table"
import type { TaskType } from "@/types/api.type"

const RecentTasks = () => {
  const workspaceId = useWorkspaceId()

  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  })

  const tasks: TaskType[] = (data?.tasks || []) as TaskType[]

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<TaskType>[]>(
    () => [
      {
        accessorKey: "taskCode",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Task" />
        ),
        cell: (info) => (
          <span className="font-medium capitalize">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: (info) => (
          <span className="font-semibold truncate block max-w-[250px]">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Due Date" />
        ),
        cell: (info) => {
          const value = info.getValue() as string
          return value ? format(value, "PPP") : null
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: (info) => (
          <Badge
            variant="secondary"
            className="uppercase font-medium shadow-sm border-0"
          >
            {transformStatusEnum(info.getValue() as string)}
          </Badge>
        ),
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Priority" />
        ),
        cell: (info) => (
          <Badge
            variant="outline"
            className="uppercase font-medium shadow-sm border-0"
          >
            {transformStatusEnum(info.getValue() as string)}
          </Badge>
        ),
      },
      {
        id: "assignedTo",
        header: "Assignee",
        cell: ({ row }) => {
          const assignee = row.original.assignedTo
          if (!assignee) return null
          const name = assignee.name
          const initials = getAvatarFallbackText(name)
          const avatarColor = getAvatarColor(name)
          return (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={assignee.profilePicture || ""}
                alt={name}
              />
              <AvatarFallback className={avatarColor}>
                {initials}
              </AvatarFallback>
            </Avatar>
          )
        },
        enableSorting: false,
      },
    ],
    []
  )

  const table = useReactTable({
    columns,
    data: tasks,
    pageCount: Math.ceil(tasks.length / pagination.pageSize),
    getRowId: (row) => row._id,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (!isLoading && tasks.length === 0) {
    return (
      <div className="font-semibold text-sm text-muted-foreground text-center py-5">
        No Task created yet
      </div>
    )
  }

  return (
    <DataGrid table={table} recordCount={tasks.length} isLoading={isLoading}>
      <div className="w-full space-y-2.5 pt-2">
        <DataGridContainer>
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  )
}

export default RecentTasks
