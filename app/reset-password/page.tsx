"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

import { LoginAlert, LoginAlertDescription } from "@/components/common/login-alert"

import { refresh_csrf, forgetPassword, getUserLastEmail } from "@/lib/api"
import { IMAGE_PATHS } from "@/contexts/images"

// Email validator
const emailValidator = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const resetPasswordSchema = z.object({
  email: z.string().min(1, "Please enter an email.").refine(emailValidator, {
    message: "Please enter a valid email address.",
  }),
})

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ResetPasswordSchema) {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // 判断当前是否可以发送邮件
      const lastInfoData = await getUserLastEmail(data.email)
      // Check if temporary password has expired (5 minutes)
      if (lastInfoData.tokenCreatedAt) {
        const tempPasswordTime = new Date(lastInfoData.tokenCreatedAt).getTime()
        const currentTime = new Date().getTime()
        const fiveMinutesInMs = 5 * 60 * 1000
        if (currentTime - tempPasswordTime <= fiveMinutesInMs) {
          // 5分钟内不可多次发起密码修改
          setError("The time limit for each password change is 5 minutes, so please try again later.")
          return
        }
      }

      // Simulate successful password reset request
      // setSuccess("Password reset instructions have been sent to your email.")

      const X_CSRF_Token = await refresh_csrf('/auth-srv/pre-register?from=user-management')
      if (X_CSRF_Token) {
        await forgetPassword(data, X_CSRF_Token)
        router.push("/reset-success")
      } else {
        setError("Network abnormality, please refresh the page, please try again.")
      }


      // Optional: redirect back to login after a delay
      // setTimeout(() => {
      //   router.push("/login")
      // }, 3000)
    } catch (error: any) {
      if (error.response?.status === 400) {
        if (error.response?.data?.detail === "User is disabled") {
          setError("This user has been disabled, please contact your admin.")
        } else if (error.response?.data?.detail === "User not found") {
          setError("Incorrect email.")
        } else {
          setError("Network abnormality, please refresh the page, please try again.")
        }
      } else {
        setError("Network abnormality, please refresh the page, please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // const handleBackToLogin = () => {
  //   router.push("/login")
  // }

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

            <h1 className="text-2xl font-semibold mb-2">Reset your password</h1>
            <p className="text-gray-600 mb-6">
              Enter your email address below and we will send you instructions to reset your password.
            </p>

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

                {error && (
                  <LoginAlert variant="destructive" className="bg-[#fee2e2] text-[#dc2626] border-[#dc2626]">
                    <AlertCircle className="h-4 w-4" />
                    <LoginAlertDescription>{error}</LoginAlertDescription>
                  </LoginAlert>
                )}

                {success && (
                  <LoginAlert className="bg-[#dcfce7] text-[#15803d] border-[#15803d]">
                    <AlertCircle className="h-4 w-4" />
                    <LoginAlertDescription>{success}</LoginAlertDescription>
                  </LoginAlert>
                )}

                <Button type="submit" className="w-full bg-[#15803d] hover:bg-[#15803d]/90" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Reset password"}
                </Button>

                {/* <Button type="button" variant="outline" className="w-full" onClick={handleBackToLogin}>
                  Back to login
                </Button> */}
              </form>
            </Form>

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

