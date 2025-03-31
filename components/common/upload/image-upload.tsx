"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle, Upload, RefreshCw, Trash2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { useWatch } from "react-hook-form"
import { IMAGE_PATHS } from "@/contexts/images"

// Define a default image path
const DEFAULT_IMAGE = IMAGE_PATHS.DEFAULT_ITEM

// Maximum file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024

interface UserImageUploadProps {
  form: any
  isEditing: boolean
  onImageChange: (file: File) => Promise<void>
  fieldName?: string
}

export function ImageUpload({ form, isEditing, onImageChange, fieldName = "smallImageUrl" }: UserImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  })
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [uniqueKey, setUniqueKey] = useState(Date.now())

  const imgRef = React.useRef<HTMLImageElement>(null)

  // Watch the smallImageUrl field
  const smallImageUrl = useWatch({
    control: form.control,
    name: fieldName,
  })

  // Update image URL when smallImageUrl changes
  useEffect(() => {
    if (smallImageUrl === "uploading...") {
      setIsUploading(true)
      return
    }

    setIsUploading(false)

    if (smallImageUrl) {
      try {
        const baseUrl = `https://fp.ablueforce.com/api/files/${smallImageUrl}/media`
        // Add timestamp to avoid caching
        const cacheBuster = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
        const newImageUrl = `${baseUrl}?v=${cacheBuster}`

        console.log("Setting image URL:", newImageUrl)
        setImageUrl(newImageUrl)

        // Force a re-render with a new key
        setUniqueKey(Date.now())
      } catch (error) {
        console.error("Error setting image URL:", error)
        setImageUrl(DEFAULT_IMAGE)
      }
    } else {
      setImageUrl(DEFAULT_IMAGE)
    }
  }, [smallImageUrl])

  // Handle file drop
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
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
  const handleCropComplete = React.useCallback(async () => {
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
      form.setValue(fieldName, "uploading...")

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

      // Close dialog and clean up
      setCropDialogOpen(false)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    } catch (error) {
      console.error("Error uploading cropped image:", error)
      setError("Failed to upload image")
      form.setValue(fieldName, null)
    } finally {
      setIsCropping(false)
    }
  }, [selectedFile, completedCrop, onImageChange, previewUrl, form, fieldName, isCropping])

  // Handle replace image
  const handleReplace = React.useCallback(() => {
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
  const handleRemove = React.useCallback(() => {
    form.setValue(fieldName, null)
    setImageUrl(DEFAULT_IMAGE)
    setUniqueKey(Date.now())
  }, [form, fieldName])

  return (
    <div className="space-y-4 w-full">
      <div className="text-sm font-medium mb-2">Item image</div>
      <div className="flex flex-row gap-4">
        <div className="relative bg-muted rounded-md overflow-hidden flex" style={{ width: "50%", height: "50%" }}>
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading image...</p>
              </div>
            </div>
          ) : (
            <div className="flex w-full h-full"> 
              <div className="flex-1 relative">
                <img
                  key={`user-image-${uniqueKey}`}
                  src={imageUrl || "/placeholder.svg"}
                  alt="Item image"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error("Image load failed:", imageUrl)
                    ;(e.target as HTMLImageElement).src = DEFAULT_IMAGE
                  }}
                />
              </div>
              {/* TODO 放到 img的右边 根据img的高度剧中显示 */}
              <div className="flex flex-col justify-center items-center p-2 space-y-3 border-l">
                {isEditing && smallImageUrl ? (
                  <>
                    <Button type="button" 
                      size="sm" 
                      variant="secondary" 
                      className="w-full shadow-sm hover:bg-background"
                      onClick={handleReplace}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Replace
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="destructive" 
                      className="w-full  hover:bg-foreground" 
                      onClick={handleRemove}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors mt-4
                      ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}
                      hover:border-primary hover:bg-primary/5`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm font-medium">{isDragActive ? "Drop the image here" : "Drag & drop an image here"}</p>
                      <p className="text-xs text-muted-foreground">or click to select (JPEG, PNG, GIF, WEBP, max 2MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* {isEditing && !smallImageUrl && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors mt-4
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}
            hover:border-primary hover:bg-primary/5`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">{isDragActive ? "Drop the image here" : "Drag & drop an image here"}</p>
            <p className="text-xs text-muted-foreground">or click to select (JPEG, PNG, GIF, WEBP, max 2MB)</p>
          </div>
        </div>
      )} */}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                aspect={1}
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