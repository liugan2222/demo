"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { Itempation } from "@/components/tanstack/schema/pationSchema/itempationSchema"
import { DataTableColumnHeader } from "@/components/tanstack/components/data-table-column-header"
// import { DataTableRowActions } from "@/components/tanstack/components/data-table-row-actions"

export const columns: ColumnDef<Itempation>[] = [
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

  // TODO item Image

  {
    accessorKey: "item",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item" />
    ),
    cell: ({ row }) => <div>{row.getValue("item")}</div>,
    size: 500,
    minSize: 150,
  },

  {
    accessorKey: "gtin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GTIN" />
    ),
    cell: ({ row }) => <div>{row.getValue("gtin")}</div>,
    size: 500,
    minSize: 150,
  },    

  {
    accessorKey: "vendor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => <div>{row.getValue("vendor")}</div>,
    size: 500,
    minSize: 150,
  },

  {
    accessorKey: "itemNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("itemNumber")}</div>,
    size: 200,
    minSize: 100,
    // enableResizing: true,  aoto column width but unusing now
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

  // {
  //   accessorKey: "createdBy",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Created By" />
  //   ),
  //   cell: ({ row }) => <div>{row.getValue("createdBy")}</div>,
  //   size: 100,
  //   minSize: 100,
  //   enableResizing: true,
  // }, 

  // {
  //   accessorKey: "createdAt",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Created At" />
  //   ),
  //   cell: ({ row }) => {
  //     const date = row.getValue("createdAt") as Date;
  //     const formattedDate = date.toLocaleString();
  //     return <div>{formattedDate}</div>;
  //   },
  //   size: 150,
  //   minSize: 100,
  //   enableResizing: true,
  // }, 

  // {
  //   accessorKey: "modifiedBy",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Modified By" />
  //   ),
  //   cell: ({ row }) => <div>{row.getValue("modifiedBy")}</div>,
  //   size: 100,
  //   minSize: 100,
  //   enableResizing: true,
  // }, 

  // {
  //   accessorKey: "modifiedAt",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Modified At" />
  //   ),
  //   cell: ({ row }) => {
  //     const date = row.getValue("modifiedAt") as Date;
  //     const formattedDate = date.toLocaleString();
  //     return <div>{formattedDate}</div>;
  //   },
  //   size: 150,
  //   minSize: 100,
  //   enableResizing: true,
  // }, 
]
