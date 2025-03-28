"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, X, CalendarIcon, AlertCircle } from "lucide-react"
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  // DialogDescription,
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Import the warehouseSchema
import { poformSchema, Poform } from '@/components/tanstack/schema/formSchema/poformSchema'

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/common/info-alert-dialog"

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { addPo, getVendorList,getItemList } from '@/lib/api';

const createEmptyPo = () => ({
  id: null,
  orderId: '',
  orderDate: null,
  // statusId: null,

  vendorGcp: null,
  supplierId: '',

  totalQuantity: null,
  totalweight: null,

  memo: null,

  contactDescription: null,

  createdBy: null,
  createdAt: null,
  modifiedAt: null,
  modifiedBy: null,

  orderItems: [createEmptyItem()]
});

const createEmptyItem = () => ({
  id:null,
  productId: '',
  productName: null,
  description: null,
  quantity: null,
  caseUomId: null,
  amount: 0,
  quantityUomId: null,
  quantityIncluded: null,
  fulfillments: []
});

// Define the Uom
interface Uom {
  uomId: string;
  abbreviation: string;
}

interface AddDialogProps {
  onAdded: () => void;
}

export function AddPoDialog({ onAdded: onAdded }: AddDialogProps) {
  const [open, setOpen] = useState(false)
  const [vendors, setVendors] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>(['item-0'])

  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: packageType = [] } = usePackageType(true)
  const { data: weightUom = [] } = useWeightUom(true)

  // Create refs for all form fields to manage tab navigation
  const formFieldRefs = useRef<Record<string, HTMLElement | null>>({})

  const form = useForm<Poform>({
    resolver: zodResolver(poformSchema),
    defaultValues: createEmptyPo(),
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderItems"
  });


  useEffect(() => {
    if (open) {
      // Fetch vendors and products when dialog opens
      const fetchData = async () => {
        try {
          const [vendorList] = await Promise.all([getVendorList()])
          setVendors(vendorList)
        } catch (error) {
          console.error("Error fetching data:", error)
        }
      }
      fetchData()
      setFormError(null)
    }
  }, [open])

  const onSubmit = useCallback(async (data: Poform) => {
    setFormError(null)
    try {
      await addPo(data)
      setOpen(false)
      form.reset(createEmptyPo());
      setExpandedItems(['item-0']);
      onAdded()
    } catch (error: any) {
      // Extract error message from the response
      const errorMessage = error.response?.data?.detail || "An error occurred while adding the PO"
      // Set a form-level error message
      setFormError(errorMessage)
    }
  }, [form, onAdded, setOpen]);

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
    form.reset(createEmptyPo());
    setExpandedItems(['item-0']);
  }

  const handleAddAnotherItem = async () => {
    const currentValues = form.getValues().orderItems;
    const lastIndex = currentValues.length - 1;
    
    const isValid = await form.trigger(`orderItems.${lastIndex}`);

    if (isValid) {
      append(createEmptyItem());
      const newItemIndex = `item-${lastIndex + 1}`;
      setExpandedItems([newItemIndex]);
    } else {
      // Keep the current item expanded to show validation errors
      setExpandedItems([`item-${lastIndex}`]);
    }
  }

  const handleProductSelect = (index: number, productId: string) => {
    const currentItems = form.getValues().orderItems;
  
    // 检查是否已存在相同的productId（排除当前项）
    const isDuplicate = currentItems.some(
      (item, idx) => idx !== index && item.productId === productId
    );
  
    if (isDuplicate) {
      // 清空当前项的所有相关字段并显示错误
      form.setValue(`orderItems.${index}.productId`, '');
      // form.setValue(`orderItems.${index}.productName`, null);
      // form.setValue(`orderItems.${index}.caseUomId`, null);
      // form.setValue(`orderItems.${index}.quantityUomId`, null);
      // form.setValue(`orderItems.${index}.quantityIncluded`, null);
      
      // 设置字段级别的错误
      form.setError(`orderItems.${index}.productId`, {
        type: 'manual',
        message: 'Item already exists in PO'
      });
      return;
    }

    const product = products.find((p) => p.productId === productId)
    if (product) {
      form.setValue(`orderItems.${index}.productName`, product.name)
      form.setValue(`orderItems.${index}.caseUomId`, product.caseUomId)
      form.setValue(`orderItems.${index}.quantityUomId`, product.quantityUomId)
      form.setValue(`orderItems.${index}.quantityIncluded`, product.quantityIncluded)
    }
  }
  
  const handleAmountChange = (index: number, amount: number) => {
    form.setValue(`orderItems.${index}.amount`, amount)
    const quantityIncluded = form.getValues(`orderItems.${index}.quantityIncluded`)
    if (quantityIncluded) {
      form.setValue(`orderItems.${index}.quantity`, amount * quantityIncluded) 
    }
  }

  // Helper function to find the abbreviation for a given uomId
  const findUomName = (uomId: string | undefined, uoms: Uom[]): string => {
    if (!uomId) return 'Units';
    const uom = uoms.find(uom => uom.uomId === uomId);
    return uom ? uom.abbreviation : 'Units';
  }

  // Contact Handle country change and fetch states/provinces
  const handleVendorChange = useCallback(async (supplierId: string) => {
    try {
      const itemList = await getItemList(supplierId);
      setProducts(itemList)
    } catch (error) {
      console.error('Error fetching states/provinces:', error);
      // Handle error (e.g., show error message to user)
    }
  }, [])


   // Function to focus the next element in the tab order
   const focusNextElement = (currentFieldName: string) => {
    // Define the tab order for form fields
    const tabOrder = [
      "orderId",
      "orderDate",
      "supplierId",
      "memo",
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
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault()
      focusNextElement(fieldName)
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
            Add PO
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add Purchase Order</DialogTitle>
            {/* <DialogDescription>
              Add a new purchase order with one or more items.
            </DialogDescription> */}
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
                <div className="mb-6 p-4 border rounded-lg relative">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PO #<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ''} 
                              onKeyDown={(e) => handleKeyDown(e, "orderId")}
                              ref={(el: HTMLInputElement | null) => {
                                formFieldRefs.current["orderId"] = el
                              }}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="orderDate"
                      render={({ field }) => (
                        <FormItem >
                          <FormLabel>Order date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button type="button" variant={"outline"} 
                                  className={"w-full pl-3 text-left font-normal"}
                                  ref={(el: HTMLButtonElement | null) => {
                                    formFieldRefs.current["orderDate"] = el
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Tab" && !e.shiftKey) {
                                      e.preventDefault()
                                      focusNextElement("orderDate")
                                    }
                                  }}>
                                  {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                onSelect={(date) => {
                                  if (date) {
                                    const now = new Date();
                                    date.setHours(now.getHours());
                                    date.setMinutes(now.getMinutes());
                                    date.setSeconds(now.getSeconds());
                                    field.onChange(date.toISOString());
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor<span className="text-red-500">*</span></FormLabel>
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleVendorChange(value);
                              setTimeout(() => focusNextElement("supplierId"), 0)
                            }}
                          >
                            <FormControl>
                              <SelectTrigger
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Tab" && !e.shiftKey) {
                                    e.preventDefault()
                                    focusNextElement("supplierId")
                                  }
                                }}
                                ref={(el: HTMLButtonElement | null) => {
                                  formFieldRefs.current["supplierId"] = el;
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
                      name="memo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value ?? ''} 
                              onKeyDown={(e) => handleKeyDown(e, "memo")}
                              ref={(el: HTMLTextAreaElement | null) => {
                                formFieldRefs.current["memo"] = el;
                              }}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Items</h3>
                      {/* <Button type="button" variant="outline" size="sm" onClick={handleAddAnotherItem}>
                        <Plus size={16} />
                        Add item
                      </Button> */}
                    </div>

                    <Accordion
                      type="single"
                      collapsible
                      value={expandedItems[0]}
                      onValueChange={(value) => setExpandedItems([value])}
                      className="space-y-4"
                    >
                      {fields.map((field, index) => (
                        <AccordionItem key={field.id} value={`item-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Item {index + 1}</span>
                              {form.watch(`orderItems.${index}.productName`) && (
                                <span className="text-sm text-muted-foreground">
                                  - {form.watch(`orderItems.${index}.productName`)}
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-4 p-4">
                              <FormField
                                control={form.control}
                                name={`orderItems.${index}.productId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Item<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                      value={field.value}
                                      onValueChange={(value) => {
                                        field.onChange(value)
                                        handleProductSelect(index, value)
                                      }}
                                    >
                                      <FormControl>
                                        <SelectTrigger className={form.formState.errors?.orderItems?.[index]?.productId ? 'border-red-500' : ''}>
                                          <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {products.map((product) => (
                                          <SelectItem key={product.productId} value={product.productId}>
                                            {product.productName}
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
                                name={`orderItems.${index}.amount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Order quantity<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="flex gap-2">
                                      <FormControl>
                                        <Input
                                          type="number"
                                          {...field}
                                          onChange={(e) => {
                                            const value = Number(e.target.value)
                                            handleAmountChange(index, value)
                                          }}
                                        />
                                      </FormControl>
                                      <div className="flex items-center px-3 border rounded-md bg-muted">
                                        {findUomName(form.watch(`orderItems.${index}.caseUomId`) ?? '', packageType)}
                                      </div>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`orderItems.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Order weight</FormLabel>
                                    <div className="flex gap-2">
                                      <FormControl>
                                        <Input type="number" {...field} value={field.value ?? ''}  disabled />
                                      </FormControl>
                                      <div className="flex items-center px-3 border rounded-md bg-muted">
                                        {findUomName(form.watch(`orderItems.${index}.quantityUomId`) ?? '', weightUom)}
                                      </div>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            {index > 0 && (
                              <div className="flex justify-end mt-6 border-t pt-4">
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
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
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
                    {form.formState.isSubmitting ? "Submit..." : "Submit"}
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