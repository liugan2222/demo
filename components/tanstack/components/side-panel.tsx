
import { ItemForm } from "@/components/form/item-form"
import { VendorForm } from "@/components/form/vendor-form"
import { WarehouseForm } from "@/components/form/warehouse-form"
import { LocationForm } from "@/components/form/location-form"
import { PoForm } from "@/components/form/po-form"
import { ReceiveForm } from "@/components/form/receive-form"
import { UserForm } from "@/components/form/user-form"
import { RoleForm } from "@/components/form/role-form"

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  selectedItem: any
  dataType: string // Add more types as needed
  onSave: () => void
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
        return <VendorForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing} onToggleEdit={onToggleEdit}/>
      case 'items':
        return <ItemForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing} onToggleEdit={onToggleEdit}/>
      case 'warehouses':
        return <WarehouseForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing} onToggleEdit={onToggleEdit}/>
      case 'locations':
        return <LocationForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing} onToggleEdit={onToggleEdit}/>
      case 'procurements':
        return <PoForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing} onToggleEdit={onToggleEdit}/>
      case 'receivings':
        return <ReceiveForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing} onToggleEdit={onToggleEdit}/>
      case 'users':
        return <UserForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing} onToggleEdit={onToggleEdit}/>
      case 'roles':
        return <RoleForm selectedItem={selectedItem} onSave={onSave} onCancel={onClose} isEditing={isEditing} onToggleEdit={onToggleEdit}/>
      default:
        return <div>Unsupported item type</div>
    }
  }

  return (
    <div className="absolute top-0 right-0 h-full w-[386px] bg-white border-l border-gray-200 shadow-lg z-10 overflow-hidden">
      {renderForm()}
      {/* <div className="flex-grow overflow-hidden">
      </div> */}
    </div>
  )
}

