"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Table } from "@tanstack/react-table"

interface DataGridContextType<TData> {
  table: Table<TData>
  recordCount: number
  isLoading?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataGridContext = createContext<DataGridContextType<any> | null>(null)

export function useDataGrid<TData>() {
  const context = useContext(DataGridContext)
  if (!context) {
    throw new Error("useDataGrid must be used within a <DataGrid> component")
  }
  return context as DataGridContextType<TData>
}

interface DataGridProps<TData> {
  table: Table<TData>
  recordCount: number
  isLoading?: boolean
  children: ReactNode
}

export function DataGrid<TData>({ table, recordCount, isLoading, children }: DataGridProps<TData>) {
  return (
    <DataGridContext.Provider value={{ table, recordCount, isLoading }}>
      {children}
    </DataGridContext.Provider>
  )
}
