"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertCircle, CircleCheck, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoginAlert, LoginAlertDescription } from "@/components/common/login-alert"
import { Card, CardContent } from "@/components/ui/card"

import { useAppContext } from "@/contexts/AppContext"
import { IMAGE_PATHS  } from "@/contexts/images"

// import { updatePassword, refresh_csrf } from "@/lib/api"

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
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type PasswordSchema = z.infer<typeof passwordSchema>

export default function ChangePasswordPage() {
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

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem("tempUserInfo")
    if (!storedUserData) {
      // Redirect to login if no user data
      router.replace("/login")
      return
    }

    setUserData(JSON.parse(storedUserData))
  }, [router])

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
    setIsLoading(true)
    setError("")

    try {
      // TODO: Implement password change API call
      console.log("Password change submitted:", data)
      // const X_CSRF_Token = await refresh_csrf('/pre-register?from=user-management')
      // if (X_CSRF_Token) {
      //   const newUser = {
      //     ...data,
      //     groupIds: groups
      //   }
      //   const response = await updatePassword(newUser)
      // } else {
      //   console.error("Error:", 111)
      // }

      // Simulate successful password change
      if (userData) {
        // Update user data
        userData.passwordChangeRequired = false

        // Save to local storage
        localStorage.removeItem("tempUserInfo")
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userPermissions", JSON.stringify(userData.permissions || []))
        localStorage.setItem("userInfo", JSON.stringify(userData))

        // Update app context
        setUserPermissions(userData.permissions || [])
        setUserInfo(userData)
        setIsLoggedIn(true)

        // Redirect to dashboard
        router.replace("/dashboard")
      }
    } catch (error) {
      console.error("Password change error:", error)
      setError("An error occurred while changing your password. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
                    <CircleCheck className={`h-5 w-5 rounded-full ${lengthValid ? "text-[#15803d]" : "text-[#71717a]"}`} />
                    <span className="text-sm">Enter between 8 to 20 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className={`h-5 w-5 rounded-full ${caseValid ? "text-[#15803d]" : "text-[#71717a]"}`} />
                    <span className="text-sm">Use upper and lower case letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className={`h-5 w-5 rounded-full ${charValid ? "text-[#15803d]" : "text-[#71717a]"}`} />
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
                  {isLoading ? "Processing..." : "Login"}
                </Button>
              </form>
            </Form>
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

