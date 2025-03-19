"use client"

import Image from "next/image"
import * as z from "zod"

import { Card, CardContent } from "@/components/ui/card"

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


export default function ResetSuccessPage() {

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
              A password reset email has been sent! Please check your inbox and follow the instructions in the email.
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

