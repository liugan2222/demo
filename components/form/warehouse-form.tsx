import React, {useEffect, useState, useCallback } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import { warehouseformSchema, Warehouseform } from '@/components/tanstack/schema/formSchema/warehouseformSchema'
import { NumberField } from './components/field/number-field'
import { TextField } from './components/field/text-field'

import { useCountries } from "@/hooks/use-cached-data"
import { getStatesAndProvinces, getWarehouseById, updateWarehouse } from '@/lib/api';

interface WarehouseFormProps {
  selectedItem: Warehouseform 
  onSave: (formData: Warehouseform) => void 
  onCancel: () => void
  isEditing: boolean
}

// Define the Country type
interface Country {
  geoId: string;
  geoName: string;
}

export function WarehouseForm({ selectedItem, onSave, onCancel, isEditing }: WarehouseFormProps) {

  const { data: countries = [] } = useCountries(true)
  const [contactstates, setContactstates] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<Warehouseform>({
    resolver: zodResolver(warehouseformSchema),
    defaultValues: {
      ...selectedItem,
      businessContacts: selectedItem.businessContacts || [{}], 
    },
  })

  useEffect(() => {
    const fetchVendorData = async () => {
      if (selectedItem.facilityId) {
        try {
          setLoading(true)
          const warehouseData = await getWarehouseById(selectedItem.facilityId)
          // Ensure businessContacts exists with at least one empty object
          const formattedData = {
            ...warehouseData,
            businessContacts: warehouseData.businessContacts?.length 
              ? warehouseData.businessContacts 
              : [{}]
          }
          form.reset(formattedData)
  
          // If there's a country selected, fetch its states
          if (formattedData.businessContacts?.[0]?.countryGeoId) {
            await handleContactCountryChange(formattedData.businessContacts[0].countryGeoId)
          }
        } catch (error) {
          console.error("Error fetching vendor data:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchVendorData()
  }, [selectedItem.facilityId, form]) 

  const onSubmit = async (data: Warehouseform) => {
    try {
      console.log('Form submitted with data:', data)
      if (data.facilityId) {
        await updateWarehouse(data.facilityId, data)
      }
      // Call the onSave callback with the form data
      await onSave(data)
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors)
  }

   // Helper function to find the geoName for a given geoId
   const findCountryName = (geoId: string | undefined, countries: Country[]): string => {
    if (!geoId) return '';
    const country = countries.find(country => country.geoId === geoId);
    return country ? country.geoName : '';
  }

    // Contact Handle country change and fetch states/provinces
    const handleContactCountryChange = useCallback(async (countryId: string) => {
      try {
        const statesData = await getStatesAndProvinces(countryId);
        setContactstates(statesData);
      } catch (error) {
        console.error('Error fetching states/provinces:', error);
        // Handle error (e.g., show error message to user)
      }
    }, []);

    const getFormValue = (path: string) => {
      return form.getValues(path as any) ?? ''
    }

    if (loading) {
      return <div>Loading...</div>
    }  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col h-full">
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">
       
            <TextField form={form} name="facilityName" label="Warehouse" required isEditing={isEditing} />
            <TextField form={form} name="gln" label="GLN" isEditing={isEditing} />
            <TextField form={form} name="internalId" label="Warehouse Number" isEditing={isEditing} />
            <NumberField form={form} name="facilitySize" label="Capacity" isEditing={isEditing} />

            <FormField
              control={form.control}
              name="businessContacts.0.countryGeoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Country</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleContactCountryChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries?.map((country: Country) => (
                            <SelectItem key={country.geoId} value={country.geoId}>
                              {country.geoName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {findCountryName(getFormValue('businessContacts.0.countryGeoId'), countries)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.physicalLocationAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Address</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.physicalLocationAddress')}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">City</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.city')}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.stateProvinceGeoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">State/Province</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state/province" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactstates?.map((state: Country) => (
                            <SelectItem key={state.geoId} value={state.geoId}>
                              {state.geoName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {findCountryName(getFormValue('businessContacts.0.stateProvinceGeoId'), contactstates)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />   

            <FormField
              control={form.control}
              name="businessContacts.0.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Postal Code</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.zipCode')}
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

