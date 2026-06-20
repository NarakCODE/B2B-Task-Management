import { type ReactNode } from "react"

interface DataGridScrollAreaProps {
  children: ReactNode
}

export function DataGridScrollArea({ children }: DataGridScrollAreaProps) {
  return <div className="overflow-x-auto">{children}</div>
}
