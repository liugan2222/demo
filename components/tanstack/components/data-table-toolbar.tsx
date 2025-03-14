"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DataTableColumnSelector } from "./data-table-column-selector"

import { AddRawDialog } from "@/components/add-dialog/add-raw-dialog"
import { AddVendorDialog } from "@/components/add-dialog/add-vendor-dialog"
import { AddWarehouseDialog } from "@/components/add-dialog/add-warehouse-dialog"
import { AddLocationDialog } from "@/components/add-dialog/add-location-dialog"
import { AddPoDialog } from "@/components/add-dialog/add-po-dialog"
import { AddUserDialog } from "@/components/add-dialog/add-user-dialog"
import { AddRoleDialog } from "@/components/add-dialog/add-role-dialog"

import { useAppContext } from "@/contexts/AppContext"

interface DataTableToolbarProps<TData> {
  table: Table<TData>,
  dataType: 'items' | 'vendors' | 'warehouses' | 'locations' | 'procurements' | 'receivings' | 'users' | 'roles',
  onRefresh?: () => void
}

export function DataTableToolbar<TData>({
  table,
  dataType,
  onRefresh: onRefresh,
}: DataTableToolbarProps<TData>) {

  // Track selected columns and their filter states
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>([])
  const { userPermissions, userInfo } = useAppContext()

  const isAdmin = userInfo?.username === "admin"

  const filterColumns = () => {
    switch (dataType) {
      case 'items':
        return [{id: 'item'},{id: 'vendor'}]
      case 'warehouses':
        return [{id: 'warehouse'}]
      case 'locations':
        // , {id: 'warehouseZone'}  
        return [{id: 'warehouse'}]  
      case 'vendors': // contact name
        return [{id: 'vendor'},]
      case 'procurements':  // , {id: 'item'}
        return [{id: 'orderStatus'}]
      case 'receivings':  // receiving date
        return [{id: 'item'}] 
      case 'users':
        return [{id: 'lastName'}]
      // case 'roles':
      //   return [{id: 'role'}]       
      default:
        return []
    }
  }


  // Get all filterable columns
  const filterableColumns = React.useMemo(() => {
    // return table.getAllColumns()
    // .filter((column) => 
    //   column.id !== 'select' && 
    //   typeof column.accessorFn !== 'undefined'
    // )
    const filteredColumns = filterColumns();
    return filteredColumns  
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

  // Search bar 
  const renderSearchBar = () => {
    switch (dataType) {
      case 'items':
        return (
          <Input
            placeholder="Search Item Number"
            value={(table.getColumn("itemNumber")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("itemNumber")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full max-w-[250px]"
          />
        )
      case 'vendors':
        return (
          <Input
            placeholder="Search Vendor Number"
            value={(table.getColumn("vendorNumber")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("vendorNumber")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full max-w-[250px]"
          />
        )
      case 'warehouses':
        return (
          <Input
            placeholder="Search Warehouse Number "
            value={(table.getColumn("warehouseNumber")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("warehouseNumber")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full max-w-[250px]"
          />
        )
      case 'locations':
        return (
          <Input
            placeholder="Search Location"
            value={(table.getColumn("location")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("location")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full max-w-[250px]"
          />
        )
      case 'procurements':
        return (
          <Input
            placeholder="Search PO Number"
            value={(table.getColumn("poNumber")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("poNumber")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full max-w-[250px]"
          />
        )
      case 'receivings':
        return (
          <Input
            placeholder="Search PO Number"
            value={(table.getColumn("PO")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("PO")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full max-w-[250px]"
          />
        )
      case 'users':
        return (
          <Input
            placeholder="Search User Number"
            value={(table.getColumn("userNumber")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("userNumber")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full max-w-[250px]"
          />
        )
      case 'roles':
        return (
          <Input
            placeholder="Search Role"
            value={(table.getColumn("role")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("role")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full max-w-[250px]"
          />
        )             
      default:
        return null
    }
  }

  // Add dialog 
  const renderAddDialog = () => {
    if (isAdmin) {
      switch (dataType) {
        case 'items':
          return <AddRawDialog onAdded={onRefresh || (() => {})} />
        case 'vendors':
          return <AddVendorDialog onAdded={onRefresh || (() => {})} />
        case 'warehouses':
          return <AddWarehouseDialog onAdded={onRefresh || (() => {})} />
        case 'locations':
          return <AddLocationDialog onAdded={onRefresh || (() => {})} />
        case 'procurements':
          return <AddPoDialog onAdded={onRefresh || (() => {})} />
        case 'users':  
          return <AddUserDialog onAdded={onRefresh || (() => {})} />
        case 'roles':  
          return <AddRoleDialog onAdded={onRefresh || (() => {})} />       
        default:
          return null
      }
    } else {
      if (userPermissions.includes('Items_Create') && dataType === 'items') {
        return <AddRawDialog onAdded={onRefresh || (() => {})} />
      } else if (userPermissions.includes('Vendors_Create') && dataType === 'vendors') {
        return <AddVendorDialog onAdded={onRefresh || (() => {})} />
      } else if (userPermissions.includes('Warehouses_Create') && dataType === 'warehouses') {
        return <AddWarehouseDialog onAdded={onRefresh || (() => {})} />
      } else if (userPermissions.includes('Locations_Create') && dataType === 'locations') {
        return <AddLocationDialog onAdded={onRefresh || (() => {})} />
      } else if (userPermissions.includes('Procurement_Create') && dataType === 'procurements') {
        return <AddPoDialog onAdded={onRefresh || (() => {})} />
      } else if (userPermissions.includes('Users_Create') && dataType === 'users') {
        return <AddUserDialog onAdded={onRefresh || (() => {})} />
      } else if (userPermissions.includes('Roles_Create') && dataType === 'roles') {
        return <AddRoleDialog onAdded={onRefresh || (() => {})} />
      } else {
        return null
      }
    }
  } 

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* <Input
          placeholder="Search ID"
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="h-8 w-full max-w-[250px]"
        /> */}

        {renderSearchBar()}
        
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
            Reset
          </Button>
        )}
      </div>
      <div className="px-2">
        <DataTableViewOptions  table={table} />
      </div>

      {renderAddDialog()}
    </div>
  )
}
