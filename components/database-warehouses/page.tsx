'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { z } from "zod"

import { warehousepationSchema } from '@/components/tanstack/schema/pationSchema/warehousepationSchema'
import { columns } from "@/components/database-warehouses/components/columns"
import { DataTable } from "@/components/tanstack/components/data-table"

import { getWarehouses } from '@/lib/api';

// Type for our warehouses
type Warehouse = z.infer<typeof warehousepationSchema>

export function DatabaseWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // const fetchWarehouses = useCallback(async () => {
  //   setIsLoading(true)
  //   // console.log('select warehouses')
  //   fetch('/json/warehouses.json')
  //     .then(res => res.json())
  //     .then(data => {
  //       try {
  //         const parsedItems = z.array(warehouseSchema).parse(data)
  //         setWarehouses(parsedItems)
  //       } catch (e) {
  //         if (e instanceof z.ZodError) {
  //           setError('Data validation failed: ' + e.message)
  //         } else {
  //           setError('An unexpected error occurred')
  //         }
  //       }
  //     })
  //     .catch(err => {
  //       setError('Failed to fetch warehouses: ' + err.message)
  //     })
  //     .finally(() => {
  //       setIsLoading(false)
  //     })
  // }, [])

  const fetchWarehouses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getWarehouses()
      const parsedItems = z.array(warehousepationSchema).parse(data);
      setWarehouses(parsedItems);
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
    fetchWarehouses()
  }, [fetchWarehouses]); 

  const getRowId = useCallback((row: Warehouse) => row.id || '', [])

  if (isLoading) {
    return <div className="p-5">Loading...</div>
  }

  if (error) {
    return <div className="p-11 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-5">
      {/* <DataTable data={warehouses} columns={columns} dataType='warehouses'
        stickyColumns={{
          columns: ['select', 'image', 'id'],
          width: 100
        }}
      /> */}
      <DataTable data={warehouses} columns={columns} dataType='warehouses'  onRefresh={fetchWarehouses} getRowId={getRowId} />
    </div>
  )
}

