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
  },
  {
    accessorKey: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("image")}</div>,
    enableSorting: false,
    enableHiding: false,
  }, 
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    // enableSorting: false,
    // enableHiding: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div className="max-w-[100px]">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "gtin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GTIN" />
    ),
    cell: ({ row }) => <div className="max-w-[100px]">{row.getValue("gtin")}</div>,
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
    cell: ({ row }) => <div className="max-w-[100px]">{row.getValue("weight")}</div>,
  },
  {
    accessorKey: "vendor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => <div className="max-w-[100px]">{row.getValue("vendor")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <div className="max-w-[100px]">{row.getValue("status")==="Activated" ? <Badge variant="default">{row.getValue("status")}</Badge> : <Badge variant="destructive">{row.getValue("status")}</Badge>}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CreatedAt" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      const formattedDate = date.toLocaleString(); // Or use any other date formatting method
      return <div className="max-w-[150px]">{formattedDate}</div>;
    },
  }, 

  // {
  //   id: "actions",
  //   cell: ({ row }) => <DataTableRowActions row={row} />,
  // },
]
