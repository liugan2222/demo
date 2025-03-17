"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
// import { Checkbox } from "@/components/ui/checkbox"

import "@/app/globals.css";

import { Rolepation } from '@/components/tanstack/schema/pationSchema/rolepationSchema'
import { DataTableColumnHeader } from "@/components/tanstack/components/data-table-column-header"

export const columns: ColumnDef<Rolepation>[] = [

  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => <div>{row.getValue("role")}</div>,
    size: 260,
    minSize: 100,
    // enableResizing: true,
  },

  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => <div className="truncate-2-lines">{row.getValue("description")}</div>,
    size: 350,
    minSize: 100,
    // enableResizing: true,
  },

  {
    accessorKey: "permissions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Permissions" />
    ),
    cell: ({ row }) => <div className="truncate-2-lines">{row.getValue("permissions")}</div>,
    size: 650,
    minSize: 100,
    // enableResizing: true,
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <div><Badge variant="outline" className={status === "Disabled" ? "badge-page badge-disabled" : "badge-page badge-fullfilled"}>{row.getValue("status")}</Badge></div>
      );
    },
    size: 120,
    minSize: 100,
    maxSize: 120,
  }
]
