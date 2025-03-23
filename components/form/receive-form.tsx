"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { X, Edit2, Plus, FileText, Check, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import "@/app/globals.css";

import {toast } from "sonner"

import { receiveformSchema, Receiveform } from '@/components/tanstack/schema/formSchema/receiveformSchema'
import { Document } from '@/components/tanstack/schema/formSchema/documentSchema'

import { usePackageType, useWeightUom } from "@/hooks/use-cached-data"
import { getReceiveById, updateReceive, getPos, uploadFile, uploadReceiveFile, updateFileName, deleteFile } from '@/lib/api';

import { useAppContext } from "@/contexts/AppContext"
import { IMAGE_PATHS  } from "@/contexts/images"

const DEFAULT_IMAGE = IMAGE_PATHS.DEFAULT_ITEM;

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

  // Add these state variables inside the ReceiveForm component, after the existing state variables
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [editingFileName, setEditingFileName] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState<string>("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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

  function getFileExtension(filename) {
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts.pop();
    }
    return ''; // 如果没有 '.'，返回空字符串
  }

  // Add this function inside the ReceiveForm component, before the return statement
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error("File size exceeds 5MB limit")
      toast.error("Upload error", {
        description: "File size exceeds 5MB limit.",
        duration: 3000, // 3 seconds
        position: "bottom-right",
      })
      return
    }

    try {
      // Upload file
      console.log("Uploading file:", file.name)
      const response = await uploadFile(file)
      // response.data.id

      // Simulate successful upload
      const referenceDocuments = form.getValues("referenceDocuments") || []
      // 文件上传
      const newDocument: Document = {
        // documentId: selectedItem.documentId,
        contentType: getFileExtension(file.name),
        documentText: file.name,
        documentLocation: response.data.id,
      }

      await uploadReceiveFile(selectedItem.documentId??'', newDocument)

      form.setValue("referenceDocuments", [...referenceDocuments, newDocument], {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      // Upload file error handling
      console.error("Error uploading file:", error)
      toast.error("Upload error", {
        description: "Please try again.",
        duration: 3000, // 3 seconds
        position: "bottom-right",
      })
    }
  }

  const handleEditFileName = (documentId: string, currentName: string) => {
    setEditingFileName(documentId)
    setNewFileName(currentName)
  }

  const saveFileName = (documentId: string) => {
    const referenceDocuments = form.getValues("referenceDocuments") || []
    const updatedDocuments = referenceDocuments.map((doc) => {
      if (doc.documentId === documentId) {
        const newNameFile = { ...doc, documentText: newFileName }
        // TODO: Modify name
        updateFileName(documentId, newNameFile)
        return newNameFile
      }
      return doc
    })

    form.setValue("referenceDocuments", updatedDocuments, {
      shouldValidate: true,
      shouldDirty: true,
    })

    setEditingFileName(null)
  }

  const confirmDeleteFile = (documentId: string) => {
    setFileToDelete(documentId)
    setShowDeleteDialog(true)
  }

  const deleteFilefc = () => {
    if (!fileToDelete) return

    // TODO: Delete file
    deleteFile(selectedItem.documentId??'', fileToDelete)

    const referenceDocuments = form.getValues("referenceDocuments") || []
    const updatedDocuments = referenceDocuments.filter((doc) => doc.documentId !== fileToDelete)


    form.setValue("referenceDocuments", updatedDocuments, {
      shouldValidate: true,
      shouldDirty: true,
    })

    setShowDeleteDialog(false)
    setFileToDelete(null)
  }

  const downloadFile = (documentLocation: string, documentName: string) => {
    const url = `https://fp.ablueforce.com/api/files/${documentLocation}/media`

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = url
    link.download = documentName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isImageFile = (fileType: string) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]
    const extension = fileType.toLowerCase()
    return imageExtensions.includes(extension)
  }

  // Add this function to truncate file names but preserve extensions
  const truncateFileName = (fileName: string, maxLength = 25) => {
    if (fileName.length <= maxLength) return fileName

    const extension = fileName.substring(fileName.lastIndexOf("."))
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf("."))

    if (extension.length >= maxLength - 3) {
      return `...${extension}`
    }

    const truncatedName = nameWithoutExtension.substring(0, maxLength - 3 - extension.length)
    return `${truncatedName}...${extension}`
  }


  const renderReadOnlyItems = () => (
    <Accordion type="single" collapsible className="space-y-4">
      {form.watch("receivingItems")?.map((item, index) => (
        <AccordionItem key={item.receiptId || index} value={`item-${index}`}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-start gap-4 w-full">
              <div className="w-24 h-24 bg-gray-100 rounded-lg">
                <img
                  src={item.smallImageUrl ? `https://fp.ablueforce.com/api/files/${item.smallImageUrl}/media` : DEFAULT_IMAGE}
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
                    src={form.watch(`receivingItems.${index}.smallImageUrl`) ? `https://fp.ablueforce.com/api/files/${form.watch(`receivingItems.${index}.smallImageUrl`)}/media` : DEFAULT_IMAGE}
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

            {/* Attachments Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Attachments</h3>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add attachment
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {(form.watch("referenceDocuments") || []).length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">No attachments</div>
                ) : (
                  (form.watch("referenceDocuments") || []).map((doc: Document) => (
                    <div
                      key={doc.documentLocation}
                      className="flex items-center p-2 border rounded-md hover:bg-accent/50 cursor-pointer"
                      onClick={() =>
                        !isEditing || editingFileName !== doc.documentId
                          ? downloadFile(doc.documentLocation??'', doc.documentText??'')
                          : null
                      }
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-md mr-3 overflow-hidden flex-shrink-0">
                        {isImageFile(doc.contentType ??'') ? (
                          <img
                            src={`https://fp.ablueforce.com/api/files/${doc.documentLocation}/media`}
                            alt={doc.documentText??''}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = IMAGE_PATHS.DEFAULT_FILE
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {isEditing && editingFileName === doc.documentId ? (
                          <div className="flex items-center">
                            <Input
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              className="h-8"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  saveFileName(doc.documentId ?? '')
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                saveFileName(doc.documentId ?? '')
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm font-medium truncate">{truncateFileName(doc.documentText ?? '')}</div>
                        )}
                      </div>

                      {isEditing && editingFileName !== doc.documentId && (
                        <div className="flex items-center ml-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditFileName(doc.documentId?? '', doc.documentText?? '')
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              confirmDeleteFile(doc.documentId?? '')
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </ScrollArea>

        <div className="flex text-sm">
          <div className="flex flex-col justify-start space-x-2 p-4">
            <p className="text-gray-600">Total quantity & weight</p>
            <p className="font-medium">{`${totalCases || 0} ${totalCasesUnit}, ${totalQuantity? totalQuantity.toFixed(2):0.00} ${totalWeightUnit}`}</p>
          </div>
        </div>

        {/* Add AlertDialog for file deletion confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this attachment?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteFilefc}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  )
}