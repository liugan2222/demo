"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"

import "@/app/globals.css";

import { Userpation } from '@/components/tanstack/schema/pationSchema/userpationSchema'
import { DataTableColumnHeader } from "@/components/tanstack/components/data-table-column-header"

export const columns: ColumnDef<Userpation>[] = [

  {
    accessorKey: "userNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("userNumber")}</div>,
    size: 260,
    minSize: 100,
    enableResizing: true,
  },

  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
    size: 200,
    minSize: 100,
    enableResizing: true,
  },

  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
    size: 200,
    minSize: 100,
    enableResizing: true,
  },

  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
    size: 400,
    minSize: 100,
    enableResizing: true,
  },

  {
    accessorKey: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roles" />
    ),
    cell: ({ row }) => <div className="truncate-2-lines">{row.getValue("roles")}</div>,
    size: 600,
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
        <div><Badge variant="outline" className={status === "Disabled" ? "badge-page badge-disabled" : "badge-page badge-fullfilled"}>{row.getValue("status")}</Badge></div>
      );
    },
    size: 200,
    minSize: 150,
    enableResizing: true,
  }
]
