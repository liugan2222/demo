import React from 'react'
import { Button } from "@/components/ui/button"

interface CustomAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onCancel: () => void
  onConfirm: () => void
}

export function CustomAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  onCancel,
  onConfirm
}: CustomAlertDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Continue</Button>
        </div>
      </div>
    </div>
  )
}

