"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Permission {
  id: string
  label: string
  children?: Permission[]
}

interface PermissionsTreeProps {
  permissions: Permission[]
}

export function PermissionsRead({ permissions }: PermissionsTreeProps) {
  // Initialize expanded state with all permission IDs
  const [expanded, setExpanded] = React.useState<string[]>(() => {
    const allIds: string[] = []
    const collectIds = (permission: Permission) => {
      allIds.push(permission.id)
      permission.children?.forEach(collectIds)
    }
    permissions.forEach(collectIds)
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

  // const getAllChildrenIds = React.useCallback((permission: Permission): string[] => {
  //   const ids: string[] = []
  //   const traverse = (p: Permission) => {
  //     ids.push(p.id)
  //     p.children?.forEach(traverse)
  //   }
  //   traverse(permission)
  //   return ids
  // }, [])

  // const togglePermission = React.useCallback(
  //   (permission: Permission) => {
  //     if (!onValueChange) return

  //     const allIds = getAllChildrenIds(permission)
  //     onValueChange((prevValue) => {
  //       const currentState = allIds.every(id => prevValue.includes(id));
  //       const newValue = new Set(prevValue);
  
  //       if (currentState) {
  //         allIds.forEach(id => newValue.delete(id));
  //       } else {
  //         allIds.forEach(id => newValue.add(id));
  //       }
  
  //       return Array.from(newValue);
  //     });
  //   },
  //   [onValueChange, getAllChildrenIds]
  // ) 

  const MemoizedPermission = React.memo(
    ({ permission, depth }: { permission: Permission; depth: number }) => {
      const hasChildren = permission.children?.length
      // const allChildrenIds = getAllChildrenIds(permission)
      // const isSelected = allChildrenIds.every((id) => value.includes(id))
      // const isIndeterminate = !isSelected && allChildrenIds.some((id) => value.includes(id))

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
            <div className="flex-1 flex items-center gap-2">
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
      {permissions.map(p => (
        <MemoizedPermission key={p.id} permission={p} depth={0} />
      ))}
    </div>
  )
}

