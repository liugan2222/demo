import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  selectedItem: any // Replace 'any' with your actual item type
  onSave: (updatedItem: any) => void // Replace 'any' with your actual item type
}

export function ItemSidePanel({ isOpen, onClose, selectedItem, onSave }: SidePanelProps) {
  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Collect form data and call onSave
    // This is a simplified example, adjust according to your actual data structure
    const formData = new FormData(e.target as HTMLFormElement)
    const updatedItem = {
      ...selectedItem,
      name: formData.get('name'),
      description: formData.get('description'),
    }
    onSave(updatedItem)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Edit Item</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="id">ID</Label>
            <Input id="id" name="id" defaultValue={selectedItem?.id} />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={selectedItem?.name} />
          </div>
          {/* Add more fields as needed */}
        </div>
        <div className="mt-6">
          <Button type="submit" className="w-full">Save Changes</Button>
        </div>
      </form>
    </div>
  )
}

