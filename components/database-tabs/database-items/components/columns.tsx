"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { Item } from "@/components/tanstack/data/itemSchema"
import { DataTableColumnHeader } from "@/components/tanstack/components/data-table-column-header"
// import { DataTableRowActions } from "@/components/tanstack/components/data-table-row-actions"

export const columns: ColumnDef<Item>[] = [
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
    accessorKey: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => row.getValue("image"),
    enableSorting: false,
    enableHiding: false,
    size: 100,
    minSize: 100,
    maxSize: 100,
  }, 
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => row.getValue("id"),
    // enableSorting: false,
    // enableHiding: false,
    size: 100,
    minSize: 100,
    maxSize: 100,
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => row.getValue("name"),
    size: 'auto',
    minSize: 100,
  },
  {
    accessorKey: "gtin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GTIN" />
    ),
    cell: ({ row }) => row.getValue("gtin"),
    size: 100,
    minSize: 100,
    maxSize: 100,
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
    cell: ({ row }) => row.getValue("weight"),
    size: 'auto',
    minSize: 100,
  },
  {
    accessorKey: "vendor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => row.getValue("vendor"),
    size: 'auto',
    minSize: 100,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {row.getValue("status")==="Activated" ? <Badge variant="default">{row.getValue("status")}</Badge> : <Badge variant="destructive">{row.getValue("status")}</Badge>},
    size: 100,
    minSize: 100,
    maxSize: 100,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CreatedAt" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      const formattedDate = date.toLocaleString(); // Or use any other date formatting method
      return <div className="min-w-[150px]">{formattedDate}</div>;
    },
    size: 'auto',
    minSize: 100,
  }, 
]
