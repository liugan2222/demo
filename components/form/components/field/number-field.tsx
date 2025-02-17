import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn, FieldPath } from "react-hook-form"
import "@/app/globals.css";

interface NumberFieldProps<T extends Record<string, any>> {
  form: UseFormReturn<T>
  name: FieldPath<T>
  label: string
  required?: boolean
  isEditing: boolean
}

export function NumberField<T extends Record<string, any>>({ 
  form, 
  name, 
  label, 
  required = false, 
  isEditing 
}: NumberFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        <FormItem>
          <FormLabel className={required ? "form-label font-common after:content-['*'] after:ml-0.5 after:text-red-500" : "form-label font-common "}>
            {label}
          </FormLabel>
          <FormControl>
            {isEditing ? (
              <Input 
                type="number"
                {...field}
                value={value?.toString() ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value)
                  onChange(val)
                }}
                onWheel={(e) => e.currentTarget.blur()}
                min={0}
                step="any"
                required={required}
              />
            ) : (
              <div className="mt-1 text-sm font-medium">
                {value?.toString() ?? ''}
              </div>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}