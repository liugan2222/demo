"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/add-dialog/components/user/multi-select"
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog"

import {toast } from "sonner"

import { Plus, CalendarIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { UserAlertDialog, UserAlertDialogContent, UserAlertDialogTitle } from "@/components/common/user-alert-dialog"

import { userformSchema, Userform } from '@/components/tanstack/schema/formSchema/userformSchema'
import { addUser, refresh_csrf, getRoles } from '@/lib/api';

const createEmptyUser = () => ({
  username: '',
  firstName: '',
  lastName: '',
  employeeNumber: '',
  groupIds: [],

  roles: [],

  departmentId: null,
  directManagerName: null,
  telephoneNumber: null,
  mobileNumber: null,
  employeeType: null,
  fromDate: null,
  employeeContractNumber: null,
  certificationDescription: null,
  skillSetDescription: null,
  languageSkills: null,
  associatedGln: null,
  profileImageUrl: null
});

interface RoleGroup {
  id: string;
  role: string;
  description: string;
  permissionList: string[];
}

// Define the Role
interface Role {
  value: string;
  label: string;
  description?: string
  permissions?: {
    [key: string]: string[]
  }
}

interface AddDialogProps {
  onAdded: () => void;
}

export function AddUserDialog({ onAdded: onAdded }: AddDialogProps) {

  const [open, setOpen] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])

  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Create refs for all form fields to manage tab navigation
  const formFieldRefs = useRef<Record<string, HTMLElement | null>>({})

  // const [apiResponse, setApiResponse] = useState<{ username: string; oneTimePassword: string } | null>(null)
  // const [showResultDialog, setShowResultDialog] = useState(false)

  const fetchBasicdatas = useCallback(async () => {
    try {
      const rolesData = await getRoles(true)

      // roles 处理
      if (rolesData) {
        const processedRoles: Role[] = rolesData.map((group: RoleGroup) => {
          const { id, role, description, permissionList } = group;

          // 处理 permissions
          const permissions: Record<string, string[]> = {};
          // 过滤 permissionList 中没有下划线的值
          const filteredPermissions = permissionList.filter(perm => perm.includes('_'));
          filteredPermissions.forEach((perm) => {
            const [resource, operation] = perm.split('_');
            if (resource && operation) {
              if (!permissions[resource]) {
                permissions[resource] = [];
              }
              permissions[resource].push(operation);
            }
          });

          return {
            value: id,
            label: role,
            description: description,
            permissions: permissions
          };
        });

        setRoles(processedRoles);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }, [])  

  useEffect(() => {
    if (open) {
      fetchBasicdatas();
      setFormError(null)
    }
  }, [open, fetchBasicdatas]);



  const form = useForm<z.infer<typeof userformSchema>>({
    resolver: zodResolver(userformSchema),
    defaultValues: createEmptyUser(),
  })

  async function onSubmit(data: Userform) {
    try {
      setFormError(null)
      // 处理 roles
      const groups = data.roles?.map(role => Number(role));
      // // Add API call 
      const X_CSRF_Token = await refresh_csrf('/auth-srv/pre-register?from=user-management')
      if (X_CSRF_Token) {
        const newUser = {
          ...data,
          groupIds: groups
        }

        await addUser(newUser)

        // const response = await addUser(newUser)
        // const apiResponseData = {
        //   username: response.username,
        //   oneTimePassword: response.oneTimePassword || 'N/A' // 如果 oneTimePassword 不存在，设置为 'N/A'
        // };
        

        // TODO  使用 sonner 组件弹出提示消息 7秒后自动消失
        // Show success toast notification
        toast.success("New user created", {
          description: "An email has been sent to the user with instructions to set-up the account.",
          duration: 7000, // 7 seconds
          position: "bottom-right",
        })

        onAdded()
        handleClose()

        // // 保存API响应并显示对话框
        // setApiResponse(apiResponseData)
        // setShowResultDialog(true)
      } else {
        setFormError("Network abnormality, please refresh the page, please try again.")
      }
    } catch (error: any) {
      // Extract error message from the response
      const errorMessage = error.response?.data?.detail || "An error occurred while adding the user"
      // Set a form-level error message
      setFormError(errorMessage)
    }
  }

   // 添加确认后的处理函数
  //  const handleConfirm = () => {
  //   setShowResultDialog(false)
  //   onAdded()
  //   handleClose()
  // }
 
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
    form.reset(createEmptyUser());
    setFormError(null)
  }

  // Function to focus the next element in the tab order
  const focusNextElement = (currentFieldName: string) => {
    // Define the tab order for form fields
    const tabOrder = [
      "employeeNumber",
      "firstName",
      "lastName",
      "username",
      "roles",
      "directManagerName",
      "telephoneNumber",
      "mobileNumber",
      "fromDate",
      "employeeContractNumber",
      "certificationDescription",
      "skillSetDescription",
      "languageSkills",
      "associatedGln",
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
        {/* <Toaster closeButton richColors /> */}

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
              Add user
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Add user</DialogTitle>
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
                <ScrollArea className="h-[60vh] pr-4">
                  <FormField
                    control={form.control}
                    name="employeeNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User number<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "employeeNumber")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["employeeNumber"] = el
                            }}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "firstName")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["firstName"] = el
                            }}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "lastName")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["lastName"] = el
                            }}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "username")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["username"] = el
                            }}/>
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
                        <FormLabel>Roles<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div
                            ref={(el) => {
                              formFieldRefs.current["roles"] = el
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Tab" && !e.shiftKey) {
                                e.preventDefault()
                                focusNextElement("roles")
                              }
                            }}
                          >
                            <MultiSelect
                              options={roles}
                              onValueChange={(value) => {
                                field.onChange(value)
                                // After selection, we can optionally focus the next field
                                setTimeout(() => focusNextElement("roles"), 0)
                              }}
                              defaultValue={field.value ?? []}
                              placeholder="Select roles"
                              variant="inverted"
                              animation={2}
                              maxCount={5}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* TODO Department */}

                  <FormField
                    control={form.control}
                    name="directManagerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direct manager</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "directManagerName")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["directManagerName"] = el
                            }}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephoneNumber"
                    render={({ field: telField }) => (
                      <FormItem>
                        <FormLabel>Telephone</FormLabel>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-1">
                            <FormControl>
                              <Input {...telField} value={telField.value ?? ""}
                                onKeyDown={(e) => handleKeyDown(e, "telephoneNumber")}
                                ref={(el: HTMLInputElement | null) => {
                                  formFieldRefs.current["telephoneNumber"] = el
                                }}/>
                            </FormControl>
                          </div>
                          <div className="col-span-3">
                            <FormField
                              control={form.control}
                              name="mobileNumber"
                              render={({ field: mobileField }) => (
                                <FormControl>
                                  <Input {...mobileField} value={mobileField.value ?? ""} 
                                    onKeyDown={(e) => handleKeyDown(e, "mobileNumber")}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current["mobileNumber"] = el
                                    }}/>
                                </FormControl>
                              )}
                            />
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* TODO Employee Type */}

                  <FormField
                    control={form.control}
                    name="fromDate"
                    render={({ field }) => (
                      <FormItem >
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button type="button" variant={"outline"} 
                                className={"w-full pl-3 text-left font-normal"}
                                ref={(el: HTMLButtonElement | null) => {
                                  formFieldRefs.current["fromDate"] = el
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Tab" && !e.shiftKey) {
                                    e.preventDefault()
                                    focusNextElement("fromDate")
                                  }
                                }}>
                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              onSelect={(date) => {
                                if (date) {
                                  const now = new Date();
                                  date.setHours(now.getHours());
                                  date.setMinutes(now.getMinutes());
                                  date.setSeconds(now.getSeconds());
                                  field.onChange(date.toISOString());
                                  setTimeout(() => focusNextElement("fromDate"), 100)
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employeeContractNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "employeeContractNumber")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["employeeContractNumber"] = el
                            }}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certificationDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certifications</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "certificationDescription")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["certificationDescription"] = el
                            }}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skillSetDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill set</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "skillSetDescription")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["skillSetDescription"] = el
                            }}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="languageSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language proficiency</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "languageSkills")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["languageSkills"] = el
                            }}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="associatedGln"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked GLN</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} 
                            onKeyDown={(e) => handleKeyDown(e, "associatedGln")}
                            ref={(el: HTMLInputElement | null) => {
                              formFieldRefs.current["associatedGln"] = el
                            }}/>
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

        {/* <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>User created successfully</AlertDialogTitle>
              <div className="text-sm text-muted-foreground space-y-4">
                {apiResponse && (
                  <>
                    <div>user ID: {apiResponse.username}</div>
                    <div>password: {apiResponse.oneTimePassword}</div>
                    <div className="text-red-500">Please keep this password safe!</div>
                  </>
                )}
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleConfirm}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>          */}

        {/* Discard confirmation dialog */}
        <UserAlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <UserAlertDialogContent className="max-w-[400px]">
            <UserAlertDialogTitle className="text-center mb-6">Discard draft?</UserAlertDialogTitle>
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
          </UserAlertDialogContent>
        </UserAlertDialog> 
      </>
  )
}

