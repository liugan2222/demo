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

// export interface StickyConfig {
//   columns: string[];  // Array of column ids/accessorKeys to make sticky
//   width?: number;     // Width of each sticky column (default: 80)
// }

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  dataType: 'items' | 'vendors' | 'warehouses' | 'locations' | 'procurements' | 'receivings' | 'users' | 'roles'
  // stickyColumns?: StickyConfig
  onRefresh?: () => void
  getRowId: (row: TData) => string
}

// interface DataTableToolbarProps {
//   table: any;
//   dataType: string;
//   onRefresh?: () => void;
// }

export function DataTable<TData, TValue>({
  columns,
  data,
  dataType,
  // stickyColumns,
  onRefresh: onRefresh,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [sidePanelOpen, setSidePanelOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<TData | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)

  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }

  const handleActionClick = (item: TData) => {
    setSelectedItem(item)
    setSidePanelOpen(true)
  }

  const handleSidePanelClose = () => {
    // console.log('handleSidePanelClose')  
    setSidePanelOpen(false)
    setSelectedItem(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    // console.log('updatedItem: ',updatedItem)
    try {
      // If the save is successful, close the panel and refresh the data
      handleSidePanelClose()
      
      // Refresh the data if a refresh callback is provided
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error updating', error)
      // Handle error (show error message to user, etc.)
    }
  }

  // const isColumnSticky = React.useCallback((columnId: string) => {
  //   return stickyColumns?.columns.includes(columnId)
  // }, [stickyColumns])

  // const getStickyPosition = React.useCallback((columnId: string) => {
  //   if (!stickyColumns) return undefined
  //   const columnIndex = stickyColumns.columns.indexOf(columnId)
  //   if (columnIndex === -1) return undefined
  //   // return (40 + (columnIndex-1) * (stickyColumns.width ?? 100))
  //   let position = 0
  //   for (let i = 0; i < columnIndex; i++) {
  //     const prevColumnId = stickyColumns.columns[i]
  //     const column = columns.find(col => {
  //       if (col.id === prevColumnId) return true
  //       const accessorKey = (col as any).accessorKey
  //       return accessorKey === prevColumnId
  //     })
  //     position += column?.size || stickyColumns.width || 100
  //   }
  //   return position
  // }, [stickyColumns, columns])

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
    getRowId: getRowId,
  })

  // Set initial page size
  React.useEffect(() => {
    table.setPageSize(20)
  }, [table])

  return (
    <div className="space-y-4 flex flex-col h-full">
      <DataTableToolbar table={table} dataType={dataType} onRefresh={onRefresh}/>
      <div className="rounded-md border flex-1 flex flex-col relative">
        <div className={`flex-1 transition-all duration-300 ${sidePanelOpen ? "mr-[340px]" : ""}`}>
          <div className="h-[calc(95vh-200px)] overflow-auto">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        // const isSticky = isColumnSticky(header.column.id)
                        // const stickyPosition = getStickyPosition(header.column.id)
                        return (
                          // <TableHead key={header.id} colSpan={header.colSpan} 
                          //   className={`border-r ${isSticky
                          //     ? 'sticky z-30 bg-background shadow-[1px_0_0_0_#e5e7eb]'
                          //     : ''
                          //   }`}
                          //   style={{
                          //     left: stickyPosition !== undefined ? `${stickyPosition}px` : undefined,
                          //     width: header.column.getSize(),
                          //     minWidth: header.column.columnDef.minSize,
                          //     maxWidth: header.column.columnDef.maxSize,
                          //   }}
                          // >
                          <TableHead key={header.id} colSpan={header.colSpan} 
                            className="rounded-md border-r table-header-content"
                            style={{
                              width: header.column.getSize(),
                              minWidth: header.column.columnDef.minSize,
                              maxWidth: header.column.columnDef.maxSize,
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
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={selectedItem && getRowId(selectedItem) === row.id ? "bg-zinc-200" : ""}
                        onClick={() => handleActionClick(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id}
                            className="table-body-content"
                            style={{
                              width: cell.column.getSize(),
                              minWidth: cell.column.columnDef.minSize,
                              maxWidth: cell.column.columnDef.maxSize,
                            }}
                            >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="table-body-content">
                          <Button
                            variant="ghost"
                            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted "
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
                        colSpan={columns.length}
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
              isEditing={isEditing}
              onToggleEdit={toggleEditing}
            />
          )}
        </div>
      </div>
      <DataTablePagination table={table} dataType={dataType} onRefresh={onRefresh || (() => {})}/>
    </div>
  )
}