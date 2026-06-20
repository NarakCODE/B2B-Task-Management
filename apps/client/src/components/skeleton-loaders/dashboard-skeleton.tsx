import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export function DashboardSkeleton() {
  return (
    <div className="relative p-4">
      <div className="absolute inset-0 z-50 flex items-start justify-center pt-10">
        <div className="flex items-center gap-2">
          <Spinner className="size-[25px]" />
          <span className="text-sm font-medium">TeamSync...</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex w-64 flex-col gap-4">
          <Skeleton className="h-8 w-40" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-36" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
