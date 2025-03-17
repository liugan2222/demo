"use client"

import * as React from "react"
import { usePathname } from 'next/navigation'
import Link from "next/link"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/sidebar/ui/collapsible"
import {
  SidebarGroup,
  // SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/sidebar/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
    pendingNum?:number
  }[]
}) {

  const pathname = usePathname()|| ''

  const [openItems, setOpenItems] = React.useState<string[]>([])

  const isItemOpen = React.useCallback((itemUrl: string) => {
    return pathname.startsWith(itemUrl)
  }, [pathname])

  const toggleItem = React.useCallback((title: string) => {
    setOpenItems(prev => {
      if (prev.includes(title)) {
        return prev.filter(item => item !== title)
      } else {
        return [...prev, title]
      }
    })
  }, [])

  React.useEffect(() => {
    const openParents = items
      .filter(item => item.items && isItemOpen(item.url))
      .map(item => item.title)
    
    setOpenItems(prev => {
      const newOpenItems = [...new Set([...prev, ...openParents])]
      return newOpenItems
    })
  }, [pathname, isItemOpen])

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          const isActive = !hasSubItems && pathname === item.url

          return (
            <Collapsible
              key={item.title}
              asChild
              open={openItems.includes(item.title) || isItemOpen(item.url)}
              onOpenChange={() => toggleItem(item.title)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {hasSubItems ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <Link href={item.url} className="w-full">
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                )}

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>

                {item.title === "Requests" && <SidebarMenuBadge>{item.pendingNum}</SidebarMenuBadge>}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
