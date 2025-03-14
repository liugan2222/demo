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

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/common/info-alert-dialog"

// Import the locationSchema
import { locationformSchema } from '@/components/tanstack/schema/formSchema/locationformSchema'

import { addLocation, getWarehouseList } from '@/lib/api';

// Create a schema for multiple items
const multipleLocationsSchema = z.object({
  items: z.array(locationformSchema).min(1, "At least one item is required"),
})

type MultipleLocationsSchema = z.infer<typeof multipleLocationsSchema>

interface Warehouse {
  facilityId: string;
  facilityName: string;
}

const createEmptyLocation = () => ({
  facilityId: '',
  locationSeqId: null,
  locationName: '',
  gln: null,
  locationCode: null,
  // status: null,
  // warehouse: null,
  areaId: null,
  description: null,
  createdBy: null,
  createdAt: null,
  modifiedAt: null,
  modifiedBy: null,
});

interface AddDialogProps {
  onAdded: () => void;
}

export function AddLocationDialog({ onAdded: onAdded }: AddDialogProps) {
  const [open, setOpen] = useState(false)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>(['location-0'])

  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  const form = useForm<MultipleLocationsSchema>({
    resolver: zodResolver(multipleLocationsSchema),
    defaultValues: {
      items: [createEmptyLocation()],
    },
    mode: 'onChange', // Enable real-time validation
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const fetchWarehouses = useCallback(async () => {
    try {
      const warehouseList = await getWarehouseList()
      setWarehouses(warehouseList)
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchWarehouses()
    }
  }, [open, fetchWarehouses])

  const onSubmit = useCallback(async (data: MultipleLocationsSchema) => {
    try {
      await addLocation(data)
      setOpen(false)
      form.reset({
        items: [createEmptyLocation()]
      });
      setExpandedItems(['location-0']);
      onAdded()
    } catch (error) {
      console.error('Error adding location:', error)
      // Handle error (e.g., show error message to user)
    }
  }, [form, onAdded, setOpen]);

  const handleAddAnotherItem = async () => {
    const currentValues = form.getValues().items;
    const lastIndex = currentValues.length - 1;
    
    const isValid = await form.trigger(`items.${lastIndex}`);

    if (isValid) {
      append(createEmptyLocation());
      const newItemIndex = `location-${lastIndex + 1}`;
      setExpandedItems([newItemIndex]);
    } else {
      // Keep the current item expanded to show validation errors
      setExpandedItems([`location-${lastIndex}`]);
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
      items: [createEmptyLocation()]
    });
    setExpandedItems(['location-0']);
  };

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
            Add location
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add locations</DialogTitle>
            <DialogDescription>
              Add one or more new locations to the inventory. Click the plus button to add more locations.
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
                    <AccordionItem key={field.id} value={`location-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Location {index + 1}
                          </span>
                          {form.getValues(`items.${index}.locationName`) && (
                            <span className="text-sm text-muted-foreground">
                              - {form.getValues(`items.${index}.locationName`)}
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
                          <FormField
                            control={form.control}
                            name={`items.${index}.locationName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.gln`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GLN</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.locationCode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location number</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.facilityId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Warehouse<span className="text-red-500">*</span></FormLabel>
                                <Select
                                  value={field.value ?? undefined}
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a warehouse" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {warehouses?.map((warehouse) => (
                                      <SelectItem key={warehouse.facilityId} value={warehouse.facilityId}>
                                        {warehouse.facilityName}
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
                            name={`items.${index}.areaId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Warehouse zone</FormLabel>
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
                          {index > 0 && (
                            <div className="col-start-2 flex justify-end mt-6 pt-4">
                              <Button
                                type="button"
                                variant="destructive"
                                size="default"
                                onClick={() => remove(index)}
                              >
                                <X className="h-4 w-4" />
                                Remove location
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
                  Add location
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