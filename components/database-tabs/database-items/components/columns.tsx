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
    cell: ({ row }) => <div>{row.getValue("image")}</div>,
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
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
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
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
    size: 200,
    minSize: 100,
    enableResizing: true,
  },
  {
    accessorKey: "gtin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GTIN" />
    ),
    cell: ({ row }) => <div>{row.getValue("gtin")}</div>,
    size: 150,
    minSize: 100,
    maxSize: 150,
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
    cell: ({ row }) => <div>{row.getValue("weight")}</div>,
    size: 120,
    minSize: 100,
    enableResizing: true,
  },
  {
    accessorKey: "vendor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => <div>{row.getValue("vendor")}</div>,
    size: 150,
    minSize: 100,
    enableResizing: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <div>{row.getValue("status")==="Activated" ? <Badge variant="default">{row.getValue("status")}</Badge> : <Badge variant="destructive">{row.getValue("status")}</Badge>}</div>,
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
      return <div>{formattedDate}</div>;
    },
    size: 150,
    minSize: 100,
    enableResizing: true,
  }, 
]
