'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { z } from "zod"

import { locationpationSchema } from '@/components/tanstack/schema/pationSchema/locationpationSchema'
import { columns } from "@/components/database-locations/components/columns"
import { DataTable } from "@/components/tanstack/components/data-table"

import { getLocations } from '@/lib/api';

// Type for our locations
type Location = z.infer<typeof locationpationSchema>

export function DatabaseLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // const fetchLocations = useCallback(async () => {
  //   setIsLoading(true)
  //   // console.log('select locations')
  //   fetch('/json/locations.json')
  //     .then(res => res.json())
  //     .then(data => {
  //       try {
  //         const parsedItems = z.array(locationSchema).parse(data)
  //         setLocations(parsedItems)
  //       } catch (e) {
  //         if (e instanceof z.ZodError) {
  //           setError('Data validation failed: ' + e.message)
  //         } else {
  //           setError('An unexpected error occurred')
  //         }
  //       }
  //     })
  //     .catch(err => {
  //       setError('Failed to fetch locations: ' + err.message)
  //     })
  //     .finally(() => {
  //       setIsLoading(false)
  //     })
  // }, [])

  const fetchLocations = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getLocations()
      const parsedItems = z.array(locationpationSchema).parse(data);
      setLocations(parsedItems);
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
    fetchLocations()
  }, [fetchLocations]); 

  const getRowId = useCallback((row: Location) => row.id || '', [])

  if (isLoading) {
    return <div className="p-11">Loading...</div>
  }

  if (error) {
    return <div className="p-11 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-11">
      {/* <DataTable data={locations} columns={columns} dataType='locations'
        stickyColumns={{
          columns: ['select', 'image', 'id'],
          width: 100
        }}
      /> */}
      <DataTable data={locations} columns={columns} dataType='locations' onRefresh={fetchLocations} getRowId={getRowId}/>
    </div>
  )
}

