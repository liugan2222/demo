import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn, FieldPath } from "react-hook-form"
import "@/app/globals.css";

interface TextFieldProps<T extends Record<string, any>> {
  form: UseFormReturn<T>
  name: FieldPath<T>
  label: string
  required?: boolean
  isEditing: boolean
  // showWhenEmpty?: boolean
}

export function TextField<T extends Record<string, any>>({ 
  form, 
  name, 
  label, 
  required = false, 
  isEditing,
}: TextFieldProps<T>) {

  const fieldValue = form.watch(name);

  if (!isEditing && !fieldValue) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={required ? "form-label font-common after:content-['*'] after:ml-0.5 after:text-red-500" : "form-label font-common"}>
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
              <div className="form-control font-common">
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