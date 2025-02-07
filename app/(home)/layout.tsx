"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/AppContext"

import { AppSidebar } from "@/components/sidebar/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/sidebar/ui/sidebar"

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { isLoggedIn } = useAppContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      // router.replace("/login")
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) {
    return null // or a loading spinner
  }

  return (
    <>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
    </>
  );
}
