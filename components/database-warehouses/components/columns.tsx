"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import "@/app/globals.css";

import { Warehousepation } from '@/components/tanstack/schema/pationSchema/warehousepationSchema'
import { DataTableColumnHeader } from "@/components/tanstack/components/data-table-column-header"

export const columns: ColumnDef<Warehousepation>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  },

  {
    accessorKey: "warehouse",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Warehouse" />
    ),
    cell: ({ row }) => <div>{row.getValue("warehouse")}</div>,
    size: 450,
    minSize: 150,
  },

  {
    accessorKey: "warehouseNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Warehouse Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("warehouseNumber")}</div>,
    size: 200,
    minSize: 100,
  },  

  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => <div>{row.getValue("address")}</div>,
    size: 500,
    minSize: 100,
  },  

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <div>{row.getValue("status")==="Activated" ? <Badge variant="outline" className="badge-page badge-activated">Activated</Badge> : <Badge variant="outline" className="badge-page badge-disabled">Disabled</Badge>}</div>,
    size: 200,
    minSize: 100,
  }
 
]
