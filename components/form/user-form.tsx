"use client"
import React, {useEffect, useState, useCallback, useRef } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { X, CalendarIcon, Edit2, EyeOff, Eye, Mail, RotateCw } from 'lucide-react'

import { userformSchema, Userform } from '@/components/tanstack/schema/formSchema/userformSchema'
import { TextField } from './components/field/text-field'
import { Badge } from "@/components/ui/badge"
import "@/app/globals.css";

import { MultiSelect } from "@/components/add-dialog/components/user/multi-select"

import { getUserById, updateUser, getRoles, refresh_csrf, userEnabled
   , getUserLastEmail, resend
 } from '@/lib/api';

import { useAppContext } from "@/contexts/AppContext"


interface UserFormProps {
  selectedItem: Userform 
  onSave: () => void 
  onCancel: () => void
  isEditing: boolean
  onToggleEdit: () => void 
}

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

// New Alert/OTP component
const AlertOTP = ({ onResend, isResendDisabled }: { onResend: () => void; isResendDisabled: boolean }) => {
  return (
    <div className="w-full bg-white rounded-md outline-1 outline-offset-[-1px] outline-zinc-300 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-zinc-900" />
          <div className="text-zinc-900 text-base font-medium leading-normal">
            Set-up Email Sent
          </div>
        </div>
        <div className="text-zinc-600 text-sm font-normal leading-tight mb-2">
          An email has been sent to the user with a link to set up their account. The link will expire in 5 minutes.
        </div>
        <Button
          type="button"
          onClick={onResend}
          disabled={isResendDisabled}
          className="h-10 w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 outline-1 outline-zinc-900"
          variant="secondary"
        >
          <RotateCw className="h-4 w-4" />
          Resend
        </Button>
      </div>
    </div>
  )
}

export function UserForm({ selectedItem, onSave, onCancel, isEditing, onToggleEdit }: UserFormProps) {

  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])

  const { userPermissions, userInfo } = useAppContext()
  const isUpdate = (userInfo?.username === "admin") || (userPermissions.includes('Users_Update'))
  const isDisable = (userInfo?.username === "admin") || (userPermissions.includes('Users_Disable'))

  const form = useForm<Userform>({
    resolver: zodResolver(userformSchema),
    defaultValues: selectedItem,
  })

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

  const [showAlertOTP, setShowAlertOTP] = useState(false)
  const [isResendDisabled, setIsResendDisabled] = useState(false) 
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null
    const fetchVendorData = async () => {
      if (selectedItem.id) {
        try {
          setLoading(true)
          fetchBasicdatas();


          // Alert / OTP  判断
          if (selectedItem.id !== "admin" && selectedItem.id !== "user") {
            const lastInfoData = await getUserLastEmail(selectedItem.id)
            // Check if password change is required
            if (!lastInfoData.passwordCreatedAt) {
              // Check if temporary password has expired (24 hours)
              setShowAlertOTP(true)
              const tempPasswordTime = new Date(lastInfoData.tokenCreatedAt).getTime()
              const currentTime = new Date().getTime()
              const fiveMinutesInMs = 24 * 60 * 60 * 1000
  
              // Resend 按钮可用 - 动态控制 Resend 按钮
              const timeRemaining = tempPasswordTime + fiveMinutesInMs - currentTime
              if (timeRemaining > 0) {
                setIsResendDisabled(true)
                // Clear any existing timer
                if (resendTimerRef.current) {
                  clearTimeout(resendTimerRef.current)
                }
                // Set new timer to enable the button after the remaining time
                timerId = setTimeout(() => {
                  setIsResendDisabled(false)
                }, timeRemaining)
              } else {
                setIsResendDisabled(false)
              }
            } else {
              setShowAlertOTP(false)
              setIsResendDisabled(true)
            }
          } else {
            setShowAlertOTP(false)
            setIsResendDisabled(true)
          }

          const userData = await getUserById(selectedItem.id)

          // roles 处理
          if (userData.groups) {
            // 将 groups 中的 id 转换为字符串数组
            userData.roles = userData.groups.map((group: any) => group.id.toString());
            userData.rolseNms = userData.groups.map((group: any) => group.groupName);
          } else {
            userData.roles = []; // 如果没有 groups，赋值为空数组
          }

          userData.status = userData.enabled==true?'Active':'Disabled'
          
          form.reset(userData)
          // Update form values with fetched data
          // Object.keys(userData).forEach((key) => {
          //   form.setValue(key as keyof Userform, userData[key])
          // })
        } catch (error) {
          console.error("Error fetching vendor data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    fetchVendorData()

    return () => {
      if (timerId) {
        clearTimeout(timerId)
      }
      if (resendTimerRef.current) {
        clearTimeout(resendTimerRef.current)
      }
    }
  }, [selectedItem.id, form])

  const handleResend = async () => {
    try {
      const X_CSRF_Token = await refresh_csrf("/auth-srv/pre-register")
      if (X_CSRF_Token) {
        await resend(selectedItem.id ?? "", X_CSRF_Token)
        setIsResendDisabled(true)
        // Clear any existing timer
        if (resendTimerRef.current) {
          clearTimeout(resendTimerRef.current)
        }

        // Set new timer
        resendTimerRef.current = setTimeout(
          () => {
            setIsResendDisabled(false)
          },
          24 * 60 * 60 * 1000,
        ) // Enable after 24 hours
      } else {
        console.error("Error:", "Failed to get token")
      }
    } catch (error) {
      console.error("Error resending password:", error)
    }
  }

  const onSubmit = async (data: Userform) => {
    try {
      if (selectedItem.id ) {
        const groups = data.roles?.map(role => Number(role));
        // Add API call 
        const X_CSRF_Token = await refresh_csrf('/auth-srv/pre-register')
        if (X_CSRF_Token) {
          const updateUserInfo = {
            ...data,
            groupIds: groups
          }
          await updateUser(selectedItem.id, updateUserInfo)
        } else {
          console.error("Error:", 'Failed to get token')
        }
      }
      // Call the onSave callback with the form data
      await onSave()
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const handleDisable = async () => {
    const X_CSRF_Token = await refresh_csrf('/auth-srv/pre-register')
    if (X_CSRF_Token) {
      await userEnabled(selectedItem.id ?? '', X_CSRF_Token)
      await onSave()
    } else {
      console.error("Error:", 'Failed to get token')
    }
  }
  const handleEnable = async () => {
    const X_CSRF_Token = await refresh_csrf('/auth-srv/pre-register')
    if (X_CSRF_Token) {
      await userEnabled(selectedItem.id ?? '', X_CSRF_Token)
      await onSave()
    } else {
      console.error("Error:", 'Failed to get token')
    }
  } 

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          {!isEditing && isDisable && (
            <div className="flex justify-end space-x-2 p-1">
              {form.getValues('status') === 'Active' ? (
                <Button type="button" variant="destructive" size="default" onClick={handleDisable}>
                  <EyeOff size={16}/>
                  Disable
                </Button>
              ) : (
                <Button type="button" size="default" onClick={handleEnable}>
                  <Eye size={16}/>
                  Enable
                </Button>
              )}
              {!isEditing && isUpdate && (form.getValues('status') === 'Active') && (
                <Button type="button" variant="outline" size="default" onClick={onToggleEdit}>
                  <Edit2 size={16} />
                  Edit
                </Button>
              )}
            </div>
          )}
          {isEditing && (
            <div className="flex justify-end space-x-2 p-4">
            <Button type="button" size="default" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X size={16} />
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">

          {showAlertOTP && <AlertOTP onResend={handleResend} isResendDisabled={isResendDisabled} />}
         
          <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label font-common">Email</FormLabel>
                  <FormControl>
                    <div className="form-control font-common">
                      {field.value?.toString() ?? ''}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TextField form={form} name="employeeNumber" label="User number" required isEditing={isEditing} />
            <TextField form={form} name="firstName" label="First name" required isEditing={isEditing} />
            <TextField form={form} name="lastName" label="Last name" isEditing={isEditing} />

            {isEditing || form.getValues('roles') ? (
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Roles<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <MultiSelect
                          options={roles}
                          onValueChange={field.onChange}
                          defaultValue={Array.isArray(field.value) ? field.value : []}
                          placeholder="Select roles"
                          variant="inverted"
                          animation={2}
                          maxCount={5}
                          roleInfoPosition={{ position: "right", value: "calc(100% + 8px)" }}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {form.getValues("rolseNms") || ""}
                        </div>
                      )} 
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={field.value === "Disabled" ? "badge-page badge-disabled" : "badge-page badge-fullfilled"}>{field.value}</Badge>
                  </div>
                </FormItem>
              )}
            />

            {/* department */}

            <TextField form={form} name="directManagerName" label="Direct manager" isEditing={isEditing} />

            {isEditing || form.getValues('mobileNumber') ? (
              <FormField
                control={form.control}
                name="telephoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone</FormLabel>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <FormControl>
                          {isEditing ? (
                            <Input 
                              {...field} 
                              value={field.value?.toString() ?? ''} 
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          ) : (
                            <div className="form-control font-common">
                              {field.value?.toString() ?? ''}
                            </div>
                          )}
                        </FormControl>
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name="mobileNumber"
                          render={({ field }) => (
                            <FormControl>
                              {isEditing ? (
                                <Input 
                                  {...field} 
                                  value={field.value?.toString() ?? ''} 
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              ) : (
                                <div className="form-control font-common">
                                  {field.value?.toString() ?? ''}
                                </div>
                              )}
                            </FormControl>
                          )}
                        />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              /> 
            ) : null}  


            {/* department */}

            {/* Start Date */}
            {isEditing || form.getValues('fromDate') ? (
              <FormField
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Start date</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button type="button" variant={"outline"} className={"w-full pl-3 text-left font-normal"}>
                              {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date?.toISOString())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="form-control font-common">
                          {field.value ? format(new Date(field.value), "h:mm a, MM/dd/yyyy") : "No date set"}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <TextField form={form} name="employeeContractNumber" label="Contract number" isEditing={isEditing} />
            <TextField form={form} name="certificationDescription" label="Certifications" isEditing={isEditing} />
            <TextField form={form} name="skillSetDescription" label="Skill set" isEditing={isEditing} />
            <TextField form={form} name="languageSkills" label="Language proficiency" isEditing={isEditing} />
            <TextField form={form} name="associatedGln" label="Linked GLN" isEditing={isEditing} />

          </div>
        </ScrollArea> 
      </form>
    </Form>
  )
}