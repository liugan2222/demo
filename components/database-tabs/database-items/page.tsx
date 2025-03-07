'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { z } from "zod"

import { itempationSchema } from '@/components/tanstack/schema/pationSchema/itempationSchema'
import { columns } from "@/components/database-tabs/database-items/components/columns"
import { DataTable } from "@/components/tanstack/components/data-table"

import { getItems } from '@/lib/api';

// Type for our items
type Item = z.infer<typeof itempationSchema>

export function DatabaseItems() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  // const fetchItems = useCallback(async () => {
  //   setIsLoading(true)
  //   // console.log('select items')
  //   fetch('/json/items.json')
  //     .then(res => res.json())
  //     .then(data => {
  //       try {
  //         const parsedItems = z.array(itemSchema).parse(data)
  //         setItems(parsedItems)
  //       } catch (e) {
  //         if (e instanceof z.ZodError) {
  //           setError('Data validation failed: ' + e.message)
  //         } else {
  //           setError('An unexpected error occurred')
  //         }
  //       }
  //     })
  //     .catch(err => {
  //       setError('Failed to fetch items: ' + err.message)
  //     })
  //     .finally(() => {
  //       setIsLoading(false)
  //     })
  // }, [])

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getItems()
      const parsedItems = z.array(itempationSchema).parse(data);
      setItems(parsedItems);
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
    fetchItems()
  }, [fetchItems]); 

  const getRowId = useCallback((row: Item) => row.id || '', [])

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-4">
      {/* <DataTable data={items} columns={columns} dataType='items'
        stickyColumns={{
          columns: ['select', 'image', 'id'],
          width: 100
        }}
      /> */}
      <DataTable data={items} columns={columns} dataType='items' onRefresh={fetchItems} getRowId={getRowId}/>
    </div>
  )
}

