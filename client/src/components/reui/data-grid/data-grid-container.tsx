import { type ReactNode } from "react"

interface DataGridContainerProps {
  children: ReactNode
}

export function DataGridContainer({ children }: DataGridContainerProps) {
  return <div className="rounded-md">{children}</div>
}
