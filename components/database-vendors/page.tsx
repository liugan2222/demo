'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { z } from "zod"

import { vendorpationSchema } from '@/components/tanstack/schema/pationSchema/vendorpationSchema'
import { columns } from "@/components/database-vendors/components/columns"
import { DataTable } from "@/components/tanstack/components/data-table"

import { getVendors } from '@/lib/api';

// Type for our vendors
type Vendor = z.infer<typeof vendorpationSchema>

export function DatabaseVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVendors = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getVendors()
      const parsedItems = z.array(vendorpationSchema).parse(data);
      setVendors(parsedItems);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError('Data validation failed: ' + e.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors]);

  const getRowId = useCallback((row: Vendor) => row.id || '', [])

  if (isLoading) {
    return <div className="p-11">Loading...</div>
  }

  if (error) {
    return <div className="p-11 text-red-500">Error: {error}</div>
  }

  // if (vendors.length === 0) {
  //   return <div className="p-11">No vendors found.</div>;
  // }

  

  return (
    <div className="p-11">
      {/* <DataTable data={vendors} columns={columns} dataType='vendors'
        stickyColumns={{
          columns: ['select', 'image', 'id'],
          width: 100
        }}
      /> */}
      <DataTable data={vendors} columns={columns} dataType='vendors' onRefresh={fetchVendors} getRowId={getRowId} />
    </div>
  )
}

