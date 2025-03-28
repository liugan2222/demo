import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, X, AlertCircle } from 'lucide-react'
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

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/common/info-alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { addItem, getVendorList, uploadFile, ItemNumberWhenCreate } from '@/lib/api';

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
  dimensionsDescription: null,
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

  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: packageType = [] } = usePackageType(true)
  const { data: weightUom = [] } = useWeightUom(true)

  // Create refs for all form fields to manage tab navigation
  const formFieldRefs = useRef<Record<string, HTMLElement | null>>({})

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
      setFormError(null)
    }
  }, [open, fetchVendors]);

  const onSubmit = useCallback(async (data: MultipleItemsSchema) => {
    try {
      setFormError(null)
      await addItem(data)
      setOpen(false)
      form.reset({
        items: [createEmptyItem()]
      });
      setExpandedItems(['item-0']);
      onAdded()
    } catch (error:any) {
      // Extract error message from the response
      const errorMessage = error.response?.data?.detail || "An error occurred while adding the item"
      // Set a form-level error message
      setFormError(errorMessage)
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

  const handleClose = useCallback(() => {
    // Check if form is dirty (has been modified)
    if (form.formState.isDirty) {
      setShowDiscardDialog(true)
    } else {
      // If form is not dirty, close directly
      closeForm()
    }
  }, [form.formState.isDirty])
  const closeForm = () => {
    setOpen(false);
    form.reset({
      items: [createEmptyItem()]
    });
    setFormError(null)
    setExpandedItems(['item-0']);
  }

  // Function to focus the next element in the tab order
  const focusNextElement = (currentFieldName: string, index: number) => {
    // Define the tab order for form fields within each location
    const tabOrder = [
      `items.${index}.productName`,
      `items.${index}.gtin`,
      `items.${index}.supplierId`,
      `items.${index}.internalId`,
      `items.${index}.caseUomId`,
      `items.${index}.individualsPerPackage`,
      `items.${index}.quantityUomId`,
      `items.${index}.quantityIncluded`,
      `items.${index}.productWeight`,
      `items.${index}.brandName`,
      `items.${index}.produceVariety`,
      `items.${index}.hsCode`,
      `items.${index}.organicCertifications`,
      `items.${index}.description`,
      `items.${index}.dimensionsDescription`,
      `items.${index}.materialCompositionDescription`,
      `items.${index}.countryOfOrigin`,
      `items.${index}.certificationCodes`,
      `items.${index}.shelfLifeDescription`,
      `items.${index}.handlingInstructions`,
      `items.${index}.storageConditions`,
      ]

    const currentIndex = tabOrder.indexOf(currentFieldName)
    if (currentIndex !== -1 && currentIndex < tabOrder.length - 1) {
      const nextFieldName = tabOrder[currentIndex + 1]
      const nextElement = formFieldRefs.current[nextFieldName]
      if (nextElement) {
        nextElement.focus()
      }
    }
  }

  // Handle key down events for form fields
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string, index: number) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault()
      focusNextElement(fieldName, index)
    }
  }  

  return (
    <>
      <Dialog
          open={open}
          onOpenChange={(newOpen) => {
            if (!newOpen && form.formState.isDirty) {
              // If trying to close and form is dirty, show confirmation dialog
              setShowDiscardDialog(true)
            } else if (!newOpen) {
              // If trying to close and form is not dirty, close directly
              closeForm()
            } else {
              // If opening the dialog
              setOpen(true)
            }
          }}
        >
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add raw
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
              {/* Form-level error alert */}
              {formError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
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
                              fieldName={`items.${index}.smallImageUrl`} // 添加fieldName
                              onImageChange={async (file) => {
                                try {
                                  form.setValue(`items.${index}.smallImageUrl`, "uploading...")
                                  const pictureObj = await uploadFile(file)
                                  // form.setValue(`items.${index}.smallImageUrl`, pictureObj.data.id, {
                                  //   shouldDirty: true,
                                  //   shouldValidate: true
                                  // })
                                  form.setValue(`items`, [
                                    ...form.getValues().items.map((item, i) => 
                                      i === index ? { ...item, smallImageUrl: pictureObj.data.id } : item
                                    )
                                  ], { shouldDirty: true, shouldValidate: true })
                                } catch (error) {
                                  form.setValue(`items.${index}.smallImageUrl`, null)
                                  form.setError(`items.${index}.picture`, {
                                    type: 'manual',
                                    message: error instanceof Error ? error.message : 'File upload failed'
                                  })
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
                                  <Input
                                    {...field}
                                    value={field.value ?? ""}
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.productName`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.productName`] = el
                                    }}
                                  />
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
                                  <Input
                                    {...field}
                                    value={field.value ?? ""}
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.gtin`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.gtin`] = el
                                    }}
                                  />
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
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    setTimeout(() => focusNextElement(`items.${index}.supplierId`, index), 0)
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      tabIndex={0}
                                      onKeyDown={(e) => {
                                        if (e.key === "Tab" && !e.shiftKey) {
                                          e.preventDefault()
                                          focusNextElement(`items.${index}.supplierId`, index)
                                        }
                                      }}
                                      ref={(el: HTMLButtonElement | null) => {
                                        formFieldRefs.current[`items.${index}.supplierId`] = el
                                      }}
                                    >
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
                                <FormLabel>Item number<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field}
                                    value={field.value ?? ""}
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.internalId`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.internalId`] = el
                                    }}
                                    onBlur={async (e) => {
                                      field.onBlur() // Call the original onBlur handler
                                      // Clear the error if it exists
                                      form.clearErrors(`items.${index}.internalId`)
                                      const value = e.target.value
                                      if (value) {
                                        try {
                                          await ItemNumberWhenCreate(value)
                                        } catch (error : any) {
                                          // Check if the error has a response with status 400
                                          if (error.response && error.response.status === 400) {
                                            // Extract the error message from the response
                                            const errorMessage = "This item number already exists"
                                            // Set the form error
                                            form.setError(`items.${index}.internalId`, {
                                              type: "manual",
                                              message: errorMessage,
                                            })
                                          } else {
                                            // Handle other types of errors
                                            form.setError(`items.${index}.internalId`, {
                                              type: "manual",
                                              message: error.response.data?.detail,
                                            })
                                          }
                                        }
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
                            name={`items.${index}.caseUomId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Packaging type<span className="text-red-500">*</span></FormLabel>
                                <Select
                                  value={field.value ?? undefined}
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    setTimeout(() => focusNextElement(`items.${index}.caseUomId`, index), 0)
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      tabIndex={0}
                                      onKeyDown={(e) => {
                                        if (e.key === "Tab" && !e.shiftKey) {
                                          e.preventDefault()
                                          focusNextElement(`items.${index}.caseUomId`, index)
                                        }
                                      }}
                                      ref={(el: HTMLButtonElement | null) => {
                                        formFieldRefs.current[`items.${index}.caseUomId`] = el
                                      }}
                                    >
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
                                <FormLabel>Quantity per package</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.individualsPerPackage`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.individualsPerPackage`] = el
                                    }}
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
                                <FormLabel>Weight units<span className="text-red-500">*</span></FormLabel>
                                <Select
                                  value={field.value ?? undefined}
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    setTimeout(() => focusNextElement(`items.${index}.facilityId`, index), 0)
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      tabIndex={0}
                                      onKeyDown={(e) => {
                                        if (e.key === "Tab" && !e.shiftKey) {
                                          e.preventDefault()
                                          focusNextElement(`items.${index}.quantityUomId`, index)
                                        }
                                      }}
                                      ref={(el: HTMLButtonElement | null) => {
                                        formFieldRefs.current[`items.${index}.quantityUomId`] = el
                                      }}
                                    >
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
                                <FormLabel>Gross weight per package<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    step="0.01"
                                    value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.quantityIncluded`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.quantityIncluded`] = el
                                    }}
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
                                <FormLabel>Net weight per package</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.productWeight`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.productWeight`] = el
                                    }}
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
                                  <Input {...field} value={field.value ?? ''}
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.brandName`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.brandName`] = el
                                    }} />
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
                                <FormLabel>Produce variety</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''}
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.produceVariety`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.produceVariety`] = el
                                    }} />
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
                                <FormLabel>HS code</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''}
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.hsCode`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.hsCode`] = el
                                    }} />
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
                                <FormLabel>Organic certification</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.organicCertifications`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.organicCertifications`] = el
                                    }}/>
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
                                  <Textarea {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.description`, index)}
                                    ref={(el: HTMLTextAreaElement | null) => {
                                      formFieldRefs.current[`items.${index}.description`] = el
                                    }}/>
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
                                  <Input {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.dimensionsDescription`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.dimensionsDescription`] = el
                                    }}/>
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
                                <FormLabel>Material composition</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.materialCompositionDescription`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.materialCompositionDescription`] = el
                                    }}/>
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
                                <FormLabel>Country of origin</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.countryOfOrigin`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.countryOfOrigin`] = el
                                    }}/>
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
                                <FormLabel>Certification code</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.certificationCodes`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.certificationCodes`] = el
                                    }}/>
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
                                <FormLabel>Shelf life</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.shelfLifeDescription`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.shelfLifeDescription`] = el
                                    }}/>
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
                                <FormLabel>Handling instructions</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.handlingInstructions`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.handlingInstructions`] = el
                                    }}/>
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
                                <FormLabel>Storage conditions</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.storageConditions`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.storageConditions`] = el
                                    }}/>
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
                                Remove item
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
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Add..." : "Add all"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Discard confirmation dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogTitle className="text-center mb-6">Discard draft?</AlertDialogTitle>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)} className="w-[160px]">
              Continue editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDiscardDialog(false)
                closeForm()
              }}
              className="w-[160px] bg-red-500 hover:bg-red-600"
            >
              Discard
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}