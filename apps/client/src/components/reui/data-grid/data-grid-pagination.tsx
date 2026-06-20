"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDataGrid } from "./data-grid"

export function DataGridPagination() {
  const { table, recordCount } = useDataGrid()
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, recordCount)

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {from}-{to} of {recordCount}
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-x-8 lg:space-y-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <div className="flex lg:w-[100px] items-center justify-center text-sm font-medium">
            Page {pageIndex + 1} of {pageCount}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="h-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft /> Previous
            </Button>
            <Button
              variant="outline"
              className="h-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              Next <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
