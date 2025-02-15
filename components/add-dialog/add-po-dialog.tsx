"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, X, CalendarIcon } from "lucide-react"
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from "date-fns"

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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Import the warehouseSchema
import { poformSchema, Poform } from '@/components/tanstack/schema/formSchema/poformSchema'

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { addPo, getVendorList,getItemList } from '@/lib/api';

const createEmptyPo = () => ({
  id: null,
  orderId: null,
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

  const { data: packageType = [] } = usePackageType(true)
  const { data: weightUom = [] } = useWeightUom(true)

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
          const [vendorList, productList] = await Promise.all([getVendorList(), getItemList()])
          setVendors(vendorList)
          setProducts(productList)
        } catch (error) {
          console.error("Error fetching data:", error)
        }
      }
      fetchData()
    }
  }, [open])

  const onSubmit = useCallback(async (data: Poform) => {
    try {
      console.log("add po", data)
      await addPo(data)
      setOpen(false)
      form.reset(createEmptyPo());
      setExpandedItems(['item-0']);
      onAdded()
    } catch (error) {
      console.error('Error adding PO:', error)
      // Handle error (e.g., show error message to user)
    }
  }, [form, onAdded, setOpen]);


  const handleClose = () => {
    setOpen(false);
    form.reset(createEmptyPo());
    setExpandedItems(['item-0']);
  };

  // const handleSaveAndExit = async () => {
  //   const data = form.getValues();
  //   console.log("Saving and exiting with data:", data);
  //   // TODO: Implement API call to save data without validation
  //   setOpen(false);
  //   form.reset(createEmptyPo());
  //   setExpandedItems(['item-0']);
  //   onAdded();
  // };  

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
  };

  const handleProductSelect = (index: number, productId: string) => {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add PO
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add Purchase Order</DialogTitle>
          <DialogDescription>
            Add a new purchase order with one or more items.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          <Input {...field} value={field.value ?? ''} />
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
                        <FormLabel>Order Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={"w-full pl-3 text-left font-normal"}>
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
                        <FormLabel>Vendor</FormLabel>
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
                    name="memo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ''} />
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
                      <Plus className="h-4 w-4 mr-2" />
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
                                      <SelectTrigger>
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
                                    Order Quantity<span className="text-red-500">*</span>
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
                                  <FormLabel>Order Weight</FormLabel>
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
                                Remove PO
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
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}