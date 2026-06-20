"use client"

import { flexRender } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useDataGrid } from "./data-grid"

export function DataGridTable() {
  const { table, isLoading } = useDataGrid()
  const columns = table.getAllColumns().length
  const rows = table.getRowModel().rows

  return (
    <div className="rounded-md border">
      {isLoading ? (
        <div className="w-full">
          <div className="flex h-10 rounded-t-lg bg-muted">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={`h-${i}`} className="flex flex-1 px-4 py-2">
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <div key={`r-${rowIdx}`} className="flex h-10">
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <div key={`c-${rowIdx}-${colIdx}`} className="flex flex-1 px-4 py-2">
                    <Skeleton className="h-4 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows?.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
