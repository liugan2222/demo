"use client"
import React, {useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

import { locationformSchema, Locationform } from '@/components/tanstack/schema/formSchema/locationformSchema'
import { TextField } from './components/field/text-field'

import { getLocationById } from '@/lib/api';


interface LocationFormProps {
  selectedItem: Locationform 
  onSave: (formData: Locationform) => void 
  onCancel: () => void
  isEditing: boolean
}

export function LocationForm({ selectedItem, onSave, onCancel, isEditing }: LocationFormProps) {

  const [loading, setLoading] = useState(true)

  const form = useForm<Locationform>({
    resolver: zodResolver(locationformSchema),
    defaultValues: selectedItem,
  })

  useEffect(() => {
    const fetchVendorData = async () => {
      if (selectedItem.facilityId && selectedItem.locationSeqId) {
        try {
          setLoading(true)
          const locationData = await getLocationById(selectedItem.facilityId, selectedItem.locationSeqId)
          // form.reset(warehouseData)
          // Update form values with fetched data
          Object.keys(locationData).forEach((key) => {
            form.setValue(key as keyof Locationform, locationData[key])
          })
        } catch (error) {
          console.error("Error fetching vendor data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    fetchVendorData()
  }, [selectedItem.facilityId, selectedItem.locationSeqId, form])


  const onSubmit = async (data: Locationform) => {
    try {
      console.log('Form submitted with data:', data)
      // Call the onSave callback with the form data
      await onSave(data)
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col h-full">
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">

            <TextField form={form} name="facilityName" label="Warehouse" isEditing={false} />
            <TextField form={form} name="locationName" label="Location" isEditing={isEditing} />
            <TextField form={form} name="gln" label="GLN" isEditing={isEditing} />
            <TextField form={form} name="locationCode" label="Location Number" isEditing={isEditing} />
            <TextField form={form} name="areaId" label="Warehouse Zone" isEditing={isEditing} />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Textarea {...field} value={field.value ?? ''} 
                       onChange={(e) => field.onChange(e.target.value)}/>
                    ) : (
                      <div className="mt-1 text-sm font-medium">
                        {field.value?.toString() ?? ''}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </ScrollArea> 
        
        {isEditing && (
          <div className="flex justify-end space-x-2 p-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        )}
      </form>
    </Form>
  )
}