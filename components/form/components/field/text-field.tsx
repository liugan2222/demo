import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn, FieldPath } from "react-hook-form"

interface TextFieldProps<T extends Record<string, any>> {
  form: UseFormReturn<T>
  name: FieldPath<T>
  label: string
  required?: boolean
  isEditing: boolean
}

export function TextField<T extends Record<string, any>>({ 
  form, 
  name, 
  label, 
  required = false, 
  isEditing 
}: TextFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={required ? "text-zinc-600 text-sm font-normal  leading-tight  after:content-['*'] after:ml-0.5 after:text-red-500" : "text-zinc-600 text-sm font-normal  leading-tight"}>
            {label}
          </FormLabel>
          <FormControl>
            {isEditing ? (
              <Input 
                {...field} 
                value={field.value?.toString() ?? ''} 
                onChange={(e) => field.onChange(e.target.value)}
                required={required}
              />
            ) : (
              <div className="text-[#121619] text-sm font-normal leading-tight">
                {field.value?.toString() ?? ''}
              </div>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}