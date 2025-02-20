"use client"

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

import { Vendorpation } from "@/components/tanstack/schema/pationSchema/vendorpationSchema"
import { Itempation } from "@/components/tanstack/schema/pationSchema/itempationSchema"
import { Warehousepation } from "@/components/tanstack/schema/pationSchema/warehousepationSchema"
import { Locationpation } from "@/components/tanstack/schema/pationSchema/locationpationSchema"
import { vendorActive, vendorDeactive, itemActive, itemDeactive, warehouseActive, warehouseDeactive, locationActive, locationDeactive } from '@/lib/api';

interface DataTablePaginationProps<TData> {
  table: Table<TData>,
  dataType: 'items' | 'vendors' | 'warehouses' | 'locations' | 'procurements' | 'receivings',
  onRefresh: () => void
}

export function DataTablePagination<TData>({
  table,
  dataType,
  onRefresh: onRefresh,
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

  const handleConfirmDisable = async() => {
    try {
      if (dataType === "items") {
        const productIds = selectedRows.map((row) => (row.original as Itempation).productId).filter(Boolean) as string[]
        if (productIds.length > 0) {
          await itemDeactive(productIds)
          console.log(`Successfully deactivated ${productIds.length} items`)
          // refresh the table data or show a success message here
        } else {
          console.warn("No valid productIds found in selected rows")
        }
      } else if (dataType === "warehouses") {
        // Handle warehouse deactivation
        const warehouseIds = selectedRows.map((row) => (row.original as Warehousepation).facilityId).filter(Boolean) as string[]
        if (warehouseIds.length > 0) {
          await warehouseDeactive(warehouseIds)
          console.log(`Successfully deactivated ${warehouseIds.length} items`)
        } else {
          console.warn("No valid warehouseIds found in selected rows")
        }
      } else if (dataType === "locations") {
        // Handle location deactivation
        const locationsByFacility = selectedRows.reduce(
          (acc, row) => {
            const location = row.original as Locationpation
            if (location.facilityId && location.locationSeqId) {
              if (!acc[location.facilityId]) {
                acc[location.facilityId] = []
              }
              acc[location.facilityId].push(location.locationSeqId)
            }
            return acc
          },
          {} as Record<string, string[]>,
        )

        for (const [facilityId, locationSeqIds] of Object.entries(locationsByFacility)) {
          if (locationSeqIds.length > 0) {
            await locationDeactive(facilityId, locationSeqIds)
            console.log(`Successfully deactivated ${locationSeqIds.length} locations for facility ${facilityId}`)
          }
        }
      } else if (dataType === "vendors") {
        // Handle vendor deactivation
        const supplierIds = selectedRows.map((row) => (row.original as Vendorpation).supplierId).filter(Boolean) as string[]
        if (supplierIds.length > 0) {
          await vendorDeactive(supplierIds)
          console.log(`Successfully deactivated ${supplierIds.length} items`)
        } else {
          console.warn("No valid supplierIds found in selected rows")
        }
      }

      onRefresh()

      setShowDisableDialog(false)
    } catch (error) {
      console.error("Error deactivating items:", error)
      // You might want to show an error message to the user here
    }
  }

  const handleConfirmEnable = async() => {
    // Implement the logic to update the status of selected items to "Activated"
    try {
      if (dataType === "items") {
        const productIds = selectedRows.map((row) => (row.original as Itempation).productId).filter(Boolean) as string[]
        if (productIds.length > 0) {
          await itemActive(productIds)
          console.log(`Successfully deactivated ${productIds.length} items`)
          // refresh the table data or show a success message here
        } else {
          console.warn("No valid productIds found in selected rows")
        }
      } else if (dataType === "warehouses") {
        // Handle warehouse deactivation
        const warehouseIds = selectedRows.map((row) => (row.original as Warehousepation).facilityId).filter(Boolean) as string[]
        if (warehouseIds.length > 0) {
          await warehouseActive(warehouseIds)
          console.log(`Successfully deactivated ${warehouseIds.length} items`)
        } else {
          console.warn("No valid warehouseIds found in selected rows")
        }
      } else if (dataType === "locations") {
        // Handle location deactivation
        const locationsByFacility = selectedRows.reduce(
          (acc, row) => {
            const location = row.original as Locationpation
            if (location.facilityId && location.locationSeqId) {
              if (!acc[location.facilityId]) {
                acc[location.facilityId] = []
              }
              acc[location.facilityId].push(location.locationSeqId)
            }
            return acc
          },
          {} as Record<string, string[]>,
        )

        for (const [facilityId, locationSeqIds] of Object.entries(locationsByFacility)) {
          if (locationSeqIds.length > 0) {
            await locationActive(facilityId, locationSeqIds)
            console.log(`Successfully deactivated ${locationSeqIds.length} locations for facility ${facilityId}`)
          }
        }
      } else if (dataType === "vendors") {
        // Handle vendor deactivation
        const supplierIds = selectedRows.map((row) => (row.original as Vendorpation).supplierId).filter(Boolean) as string[]
        if (supplierIds.length > 0) {
          await vendorActive(supplierIds)
          console.log(`Successfully deactivated ${supplierIds.length} items`)
        } else {
          console.warn("No valid supplierIds found in selected rows")
        }
      }

      onRefresh()

      setShowEnableDialog(false)
    } catch (error) {
      console.error("Error deactivating items:", error)
      // You might want to show an error message to the user here
    }    
  }

  console.log('select :', selectedRows)

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
        title={`Are you sure you want to disable ${selectedRows.length} entries?`}
        description="These items will remain viewable only in the base data but will be hidden in any other modules for future entries."
        onCancel={() => setShowDisableDialog(false)}
        onConfirm={handleConfirmDisable}
      />

      <CustomAlertDialog
        open={showEnableDialog}
        onOpenChange={setShowEnableDialog}
        title={`Are you sure you want to enable ${selectedRows.length} entries?`}
        description="These items will be visible in any other modules for future entries."
        onCancel={() => setShowEnableDialog(false)}
        onConfirm={handleConfirmEnable}
      />

    </div>
  )
}
