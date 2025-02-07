import React, { useState } from "react"
import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { EyeOff, Eye } from "lucide-react"

import { CustomAlertDialog } from "@/components/ui/custom-alert-dialog"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {

  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [showEnableDialog, setShowEnableDialog] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasActivated = selectedRows.some(row => (row.original as any).status === "Activated")
  const hasDisabled = selectedRows.some(row => (row.original as any).status === "Disabled")

  const handleDisable = () => {
    setShowDisableDialog(true)
  }

  const handleEnable = () => {
    setShowEnableDialog(true)
  }

  const handleConfirmDisable = () => {
    // TODO: Implement the logic to update the status of selected items to "Disabled"
    setShowDisableDialog(false)
  }

  const handleConfirmEnable = () => {
    // TODO: Implement the logic to update the status of selected items to "Activated"
    setShowEnableDialog(false)
  }

  return (
    <div className="flex items-center justify-between px-2">
      {/* <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div> */}

      <div className="flex items-center space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedRows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        {selectedRows.length > 0 && (
          <>
            {hasActivated && (
              <Button
                variant="destructive"
                size="default"
                onClick={handleDisable}
                className="h-8 px-2 lg:px-3 rounded"
              >
                <EyeOff size={16}/>
                Disable
              </Button>
            )}
            {hasDisabled && (
              <Button
                size="default"
                onClick={handleEnable}
                className="h-8 px-2 lg:px-3 rounded"
              >
                <Eye size={16}/>
                Enable
              </Button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[150px] items-center justify-center text-sm font-medium">
          Page:  
          {/* {table.getState().pagination.pageIndex + 1}  */}
          <span className="flex items-center gap-1">
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                table.setPageIndex(page)
              }}
              className="border p-1 rounded w-16 mr-1 ml-1"
            />
          </span>
          of{" "}
          {table.getPageCount()}
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
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>

      <CustomAlertDialog
        open={showDisableDialog}
        onOpenChange={setShowDisableDialog}
        title={`Are you sure you want to disable ${selectedRows.length} items?`}
        description="These items will remain viewable only in the base data but will be hidden in any other modules for future entries."
        onCancel={() => setShowDisableDialog(false)}
        onConfirm={handleConfirmDisable}
      />

      <CustomAlertDialog
        open={showEnableDialog}
        onOpenChange={setShowEnableDialog}
        title={`Are you sure you want to enable ${selectedRows.length} items?`}
        description="These items will be visible in any other modules for future entries."
        onCancel={() => setShowEnableDialog(false)}
        onConfirm={handleConfirmEnable}
      />

    </div>
  )
}
