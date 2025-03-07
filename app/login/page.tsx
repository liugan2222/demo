"use client"

import { useState, useEffect } from "react"
import { useRouter  } from "next/navigation"
// import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useAppContext } from "@/contexts/AppContext"
import { login, get_csrf, getUserById } from "@/lib/api"

const loginSchema = z.object({
  // email: z.string().email("Invalid email address"),
  email: z.string().min(1, "Invalid user"),
  password: z.string().min(1, "Password must be at least 6 characters"),
})

type LoginSchema = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  // const pathname = usePathname();
  const { isLoggedIn, setIsLoggedIn, setUserPermissions, setUserInfo } = useAppContext()
  const [error, setError] = useState<string>("")

  // useEffect(() => {
  //   console.log('login useEffect','setIsLoggedIn true and to dashboard')
  //   if (isLoggedIn) {
  //     router.replace("/dashboard")
  //   }
  // }, [isLoggedIn, router])

  useEffect(() => {
    const fetch_csrf = async () => {
      try {
        const csrfToken = await get_csrf();
        // const c = document.cookie.split(';');
        localStorage.setItem('csrfToken', JSON.stringify(csrfToken));
        // localStorage.setItem('sessionCookies', cookies); // 存储原始 Cookie
        // console.log(csrfToken)
      } catch (error) {
        console.error("Error fetching vendor data:", error)
      }
    }
    fetch_csrf()
  }, [])

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginSchema) {
    const csrfToken = JSON.parse(localStorage.getItem('csrfToken') || '');
    const X_CSRF_Token = await login(data, csrfToken)
    if (X_CSRF_Token) {
      
      // Set user info
      const userData = await getUserById(data.email)

      // 登录成功后设置本地存储
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userPermissions', JSON.stringify(userData.permissions || []))
      localStorage.setItem('userInfo', JSON.stringify(userData))

      setUserPermissions(userData.permissions || [])
      setUserInfo(userData)
      setIsLoggedIn(true)

      router.replace("/dashboard")
      // console.log("router.replace called. Current pathname:", pathname);
    } else {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userPermissions')
      localStorage.removeItem('userInfo')
      setError("Invalid email or password")
    }
  }

  if (isLoggedIn) {
    console.log('login success')
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-semibold mb-6">Log in</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} 
                        // type="email" 
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            {"Don't have an account? "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-8">
        {/* <Image src="/freshpoint-logo.png" alt="Freshpoint Logo" width={200} height={50} priority /> */}
      </div>
    </div>
  )
}