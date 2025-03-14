"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

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

interface PermissionsTreeProps {
  value?: string[]
  onValueChange?: (value: string[] | ((prev: string[]) => string[])) => void;
}

export function PermissionsTree({ value = [], onValueChange }: PermissionsTreeProps) {
  // Initialize expanded state with all permission IDs
  const [expanded, setExpanded] = React.useState<string[]>(() => {
    const allIds: string[] = []
    const collectIds = (permission: Permission) => {
      allIds.push(permission.id)
      permission.children?.forEach(collectIds)
    }
    defaultPermissions.forEach(collectIds)
    return allIds
  })

  const toggleExpand = React.useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }, [])

  const isExpanded = React.useCallback(
    (id: string) => {
      return expanded.includes(id)
    },
    [expanded],
  )

  const getAllChildrenIds = React.useCallback((permission: Permission): string[] => {
    const ids: string[] = []
    const traverse = (p: Permission) => {
      ids.push(p.id)
      p.children?.forEach(traverse)
    }
    traverse(permission)
    return ids
  }, [])

  const togglePermission = React.useCallback(
    (permission: Permission) => {
      if (!onValueChange) return

      const allIds = getAllChildrenIds(permission)
      onValueChange((prevValue) => {
        // 强化类型校验
        const currentValue = Array.isArray(prevValue) ? prevValue : []
        const currentState = allIds.every(id => currentValue.includes(id))
        
        // 使用更可靠的更新逻辑
        return currentState 
          ? currentValue.filter(id => !allIds.includes(id))
          : [...new Set([...currentValue, ...allIds])]
      })
    },
    [onValueChange, getAllChildrenIds]
  )

  const MemoizedPermission = React.memo(
    ({ permission, depth }: { permission: Permission; depth: number }) => {
      const hasChildren = permission.children?.length
      const allChildrenIds = getAllChildrenIds(permission)
      const isSelected = allChildrenIds.every((id) => value.includes(id))
      const isIndeterminate = !isSelected && allChildrenIds.some((id) => value.includes(id))

      return (
        <div key={permission.id} className="select-none">
          <div
            className={cn(
              "flex items-center gap-2 py-1 px-2 rounded-md",
              "hover:bg-accent hover:text-accent-foreground",
              depth > 0 && "ml-6",
            )}
          >
            {hasChildren && (
              <button
                onClick={(e) => toggleExpand(e, permission.id)}
                className="p-0.5 rounded-sm hover:bg-accent-foreground/10"
              >
                <ChevronRight
                  className={cn("h-4 w-4 transition-transform", isExpanded(permission.id) && "transform rotate-90")}
                />
              </button>
            )}
            <div className="flex-1 flex items-center gap-2" 
              onClick={(e) => {
                e.preventDefault()
                togglePermission(permission)
              }}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  if (checked !== 'indeterminate') {
                    togglePermission(permission)
                  }
                }}
                ref={(ref: any) => {
                  if (ref) {
                    ref.indeterminate = isIndeterminate
                  }
                }}
                className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:opacity-70"
              />
              <span>{permission.label}</span>
            </div>
          </div>
          {hasChildren && isExpanded(permission.id) && (
            <div className="ml-2 border-l pl-2">
              {permission.children!.map((child) => (<MemoizedPermission key={child.id} permission={child} depth={depth + 1} />))}
            </div>
          )}
        </div>
      )
    },
    (prev, next) => 
      prev.permission.id === next.permission.id &&
      prev.depth === next.depth &&
      expanded.includes(prev.permission.id) === expanded.includes(next.permission.id)
  );

  // 添加 displayName 属性
  MemoizedPermission.displayName = "MemoizedPermission";  // <-- 新增这行


  return (
    <div className="border rounded-lg p-4 space-y-2">
      {defaultPermissions.map(p => (
        <MemoizedPermission key={p.id} permission={p} depth={0} />
      ))}
    </div>
  )
}

