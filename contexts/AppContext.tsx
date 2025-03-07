"use client"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useCountries, useCurrencies } from "@/hooks/use-cached-data"

interface AppContextType {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
  countries?: any[];
  currencies?: any[];
  userPermissions: string[]
  setUserPermissions: (perms: string[]) => void
  userInfo: any
  setUserInfo: (info: any) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 客户端状态初始化
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isHydrated, setIsHydrated] = useState(false) // 新增水合状态

  useEffect(() => {
    // 仅在客户端执行初始化
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true')
      setUserPermissions(JSON.parse(localStorage.getItem('userPermissions') || '[]'))
      setUserInfo(JSON.parse(localStorage.getItem('userInfo') || 'null'))
      setIsHydrated(true) // 标记水合完成
    }
  }, []) // 空依赖数组确保只执行一次

  useEffect(() => {
    // 仅在客户端更新存储
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', isLoggedIn.toString())
      localStorage.setItem('userPermissions', JSON.stringify(userPermissions))
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    }
  }, [isLoggedIn, userPermissions, userInfo, isHydrated])

  // Prefetch and cache geo data
  const { data: countries } = useCountries(isLoggedIn)
  const { data: currencies } = useCurrencies(isLoggedIn)

  return <AppContext.Provider 
          value={{ 
            isLoggedIn, 
            setIsLoggedIn, 
            countries,
            currencies,
            userPermissions,
            setUserPermissions,
            userInfo,
            setUserInfo }}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}