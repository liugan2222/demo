"use client"

import React, {useEffect , useState, useCallback} from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

import { itemformSchema, Itemform } from '@/components/tanstack/schema/formSchema/itemformSchema'
import { NumberField } from './components/field/number-field'
import { TextField } from './components/field/text-field'

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { getItemById , getVendorList, updateItem } from '@/lib/api';

interface ItemFormProps {
  selectedItem: Itemform 
  onSave: (formData: Itemform) => void 
  onCancel: () => void
  isEditing: boolean
}

// Define the Uom
interface Uom {
  uomId: string;
  abbreviation: string;
}

// Define the Vendor
interface Vendor {
  supplierId: string;
  supplierShortName: string;
}

export function ItemForm({ selectedItem, onSave, onCancel, isEditing }: ItemFormProps) {

  const [loading, setLoading] = useState(true)

  const [vendors, setVendors] = useState<Vendor[]>([])

  const { data: packageType = [] } = usePackageType(true)
  const { data: weightUom = [] } = useWeightUom(true)

  const form = useForm<Itemform>({
    resolver: zodResolver(itemformSchema),
    defaultValues: selectedItem,
  })

  const fetchVendors = useCallback(async () => {
    try {
      const vendorList = await getVendorList()
      setVendors(vendorList)
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }, [])   

  useEffect(() => {
    const fetchVendorData = async () => {
      if (selectedItem.productId) {
        try {
          setLoading(true)
          const itemData = await getItemById(selectedItem.productId)
          form.reset(itemData)
        } catch (error) {
          console.error("Error fetching vendor data:", error)
        } finally {
          setLoading(false)
        }
        fetchVendors();
      } else {
        setLoading(false)
      }
    }
    fetchVendorData()
  }, [selectedItem.productId, form, fetchVendors])

  // Helper function to find the abbreviation for a given uomId
  const findUomName = (uomId: string | undefined, uoms: Uom[]): string => {
    if (!uomId) return '';
    const uom = uoms.find(uom => uom.uomId === uomId);
    return uom ? uom.abbreviation : '';
  }

  // Helper function to find the vendorName for a given vendorId
  const findVendorName = (supplierId: string | undefined, vendors: Vendor[]): string => {
    if (!supplierId) return '';
    const vendor = vendors.find(vendor => vendor.supplierId === supplierId);
    return vendor ? vendor.supplierShortName : '';
  }


  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target
  //   setFormData((prev: any) => ({ ...prev, [name]: value }))
  // }

  const onSubmit = async (data: Itemform) => {
    try {
      console.log('Form submitted with data:', data)
      if (data.productId) {
        await updateItem(data.productId, data)
      }
      // Call the onSave callback with the form data
      await onSave(data)
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)
    console.log("Current form values:", form.getValues())
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col h-full"
      >
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">
            <TextField form={form} name="productName" label="Item" required isEditing={isEditing} />
            <TextField form={form} name="gtin" label="GTIN" isEditing={isEditing} />
            {/* vendor select */}
            <FormField
              control={form.control}
              name='supplierId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight after:content-['*'] after:ml-0.5 after:text-red-500">
                    Vendor
                  </FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor.supplierId} value={vendor.supplierId}>
                              {vendor.supplierShortName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {findVendorName(field.value?.toString() ?? '', vendors)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TextField form={form} name="internalId" label="Item Number" required isEditing={isEditing} />

            {/* packagingType select */}
            <FormField
              control={form.control}
              name='caseUomId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight after:content-['*'] after:ml-0.5 after:text-red-500">
                    Packaging Type
                  </FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Packaging Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {packageType?.map((packageUom: Uom) => (
                            <SelectItem key={packageUom.uomId} value={packageUom.uomId}>
                              {packageUom.abbreviation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {findUomName(field.value?.toString() ?? '', packageType)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="individualsPerPackage"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">
                    Quantity Per Package
                  </FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input 
                        type="number"
                        {...field}
                        value={value?.toString() ?? ''}
                        onChange={(e) => {
                          // const val = e.target.value === '' ? null : Number(e.target.value)
                          // onChange(val)
                          const value = e.target.value;
                          // Ensure only integer values are allowed
                          if (value === '' || /^[0-9]+$/.test(value)) {
                            onChange(value ? parseInt(value, 10) : null);
                          }
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        min={0}
                        step="any"
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {value?.toString() ?? ''}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* weightUnits select */}
            <FormField
              control={form.control}
              name='quantityUomId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight after:content-['*'] after:ml-0.5 after:text-red-500">
                    Weight Units
                  </FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Weight Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weightUom?.map((weightUo: Uom) => (
                            <SelectItem key={weightUo.uomId} value={weightUo.uomId}>
                              {weightUo.abbreviation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {findUomName(field.value?.toString() ?? '', weightUom)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <NumberField form={form} name="quantityIncluded" label="Gross Weight Per Package" required isEditing={isEditing} />
            <NumberField form={form} name="productWeight" label="Net Weight Per Package"  isEditing={isEditing} />
            <TextField form={form} name="brandName" label="Brand" isEditing={isEditing} />
            <TextField form={form} name="produceVariety" label="Produce Variety" isEditing={isEditing} />
            <TextField form={form} name="hsCode" label="HS Code" isEditing={isEditing} />
            <TextField form={form} name="organicCertifications" label="Organic Certification" isEditing={isEditing} />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Description</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Textarea {...field} value={field.value ?? ''} 
                       onChange={(e) => field.onChange(e.target.value)}/>
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

            <TextField form={form} name="dimensionsDescription" label="Dimensions" isEditing={isEditing} />
            <TextField form={form} name="materialCompositionDescription" label="Material Composition" isEditing={isEditing} />
            <TextField form={form} name="countryOfOrigin" label="Country Of Origin" isEditing={isEditing} />
            <TextField form={form} name="certificationCodes" label="Certification Code" isEditing={isEditing} />
            <TextField form={form} name="shelfLifeDescription" label="Shelf Life" isEditing={isEditing} />
            <TextField form={form} name="handlingInstructions" label="Handling Instructions" isEditing={isEditing} />
            <TextField form={form} name="storageConditions" label="Storage Conditions" isEditing={isEditing} />
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