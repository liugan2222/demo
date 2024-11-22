"use client"

import * as React from "react"

import {
  type LucideIcon
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/sidebar/ui/sidebar"

export function AppSidebar({
  user,
  navMain
}: {
  user: {
    name: string
    email: string
    avatar?: LucideIcon
  },
  navMain: Array<
    {
      title: string
      url: string
      icon?: LucideIcon
      isActive?: boolean
    }
  >
}) {

  console.log('menuInfo',navMain)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
