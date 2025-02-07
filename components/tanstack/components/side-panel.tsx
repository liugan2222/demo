import { X, Edit2 } from 'lucide-react'
import { Button } from "@/components/ui/button"

import { ItemForm } from "@/components/form/item-form"
import { VendorForm } from "@/components/form/vendor-form"
import { WarehouseForm } from "@/components/form/warehouse-form"
import { LocationForm } from "@/components/form/location-form"
import { PoForm } from "@/components/form/po-form"

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  selectedItem: any
  dataType: string // Add more types as needed
  onSave: (updatedItem: any) => void
  isEditing: boolean
  onToggleEdit: () => void
}

export function SidePanel({
  isOpen,
  onClose,
  selectedItem,
  dataType,
  onSave,
  isEditing,
  onToggleEdit,
}: SidePanelProps) {

  if (!isOpen) return null

  const renderForm = () => {
    switch (dataType) {
      case 'vendors':
        return <VendorForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing}/>
      case 'items':
        return <ItemForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing}/>
      case 'warehouses':
        return <WarehouseForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing}/>
      case 'locations':
        return <LocationForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing}/>
      case 'procurements':
      return <PoForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing}/>  
      default:
        return <div>Unsupported item type</div>
    }
  }

  return (
    <div className="w-96 border-l border-border bg-background flex flex-col h-[calc(73vh)]">
      <div className="flex items-center justify-between p-4 border-border">
        <h2 className="text-lg font-semibold"></h2>
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={onToggleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        {renderForm()}
      </div>
    </div>
  )
}

