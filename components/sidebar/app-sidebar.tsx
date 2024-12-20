"use client"

import * as React from "react"

import { Database, House, ListChecks, Package, ShoppingCart, SquareCheckBig, User, UserRoundCog } from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/sidebar/ui/sidebar"


// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: User,
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: House,
      isActive: true,
    },
    {
      title: "Requests",
      url: "/requests",
      icon: SquareCheckBig,
      pendingNum: 4,
    },
    {
      title: "Database",
      url: "/database",
      icon: Database,
      items: [
        {
          title: "Items",
          url: "/database/items",
        },
        {
          title: "Suppliers",
          url: "/database/suppliers",
        },
        {
          title: "Locations",
          url: "/database/locations",
        },
      ],
    },
    {
      title: "Procurement",
      url: "/procurement",
      icon: ShoppingCart,
    },
    {
      title: "Receiving",
      url: "/receiving",
      icon: Package,
    },
    {
      title: "QA",
      url: "/qa",
      icon: ListChecks,
    },
    {
      title: "Admin",
      url: "/admin",
      icon: UserRoundCog,
      items: [
        {
          title: "Users",
          url: "/admin/users",
        },
        {
          title: "Roles",
          url: "/admin/roles",
        },
        {
          title: "Logbook",
          url: "/admin/logbook",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
