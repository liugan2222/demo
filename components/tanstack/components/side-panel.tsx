import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ItemForm } from "@/components/form/item-from"
// import { OrderForm } from "./forms/OrderForm"

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  selectedItem: any
  dataType: string // Add more types as needed
  onSave: (updatedItem: any) => void
}

export function SidePanel({
  isOpen,
  onClose,
  selectedItem,
  dataType,
  onSave,
}: SidePanelProps) {
  if (!isOpen) return null

  const renderForm = () => {
    switch (dataType) {
      case 'items':
        return <ItemForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} />
      // case 'order':
      //   return <OrderForm onSubmit={onSave} onCancel={onClose} />
      default:
        return <div>Unsupported item type</div>
    }
  }

  return (
    <div className="w-96 border-l border-border bg-background p-6">
      <div className="flex items-center justify-end mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {renderForm()}
    </div>
  )
}

