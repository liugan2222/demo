"use client"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useCountries } from "@/hooks/use-cached-data"

interface AppContextType {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
  countries?: any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // 检查是否有 auth-token
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)auth-token\s*=\s*([^;]*).*$)|^.*$/, "$1");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Prefetch and cache geo data when logged in
  // const { data: countries } = useCountries(isLoggedIn)
  // const { data: statesAndProvinces } = useStatesAndProvinces(isLoggedIn, "USA")

  return <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}