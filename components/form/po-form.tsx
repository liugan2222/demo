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
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"

import { Plus, X, CalendarIcon, Edit2 } from "lucide-react"

import { format } from "date-fns"

import { poformSchema, Poform } from '@/components/tanstack/schema/formSchema/poformSchema'
import { TextField } from './components/field/text-field'
import "@/app/globals.css";

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { getPoById, getVendorById, getItemList, updatePo, getVendorList } from '@/lib/api';

import { useAppContext } from "@/contexts/AppContext"

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
  onSave: () => void 
  onCancel: () => void
  isEditing: boolean
  onToggleEdit: () => void 
}

export function PoForm({ selectedItem, onSave, onCancel, isEditing, onToggleEdit }: PoFormProps) {

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([]) 
  const [vendors, setVendors] = useState<Vendor[]>([])

  const { userPermissions, userInfo } = useAppContext()
  const isUpdate = (userInfo?.username === "admin") || (userPermissions.includes('Procurement_Update'))

  
  const { data: packageType = [] } = usePackageType(true)
  const { data: weightUom = [] } = useWeightUom(true)
  
  const [totalCases, setTotalCases] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalCasesUnit, setTotalCasesUnit] = useState('Units');
  const [totalWeightUnit, setTotalWeightUnit] = useState('Units');
  
  const calculateTotals = useCallback((items: Poform['orderItems']) => {
    let cases = 0;
    let weight = 0;
    
    items?.forEach(item => {
      cases += item.amount || 0;
      weight += item.quantity || 0;
    });

    setTotalCases(cases);
    if (items.length > 0) {
      setTotalCasesUnit(findUomName(items[0].caseUomId ?? "", packageType))
      setTotalWeightUnit(findUomName(items[0].quantityUomId ?? "", weightUom))
    }
    setTotalWeight(weight);
  }, []);


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
          const poData = await getPoById(selectedItem.orderId, true, true)
          // Fetch vendor data
          if (poData.supplierId) {
            const vendorData = await getVendorById(poData.supplierId)
            poData.supplierName = vendorData.supplierName
            poData.statusId= poData.fulfillmentStatusId?(poData.fulfillmentStatusId):(poData.statusId?poData.statusId:'')

            const [productList] = await Promise.all([getItemList(poData.supplierId)])
            setProducts(productList)
          }
          if (poData.orderItems) {
              poData.orderItems = poData.orderItems.map((orderItem) => ({
              ...orderItem,
              amount: Number(orderItem.quantity / (orderItem.product.quantityIncluded)),
              internalId: orderItem.product.internalId,
              description: orderItem.product.description,
              quantityUomId: orderItem.product.quantityUomId,
              caseUomId: orderItem.product.caseUomId,
              smallImageUrl: orderItem.product.smallImageUrl
            }))
            calculateTotals(poData.orderItems)
          }

          form.reset(poData)
          // Update form values with fetched data
          // Object.keys(poData).forEach((key) => {
          //   form.setValue(key as keyof Poform, poData[key])
          // })
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
  }, [selectedItem.orderId, form, fetchVendors])


  const onSubmit = async (data: Poform) => {
    try {
      if (data.orderId) {
        await updatePo(data.orderId, data)
      }
      // Call the onSave callback with the form data
      await onSave()
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const getFulfillmentStatusColor = (status: string | null | undefined) => {
    const statusColors: Record<string, string> = {
      ORDERED: "text-base  text-blue-800",
      NOT_FULFILLED: "text-base badge-notFulfilled",
      PARTIALLY_FULFILLED: "text-base badge-partiallyFulfilled",
      FULFILLED: "text-base badge-fullfilled",
      CANCELLED: "text-base text-red-800",
    }
    return statusColors[status || "NOT_FULFILLED"] || "text-base badge-notFulfilled"
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
      fulfillmentStatusId: "NOT_FULFILLED",
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

    const items = form.getValues("orderItems");
    // do calculateTotals 
    calculateTotals(items);
  }

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return '0.00';
    }
    return value.toFixed(2);
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
                  src={item.smallImageUrl ? `http://47.88.28.103:8080/api/files/${item.smallImageUrl}/media` : "/placeholder.svg?height=96&width=96"}
                  alt={item.productName || ""}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 text-left">
                <h4 className={getFulfillmentStatusColor(item.fulfillmentStatusId)}>
                  {item.fulfillmentStatusId || "NOT_FULFILLED"}
                </h4>
                <h4 className="text-base font-medium mt-1">{item.productName}</h4>
                <p className="text-sm text-gray-600">
                  {`${item.amount ? item.amount : ''} ${findUomName(item.caseUomId ?? '', packageType)} , ${item.quantity?item.quantity.toFixed(2) : ''} ${findUomName(item.quantityUomId ?? '', weightUom)}`}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {item.fulfillments?.map((fulfillment, fIndex) => (
                <Card key={fIndex} className="p-4">
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-center">
                      <p className="text-gray-500 w-24 shrink-0 text-right pr-2">Receiving ID:</p>
                      <div className="flex-1">
                        <p className="font-medium whitespace-normal word-wrap break-word text-left">{fulfillment.shipmentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-gray-500 w-24 shrink-0 text-right pr-2">Quantity:</p>
                      <div className="flex-1">
                        <p className="font-medium whitespace-normal word-wrap break-word text-left"> 
                          {`${fulfillment.allocatedQuantity ? (fulfillment.allocatedQuantity / (item.quantityIncluded ? item.quantityIncluded : 1)) : ''} ${findUomName(item.caseUomId ?? '', packageType)} , ${fulfillment.allocatedQuantity? fulfillment.allocatedQuantity.toFixed(2) : ''} ${findUomName(item.quantityUomId ?? '', weightUom)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-gray-500 w-24 shrink-0 text-right pr-2">Date:</p>
                      <div className="flex-1">
                        <p className="font-medium whitespace-normal word-wrap break-word text-left">{fulfillment.receivedAt ? format(new Date(fulfillment.receivedAt), "h:mm a, MM/dd/yyyy") : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-gray-500 w-24 shrink-0 text-right pr-2">QA status:</p>
                      <div className="flex-1">
                        <p className={
                          fulfillment.shipmentQaInspectionStatusId === 'INSPECTION_PASSED'?'font-medium whitespace-normal word-wrap break-word text-left badge-fullfilled':(fulfillment.shipmentQaInspectionStatusId=='PARTIALLY_INSPECTED'?'font-medium whitespace-normal word-wrap break-word text-left badge-partiallyFulfilled': 'font-medium whitespace-normal word-wrap break-word text-left badge-notFulfilled')}
                        >
                          {fulfillment.shipmentQaInspectionStatusId}
                        </p>
                      </div>
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
          <Plus size={16} />
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
                    src={form.watch(`orderItems.${index}.smallImageUrl`) ? `http://47.88.28.103:8080/api/files/${form.watch(`orderItems.${index}.smallImageUrl`)}/media` : "/placeholder.svg?height=96&width=96"}
                    alt={form.watch(`orderItems.${index}.productName`) || ""}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={getFulfillmentStatusColor(form.watch(`orderItems.${index}.fulfillmentStatusId`))}>{form.watch(`orderItems.${index}.fulfillmentStatusId`)}</h4>
                  <h4 className="text-base font-medium mt-1">
                    {form.watch(`orderItems.${index}.productName`) || "Select a item"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {`${form.watch(`orderItems.${index}.amount`) || 0} ${findUomName(form.watch(`orderItems.${index}.caseUomId`) ?? "", packageType)}, ${formatNumber(form.watch(`orderItems.${index}.quantity`))} ${findUomName(form.watch(`orderItems.${index}.quantityUomId`) ?? "", weightUom)}`}
                  </p>
                </div>
                {/* <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => remove(index)}>
                  <X size={16} />
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
                            <SelectValue placeholder="Select a item" />
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
                            value={field.value ?? ""}
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
              {/* <div className="mt-4 pl-28"> */}
              <div className="flex justify-end p-4">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                      remove(index); 
                      const items = form.getValues("orderItems"); 
                      calculateTotals(items); 
                    }}
                  >
                  <X size={16} />
                  Remove item
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
        <div className="flex items-center justify-between p-4">
          {!isEditing && isUpdate && (
            <Button type="button" variant="outline" size="default" onClick={onToggleEdit}>
              <Edit2 size={16} />
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
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X size={16} />
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="space-y-6 p-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 gap-6">
              <TextField form={form} name="orderId" label="PO #" required isEditing={isEditing} />

              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Status</FormLabel>
                    <FormControl>
                      <div className="form-control font-common">
                        <Badge variant="outline" className={field.value === "NOT_FULFILLED" ? "badge-page badge-notFulfilled" : (field.value  === "PARTIALLY_FULFILLED" ? "badge-page badge-partiallyFulfilled" : "badge-page badge-fullfilled")}>{field.value || 'NOT_FULFILLED'}</Badge>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Updated orderDate field */}
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Order date</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button type="button" variant={"outline"} className={"w-full pl-3 text-left font-normal"}>
                              {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date?.toISOString())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="form-control font-common">
                          {field.value ? format(new Date(field.value), "h:mm a, MM/dd/yyyy") : "No date set"}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* vendor select */}
              <FormField
                control={form.control}
                name='supplierId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">
                      Vendor<span className="text-red-500">*</span>
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
                          {form.getValues("supplierName") || "No vendor selected"}
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
                  <FormLabel className="form-label font-common">Order notes</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Textarea {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
                    ) : (
                      <div className="form-control font-common">{field.value || "No notes available"}</div>
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

        <div className="flex text-sm">
          <div className="flex flex-col justify-start space-x-2 p-4">
            <p className="text-gray-600">Total ordered quantity & weight</p>
            <p className="font-medium">{`${totalCases || 0} ${totalCasesUnit}, ${totalWeight? totalWeight.toFixed(2)  : 0.00} ${totalWeightUnit}`}</p>
          </div>
        </div> 
      </form>
    </Form>
  )
}