"use client"
import React, {useEffect, useState } from 'react'

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

import { getPoById, getVendorById, getItemList } from '@/lib/api';


interface PoFormProps {
  selectedItem: Poform 
  onSave: (formData: Poform) => void 
  onCancel: () => void
  isEditing: boolean
}

export function PoForm({ selectedItem, onSave, onCancel, isEditing }: PoFormProps) {

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([]) // TODO: Add proper type

  const form = useForm<Poform>({
    resolver: zodResolver(poformSchema),
    defaultValues: selectedItem,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderItems",
  })

  useEffect(() => {
    const fetchVendorData = async () => {
      if (selectedItem.orderId) {
        try {
          setLoading(true)
          const poData = await getPoById(selectedItem.orderId)
          // Fetch vendor data if supplierId exists
          if (poData.supplierId) {
            const vendorData = await getVendorById(poData.supplierId)
            poData.supplierName = vendorData.supplierName
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
    fetchVendorData()
    const fetchData = async () => {
      try {
        const [productList] = await Promise.all([getItemList()])
        setProducts(productList)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
    // fetch items


  }, [selectedItem.orderId, form])


  const onSubmit = async (data: Poform) => {
    try {
      console.log('Form submitted with data:', data)
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
      quantity: 0,
      weight: 0,
      shippingWeight: null,
      productWeight: null,
      description: null,
      quantityUomId: null,
      caseUomId: null,
      fulfillmentStatusId: "ORDERED",
      fulfillments: [],
    })
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
                <p className="text-sm text-gray-600">
                  {item.quantity} units - {item.productId}
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
                      <p className="font-medium">{fulfillment.allocatedQuantity} units</p>
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
                  <p className="text-sm text-gray-600">{form.watch(`orderItems.${index}.quantity`) || 0} units</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
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
                          // TODO: Update product name and unit when product is selected
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
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
                  name={`orderItems.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order quantity</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <div className="flex items-center px-3 border rounded-md bg-muted">Cases</div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <TextField form={form} name="orderDate" label="Order Date" isEditing={isEditing} />
              <TextField form={form} name="statusId" label="Status" isEditing={false} />
              <TextField form={form} name="supplierName" label="Vendor" isEditing={isEditing} />
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