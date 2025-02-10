"use client"

import { ColumnDef } from "@tanstack/react-table"

// import { Badge } from "@/components/ui/badge"
// import { Checkbox } from "@/components/ui/checkbox"

import { Popation } from '@/components/tanstack/schema/pationSchema/popationSchema'
import { DataTableColumnHeader } from "@/components/tanstack/components/data-table-column-header"

export const columns: ColumnDef<Popation>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  //   size: 40,
  //   minSize: 40,
  //   maxSize: 40,
  // },

  {
    accessorKey: "poNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PO Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("poNumber")}</div>,
    size: 300,
    minSize: 100,
    enableResizing: true,
  },

  {
    accessorKey: "vendor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => <div>{row.getValue("vendor")}</div>,
    size: 400,
    minSize: 100,
    enableResizing: true,
  },

  {
    accessorKey: "orderDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("orderDate") as Date;
      const formattedDate = date.toLocaleString(); 
      return <div>{formattedDate}</div>;
    },
    size: 430,
    minSize: 100,
    enableResizing: true,
  }, 

  {
    accessorKey: "orderStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Status" />
    ),
    cell: ({ row }) => <div>{row.getValue("orderStatus")}</div>,
    size: 300,
    minSize: 150,
    enableResizing: true,
  }, 



  // {
  //   accessorKey: "item",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Item" />
  //   ),
  //   cell: ({ row }) => <div>{row.getValue("item")}</div>,
  //   size: 100,
  //   minSize: 100,
  //   enableResizing: true,
  // }
]
