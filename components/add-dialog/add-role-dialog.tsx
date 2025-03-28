"use client"

import React, { useState, useCallback, useRef } from 'react'
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
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Plus, AlertCircle } from "lucide-react"

import { roleformSchema, Roleform } from '@/components/tanstack/schema/formSchema/roleformSchema'

import { PermissionsTree } from "@/components/add-dialog/components/role/permissions-tree"
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/common/info-alert-dialog"

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
  const [formError, setFormError] = useState<string | null>(null)

  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  // Create refs for all form fields to manage tab navigation
  const formFieldRefs = useRef<Record<string, HTMLElement | null>>({})

  const form = useForm<z.infer<typeof roleformSchema>>({
    resolver: zodResolver(roleformSchema),
    defaultValues: createEmptyRole(),
  })

  async function onSubmit(data: Roleform) {
    setFormError(null)
    try {
      // Add API call 
      const X_CSRF_Token = await refresh_csrf('/auth-srv/group-management')
      if (X_CSRF_Token) {
        // const newRole = {
        //   ...data,
        //   permissions: data.permissions?.filter(perm => perm.includes('_')), 
        // }
        await addRole(data)
        onAdded()
      } else {
        setFormError("'Failed to get token, please refresh the page, please try again.")
      }
    } catch (error: any) {
      // Extract error message from the response
      const errorMessage = error.response?.data?.detail || "An error occurred while adding the role"
      // Set a form-level error message
      setFormError(errorMessage)
    }
  }

  const handleClose = useCallback(() => {
    // Check if form is dirty (has been modified)
    if (form.formState.isDirty) {
      setShowDiscardDialog(true)
    } else {
      // If form is not dirty, close directly
      closeForm()
    }
  }, [form.formState.isDirty])

  const closeForm = () => {
    setOpen(false);
    form.reset(createEmptyRole());
    setFormError(null)
  }

  // Function to focus the next element in the tab order
  const focusNextElement = (currentFieldName: string) => {
    // Define the tab order for form fields within each location
    const tabOrder = [
      `groupName`,
      `description`,
      `permissions`,
    ]
    const currentIndex = tabOrder.indexOf(currentFieldName)
    if (currentIndex !== -1 && currentIndex < tabOrder.length - 1) {
      const nextFieldName = tabOrder[currentIndex + 1]
      const nextElement = formFieldRefs.current[nextFieldName]
      if (nextElement) {
        nextElement.focus()
      }
    }
  }

  // Handle key down events for form fields
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault()
      focusNextElement(fieldName)
    }
  }

  return (
      <>
        <Dialog
          open={open}
          onOpenChange={(newOpen) => {
            if (!newOpen && form.formState.isDirty) {
              // If trying to close and form is dirty, show confirmation dialog
              setShowDiscardDialog(true)
            } else if (!newOpen) {
              // If trying to close and form is not dirty, close directly
              closeForm()
            } else {
              // If opening the dialog
              setOpen(true)
            }
          }}
        >
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
                {/* Form-level error alert */}
                {formError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={form.control}
                  name="groupName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} 
                          onKeyDown={(e) => handleKeyDown(e, "groupName")}
                          ref={(el: HTMLInputElement | null) => {
                            formFieldRefs.current["groupName"] = el;
                          }}/>
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
                        <Textarea {...field} value={field.value ?? ''} 
                          onKeyDown={(e) => handleKeyDown(e, "description")}
                          ref={(el: HTMLTextAreaElement | null) => {
                            formFieldRefs.current["description"] = el;
                          }}/>
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

        {/* Discard confirmation dialog */}
        <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <AlertDialogContent className="max-w-[400px]">
            <AlertDialogTitle className="text-center mb-6">Discard draft?</AlertDialogTitle>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setShowDiscardDialog(false)} className="w-[160px]">
                Continue editing
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDiscardDialog(false)
                  closeForm()
                }}
                className="w-[160px] bg-red-500 hover:bg-red-600"
              >
                Discard
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </>
  )
}

