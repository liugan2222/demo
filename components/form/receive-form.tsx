"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { X, Edit2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import "@/app/globals.css";

import { receiveformSchema, Receiveform } from '@/components/tanstack/schema/formSchema/receiveformSchema'

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { getReceiveById, updateReceive, getPos } from '@/lib/api';

import { useAppContext } from "@/contexts/AppContext"


interface ReceiveFormProps {
  selectedItem: Receiveform
  onSave: () => void
  onCancel: () => void
  isEditing: boolean
  onToggleEdit: () => void 
}

// Define the Po
interface Po {
  poNumber: string
}

export function ReceiveForm({ selectedItem, onSave, onCancel, isEditing, onToggleEdit }: ReceiveFormProps) {
  const [loading, setLoading] = useState(true)

  const { userPermissions, userInfo } = useAppContext()
  const isUpdate = (userInfo?.username === "admin") || (userPermissions.includes('Receiving_Update'))

  const [totalCases, setTotalCases] = useState(0)
  const [totalQuantity, setTotalQuantity] = useState(0)
  const [totalCasesUnit, setTotalCasesUnit] = useState('Units');
  const [totalWeightUnit, setTotalWeightUnit] = useState('Units');

  const { data: packageType = [] } = usePackageType(true)
  const { data: weightUom = [] } = useWeightUom(true)

  const [pos, setPos] = useState<Po[]>([])

  const form = useForm<Receiveform>({
    resolver: zodResolver(receiveformSchema),
    defaultValues: selectedItem,
  })

  // , append, remove
  const { fields } = useFieldArray({
    control: form.control,
    name: "receivingItems",
  })

  const calculateTotals = useCallback((items: Receiveform["receivingItems"]) => {
    const cases = items.reduce((sum, item) => sum + (item.casesAccepted || 0), 0)
    const quantity = items.reduce((sum, item) => sum + (item.quantityAccepted || 0), 0)
    setTotalCases(cases)
    setTotalQuantity(quantity)

    if (items.length > 0) {
      setTotalCasesUnit(findUomName(items[0].caseUomId ?? "", packageType))
      setTotalWeightUnit(findUomName(items[0].quantityUomId ?? "", weightUom))
    }
  }, [])

  const handleAmountChange = (index: number, amount: number) => {
    form.setValue(`receivingItems.${index}.casesAccepted`, amount)
    const quantityIncluded = form.getValues(`receivingItems.${index}.quantityIncluded`)
    if (quantityIncluded) {
      form.setValue(`receivingItems.${index}.quantityAccepted`, amount * quantityIncluded) 
    }

    const items = form.getValues("receivingItems");
    // do calculateTotals 
    calculateTotals(items);
  }  

  const fetchPosByVendor = useCallback(async (supplierId) => {
    try {
      const poList = await getPos(supplierId)
      setPos(poList)
    } catch (error) {
      console.error("Error fetching polist:", error)
    }
  }, [])  


  useEffect(() => {
    const fetchReceiveData = async () => {
      if (selectedItem.documentId) {
        try {
          setLoading(true)
          const receiveData = await getReceiveById(selectedItem.documentId, true)
          if (receiveData.receivingItems) {
            calculateTotals(receiveData.receivingItems)
          }

          if (!receiveData.primaryOrderId) {
            fetchPosByVendor(receiveData.partyIdFrom)
          }

          form.reset(receiveData)
      
        } catch (error) {
          console.error("Error fetching vendor data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    fetchReceiveData()
  }, [selectedItem.documentId, form, fetchPosByVendor])


  // Helper function to find the abbreviation for a given uomId
  const findUomName = (uomId: string | undefined, uoms: any): string => {
    if (!uomId) return 'Units';
    const uom = uoms.find(uom => uom.uomId === uomId);
    return uom ? uom.abbreviation : 'Units';
  }  

  const onSubmit = async (data: Receiveform) => {
    try {
      console.log('Form submitted with data:', data)
      if (data.documentId) {
        await updateReceive(data.documentId, data)
      }
      // Call the onSave callback with the form data
      await onSave()
    } catch (error) {
      console.error('Error saving item:', error)
    }
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
      {form.watch("receivingItems")?.map((item, index) => (
        <AccordionItem key={item.receiptId || index} value={`item-${index}`}>
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
                <h4 className={item.qaInspectionStatusId=='INSPECTION_PASSED'?'text-base badge-fullfilled':(item.qaInspectionStatusId=='PARTIALLY_INSPECTED'?'text-base badge-partiallyFulfilled': 'text-base badge-notFulfilled')}> {item.qaInspectionStatusId || "PENDING_INSPECTION"}</h4>
                <h4 className="text-base font-medium mt-1">{item.productName}</h4>
                <p className="text-sm text-gray-600">
                  {`${item.casesAccepted ? item.casesAccepted : ''} ${findUomName(item.caseUomId ?? '', packageType)} , ${item.quantityAccepted?item.quantityAccepted.toFixed(2):0.00} ${findUomName(item.quantityUomId ?? '', weightUom)}`}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Card className="p-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 w-24 shrink-0 text-right pr-2">Item ID:</p>
                    <div className="flex-1">
                      <p className="font-medium whitespace-normal word-wrap break-word text-left">{item.internalId}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 w-24 shrink-0 text-right pr-2">GTIN:</p>
                    <div className="flex-1">
                      <p className="font-medium whitespace-normal word-wrap break-word text-left">{item.gtin || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 w-24 shrink-0 text-right pr-2">Lot:</p>
                    <div className="flex-1">
                      <p className="font-medium whitespace-normal word-wrap break-word text-left">{item.lotId}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 w-24 shrink-0 text-right pr-2">Location:</p>
                    <div className="flex-1">
                      <p className="font-medium whitespace-normal word-wrap break-word text-left">{item.locationName}</p>
                    </div>
                  </div>
                  <div className="h-[0px] border border-zinc-300"></div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 w-24 shrink-0 text-right pr-2">QA:</p>
                    <div className="flex-1">
                      <p className="font-medium whitespace-normal word-wrap break-word text-left">{item.inspectedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 w-24 shrink-0 text-right pr-2">Notes:</p>
                    <div className="flex-1">
                      <p className="font-medium whitespace-normal word-wrap break-word text-left">{item.comments}</p>
                    </div>
                  </div>
                </div>
              </Card>
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
      </div>
      <Accordion type="single" collapsible className="space-y-4">
        {fields.map((field, index) => (
          <AccordionItem key={field.id} value={`item-${index}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-start gap-4 w-full">
                <div className="w-24 h-24 bg-gray-100 rounded-lg">
                  <img
                    src={form.watch(`receivingItems.${index}.smallImageUrl`) ? `http://47.88.28.103:8080/api/files/${form.watch(`receivingItems.${index}.smallImageUrl`)}/media` : "/placeholder.svg?height=96&width=96"}
                    alt={form.watch(`receivingItems.${index}.productName`) || ""}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={form.watch(`receivingItems.${index}.qaInspectionStatusId`)=='INSPECTION_PASSED'?'text-base badge-fullfilled':(form.watch(`receivingItems.${index}.qaInspectionStatusId`)=='PARTIALLY_INSPECTED'?'text-base badge-partiallyFulfilled': 'text-base badge-notFulfilled')}>{form.watch(`receivingItems.${index}.qaInspectionStatusId`) || "PENDING_INSPECTION"}</h4>
                  <h4 className="text-base font-medium mt-1">
                    {form.watch(`receivingItems.${index}.productName`) || "Select a product"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {`${form.watch(`receivingItems.${index}.casesAccepted`) || 0} ${findUomName(form.watch(`receivingItems.${index}.caseUomId`) ?? "", packageType)}, ${formatNumber(form.watch(`receivingItems.${index}.quantityAccepted`))} ${findUomName(form.watch(`receivingItems.${index}.quantityUomId`) ?? "", weightUom)}`}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name={`receivingItems.${index}.casesAccepted`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">Quantity</FormLabel>
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
                          {findUomName(form.watch(`receivingItems.${index}.caseUomId`) ?? '', packageType)}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`receivingItems.${index}.quantityAccepted`}
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
                          {findUomName(form.watch(`receivingItems.${index}.quantityUomId`) ?? '', weightUom)}
                        </div>
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
            <div className="grid grid-cols-1 gap-6">
              {/* PO# select */}
              <FormField
                control={form.control}
                name='primaryOrderId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">
                      PO#
                    </FormLabel>
                    <FormControl>
                    {isEditing ? (
                        form.getValues("primaryOrderId") ? (
                          <div className="form-control font-common">
                            {form.getValues("primaryOrderId")}
                          </div>
                        ):(
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a PO#" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pos?.map((po) => (
                                <SelectItem key={po.poNumber} value={po.poNumber}>
                                  {po.poNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      ) : (
                        <div className="form-control font-common">
                          {form.getValues("primaryOrderId")}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="documentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Receiving #</FormLabel>
                    <FormControl>
                      <div className="form-control font-common">
                        {field.value?.toString() ?? ''}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partyNameFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Vendor</FormLabel>
                    <FormControl>
                      <div className="form-control font-common">
                        {field.value?.toString() ?? ''}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={field.value=='SUBMITTED'?'badge-page badge-fullfilled':'badge-page badge-notFulfilled'}>{field.value}</Badge>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationFacilityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Warehouse</FormLabel>
                    <FormControl>
                      <div className="form-control font-common">
                        {field.value?.toString() ?? ''}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing || form.getValues('receivedAt') ? (
                <FormField
                  control={form.control}
                  name="receivedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label font-common">Recieved at</FormLabel>
                      <FormControl>
                        <div className="form-control font-common">
                          {field.value ? format(new Date(field.value), "h:mm a, MM/dd/yyyy") : "No date set"}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                ) : null}


              <FormField
                control={form.control}
                name="createdBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Received by</FormLabel>
                    <FormControl>
                      <div className="form-control font-common">
                        {field.value?.toString() ?? ''}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Items Section */}
              <div className="space-y-4">{isEditing ? renderEditItems() : renderReadOnlyItems()}</div>
            </div>
            
          </div>
        </ScrollArea>

        <div className="flex text-sm">
          <div className="flex flex-col justify-start space-x-2 p-4">
            <p className="text-gray-600">Total quantity & weight</p>
            <p className="font-medium">{`${totalCases || 0} ${totalCasesUnit}, ${totalQuantity? totalQuantity.toFixed(2):0.00} ${totalWeightUnit}`}</p>
          </div>
        </div>
      </form>
    </Form>
  )
}