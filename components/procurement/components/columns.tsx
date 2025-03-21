"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
// import { Checkbox } from "@/components/ui/checkbox"

import "@/app/globals.css";

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
    size: 350,
    minSize: 100,
    enableResizing: true,
  },

  {
    accessorKey: "vendor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => <div>{row.getValue("vendor")}</div>,
    size: 450,
    minSize: 100,
    enableResizing: true,
  },

  {
    accessorKey: "orderDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Date" />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue("orderDate") as string
      if (!dateStr) return <div>-</div>

      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return <div>Invalid date</div>

      const formattedDate = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }).format(date)

      // Convert "02/10/2025, 10:00 AM" to "10:00 AM, 02/10/2025"
      const [datePart, timePart] = formattedDate.split(", ")
      return <div>{`${timePart}, ${datePart}`}</div>
    },
    size: 300,
    minSize: 100,
    enableResizing: true,
  }, 

  {
    accessorKey: "orderStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("orderStatus");
      return (
        <div><Badge variant="outline" className={status === "NOT_FULFILLED" ? "badge-page badge-notFulfilled" : (status  === "PARTIALLY_FULFILLED" ? "badge-page badge-partiallyFulfilled" : "badge-page badge-fullfilled")}>{row.getValue("orderStatus")}</Badge></div>
      );
    },
    size: 300,
    minSize: 150,
    enableResizing: true,
  }, 

]
