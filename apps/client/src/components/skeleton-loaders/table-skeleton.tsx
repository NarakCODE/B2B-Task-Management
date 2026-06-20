import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  columns: number
  rows?: number
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows = 20 }) => {
  return (
    <div className="w-full rounded-lg">
      <div className="flex h-10 rounded-t-lg bg-muted">
        {[...Array(columns)].map((_, index) => (
          <div key={`header-col-${index}`} className="flex flex-1 px-4 py-2">
            <Skeleton className="h-4 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="divide-y divide-border">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex h-10">
            {[...Array(columns)].map((_, colIndex) => (
              <div key={`row-${rowIndex}-col-${colIndex}`} className="flex flex-1 px-4 py-2">
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableSkeleton
