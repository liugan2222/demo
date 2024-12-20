import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


interface ItemFormProps {
  selectedItem: any // Replace 'any' with your actual item type
  onSave: (updatedItem: any) => void // Replace 'any' with your actual item type
  onCancel: () => void
}

export function ItemForm({ selectedItem, onSave, onCancel }: ItemFormProps) {


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Collect form data and call onSave
    // This is a simplified example, adjust according to your actual data structure
    const formData = new FormData(e.target as HTMLFormElement)
    const updatedItem = {
      ...selectedItem,
      id: formData.get('id'),
      name: formData.get('name'),
      weight: formData.get('weight'),
    }
    onSave(updatedItem)
  }


  return (

    <>
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
          <div>
            <Label htmlFor="weight">Weight</Label>
            <Input type="number" id="weight" name="weight" defaultValue={selectedItem?.weight} />
          </div>
          {/* Add more fields as needed */}
        </div>
        <div className="flex justify-end mt-2 space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </>

  )
}

