import React, { useState, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { ItemImage } from "@/components/common/item/item-image"
// Import the itemSchema
import { itemformSchema } from '@/components/tanstack/schema/formSchema/itemformSchema'

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { addItem, getVendorList, uploadFile } from '@/lib/api';

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

// Create a schema for multiple items
const multipleItemsSchema = z.object({
  items: z.array(itemformSchema).min(1, "At least one item is required"),
})

type MultipleItemsSchema = z.infer<typeof multipleItemsSchema>

const createEmptyItem = () => ({
  id: null,
  productName: '',
  gtin: null,
  supplierId: '',
  internalId: '',
  caseUomId: '',
  quantityIncluded: 0,
  quantityUomId: '',
  individualsPerPackage: null,
  productWeight: null,
  brandName: null,
  produceVariety: null,
  hsCode: null,
  organicCertifications: null,
  description: null,
  dimensionsDescription: null,  // TODO
  materialCompositionDescription: null,
  countryOfOrigin: null,
  certificationCodes: null,
  shelfLifeDescription: null,
  handlingInstructions: null,
  storageConditions: null,
  createdBy: null,
  createdAt: null,
  modifiedAt: null,
  modifiedBy: null,
  smallImageUrl: null,
  picture: null
});

interface AddDialogProps {
  onAdded: () => void;
}

export function AddRawDialog({ onAdded: onAdded }: AddDialogProps) {
  const [open, setOpen] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>(['item-0'])

  const { data: packageType = [] } = usePackageType(true)
  const { data: weightUom = [] } = useWeightUom(true)

  const form = useForm<MultipleItemsSchema>({
    resolver: zodResolver(multipleItemsSchema),
    defaultValues: {
      items: [createEmptyItem()],
    },
    mode: 'onChange', // Enable real-time validation
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
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
    if (open) {
      fetchVendors();
    }
  }, [open, fetchVendors]);

  const onSubmit = useCallback(async (data: MultipleItemsSchema) => {
    try {
      console.log("add items", data)
      await addItem(data)
      setOpen(false)
      form.reset({
        items: [createEmptyItem()]
      });
      setExpandedItems(['item-0']);
      onAdded()
    } catch (error) {
      console.error('Error adding item:', error)
      // Handle error (e.g., show error message to user)
    }
  }, [form, onAdded, setOpen]);

  const handleAddAnotherItem = async () => {
    const currentValues = form.getValues().items;
    const lastIndex = currentValues.length - 1;
    
    const isValid = await form.trigger(`items.${lastIndex}`);
    // const result = await form.trigger(`items.${lastIndex}`, { shouldFocus: true });

    if (isValid) {
      append(createEmptyItem());
      const newItemIndex = `item-${lastIndex + 1}`;
      setExpandedItems([newItemIndex]);
    } else {
      // Keep the current item expanded to show validation errors
      setExpandedItems([`item-${lastIndex}`]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    form.reset({
      items: [createEmptyItem()]
    });
    setExpandedItems(['item-0']);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Raw
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add raw items</DialogTitle>
          <DialogDescription>
            Add one or more raw items to the database.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ScrollArea className="h-[60vh] pr-4">
              <Accordion
                type="single"
                collapsible
                value={expandedItems[0]}
                onValueChange={(value) => setExpandedItems([value])}
              >
                {fields.map((field, index) => (
                  <AccordionItem key={field.id} value={`item-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Item {index + 1}
                        </span>
                        {form.getValues(`items.${index}.productName`) && (
                          <span className="text-sm text-muted-foreground">
                            - {form.getValues(`items.${index}.productName`)}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4 p-4">
                        {/* <FormItem>
                          <FormLabel>ID</FormLabel>
                          <FormDescription>
                            This field is automatically generated by the system.
                          </FormDescription>
                        </FormItem> */}

                        <div className="col-span-2 flex justify-center items-center">
                          <ItemImage
                            form={form}
                            isEditing={true}
                            onImageChange={async (file) => {
                              try {
                                form.setValue(`items.${index}.smallImageUrl`, 'uploading...');
                                const pictureObj = await uploadFile(file)
                                form.setValue(`items.${index}.smallImageUrl`, pictureObj.data?.id)
                              } catch (error) {
                                form.setError(`items.${index}.picture`, {
                                  type: 'manual',
                                  message: error instanceof Error ? error.message : 'File upload failed'
                                });
                                form.setValue(`items.${index}.smallImageUrl`, null);
                          
                              }
                            }}
                          />
                        </div>

                        {/* <FormField
                          control={form.control}
                          name={`items.${index}.picture`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Picture</FormLabel>
                              <FormControl>
                                <Input
                                 type="file" 
                                 accept="image/*"
                                 {...field} 
                                 value={field.value ?? ''}
                                 onChange={(e) => handlePictureChange(index, e)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}

                        <FormField
                          control={form.control}
                          name={`items.${index}.productName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item<span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.gtin`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GTIN</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.supplierId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor<span className="text-red-500">*</span></FormLabel>
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
                                  {vendors.map((vendor) => (
                                    <SelectItem key={vendor.supplierId} value={vendor.supplierId}>
                                      {vendor.supplierShortName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.internalId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item Number<span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.caseUomId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Packaging Type<span className="text-red-500">*</span></FormLabel>
                              <Select
                                value={field.value ?? undefined}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select packaging type" />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.individualsPerPackage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity Per Package</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  value={field.value ?? ''} 
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Ensure only integer values are allowed
                                    if (value === '' || /^[0-9]+$/.test(value)) {
                                      field.onChange(value ? parseInt(value, 10) : null);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.quantityUomId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight Units<span className="text-red-500">*</span></FormLabel>
                              <Select
                                value={field.value ?? undefined}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select weight units" />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.quantityIncluded`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gross Weight Per Package<span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="0.01"
                                  value={field.value ?? ''} 
                                  onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : null;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.productWeight`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Net Weight Per Package</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  value={field.value ?? ''} 
                                  onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : null;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.brandName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.produceVariety`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Produce Variety</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.hsCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>HS Code</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.organicCertifications`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organic Certification</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />


                        <FormField
                          control={form.control}
                          name={`items.${index}.dimensionsDescription`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dimensions</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.materialCompositionDescription`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Material Composition</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.countryOfOrigin`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country Of Origin</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.certificationCodes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certification Code</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.shelfLifeDescription`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shelf Life</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.handlingInstructions`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Handling Instructions</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.storageConditions`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Storage Conditions</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {index > 0 && (
                          <div className="flex justify-end mt-6 pt-4">
                            <Button
                              type="button"
                              variant="destructive"
                              size="default"
                              onClick={() => remove(index)}
                            >
                              <X className="h-4 w-4" />
                              Remove Item
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAnotherItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add item
              </Button>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">Add all</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}