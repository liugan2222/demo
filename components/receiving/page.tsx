'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { z } from "zod"

import { receivepationSchema } from '@/components/tanstack/schema/pationSchema/receivepationSchema'
import { columns } from "@/components/receiving/components/columns"
import { DataTable } from "@/components/tanstack/components/data-table"

import { getReceives } from '@/lib/api';

// Type for our Procurements
type Receive = z.infer<typeof receivepationSchema>

export function Receiving() {
  const [receives, setReceives] = useState<Receive[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReceives = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getReceives()
      const parsedItems = z.array(receivepationSchema).parse(data);
      setReceives(parsedItems);
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
    fetchReceives()
  }, [fetchReceives]); 

  const getRowId = useCallback((row: Receive) => row.id || '', [])

  if (isLoading) {
    return <div className="p-5">Loading...</div>
  }

  if (error) {
    return <div className="p-5 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-11">
      <DataTable data={receives} columns={columns} dataType='receivings'  onRefresh={fetchReceives} getRowId={getRowId}/>
    </div>
  )
}

