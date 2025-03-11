"use client"

import React, {useEffect , useState} from 'react'

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useDropzone } from "react-dropzone";

const DEFAULT_IMAGE = "/default_item_pic.png";

interface ItemImageProps {
  form: any
  isEditing: boolean
  onImageChange?: (file: File) => Promise<void>
}

export function ItemImage({ form, isEditing, onImageChange }: ItemImageProps) {
  const [imageUrl, setImageUrl] = useState("")
  const smallImageUrl = form.watch("smallImageUrl")


  // const imageUrl = form.watch("smallImageUrl") 
  //                 ? `http://47.88.28.103:8080/api/files/${form.watch("smallImageUrl")}/media`
  //                 : "/placeholder.svg"

  useEffect(() => {
    const updateImageUrl = () => {
      const baseUrl = smallImageUrl 
        ? `http://47.88.28.103:8080/api/files/${smallImageUrl}/media`
        : DEFAULT_IMAGE;
      // 添加时间戳避免缓存
      setImageUrl(`${baseUrl}?timestamp=${Date.now()}`)
    }
    
    updateImageUrl()
    // 添加轮询更新（可选）
    const interval = setInterval(updateImageUrl, 3000)
    return () => clearInterval(interval)
  }, [smallImageUrl])

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

