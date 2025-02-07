'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { z } from "zod"

import { popationSchema } from '@/components/tanstack/schema/pationSchema/popationSchema'
import { columns } from "@/components/procurement/components/columns"
import { DataTable } from "@/components/tanstack/components/data-table"

import { getPos } from '@/lib/api';

// Type for our Procurements
type Po = z.infer<typeof popationSchema>

export function Procurement() {
  const [procurements, setProcurements] = useState<Po[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProcurements = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getPos()
      const parsedItems = z.array(popationSchema).parse(data);
      setProcurements(parsedItems);
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
    fetchProcurements()
  }, [fetchProcurements]); 

  if (isLoading) {
    return <div className="p-5">Loading...</div>
  }

  if (error) {
    return <div className="p-5 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-12">
      <DataTable data={procurements} columns={columns} dataType='procurements'  onRefresh={fetchProcurements}/>
    </div>
  )
}

