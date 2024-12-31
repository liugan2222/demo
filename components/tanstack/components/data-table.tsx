"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { SidePanel } from "@/components/tanstack/components/side-panel"
import { Button } from "@/components/ui/button"
import { ChevronRight } from 'lucide-react';

export interface StickyConfig {
  columns: string[];  // Array of column ids/accessorKeys to make sticky
  width?: number;     // Width of each sticky column (default: 80)
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  dataType: 'items' | 'vendors' | 'warehouses' | 'locations'
  stickyColumns?: StickyConfig
}

export function DataTable<TData, TValue>({
  columns,
  data,
  dataType,
  stickyColumns,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [sidePanelOpen, setSidePanelOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<TData | null>(null)
  const handleActionClick = (item: TData) => {
    setSelectedItem(item)
    setSidePanelOpen(true)
  }

  const handleSidePanelClose = () => {
    setSidePanelOpen(false)
    setSelectedItem(null)
  }

  const handleSave = (updatedItem: TData) => {
    // Implement your save logic here
    console.log("Saving updated item:", updatedItem)
    handleSidePanelClose()
  }

  const isColumnSticky = React.useCallback((columnId: string) => {
    return stickyColumns?.columns.includes(columnId)
  }, [stickyColumns])

  const getStickyPosition = React.useCallback((columnId: string) => {
    if (!stickyColumns) return undefined
    const columnIndex = stickyColumns.columns.indexOf(columnId)
    if (columnIndex === -1) return undefined
    return (40 + (columnIndex-1) * (stickyColumns.width ?? 100))
  }, [stickyColumns])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Set initial page size
  React.useEffect(() => {
    table.setPageSize(20)
  }, [table, 20])

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <div className="flex">
          <div className={`relative ${sidePanelOpen ? 'w-[calc(80vw-384px)]' : 'w-full'}`}>
            <div className="sticky top-0 z-30 bg-background border-b">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const isSticky = isColumnSticky(header.column.id)
                        const stickyPosition = getStickyPosition(header.column.id)
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}
                            className={`border-r ${isSticky
                                ? 'sticky z-30 bg-background shadow-[1px_0_0_0_#e5e7eb]'
                                : ''
                              }`}
                            style={{
                              left: stickyPosition !== undefined ? `${stickyPosition}px` : undefined,
                              minWidth: header.column.columnDef.minSize || 100,
                              width: header.column.columnDef.size || 'auto',
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        )
                      })}
                      <TableHead style={{ width: 80 }}></TableHead>
                    </TableRow>
                  ))}
                </TableHeader>
              </Table>
            </div>  
            <div className="h-[calc(95vh-200px)] overflow-auto">
              <Table>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isSticky = isColumnSticky(cell.column.id)
                          const stickyPosition = getStickyPosition(cell.column.id)

                          return (
                            <TableCell
                              key={cell.id}
                              className={`${isSticky
                                  ? 'sticky z-20 bg-background shadow-[1px_0_0_0_#e5e7eb]'
                                  : ''
                                }`}
                              style={{
                                left: stickyPosition !== undefined ? `${stickyPosition}px` : undefined,
                                minWidth: cell.column.columnDef.minSize || 100,
                                width: cell.column.columnDef.size || 'auto',
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell style={{ width: 80 }}>
                          <Button
                            variant="ghost"
                            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                            onClick={() => handleActionClick(row.original)}
                          >
                            <ChevronRight size={10} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + 1}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {sidePanelOpen && (
            <SidePanel
              isOpen={sidePanelOpen}
              onClose={handleSidePanelClose}
              dataType={dataType}
              selectedItem={selectedItem}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}