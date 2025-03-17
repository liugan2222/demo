"use client"
import React, {useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { X, Edit2, EyeOff, Eye } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

import { locationformSchema, Locationform } from '@/components/tanstack/schema/formSchema/locationformSchema'
import { TextField } from './components/field/text-field'
import "@/app/globals.css";

import { getLocationById, updateLocation, locationDeactive, locationActive } from '@/lib/api';

import { useAppContext } from "@/contexts/AppContext"


interface LocationFormProps {
  selectedItem: Locationform 
  onSave: () => void 
  onCancel: () => void
  isEditing: boolean
  onToggleEdit: () => void 
}

export function LocationForm({ selectedItem, onSave, onCancel, isEditing, onToggleEdit }: LocationFormProps) {

  const [loading, setLoading] = useState(true)

  const { userPermissions, userInfo } = useAppContext()
  const isUpdate = (userInfo?.username === "admin") || (userPermissions.includes('Locations_Update'))
  const isDisable = (userInfo?.username === "admin") || (userPermissions.includes('Locations_Disable'))

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
          locationData.facilityId = selectedItem.facilityId
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
      if (data.facilityId && data.locationSeqId) {
        await updateLocation(data.facilityId, data.locationSeqId, data)
      }
      // Call the onSave callback with the form data
      await onSave()
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const handleDisable = async () => {
    const locationSeqIds: string[] = [selectedItem.locationSeqId ?? ''];
    await locationDeactive(selectedItem.facilityId, locationSeqIds)
    await onSave()
  }
  const handleEnable = async () => {
    const locationSeqIds: string[] = [selectedItem.locationSeqId ?? ''];
    await locationActive(selectedItem.facilityId, locationSeqIds)
    await onSave()
  } 

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          {!isEditing && isDisable && (
            <div className="flex justify-end space-x-2 p-1">
              {form.getValues('active') === 'Y' ? (
                <Button type="button" variant="destructive" size="default" onClick={handleDisable}>
                  <EyeOff size={16}/>
                  Disable
                </Button>
              ) : (
                <Button type="button" size="default" onClick={handleEnable}>
                  <Eye size={16}/>
                  Enable
                </Button>
              )}
              {!isEditing && isUpdate && (form.getValues('active') === 'Y') && (
                <Button type="button" variant="outline" size="default" onClick={onToggleEdit}>
                  <Edit2 size={16} />
                  Edit
                </Button>
              )}
            </div>
          )}
          {isEditing && (
            <div className="flex justify-end space-x-2 p-4">
            <Button type="button" size="default" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X size={16} />
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">

          <FormField
              control={form.control}
              name="facilityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label font-common">Warehouse</FormLabel>
                  <FormControl>
                    <div className="form-control font-common">
                      {field.value?.toString() ?? ''}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TextField form={form} name="locationName" label="Location" required isEditing={isEditing} />
            <TextField form={form} name="gln" label="GLN" isEditing={isEditing} />
            <TextField form={form} name="locationCode" label="Location number" isEditing={isEditing} />
            <TextField form={form} name="areaId" label="Warehouse zone" isEditing={isEditing} />

            {isEditing || form.getValues('description') ? (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Description</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Textarea {...field} value={field.value ?? ''} 
                         onChange={(e) => field.onChange(e.target.value)}/>
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
            ) : null}


          </div>
        </ScrollArea> 
      </form>
    </Form>
  )
}