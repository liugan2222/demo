"use client"
import Demo from "@/components/demo"
import { AppSidebar } from "@/components/sidebar/app-sidebar"

import { Database, House, ListChecks, Package, ShoppingCart, SquareCheckBig, User, UserRoundCog } from "lucide-react"

import {
  SidebarInset,
  SidebarProvider,
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
      url: "#",
      icon: House,
      isActive: true,
    },
    {
      title: "Requests",
      url: "#",
      icon: SquareCheckBig,
      pendingNum: 4,
    },
    {
      title: "Database",
      url: "#",
      icon: Database,
      items: [
        {
          title: "Items",
          url: "#",
        },
        {
          title: "Suppliers",
          url: "#",
        },
        {
          title: "Locations",
          url: "#",
        },
      ],
    },
    {
      title: "Procurement",
      url: "#",
      icon: ShoppingCart,
    },
    {
      title: "Receiving",
      url: "#",
      icon: Package,
    },
    {
      title: "QA",
      url: "#",
      icon: ListChecks,
    },
    {
      title: "Admin",
      url: "#",
      icon: UserRoundCog,
      items: [
        {
          title: "Users",
          url: "#",
        },
        {
          title: "Roles",
          url: "#",
        },
        {
          title: "Logbook",
          url: "#",
        },
      ],
    },
  ],
}

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar user={data.user} navMain={data.navMain}/>
      <SidebarInset>
        <Demo altTxt="This is the screen reserved for the dashboard."></Demo>
        {/* <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h1> This is the screen reserved for the dashboard. </h1>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <h1> This is the screen reserved for the dashboard. </h1>
          </div>
        </div> */}
      </SidebarInset>
    </SidebarProvider>
  )
}
