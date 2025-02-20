"use client"

import type React from "react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useDropzone } from "react-dropzone";

interface ItemImageProps {
  form: any
  isEditing: boolean
  onImageChange?: (file: File) => Promise<void>
}

export function ItemImage({ form, isEditing, onImageChange }: ItemImageProps) {
  const imageUrl =
    // form.watch("smallImageUrl") || 
    "http://47.88.28.103:8080/api/files/f9c020c7-ab25-44b8-9736-69b926d08f31/media"

  // const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (file && onImageChange) {
  //     await onImageChange(file)
  //   }
  // }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp']
    },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file && onImageChange) {
        await onImageChange(file);
      }
    }
  });

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
                {/* <Input type="file" 
                  // accept="image/*" 
                  onChange={handleImageChange} 
                  className="cursor-pointer" /> */}
                <div {...getRootProps()} className="border-2 border-dashed rounded-md p-4 cursor-pointer">
                  <input {...getInputProps()} />
                  <p>Drag & drop an image here</p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

