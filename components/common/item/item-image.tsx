"use client"

import React, { useEffect, useState, useCallback } from "react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ItempicAlert, ItempicAlertDescription } from "@/components/common/itempic-alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle, Upload, RefreshCw, Trash2 } from "lucide-react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

import { useWatch, useFormContext } from "react-hook-form"

import { IMAGE_PATHS } from "@/contexts/images"

// Define a default image path
const DEFAULT_IMAGE = IMAGE_PATHS.DEFAULT_ITEM

// Maximum file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024

interface ItemImageProps {
  form: any
  isEditing: boolean
  onImageChange?: (file: File) => Promise<void>
  fieldName?: string
}

export function ItemImage({ form, isEditing, onImageChange, fieldName = "smallImageUrl"}: ItemImageProps) {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCropping, setIsCropping] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [uniqueKey, setUniqueKey] = useState(Date.now());
  

  // Crop related states
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 0,
    y: 0,
  })
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const imageContainerRef = React.useRef<HTMLDivElement>(null)

  const formContext = useFormContext()
  // Watch the correct field path
  const smallImageUrl = useWatch({
    control: form.control,
    name: fieldName,
    exact: true // 添加精确匹配
  });

  // Update image URL when smallImageUrl changes
  useEffect(() => {
    if (smallImageUrl === "uploading...") {
      setIsUploading(true)
      return
    }

    setIsUploading(false)
    setImageLoaded(false)

    console.log(imageLoaded)

    if (smallImageUrl) {
      setUniqueKey(Date.now() + Math.random())
      try {
        const baseUrl = `https://fp.ablueforce.com/api/files/${smallImageUrl}/media`
        // Add timestamp to avoid caching
        const cacheBuster = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
        const newImageUrl = `${baseUrl}?v=${cacheBuster}`
        setImageUrl(newImageUrl)

        // // Preload the image to ensure it's in the browser cache
        // const preloadImage = new globalThis.Image()
        // preloadImage.crossOrigin = "anonymous"
        // preloadImage.src = newImageUrl
        // preloadImage.onload = () => {
        //   // Force a re-render when the image is successfully loaded
        //   setForceUpdate((prev) => prev + 1)
        // }
        // preloadImage.onerror = () => {
        //   console.error("Preload image failed:", newImageUrl)
        //   setImageUrl(DEFAULT_IMAGE)
        // }

        // Increment the key to force a complete re-render of the Image component
      } catch (error) {
        console.error("Error setting image URL:", error)
        setImageUrl(DEFAULT_IMAGE)
      }
 
    } else {
      setImageUrl(DEFAULT_IMAGE)
    }
  }, [smallImageUrl])

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)

    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 2MB limit")
      return
    }

    // Create preview URL and open crop dialog
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedFile(file)
    setCropDialogOpen(true)

    // Reset crop to center when a new image is loaded
    setCrop({
      unit: "%",
      width: 50,
      height: 50,
      x: 25,
      y: 25,
    })
  }, [])

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/gif": [],
      "image/webp": [],
    },
    maxFiles: 1,
    disabled: !isEditing,
  })

  // Process and upload the cropped image
  const handleCropComplete = useCallback(async () => {
    if (!selectedFile || !completedCrop || !imgRef.current || isCropping) {
      return
    }

    setIsCropping(true)

    try {
      const image = imgRef.current
      const canvas = document.createElement("canvas")
      const crop = completedCrop
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      canvas.width = crop.width
      canvas.height = crop.height

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height,
      )

      // Set form value to "uploading..." to show loading state
      const formToUse = formContext || form
      formToUse.setValue(fieldName, "uploading...", { shouldValidate: true, shouldDirty: true, shouldTouch: true })

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), selectedFile.type)
      })

      if (!blob || !onImageChange) {
        throw new Error("Failed to create image blob")
      }

      // Create a new file from the blob
      const croppedFile = new File([blob], selectedFile.name, {
        type: selectedFile.type,
        lastModified: Date.now(),
      })

      // Upload the cropped image
      await onImageChange(croppedFile)

      // setTimeout(() => {
      //   setForceUpdate((prev) => prev + 1)
      // }, 1000)

      // Close dialog and clean up
      setCropDialogOpen(false)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    } catch (error) {
      console.error("Error uploading cropped image:", error)
      setError("Failed to upload image")
      const formToUse = formContext || form
      formToUse.setValue(fieldName, null, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
      // setForceUpdate(prev => prev + 1) // 强制刷新
    } finally {
      setIsCropping(false)
    }
  }, [selectedFile, completedCrop, onImageChange, previewUrl, form, formContext, isCropping, fieldName])

  // Handle replace image
  const handleReplace = useCallback(() => {
    setError(null)
    // Trigger file input click
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/jpeg,image/png,image/gif,image/webp"
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 2MB limit")
        return
      }

      // Create preview URL and open crop dialog
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setSelectedFile(file)
      setCropDialogOpen(true)
    }
    fileInput.click()
  }, [])

  // Handle remove image
  const handleRemove = useCallback(() => {
    const formToUse = formContext || form
    formToUse.setValue(fieldName, null, { shouldValidate: true, shouldDirty: true })
    setImageUrl(DEFAULT_IMAGE)
    // setForceUpdate((prev) => prev + 1)
  }, [form, formContext, fieldName])

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  return (
    <div className="space-y-4">
      {isEditing && (
        <div className="relative" ref={imageContainerRef}>
          {/* Always render the AspectRatio container to ensure consistent layout */}
          <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading image...</p>
                </div>
              </div>
            ) : (
              <Image
                key={`image-${uniqueKey}`}
                src={imageUrl || DEFAULT_IMAGE}
                alt="Item image"
                fill
                className="rounded-md object-cover"
                crossOrigin="anonymous"
                unoptimized={true} // Add this to bypass Next.js image optimization
                priority={true} // Add priority to load the image faster
                onLoad={handleImageLoad}
                onError={(e) => {
                  console.error('Image load failed:', imageUrl);
                  (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                }}
              />
            )}
          </AspectRatio>

          {/* Position buttons vertically on the right side */}
          {smallImageUrl && !isUploading && (
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 px-2 bg-white/80 hover:bg-white"
                onClick={handleReplace}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Replace
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-8 px-2 bg-white/80 hover:bg-white text-destructive hover:text-destructive"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      )}

      {!isEditing && (
        <AspectRatio ratio={1} className="bg-muted">
          <Image
            src={imageUrl || DEFAULT_IMAGE}
            alt="Item image"
            fill
            className="rounded-md object-cover"
            unoptimized={true}
            crossOrigin="anonymous"
          />
        </AspectRatio>
      )}

      {isEditing && !smallImageUrl && (
        <FormField
          control={formContext?.control || form.control}
          name={fieldName}
          render={() => (
            <FormItem>
              <FormLabel>Picture</FormLabel>
              <FormControl>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors
                    ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}
                    hover:border-primary hover:bg-primary/5`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {isDragActive ? "Drop the image here" : "Drag & drop an image here"}
                    </p>
                    <p className="text-xs text-muted-foreground">or click to select (JPEG, PNG, GIF, WEBP, max 2MB)</p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {error && (
        <ItempicAlert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <ItempicAlertDescription>{error}</ItempicAlertDescription>
        </ItempicAlert>
      )}

      {/* Image Cropping Dialog */}
      <Dialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          // Prevent closing dialog during cropping
          if (!isCropping) {
            setCropDialogOpen(open)
            if (!open && previewUrl) {
              URL.revokeObjectURL(previewUrl)
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] overflow-auto">
            {previewUrl && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1} // This is passed to ReactCrop component, not to the crop state
                circularCrop={false}
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={previewUrl || "/placeholder.svg"}
                  alt="Crop preview"
                  className="max-w-full"
                  crossOrigin="anonymous"
                />
              </ReactCrop>
            )}
          </div>

          <DialogFooter className="flex justify-between mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCropDialogOpen(false)
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl)
                }
              }}
              disabled={isCropping}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropComplete}
              disabled={isCropping}
              className={isCropping ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isCropping ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Apply Crop"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}