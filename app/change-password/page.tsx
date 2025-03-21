"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { IMAGE_PATHS } from "@/contexts/images"

// Main page component with Suspense boundary
export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]">
          <Card className="w-full max-w-[1000px] overflow-hidden shadow-md">
            <CardContent className="p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-8 mx-auto">
                  <Image
                    src={IMAGE_PATHS.DEFAULT_FRESHPOINT_LOGO || "/placeholder.svg"}
                    alt="Freshpoint Logo"
                    width={180}
                    height={50}
                    priority
                  />
                </div>
                <p>Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ChangePasswordForm />
    </Suspense>
  )
}

// Separate component that uses useSearchParams
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertCircle, CircleCheck, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoginAlert, LoginAlertDescription } from "@/components/common/login-alert"

import { useAppContext } from "@/contexts/AppContext"
import { getUserByToken, refresh_csrf, getUserById, updatePassword } from "@/lib/api"

// Password validation schema
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters")
      .regex(/(?=.*[a-z])(?=.*[A-Z])/, "Password must include upper and lower case letters")
      .regex(/(?=.*[a-zA-Z])|(?=.*[!@#$%^&*(),.?":{}|<>])/, "Password must include at least 1 letter or 1 symbol"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords do not match",
    path: ["confirmPassword"],
  })

type PasswordSchema = z.infer<typeof passwordSchema>

function ChangePasswordForm() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { setIsLoggedIn, setUserPermissions, setUserInfo } = useAppContext()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  // Password validation states
  const [lengthValid, setLengthValid] = useState(false)
  const [caseValid, setCaseValid] = useState(false)
  const [charValid, setCharValid] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [expired, setExpired] = useState(false)

  const searchParams = useSearchParams() // 获取 searchParams 实例
  // 从 URL 参数获取 token 和 type
  const token = searchParams?.get("token")
  const passwordType = searchParams?.get("type") // 改名为 passwordType 避免与 type 关键字冲突

  // 添加参数验证逻辑
  useEffect(() => {
    if (!token) {
      setError("Missing token.")
      setTimeout(() => {
        router.replace("/login") // 无 token 时重定向
      }, 2000) // 2000ms延迟确保toast已渲染
      return
    }
  }, [router, token])

  useEffect(() => {
    const fetchUserData = async () => {
      // token
      if (token) {
        try {
          setLoading(true)
          const userData = await getUserByToken(token)
          // 判断token时效
          // Check if temporary password has expired (5 minutes)
          if (userData.tokenCreatedAt) {
            const tempPasswordTime = new Date(userData.tokenCreatedAt).getTime()
            const currentTime = new Date().getTime()
            const fiveMinutesInMs = 5 * 60 * 1000
            const Hours24 = 24 * 60 * 60 * 1000

           if (passwordType === 'register') {
            if (currentTime - tempPasswordTime > Hours24) {
              // 注册是24小时时效
              setError(
                "The time limit for each password change is 24 hours. If the current change request has expired, please re-initiate it.",
              )
              setExpired(true)
              return
            }
           } else {
             if (currentTime - tempPasswordTime > fiveMinutesInMs) {
               // 5分钟时效
               setError(
                 "The time limit for each password change is 5 minutes. If the current change request has expired, please re-initiate it.",
               )
               setExpired(true)
               return
             }
           }

          }

          setUserData(userData)
        } catch (error) {
          console.error("Error fetching vendor data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [router, token])

  const form = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Enable real-time validation
  })

  // Watch password field for real-time validation
  const password = form.watch("password")

  useEffect(() => {
    // Validate password requirements in real-time
    setLengthValid(password.length >= 8 && password.length <= 20)
    setCaseValid(/(?=.*[a-z])(?=.*[A-Z])/.test(password))
    setCharValid(/(?=.*[a-zA-Z])|(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password))
  }, [password])

  async function onSubmit(data: PasswordSchema) {
    if (expired) {
      setError(
        "The time limit for each password change is 5 minutes. If the current change request has expired, please re-initiate it.",
      )
      return
    }
    setIsLoading(true)
    setError("")

    try {
      //: Implement password change API call
      const X_CSRF_Token = await refresh_csrf("/auth-srv/pre-register?from=user-management")
      if (X_CSRF_Token) {
        const newUser = {
          token: token,
          type: passwordType,
          password: data.confirmPassword,
        }
        await updatePassword(newUser, X_CSRF_Token)
      } else {
        setError("Network abnormality, please refresh the page, please try again.")
      }

      // Simulate successful password change
      if (userData) {
        // Set user info
        const userInfo = await getUserById(userData.username)

        // Save to local storage
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userPermissions", JSON.stringify(userInfo.permissions || []))
        localStorage.setItem("userInfo", JSON.stringify(userInfo))

        // Update app context
        setUserPermissions(userInfo.permissions || [])
        setUserInfo(userInfo)
        setIsLoggedIn(true)

        // Redirect to dashboard
        router.replace("/dashboard")
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError(error.response?.data?.detail)
      } else {
        setError("Network abnormality, please refresh the page, please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]">
        <Card className="w-full max-w-[1000px] overflow-hidden shadow-md">
          <CardContent className="p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-8 mx-auto">
                <Image
                  src={IMAGE_PATHS.DEFAULT_FRESHPOINT_LOGO || "/placeholder.svg"}
                  alt="Freshpoint Logo"
                  width={180}
                  height={50}
                  priority
                />
              </div>
              <p>Loading user data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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

            <h1 className="text-2xl font-semibold mb-6">Create a password</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input {...field} type={showConfirmPassword ? "text" : "password"} />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password requirements */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CircleCheck
                      className={`h-5 w-5 rounded-full ${lengthValid ? "text-[#15803d]" : "text-[#71717a]"}`}
                    />
                    <span className="text-sm">Enter between 8 to 20 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck
                      className={`h-5 w-5 rounded-full ${caseValid ? "text-[#15803d]" : "text-[#71717a]"}`}
                    />
                    <span className="text-sm">Use upper and lower case letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck
                      className={`h-5 w-5 rounded-full ${charValid ? "text-[#15803d]" : "text-[#71717a]"}`}
                    />
                    <span className="text-sm">Enter at least 1 letter or 1 symbol</span>
                  </div>
                </div>

                {error && (
                  <LoginAlert variant="destructive" className="bg-[#fee2e2] text-[#dc2626] border-[#dc2626]">
                    <AlertCircle className="h-4 w-4" />
                    <LoginAlertDescription>{error}</LoginAlertDescription>
                  </LoginAlert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#15803d] hover:bg-[#15803d]/90"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              </form>
            </Form>

            {/* Add BlueForce logo at the bottom left */}
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