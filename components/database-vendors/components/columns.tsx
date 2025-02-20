"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import "@/app/globals.css";

import { Vendorpation } from '@/components/tanstack/schema/pationSchema/vendorpationSchema'

import { DataTableColumnHeader } from "@/components/tanstack/components/data-table-column-header"

export const columns: ColumnDef<Vendorpation>[] = [
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

  // {
  //   accessorKey: "id",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="ID" />
  //   ),
  //   cell: ({ row }) => <div  style={{ display: 'none' }}>{row.getValue("id")}</div>,
  // },

  // vendorNumber
  {
    accessorKey: "vendorNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("vendorNumber")}</div>,
    size: 240,
    minSize: 150,
  }, 

  {
    accessorKey: "vendor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => <div>{row.getValue("vendor")}</div>,
    size: 550,
    minSize: 100,
  },

  // fullName
  // address

  {
    accessorKey: "tel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tel" />
    ),
    cell: ({ row }) => <div>{row.getValue("tel")}</div>,
    size: 350,
    minSize: 100,
  }, 

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <div>{row.getValue("status")==="Activated" ? <Badge variant="outline" className="badge-page badge-activated">Activated</Badge> : <Badge variant="outline" className="badge-page badge-disabled">Disabled</Badge>}</div>,
    size: 240,
    minSize: 100,
  }, 

  // taxID
  // type
  // bankAccountInformation
  // certificationCodes
  // relationship
  // tradePartnerAgreementNumber
  // website
  // contactName
  // contactRole
  // contactEmail
  // contactPhone
  

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
  //     const formattedDate = date.toLocaleString(); // Or use any other date formatting method
  //     return <div>{formattedDate}</div>;
  //   },
  //   size: 160,
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
  //     const formattedDate = date.toLocaleString(); // Or use any other date formatting method
  //     return <div>{formattedDate}</div>;
  //   },
  //   size: 160,
  //   minSize: 100,
  //   enableResizing: true,
  // }, 
]
