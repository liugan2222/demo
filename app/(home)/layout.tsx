"use client"

import { useEffect, useState } from "react"
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

  const { isLoggedIn, setUserInfo, setUserPermissions } = useAppContext()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false) // 新增初始化状态

  useEffect(() => {
    // 仅在客户端执行
    if (typeof window !== 'undefined') {
      // 从本地存储恢复状态
      const storedUserInfo = localStorage.getItem('userInfo')
      const storedPermissions = localStorage.getItem('userPermissions')
      
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo))
      }
      if (storedPermissions) {
        setUserPermissions(JSON.parse(storedPermissions))
      }
      
      // 标记初始化完成
      setIsInitialized(true)
    }
  }, [setUserInfo, setUserPermissions])

  useEffect(() => {
    // 初始化完成后检查登录状态
    if (isInitialized && !isLoggedIn) {
      router.replace("/login")
    }
  }, [isInitialized, isLoggedIn, router])

  if (!isLoggedIn) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return  isLoggedIn ? (
    <div className="flex h-screen w-full overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col overflow-hidden">{children}</SidebarInset>
      </SidebarProvider>
    </div>
  ) : null
}
