"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/AppContext"

export default function RootPage() {
  const router = useRouter()
  const { isLoggedIn } = useAppContext()

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard")
    } else {
      // TODO
      router.replace("/login")
    }
  }, [isLoggedIn, router])

  return null // or a loading spinner
}