import React, {useEffect, useState, useCallback } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { X, Edit2, EyeOff, Eye } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

import { warehouseformSchema, Warehouseform } from '@/components/tanstack/schema/formSchema/warehouseformSchema'
import { NumberField } from './components/field/number-field'
import { TextField } from './components/field/text-field'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import "@/app/globals.css";

import { useAppContext } from "@/contexts/AppContext"
import { getStatesAndProvinces, getWarehouseById, updateWarehouse, warehouseDeactive, warehouseActive } from '@/lib/api';

interface WarehouseFormProps {
  selectedItem: Warehouseform 
  onSave: () => void 
  onCancel: () => void
  isEditing: boolean
  onToggleEdit: () => void 
}

// Define the Country type
interface Country {
  geoId: string;
  geoName: string;
}

export function WarehouseForm({ selectedItem, onSave, onCancel, isEditing, onToggleEdit }: WarehouseFormProps) {

  const { countries = [], userPermissions, userInfo } = useAppContext()
  const isUpdate = (userInfo?.username === "admin") || (userPermissions.includes('Warehouses_Update'))
  const isDisable = (userInfo?.username === "admin") || (userPermissions.includes('Warehouses_Disable'))

  const [contactstates, setContactstates] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = useState(false)
  const [isStatePopoverOpen, setIsStatePopoverOpen] = useState(false)

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
      await onSave()
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  // const onError = (errors: any) => {
  //   console.error('Form validation errors:', errors)
  // }

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

    const handleDisable = async () => {
      const warehouseIds: string[] = [selectedItem.facilityId ?? ''];
      await warehouseDeactive(warehouseIds)
      await onSave()
    }
    const handleEnable = async () => {
      const warehouseIds: string[] = [selectedItem.facilityId ?? ''];
      await warehouseActive(warehouseIds)
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
       
            <TextField form={form} name="facilityName" label="Warehouse" required isEditing={isEditing} />
            <TextField form={form} name="gln" label="GLN" isEditing={isEditing} />
            <TextField form={form} name="internalId" label="Warehouse number" isEditing={isEditing} />
            <NumberField form={form} name="facilitySize" label="Capacity" isEditing={isEditing} />

            {isEditing || form.getValues('businessContacts.0.countryGeoId') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.countryGeoId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="form-label font-common">Country<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <div className="relative">
                            <Popover open={isCountryPopoverOpen} onOpenChange={setIsCountryPopoverOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                                  >
                                    {field.value ?? "Select a country"}
                                    {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search country..." />
                                  <CommandList>
                                    <CommandEmpty>No country found.</CommandEmpty>
                                    <CommandGroup>
                                      {countries?.map((country) => (
                                        <CommandItem
                                          value={country.geoId}
                                          key={country.geoId}
                                          onSelect={() => {
                                            field.onChange(country.geoId)
                                            handleContactCountryChange(country.geoId)
                                            setIsCountryPopoverOpen(false) // 选择后关闭下拉
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === country.geoId ? "opacity-100" : "opacity-0",
                                            )}
                                          />
                                          {country.geoName}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
  
                            {/* 图标容器 */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {/* 清除按钮 */}
                              {field.value && (
                                <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  field.onChange("")
                                  setIsCountryPopoverOpen(false)
                                }}
                                >
                                <X className="h-4 w-4" />
                                </button>
                              )}

                              {/* 下拉图标 */}
                              <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            </div>
                          </div>
                          ) : (
                            <div className="form-control font-common">
                              {findCountryName(getFormValue('businessContacts.0.countryGeoId'), countries)}
                            </div>
                          )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            ) : null}


            {isEditing || form.getValues('businessContacts.0.physicalLocationAddress') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.physicalLocationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Address<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.physicalLocationAddress')}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.city') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">City<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.city')}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.stateProvinceGeoId') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.stateProvinceGeoId"
                render={({ field }) => {

                  return (
                    <FormItem>
                      <FormLabel>State/Province<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <div className="relative">
                              <Popover open={isStatePopoverOpen} onOpenChange={setIsStatePopoverOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      role="combobox"
                                      className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                                    >
                                      {field.value ?? "Select a state"}
                                      {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Search state/province..." />
                                    <CommandList>
                                      <CommandEmpty>No state/province found.</CommandEmpty>
                                      <CommandGroup>
                                        {contactstates?.map((state) => (
                                          <CommandItem
                                            value={state.geoId}
                                            key={state.geoId}
                                            onSelect={() => {
                                              field.onChange(state.geoId)
                                              setIsStatePopoverOpen(false) // 选择后关闭下拉
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === state.geoId ? "opacity-100" : "opacity-0",
                                              )}
                                            />
                                            {state.geoName}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
  
                              {/* 图标容器 */}
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {/* 清除按钮 */}
                                {field.value && (
                                  <button
                                  type="button"
                                  className="text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    field.onChange("")
                                    setIsStatePopoverOpen(false)
                                  }}
                                  >
                                  <X className="h-4 w-4" />
                                  </button>
                                )}

                                {/* 下拉图标 */}
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                              </div>
                            </div>
                            ) : (
                              <div className="form-control font-common">
                                {findCountryName(getFormValue('businessContacts.0.stateProvinceGeoId'), contactstates)}
                              </div>
                            )}
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.zipCode') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Postal code<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.zipCode')}
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

