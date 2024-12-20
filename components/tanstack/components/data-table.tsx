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
import {SidePanel} from "@/components/tanstack/components/side-panel"
import { Button } from "@/components/ui/button"
import { ChevronRight } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  dataType : 'items' | 'vendors' | 'warehouses' | 'locations'
}

export function DataTable<TData, TValue>({
  columns,
  data,
  dataType,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
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
          <div className={`overflow-auto transition-all ${sidePanelOpen ? 'w-[calc(100%-384px)]' : 'w-full'}`}>
            <div className="h-[calc(95vh-200px)] overflow-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan} className="rounded-md border-r">
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
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
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
            />
          )}
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
