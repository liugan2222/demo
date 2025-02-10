"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { Locationpation } from "@/components/tanstack/schema/pationSchema/locationpationSchema"
import { DataTableColumnHeader } from "@/components/tanstack/components/data-table-column-header"
// import { DataTableRowActions } from "@/components/tanstack/components/data-table-row-actions"

export const columns: ColumnDef<Locationpation>[] = [
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
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => <div>{row.getValue("location")}</div>,
    size: 240,
    minSize: 150,
  },

  {
    accessorKey: "locationNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("locationNumber")}</div>,
    size: 300,
    minSize: 100,
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <div>{row.getValue("status")==="Active" ? <Badge variant="default">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</div>,
    size: 240,
    minSize: 100,
  },

  {
    accessorKey: "warehouse",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Warehouse" />
    ),
    cell: ({ row }) => <div>{row.getValue("warehouse")}</div>,
    size: 600,
    minSize: 150,
  }
 
]
