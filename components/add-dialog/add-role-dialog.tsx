"use client"

import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Plus } from "lucide-react"

import { roleformSchema, Roleform } from '@/components/tanstack/schema/formSchema/roleformSchema'

import { PermissionsTree } from "@/components/add-dialog/components/role/permissions-tree"

import { addRole, refresh_csrf } from '@/lib/api';

const createEmptyRole = () => ({
  role: '',
  description: '',
  permissions: [] as string[],
});

interface AddDialogProps {
  onAdded: () => void;
}

export function AddRoleDialog({ onAdded: onAdded }: AddDialogProps) {

  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof roleformSchema>>({
    resolver: zodResolver(roleformSchema),
    defaultValues: createEmptyRole(),
  })

  async function onSubmit(data: Roleform) {
    try {
      // Add API call 
      const X_CSRF_Token = await refresh_csrf('/group-management')
      if (X_CSRF_Token) {
        // const newRole = {
        //   ...data,
        //   permissions: data.permissions?.filter(perm => perm.includes('_')), 
        // }
        await addRole(data)
        onAdded()
      } else {
        console.error("Error:", 'Failed to get token')
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleClose = () => {
    setOpen(false);
    form.reset(createEmptyRole());
  };  

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add role
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add role</DialogTitle>
            {/* <DialogDescription>
              Add a new purchase order with one or more items.
            </DialogDescription> */}
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="groupName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ScrollArea className="h-[50vh] pr-4">
                {/* Permissions */}
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Permissions<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <PermissionsTree 
                          value={field.value ?? []} 
                          onValueChange={(value) => {
                            // 处理函数式更新
                            if (typeof value === 'function') {
                              field.onChange(value(field.value ?? []));
                            } else {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ScrollArea>
              
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Add..." : "Add"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  )
}

