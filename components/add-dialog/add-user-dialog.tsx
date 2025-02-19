"use client"

import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelect, type Option } from "@/components/add-dialog/components/user/multi-select"
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Plus } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  roles: z.array(z.string()).min(1, {
    message: "Please select at least one role.",
  }),
})

const roles: Option[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access to all resources and settings",
  },
  {
    value: "manager",
    label: "Manager",
    description: "Access to manage team members and projects",
  },
  {
    value: "user",
    label: "User",
    description: "Basic access to resources",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to resources",
  },
]

interface AddDialogProps {
  onAdded: () => void;
}

export function AddUserDialog({ onAdded: onAdded }: AddDialogProps) {

  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roles: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values)
      // Add your API call here
      onAdded()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // const handleClose = () => {
  //   setOpen(false);
  //   // form.reset(createEmptyPo());
  //   // setExpandedItems(['item-0']);
  // };  

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            {/* <DialogDescription>
              Add a new purchase order with one or more items.
            </DialogDescription> */}
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={roles}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select roles"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  )
}

