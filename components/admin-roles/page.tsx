'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { z } from "zod"

import { rolepationSchema } from '@/components/tanstack/schema/pationSchema/rolepationSchema'
import { columns } from "@/components/admin-roles/components/columns"
import { DataTable } from "@/components/tanstack/components/data-table"

import { getRoles } from '@/lib/api';

// Type for roles
type Role = z.infer<typeof rolepationSchema>

export function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getRoles()
      const parsedItems = z.array(rolepationSchema).parse(data);
      setRoles(parsedItems);
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
    fetchRoles()
  }, [fetchRoles]); 

  const getRowId = useCallback((row: Role) => row.id || '', [])

  if (isLoading) {
    return <div className="p-5">Loading...</div>
  }

  if (error) {
    return <div className="p-5 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-11">
      <DataTable data={roles} columns={columns} dataType='roles'  onRefresh={fetchRoles} getRowId={getRowId}/>
    </div>
  )
}

