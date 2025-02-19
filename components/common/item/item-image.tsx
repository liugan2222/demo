"use client"

import type React from "react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface ItemImageProps {
  form: any
  isEditing: boolean
  onImageChange?: (file: File) => Promise<void>
}

export function ItemImage({ form, isEditing, onImageChange }: ItemImageProps) {
  const imageUrl =
    // form.watch("smallImageUrl") || 
    "http://47.88.28.103:8080/api/files/8dcbc767-0ad1-488f-bc11-de185b9bd245/media"

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageChange) {
      await onImageChange(file)
    }
  }

  return (
    <div className="space-y-4">
      <AspectRatio ratio={16 / 9} className="bg-muted">
        <Image src={imageUrl || "/placeholder.svg"} alt="Item image" fill className="rounded-md object-cover" />
      </AspectRatio>

      {isEditing && (
        <FormField
          control={form.control}
          name="picture"
          render={({ 
            // field
           }) => (
            <FormItem>
              <FormLabel>Picture</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

