"use client"
import React, {useEffect, useState, useCallback } from 'react'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import { Plus, X } from "lucide-react"

import { poformSchema, Poform } from '@/components/tanstack/schema/formSchema/poformSchema'
import { TextField } from './components/field/text-field'

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { getPoById, getVendorById, getItemList, updatePo, getVendorList } from '@/lib/api';

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

interface PoFormProps {
  selectedItem: Poform 
  onSave: (formData: Poform) => void 
  onCancel: () => void
  isEditing: boolean
}

export function PoForm({ selectedItem, onSave, onCancel, isEditing }: PoFormProps) {

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([]) 
  const [vendors, setVendors] = useState<Vendor[]>([])

  const { data: packageType = [] } = usePackageType(true)
  const { data: weightUom = [] } = useWeightUom(true)

  const form = useForm<Poform>({
    resolver: zodResolver(poformSchema),
    defaultValues: selectedItem,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderItems",
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
    const fetchPoData = async () => {
      if (selectedItem.orderId) {
        try {
          setLoading(true)
          const poData = await getPoById(selectedItem.orderId, true)
          console.log('poData : ',poData)
          // Fetch vendor data
          if (poData.supplierId) {
            const vendorData = await getVendorById(poData.supplierId)
            poData.supplierName = vendorData.supplierName
          }
          if (poData.orderItems) {
              poData.orderItems = poData.orderItems.map((orderItem) => ({
              ...orderItem,
              amount: Number(orderItem.quantity / (orderItem.quantityIncluded || 1)),
            }))
          }

          // form.reset(warehouseData)
          // Update form values with fetched data
          Object.keys(poData).forEach((key) => {
            form.setValue(key as keyof Poform, poData[key])
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
    fetchVendors()
    fetchPoData()
    const fetchData = async () => {
      try {
        const [productList] = await Promise.all([getItemList()])
        setProducts(productList)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [selectedItem.orderId, form, fetchVendors])


  const onSubmit = async (data: Poform) => {
    try {
      console.log('Form submitted with data:', data)
      if (data.orderId) {
        await updatePo(data.orderId, data)
      }
      // Call the onSave callback with the form data
      await onSave(data)
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const getFulfillmentStatusColor = (status: string | null | undefined) => {
    const statusColors: Record<string, string> = {
      ORDERED: "bg-blue-100 text-blue-800",
      PARTIALLY_FULFILLED: "bg-yellow-100 text-yellow-800",
      FULFILLED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    }
    return statusColors[status || "ORDERED"] || "bg-gray-100 text-gray-800"
  } 

  const handleAddItem = () => {
    append({
      orderItemSeqId: null,
      smallImageUrl: null,
      gtin: null,
      productId: "",
      productName: null,
      internalId: null,
      quantity: null,
      amount: 0,
      shippingWeight: null,
      productWeight: null,
      description: null,
      quantityUomId: null,
      caseUomId: null,
      fulfillmentStatusId: "ORDERED",
      fulfillments: [],
      quantityIncluded:null
    })
  }

  // Helper function to find the abbreviation for a given uomId
  const findUomName = (uomId: string | undefined, uoms: Uom[]): string => {
    if (!uomId) return 'Units';
    const uom = uoms.find(uom => uom.uomId === uomId);
    return uom ? uom.abbreviation : 'Units';
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.productId === productId)
    if (product) {
      form.setValue(`orderItems.${index}.productName`, product.name)
      form.setValue(`orderItems.${index}.caseUomId`, product.caseUomId)
      form.setValue(`orderItems.${index}.quantityUomId`, product.quantityUomId)
      form.setValue(`orderItems.${index}.quantityIncluded`, product.quantityIncluded)
      // TODO  form.setValue(`orderItems.${index}.smallImageUrl`, product.smallImageUrl)
    }
  }

  const handleAmountChange = (index: number, amount: number) => {
    form.setValue(`orderItems.${index}.amount`, amount)
    const quantityIncluded = form.getValues(`orderItems.${index}.quantityIncluded`)
    if (quantityIncluded) {
      form.setValue(`orderItems.${index}.quantity`, amount * quantityIncluded) 
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const renderReadOnlyItems = () => (
    <Accordion type="single" collapsible className="space-y-4">
      {form.watch("orderItems")?.map((item, index) => (
        <AccordionItem key={item.orderItemSeqId || index} value={`item-${index}`}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-start gap-4 w-full">
              <div className="w-24 h-24 bg-gray-100 rounded-lg">
                <img
                  src="/placeholder.svg?height=96&width=96"
                  alt={item.productName || ""}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 text-left">
                <Badge className={getFulfillmentStatusColor(item.fulfillmentStatusId)}>
                  {item.fulfillmentStatusId || "ORDERED"}
                </Badge>
                <h4 className="text-base font-medium mt-1">{item.productName}</h4>
                {/* <p className="text-sm text-gray-600">
                  {item.quantity?(item.quantity/(item.quantityIncluded?item.quantityIncluded:1)):''} {findUomName(item.caseUomId ?? '', packageType)} , {item.quantity} {findUomName(item.quantityUomId ?? '', weightUom)}
                </p> */}
                <p className="text-sm text-gray-600">
                  {`${item.quantity ? (item.quantity / (item.quantityIncluded ? item.quantityIncluded : 1)) : ''} ${findUomName(item.caseUomId ?? '', packageType)} , ${item.quantity} ${findUomName(item.quantityUomId ?? '', weightUom)}`}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-28 space-y-4">
              {item.fulfillments?.map((fulfillment, fIndex) => (
                <Card key={fIndex} className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Receiving ID</p>
                      <p className="font-medium">{fulfillment.receiptId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p className="font-medium"> 
                        {`${fulfillment.allocatedQuantity ? (fulfillment.allocatedQuantity / (item.quantityIncluded ? item.quantityIncluded : 1)) : ''} ${findUomName(item.caseUomId ?? '', packageType)} , ${fulfillment.allocatedQuantity} ${findUomName(item.quantityUomId ?? '', weightUom)}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      {/* <p className="font-medium">{new Date(fulfillment.receivedAt).toLocaleString()}</p> */}
                      <p className="font-medium">{fulfillment.receivedAt}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">QA Status</p>
                      <Badge
                        className={
                          fulfillment.shipmentQaInspectionStatusId === "PASSED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {fulfillment.shipmentQaInspectionStatusId}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )

  const renderEditItems = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Items</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add item
        </Button>
      </div>
      <Accordion type="single" collapsible className="space-y-4">
        {fields.map((field, index) => (
          <AccordionItem key={field.id} value={`item-${index}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-start gap-4 w-full">
                <div className="w-24 h-24 bg-gray-100 rounded-lg">
                  <img
                    src="/placeholder.svg?height=96&width=96"
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 text-left">
                  <Badge className={getFulfillmentStatusColor("ORDERED")}>ORDERED</Badge>
                  <h4 className="text-base font-medium mt-1">
                    {form.watch(`orderItems.${index}.productName`) || "Select a product"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {`${form.watch(`orderItems.${index}.amount`) || 0} ${findUomName(form.watch(`orderItems.${index}.caseUomId`) ?? "", packageType)}, ${form.watch(`orderItems.${index}.quantity`) || 0} ${findUomName(form.watch(`orderItems.${index}.quantityUomId`) ?? "", weightUom)}`}
                  </p>
                </div>
                {/* <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => remove(index)}>
                  <X className="h-4 w-4" />
                  Remove Item
                </Button> */}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-28 space-y-4">
                <FormField
                  control={form.control}
                  name={`orderItems.${index}.productId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
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
                      <FormLabel>Order quantity</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            type="number" {...field} 
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
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || null)}
                            disabled
                          />
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
              <div className="mt-4 pl-28">
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <X className="h-4 w-4 mr-2" />
                  Remove Item
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="flex-grow">
          <div className="space-y-6 p-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 gap-6">
              <TextField form={form} name="orderId" label="PO #" isEditing={isEditing} />
              <TextField form={form} name="statusId" label="Status" isEditing={false} />
              <TextField form={form} name="orderDate" label="Order Date" isEditing={isEditing} />

              {/* vendor select */}
            <FormField
              control={form.control}
              name='supplierId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
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
                      <div className="mt-1 text-sm font-medium">
                        <TextField form={form} name="supplierName" label="Vendor" isEditing={false} />
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Notes</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Textarea {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
                    ) : (
                      <div className="text-sm text-gray-700">{field.value || "No notes available"}</div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items Section */}
            <div className="space-y-4">{isEditing ? renderEditItems() : renderReadOnlyItems()}</div>
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