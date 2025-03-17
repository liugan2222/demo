"use client"
import React, {useEffect, useState, useCallback } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { X, Edit2, EyeOff, Eye } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

import { roleformSchema, Roleform } from '@/components/tanstack/schema/formSchema/roleformSchema'
import { Badge } from "@/components/ui/badge"
import "@/app/globals.css";

import { PermissionsRead } from "@/components/form/components/role/permissions-read"
import { ManageMembersDialog } from "@/components/form/components/role/manage-members-dialog"
import { PermissionsTree } from "@/components/add-dialog/components/role/permissions-tree"

import { getRoleById, updateRole, getUsers, getRoleUsers, refresh_csrf, roleEnabled } from '@/lib/api';

import { useAppContext } from "@/contexts/AppContext"

interface Permission {
  id: string
  label: string
  children?: Permission[]
}

const defaultPermissions: Permission[] = [
  {
    id: "Basedata",
    label: "Base data",
    children: [
      {
        id: "Vendors",
        label: "Vendors",
        children: [
          { id: "Vendors_Read", label: "Read" },
          { id: "Vendors_Create", label: "Create" },
          { id: "Vendors_Update", label: "Update" },
          { id: "Vendors_Disable", label: "Disable" },
        ],
      },
      {
        id: "Items",
        label: "Items",
        children: [
          { id: "Items_Read", label: "Read" },
          { id: "Items_Create", label: "Create" },
          { id: "Items_Update", label: "Update" },
          { id: "Items_Disable", label: "Disable" },
        ],
      },
      {
        id: "Warehouses",
        label: "Warehouses",
        children: [
          { id: "Warehouses_Read", label: "Read" },
          { id: "Warehouses_Create", label: "Create" },
          { id: "Warehouses_Update", label: "Update" },
          { id: "Warehouses_Disable", label: "Disable" },
        ],
      },
      {
        id: "Locations",
        label: "Locations",
        children: [
          { id: "Locations_Read", label: "Read" },
          { id: "Locations_Create", label: "Create" },
          { id: "Locations_Update", label: "Update" },
          { id: "Locations_Disable", label: "Disable" },
        ],
      }
    ]
  },
  {
    id: "Procurement",
    label: "Procurement",
    children: [
      { id: "Procurement_Read", label: "Read" },
      { id: "Procurement_Create", label: "Create" },
      { id: "Procurement_Update", label: "Update" },
      { id: "Procurement_RequestUpdates", label: "Request updates" },
      // { id: "Procurement_Cancel", label: "Cancel" },
      { id: "Procurement_ApproveUpdates", label: "Approve updates" },
    ],
  },
  {
    id: "Receiving",
    label: "Receiving",
    children: [
      { id: "Receiving_Read", label: "Read" },
      { id: "Receiving_Create", label: "Create" },
      { id: "Receiving_Update", label: "Update" },
      { id: "Receiving_RequestUpdates", label: "Request updates" },
      { id: "Receiving_ApproveUpdates", label: "Approve updates" },
    ],
  },
  {
    id: "QA",
    label: "QA",
    children: [
      { id: "QA_Read", label: "Read" },
      { id: "QA_Create", label: "Create" },
    ],
  },
  {
    id: "Users",
    label: "Users",
    children: [
      { id: "Users_Read", label: "Read" },
      { id: "Users_Create", label: "Create" },
      { id: "Users_Update", label: "Update" },
      { id: "Users_Disable", label: "Disable" },
    ],
  },
  {
    id: "Roles",
    label: "Roles",
    children: [
      { id: "Roles_Read", label: "Read" },
      { id: "Roles_Create", label: "Create" },
      { id: "Roles_Update", label: "Update" },
      { id: "Roles_Disable", label: "Disable" },
    ],
  }
]

interface User {
  username: string
  firstName: string
  lastName: string
}

interface RoleFormProps {
  selectedItem: Roleform 
  onSave: () => void 
  onCancel: () => void
  isEditing: boolean
  onToggleEdit: () => void 
}

export function RoleForm({ selectedItem, onSave, onCancel, isEditing, onToggleEdit }: RoleFormProps) {

  const [loading, setLoading] = useState(true)
  const [roleMembers, setRoleMembers] = useState<string[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<User[]>([])

  const { userPermissions, userInfo } = useAppContext()
  const isDisable = (userInfo?.username === "admin") || (userPermissions.includes('Roles_Disable'))
  const isUpdate = (userInfo?.username === "admin") || (userPermissions.includes('Roles_Update'))

  const form = useForm<Roleform>({
    resolver: zodResolver(roleformSchema),
    defaultValues: selectedItem,
    mode: 'onChange', // 添加验证模式
    // shouldUnregister: true, // 确保字段正确注销
  })

  const fetchUserlist = useCallback(async () => {
    try {
      if (selectedItem.id) {
        const uselist = await getUsers()
  
        // 如果 rolesData 存在且是一个数组
        if (uselist && Array.isArray(uselist)) {
           // 过滤掉 username 为 'admin' 和 'user' 的用户
          const filteredList = uselist.filter((user: any) => 
            user.firstName && user.firstName !== ''
          );
          // 提取需要的属性，构建 User[] 类型的数据
          const filteredUsers: User[] = filteredList.map((user: any) => ({
            username: user.username || "", // 如果接口返回的字段名不同，可以在这里调整
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          }));

          setUsers(filteredUsers);
        } else {
          setUsers([]); // 如果数据格式不符合预期，设置为空数组
        }
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }, [])  

  useEffect(() => {
    const fetchVendorData = async () => {
      if (selectedItem.id) {
        try {
          setLoading(true)
          fetchUserlist()
          const roleData = await getRoleById(selectedItem.id)
          // permission 数据处理
          const processedPermissions = processPermissions(defaultPermissions, roleData.permissions);
          setPermissions(processedPermissions)

          // members 处理
          const rolesData = await getRoleUsers(selectedItem.id)
          if (rolesData && Array.isArray(rolesData)) {
            // 提取需要的属性，构建 User[] 类型的数据
            const filteredUsers: string[] = rolesData.map((user: any) => (user.username));
  
            setRoleMembers(filteredUsers);
          } else {
            setRoleMembers([]); // 如果数据格式不符合预期，设置为空数组
          }

          roleData.status = roleData.enabled==true?'Active':'Disabled'
          roleData.id = roleData.id.toString()
          form.reset(roleData)
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
  }, [selectedItem.id, form])

  const handleMembersChange = (members: string[]) => {
    setRoleMembers(members)
    // You might want to update the form value as well if it's part of your form schema
    // form.setValue('members', members)
  }


  const onSubmit = async (data: Roleform) => {
    try {
      // 强制验证权限字段
      // if (!data.permissions || data.permissions.length === 0) {
      //   form.setError('permissions', {
      //     type: 'manual',
      //     message: '至少需要选择一个权限'
      //   });
      //   return;
      // }

      if (selectedItem.id) {
        const X_CSRF_Token = await refresh_csrf('/group-management')
        if (X_CSRF_Token) {
          // const newRole = {
          //   ...data,
          //   permissions: data.permissions?.filter(perm => perm.includes('_')), 
          // }
          await updateRole(selectedItem.id, data)
          await onSave()
        } else {
          console.error("Error:", 'Failed to get token')
        }
      }
      // Call the onSave callback with the form data
    } catch (error) {
      console.error('Error saving item:', error);
      // 显示错误提示
      form.setError('root', {
        type: 'manual',
        message: 'Failed to save changes',
      });
    }
  }

  // permission 数据处理
  function processPermissions(defaultPermissions: Permission[], rolePermissions: string[]): Permission[] {
    // 递归函数，用于筛选权限
    function filterPermissions(permissions: Permission[]): Permission[] {
      return permissions
        .map(permission => {
          // 如果当前权限是叶子节点（没有 children），直接检查是否存在
          if (!permission.children) {
            return rolePermissions.includes(permission.id) ? permission : null;
          }

          // 如果当前权限有子节点，递归处理子节点
          const filteredChildren = filterPermissions(permission.children);
          // 如果子节点为空，移除当前父节点
          if (filteredChildren.length === 0) {
            return null;
          }

          // 如果子节点存在，保留当前父节点并更新子节点
          return { ...permission, children: filteredChildren };
        })
        .filter(Boolean) as Permission[]; // 过滤掉 null 和 undefined
    }

    // 调用递归函数，处理默认权限
    return filterPermissions(defaultPermissions);
  }


  if (loading) {
    return <div>Loading...</div>
  }

  const handleDisable = async () => {
    const X_CSRF_Token = await refresh_csrf('/group-management')
    if (X_CSRF_Token) {
      await roleEnabled(selectedItem.id ?? '', X_CSRF_Token)
      await onSave()
    } else {
      console.error("Error:", 'Failed to get token')
    }
  }
  const handleEnable = async () => {
    const X_CSRF_Token = await refresh_csrf('/group-management')
    if (X_CSRF_Token) {
      await roleEnabled(selectedItem.id ?? '', X_CSRF_Token)
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
                </Button>
              ) : (
                <Button type="button" size="default" onClick={handleEnable}>
                  <Eye size={16}/>
                </Button>
              )}
            </div>
          )}
          {!isEditing && isUpdate && (form.getValues('status') === 'Active') && (
            <div className="flex justify-end space-x-2 p-4">
              <Button type="button" variant="outline" size="default" onClick={onToggleEdit}>
                <Edit2 size={16} />
              </Button>
              <ManageMembersDialog
                roleId={selectedItem.id??''}
                users={users}
                selectedUsers={roleMembers}
                onSelectedUsersChange={handleMembersChange}
              />
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

            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label font-common after:content-['*'] after:ml-0.5 after:text-red-500">Role</FormLabel>
                  <FormControl>
                    <div className="form-control font-common">
                      {field.value?.toString() ?? ''}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 font-medium" />
                </FormItem>
              )}
            />
            
            {isEditing || form.getValues('description') ? (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Description</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Textarea {...field} value={field.value ?? ''} 
                         onChange={(e) => field.onChange(e.target.value)}/>
                      ) : (
                        <div className="form-control font-common">
                          {field.value?.toString() ?? ''}
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

            <FormField
              control={form.control}
              name="permissions"
              // shouldUnregister={false} // 添加这一行
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label font-common">Permissions</FormLabel>
                  <FormControl>
                    {isEditing ? (
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
                    ) : (
                      <PermissionsRead permissions={permissions}/>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea> 
      </form>
    </Form>
  )
}