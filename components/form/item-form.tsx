"use client"

import React, {useEffect , useState, useCallback} from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { X, Edit2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

import { itemformSchema, Itemform } from '@/components/tanstack/schema/formSchema/itemformSchema'
import { NumberField } from './components/field/number-field'
import { TextField } from './components/field/text-field'
import { ItemImage } from "@/components/common/item/item-image"
import "@/app/globals.css";

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { getItemById , getVendorList, updateItem, uploadFile } from '@/lib/api';

import { useAppContext } from "@/contexts/AppContext"

interface ItemFormProps {
  selectedItem: Itemform 
  onSave: (formData: Itemform) => void 
  onCancel: () => void
  isEditing: boolean
  onToggleEdit: () => void 
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

export function ItemForm({ selectedItem, onSave, onCancel, isEditing, onToggleEdit }: ItemFormProps) {

  const [loading, setLoading] = useState(true)

  const { userPermissions, userInfo } = useAppContext()
  const isUpdate = (userInfo?.username === "admin") || (userPermissions.includes('Items_Update'))

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

  // const onError = (errors: any) => {
  //   console.log('Form validation errors:', errors)
  //   console.log("Current form values:", form.getValues())
  // }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <div className="flex items-center justify-between p-4">
          {!isEditing && isUpdate && (
            <Button variant="outline" size="default" onClick={onToggleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex justify-end space-x-2 p-4">
            <Button type="button" size="default" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
          )}
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">
          <ItemImage
              form={form}
              isEditing={isEditing}
              onImageChange={async (file) => {
                try {
                  const response = await uploadFile(file)
                  form.setValue("smallImageUrl", response.data?.id)
                } catch (error) {
                  console.error("Error uploading file:", error)
                }
              }}
            />
            <TextField form={form} name="productName" label="Item" required isEditing={isEditing} />
            <TextField form={form} name="gtin" label="GTIN" isEditing={isEditing} />
            {/* vendor select */}
            <FormField
              control={form.control}
              name='supplierId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label font-common after:content-['*'] after:ml-0.5 after:text-red-500">
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
                            <SelectValue placeholder="Select a vendor" />
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
                      <div className="form-control font-common">
                        {findVendorName(field.value?.toString() ?? '', vendors)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TextField form={form} name="internalId" label="Item number" required isEditing={isEditing} />

            {/* packagingType select */}
            <FormField
              control={form.control}
              name='caseUomId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label font-common after:content-['*'] after:ml-0.5 after:text-red-500">
                    Packaging type
                  </FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a packaging Type" />
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
                      <div className="form-control font-common">
                        {findUomName(field.value?.toString() ?? '', packageType)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {isEditing || form.getValues('individualsPerPackage') ? (
              <FormField
                control={form.control}
                name="individualsPerPackage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">
                      Quantity per package
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
                        <div className="form-control font-common">
                          {value?.toString() ?? ''}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              ) : null}

            {/* weightUnits select */}
            <FormField
              control={form.control}
              name='quantityUomId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label font-common after:content-['*'] after:ml-0.5 after:text-red-500">
                    Weight units
                  </FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a weight unit" />
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
                      <div className="form-control font-common">
                        {findUomName(field.value?.toString() ?? '', weightUom)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantityIncluded"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel className="form-label font-common after:content-['*'] after:ml-0.5 after:text-red-500">
                    Gross weight per package
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
                        step="0.01"
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

            <NumberField form={form} name="productWeight" label="Net weight per package"  isEditing={isEditing} />
            <TextField form={form} name="brandName" label="Brand" isEditing={isEditing} />
            <TextField form={form} name="produceVariety" label="Produce variety" isEditing={isEditing} />
            <TextField form={form} name="hsCode" label="HS code" isEditing={isEditing} />
            <TextField form={form} name="organicCertifications" label="Organic certification" isEditing={isEditing} />
            
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

            <TextField form={form} name="dimensionsDescription" label="Dimensions" isEditing={isEditing} />
            <TextField form={form} name="materialCompositionDescription" label="Material composition" isEditing={isEditing} />
            <TextField form={form} name="countryOfOrigin" label="Country of origin" isEditing={isEditing} />
            <TextField form={form} name="certificationCodes" label="Certification code" isEditing={isEditing} />
            <TextField form={form} name="shelfLifeDescription" label="Shelf life" isEditing={isEditing} />
            <TextField form={form} name="handlingInstructions" label="Handling instructions" isEditing={isEditing} />
            <TextField form={form} name="storageConditions" label="Storage conditions" isEditing={isEditing} />
          </div>
        </ScrollArea> 
      </form>
    </Form>
  )
}