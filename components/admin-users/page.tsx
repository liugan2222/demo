'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { z } from "zod"

import { userpationSchema } from '@/components/tanstack/schema/pationSchema/userpationSchema'
import { columns } from "@/components/admin-users/components/columns"
import { DataTable } from "@/components/tanstack/components/data-table"

import { getUsers } from '@/lib/api';

// Type for our Users
export type User = z.infer<typeof userpationSchema>

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getUsers()
      const parsedItems = z.array(userpationSchema).parse(data);
      setUsers(parsedItems);
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
    fetchUsers()
  }, [fetchUsers]); 

  const getRowId = useCallback((row: User) => row.id || '', [])

  if (isLoading) {
    return <div className="p-5">Loading...</div>
  }

  if (error) {
    return <div className="p-5 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-11">
      <DataTable data={users} columns={columns} dataType='users'  onRefresh={fetchUsers} getRowId={getRowId}/>
    </div>
  )
}

