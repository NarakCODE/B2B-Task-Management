"use client"

import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DataGrid,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
} from "@/components/reui/data-grid"
import { DataTableColumnHeader } from "@/components/workspace/task/table/table-column-header"
import useWorkspaceId from "@/hooks/use-workspace-id"
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects"
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper"
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
import type { ProjectType } from "@/types/api.type"

const RecentProjects = () => {
  const workspaceId = useWorkspaceId()

  const { data, isPending } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 10,
  })

  const projects = (data?.projects || []) as ProjectType[]

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<ProjectType>[]>(
    () => [
      {
        accessorKey: "emoji",
        header: "",
        cell: (info) => (
          <span className="text-xl leading-none">
            {info.getValue() as string}
          </span>
        ),
        size: 50,
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <Link
            to={`/workspace/${workspaceId}/project/${row.original._id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        id: "createdBy",
        header: "Created By",
        cell: ({ row }) => {
          const name = row.original.createdBy.name
          const initials = getAvatarFallbackText(name)
          const avatarColor = getAvatarColor(name)
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={row.original.createdBy.profilePicture || ""}
                  alt={name}
                />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{name}</span>
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created At" />
        ),
        cell: (info) => {
          const value = info.getValue() as string
          return value ? format(value, "PPP") : null
        },
      },
    ],
    [workspaceId]
  )

  const table = useReactTable({
    columns,
    data: projects,
    pageCount: Math.ceil(projects.length / pagination.pageSize),
    getRowId: (row) => row._id,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (!isPending && projects.length === 0) {
    return (
      <div className="font-semibold text-sm text-muted-foreground text-center py-5">
        No Project created yet
      </div>
    )
  }

  return (
    <DataGrid table={table} recordCount={projects.length} isLoading={isPending}>
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

export default RecentProjects
