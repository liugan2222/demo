import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface FormFuctionProps {
  onSubmit: (data: Record<string, any>) => void
  onCancel: () => void
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'textarea'
  defaultValue?: string | number
}

interface BaseFormProps extends FormFuctionProps {
  fields: FormField[]
  title: string
}

export function BaseForm({ fields, title, onSubmit, onCancel }: BaseFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            name={field.name}
            type={field.type}
            defaultValue={field.defaultValue}
          />
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}

