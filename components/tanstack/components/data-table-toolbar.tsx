"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
// import { Calendar } from "lucide-react"
// import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DataTableColumnSelector } from "./data-table-column-selector"

// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Calendar as CalendarComponent } from "@/components/ui/calendar"

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
  const [openFilterId, setOpenFilterId] = React.useState<string | null>(null)

  const { userPermissions, userInfo } = useAppContext()

  const isAdmin = userInfo?.username === "admin"

  const filterColumns = () => {
    switch (dataType) {
      case 'items':
        return [{id: 'item'},{id: 'vendor'},{id: 'status'}]
      case 'warehouses':
        return [{id: 'warehouse'},{id: 'status'}]
      case 'locations':
        return [{id: 'warehouse'},{id: 'status'}]  
      case 'vendors': // contact name
        return [{id: 'vendor'},{id: 'status'}]
      case 'procurements':  // , {id: 'item'}
        return [{id: 'orderStatus'}]
      case 'receivings':  // receiving date
        return []
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
    setOpenFilterId(columnId) // Open the filter dropdown immediately
  }

  // Handle removing a column filter
  const handleRemoveColumnFilter = (columnId: string) => {
    setSelectedColumns((prev) => prev.filter((id) => id !== columnId))
    table.getColumn(columnId)?.setFilterValue(undefined)
    setOpenFilterId(null)
  }

  // Reset all filters
  const handleResetFilters = () => {
    table.resetColumnFilters()
    setSelectedColumns([])

    // 如果是receivings类型，也重置日期范围
    // if (dataType === "receivings") {
    //   setDateRange({ from: undefined, to: undefined })
    // }
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

  // const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
  //   from: undefined,
  //   to: undefined,
  // })

  // // Function to handle date selection
  // const handleDateSelect = (selectedDate: Date | undefined) => {
  //   if (selectedDate) {
  //     setDateRange((prev) => {
  //       if (!prev.from) {
  //         return { from: selectedDate, to: undefined }
  //       } else if (!prev.to && selectedDate > prev.from) {
  //         return { ...prev, to: selectedDate }
  //       } else {
  //         return { from: selectedDate, to: undefined }
  //       }
  //     })
  //   }
  // }

  // // Effect to apply date range filter
  // React.useEffect(() => {
  //   if (dataType === "receivings") {
  //     const dateColumn = table.getColumn("receivingDate")
  //     if (dateColumn) {
  //       if (dateRange.from && dateRange.to) {
  //         // 设置自定义过滤函数
  //         dateColumn.setFilterValue((row) => {
  //           const rowDate = row ? new Date(row as string) : null
  //           if (!rowDate) return false

  //           // // 确保日期在选定范围内
  //           // let fromDate: Date | null = null
  //           // let toDate: Date | null = null
  //           // if (dateRange.from) {
  //           //   fromDate = new Date(dateRange.from)
  //           // }
  //           // if (dateRange.to) {
  //           //   toDate = new Date(dateRange.to)
  //           // }
  //           if (dateRange.from && dateRange.to) {
  //             const fromDate = new Date(dateRange.from)
  //             fromDate.setHours(0, 0, 0, 0)
  
  //             const toDate = new Date(dateRange.to)
  //             toDate.setHours(23, 59, 59, 999)
  
  //             return rowDate >= fromDate && rowDate <= toDate
  //           } else {
  //             return false
  //           }
  //         })
  //       } else {
  //         // 如果没有日期范围，清除过滤器
  //         dateColumn.setFilterValue(undefined)
  //       }
  //     }
  //   }
  // }, [dataType, dateRange, table])

  // // Render date range component
  // const renderDateRangeComponent = () => {
  //   if (dataType !== "receivings") return null

  //   return (
  //     <Popover>
  //       <PopoverTrigger asChild>
  //         <Button variant="outline" className="h-8 border-dashed">
  //           <Calendar className="mr-2 h-4 w-4" />
  //           {dateRange.from ? (
  //             dateRange.to ? (
  //               <>
  //                 {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
  //               </>
  //             ) : (
  //               format(dateRange.from, "MMM dd, yyyy")
  //             )
  //           ) : (
  //             <span>Pick a date range</span>
  //           )}
  //         </Button>
  //       </PopoverTrigger>
  //       <PopoverContent className="w-auto p-0" align="start">
  //         <div className="p-2">
  //           <CalendarComponent
  //             mode="range"
  //             selected={{ from: dateRange.from, to: dateRange.to }}
  //             onSelect={(range) => {
  //               setDateRange({
  //                 from: range?.from,
  //                 to: range?.to,
  //               })

  //               // 如果用户清除了日期选择，也清除过滤器
  //               if (!range?.from || !range?.to) {
  //                 table.getColumn("receivingDate")?.setFilterValue(undefined)
  //               }
  //             }}
  //             numberOfMonths={2}
  //           />
  //           <div className="mt-4 flex justify-end gap-2">
  //             <Button
  //               variant="outline"
  //               size="sm"
  //               onClick={() => {
  //                 setDateRange({ from: undefined, to: undefined })
  //                 table.getColumn("receivingDate")?.setFilterValue(undefined)
  //               }}
  //             >
  //               Clear
  //             </Button>
  //             <Button
  //               size="sm"
  //               onClick={() => {
  //                 if (dateRange.from && dateRange.to) {
  //                   // 应用过滤器
  //                   const dateColumn = table.getColumn("receivingDate")
  //                   if (dateColumn) {
  //                     dateColumn.setFilterValue((row) => {
  //                       const rowDate = row ? new Date(row as string) : null
  //                       if (!rowDate) return false

  //                       // 确保日期在选定范围内
  //                       const fromDate = new Date(dateRange.from!)
  //                       fromDate.setHours(0, 0, 0, 0)

  //                       const toDate = new Date(dateRange.to!)
  //                       toDate.setHours(23, 59, 59, 999)

  //                       return rowDate >= fromDate && rowDate <= toDate
  //                     })
  //                   }
  //                 }
  //               }}
  //             >
  //               Apply
  //             </Button>
  //           </div>
  //         </div>
  //       </PopoverContent>
  //     </Popover>
  //   )
  // }


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
              isOpen={openFilterId === columnId}
              onOpenChange={(open) => {
                if (open) {
                  setOpenFilterId(columnId)
                } else {
                  setOpenFilterId(null)
                }
              }}
            />
          )
        })}     

        {/* TODO 日期查询组件 */}
        {/* {renderDateRangeComponent()} */}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-8 px-2 lg:px-3 text-green-700"
          >
            {/* <X /> */}
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
