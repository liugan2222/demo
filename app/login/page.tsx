"use client"

import { useState, useEffect } from "react"
import { useRouter  } from "next/navigation"
import Image from "next/image"
// import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

import { LoginAlert, LoginAlertDescription } from "@/components/common/login-alert"

import { useAppContext } from "@/contexts/AppContext"
import { login, get_csrf, getUserById } from "@/lib/api"
import { IMAGE_PATHS  } from "@/contexts/images"

// Custom email validator that allows 'admin' as a valid value
const customEmailValidator = (value: string) => {
  if (value === "admin") return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const loginSchema = z.object({
  email: z.string().min(1, "Please enter an email.").refine(customEmailValidator, {
    message: "Please enter an email. ",
  }),
  password: z.string().min(1, "Please enter a password."),
})

type LoginSchema = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  // const pathname = usePathname();
  
  // useEffect(() => {
    //   console.log('login useEffect','setIsLoggedIn true and to dashboard')
    //   if (isLoggedIn) {
      //     router.replace("/dashboard")
      //   }
      // }, [isLoggedIn, router])

  const { isLoggedIn, setIsLoggedIn, setUserPermissions, setUserInfo } = useAppContext()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
      
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
        setError("Unable to connect to the server")
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
    setIsLoading(true)
    setError("")

    try {
      const csrfToken = JSON.parse(localStorage.getItem("csrfToken") || "")
      await login(data, csrfToken)

      // Set user info
      const userData = await getUserById(data.email)

      // // Check if password change is required
      // if (userData.passwordChangeRequired) {
      //   // Check if temporary password has expired (5 minutes)
      //   if (userData.tempPasswordLastGenerated) {
      //     const tempPasswordTime = new Date(userData.tempPasswordLastGenerated).getTime()
      //     const currentTime = new Date().getTime()
      //     const fiveMinutesInMs = 5 * 60 * 1000

      //     if (currentTime - tempPasswordTime > fiveMinutesInMs) {
      //       setError("Your temporary password has expired, please contact your admin.")
      //       setIsLoading(false)
      //       return
      //     } else {
      //       // Store user info temporarily and redirect to password change page
      //       localStorage.setItem("tempUserInfo", JSON.stringify(userData))
      //       router.push("/change-password")
      //       return
      //     }
          
      //     // // for test
      //     // localStorage.setItem("tempUserInfo", JSON.stringify(userData))
      //     // router.push("/change-password")
      //     // return
      //   }
      // }

      // Regular login flow
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userPermissions", JSON.stringify(userData.permissions || []))
      localStorage.setItem("userInfo", JSON.stringify(userData))

      // Update app context
      setUserPermissions(userData.permissions || [])
      setUserInfo(userData)
      setIsLoggedIn(true)

      router.replace("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle different error scenarios
      if (error.response?.status === 401) {
        if (error.response?.data?.error === "User is disabled") {
          setError("This user has been disabled, please contact your admin.")
        } else {
          setError("Incorrect email or password.")
        }
      } else {
        setError("An error occurred during login. Please try again.")
      }

      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userPermissions")
      localStorage.removeItem("userInfo")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoggedIn) {
    console.log('login success')
  }

  const handleForgotPassword = () => {
    router.push("/reset-password")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]">
      <Card className="w-full max-w-[1000px] overflow-hidden shadow-md">
        <CardContent className="p-0 grid md:grid-cols-2">
          <div className="p-8 flex flex-col">
            <div className="mb-8">
              <Image
                src={IMAGE_PATHS.DEFAULT_FRESHPOINT_LOGO || "/placeholder.svg"}
                alt="Freshpoint Logo"
                width={180}
                height={50}
                priority
              />
            </div>

            <h1 className="text-2xl font-semibold mb-6">Welcome back!</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-[#15803d] hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input {...field} type={showPassword ? "text" : "password"} />
                          </FormControl>
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {error && (
                  <LoginAlert variant="destructive" className="bg-[#fee2e2] text-[#dc2626] border-[#dc2626]">
                    <AlertCircle className="h-4 w-4" />
                    <LoginAlertDescription>{error}</LoginAlertDescription>
                  </LoginAlert>
                )}

                <Button type="submit" className="w-full bg-[#15803d] hover:bg-[#15803d]/90" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>

            <p className="mt-8 text-sm text-left">
              To create an account, reach out to your admin for a temporary password.
            </p>

            <div className="mt-auto pt-8 flex items-center">
              <span className="text-sm text-gray-500 mr-2">Powered by</span>
              <Image
                src={IMAGE_PATHS.DEFAULT_BLUEFORCE_LOGO || "/placeholder.svg"}
                alt="BlueForce Logo"
                width={100}
                height={24}
              />
            </div>
          </div>

          <div className="relative hidden md:block bg-[#e2e8f0]">
            <Image
              src={IMAGE_PATHS.DEFAULT_LOGIN_PIC || "/placeholder.svg"}
              alt="Fresh produce"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}