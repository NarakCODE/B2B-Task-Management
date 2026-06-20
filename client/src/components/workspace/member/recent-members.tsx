"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DataGrid,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
} from "@/components/reui/data-grid"
import { DataTableColumnHeader } from "@/components/workspace/task/table/table-column-header"
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members"
import useWorkspaceId from "@/hooks/use-workspace-id"
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

interface MemberRow {
  _id: string
  name: string
  email: string
  profilePicture: string | null
  role: string
  joinedAt: string
}

const RecentMembers = () => {
  const workspaceId = useWorkspaceId()
  const { data, isPending } = useGetWorkspaceMembers(workspaceId)

  const members: MemberRow[] = useMemo(
    () =>
      (data?.members || []).map((m) => ({
        _id: m._id,
        name: m.userId.name,
        email: m.userId.email,
        profilePicture: m.userId.profilePicture,
        role: m.role.name,
        joinedAt: m.joinedAt,
      })),
    [data]
  )

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<MemberRow>[]>(
    () => [
      {
        id: "avatar",
        header: "",
        cell: ({ row }) => {
          const initials = getAvatarFallbackText(row.original.name)
          const avatarColor = getAvatarColor(row.original.name)
          return (
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={row.original.profilePicture || ""}
                alt={row.original.name}
              />
              <AvatarFallback className={avatarColor}>
                {initials}
              </AvatarFallback>
            </Avatar>
          )
        },
        size: 50,
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: (info) => (
          <span className="text-muted-foreground">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: (info) => (
          <span className="text-sm">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "joinedAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Joined" />
        ),
        cell: (info) => {
          const value = info.getValue() as string
          return value ? format(value, "PPP") : null
        },
      },
    ],
    []
  )

  const table = useReactTable({
    columns,
    data: members,
    pageCount: Math.ceil(members.length / pagination.pageSize),
    getRowId: (row) => row._id,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (!isPending && members.length === 0) {
    return (
      <div className="font-semibold text-sm text-muted-foreground text-center py-5">
        No members found
      </div>
    )
  }

  return (
    <DataGrid table={table} recordCount={members.length} isLoading={isPending}>
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

export default RecentMembers
