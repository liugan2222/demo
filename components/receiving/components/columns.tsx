"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"

import "@/app/globals.css";

import { Receivepation } from '@/components/tanstack/schema/pationSchema/receivepationSchema'
import { DataTableColumnHeader } from "@/components/tanstack/components/data-table-column-header"

export const columns: ColumnDef<Receivepation>[] = [

  {
    accessorKey: "receivingNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Receiving Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("receivingNumber")}</div>,
    size: 200,
    minSize: 100,
    enableResizing: true,
  },

  {
    accessorKey: "PO",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PO Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("PO")}</div>,
    size: 240,
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
    accessorKey: "receivingDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Receiving Date" />
    ),
    filterFn: (row, columnId, filterValue) => {
      const rowDateStr = row.getValue(columnId) as string;
      if (!rowDateStr) return false;
      
      const rowDate = new Date(rowDateStr);
      if (isNaN(rowDate.getTime())) return false;

      // 解析过滤值
      const { from, to } = filterValue || {};
      if (!from && !to) return true;

      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      return (
        (!fromDate || rowDate >= fromDate) &&
        (!toDate || rowDate <= toDate)
      );
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("receivingDate") as string
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
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <div><Badge variant="outline" className={status === "DRAFTED" ? "badge-page badge-notFulfilled" : "badge-page badge-fullfilled"}>{row.getValue("status")}</Badge></div>
      );
    },
    size: 120,
    minSize: 100,
    maxSize: 120,
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
