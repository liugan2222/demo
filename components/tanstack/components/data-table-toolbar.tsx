"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { X, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DataTableColumnSelector } from "./data-table-column-selector"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {

  // Track selected columns and their filter states
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>([])

  // Get all filterable columns
  const filterableColumns = React.useMemo(() => {
    return table.getAllColumns()
    .filter((column) => 
      column.id !== 'select' && 
      typeof column.accessorFn !== 'undefined'
    )
    .map((column) => ({
      label: column.id,
      value: column.id,
      disabled: selectedColumns.includes(column.id)
    }))
  }, [table, selectedColumns])

  // Get unique options for all columns
  const columnOptions = React.useMemo(() => {
    const options: { [key: string]: { label: string; value: string }[] } = {}
    
    table.getAllColumns().forEach((column) => {
      const columnId = column.id
      const optionSet = new Set()
      
      options[columnId] = table.getCoreRowModel().rows.reduce((acc, row) => {
        const value = row.getValue(columnId)
        const option = { label: String(value), value: String(value) }
        const optionKey = `${option.label}-${option.value}`
        
        if (!optionSet.has(optionKey)) {
          optionSet.add(optionKey)
          acc.push(option)
        }
        
        return acc
      }, [] as { label: string; value: string }[])
    })
    
    return options
  }, [table])  

  // Handle adding a new column filter
  const handleAddColumnFilter = (columnId: string) => {
    setSelectedColumns((prev) => [...prev, columnId])
  }

  // Handle removing a column filter
  const handleRemoveColumnFilter = (columnId: string) => {
    setSelectedColumns((prev) => prev.filter((id) => id !== columnId))
    table.getColumn(columnId)?.setFilterValue(undefined)
  }

  // Reset all filters
  const handleResetFilters = () => {
    table.resetColumnFilters()
    setSelectedColumns([])
  }

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search ID"
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        
        <DataTableColumnSelector
          columns={filterableColumns}
          onSelect={handleAddColumnFilter}
        />
        
        {selectedColumns.map((columnId) => {
          const column = table.getColumn(columnId)
          if (!column) return null

          const options = columnOptions[columnId] || []

          if (!options.length) {
            return null
          }

          return (
            <DataTableFacetedFilter
              key={columnId}
              column={column}
              title={columnId}
              options={options}
              selectedValues={new Set(
                [column.getFilterValue()].flat().filter(Boolean) as string[]
              )}
              onSelect={(value) => {
                column.setFilterValue(value)
              }}
              onRemove={() => handleRemoveColumnFilter(columnId)}
            />
          )
        })}     


        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-8 px-2 lg:px-3 text-green-700"
          >
            <X />
            Clear filters
          </Button>
        )}
      </div>
      <div className="px-2">
        <DataTableViewOptions  table={table} />
      </div>
      <Button> <Plus size={8}/>Add raw</Button>
    </div>
  )
}
