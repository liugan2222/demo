import React, { useState, useCallback } from 'react'
import { Plus, X, Check, ChevronsUpDown } from 'lucide-react'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Import the warehouseSchema
import { warehouseformSchema } from '@/components/tanstack/schema/formSchema/warehouseformSchema'

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/common/info-alert-dialog"


import { useAppContext } from "@/contexts/AppContext"
import { getStatesAndProvinces, addWarehouse } from '@/lib/api';

// Define the Country type
interface Country {
  geoId: string;
  geoName: string;
}

// Create a schema for multiple warehouses
const multipleWarehousesSchema = z.object({
  items: z.array(warehouseformSchema).min(1, "At least one warehouse is required"),
})

type MultipleWarehousesSchema = z.infer<typeof multipleWarehousesSchema>

// Mock function to fetch vendors
// const fetchVendors = async () => {
//   // Simulating API call
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   return ['Vendor A', 'Vendor B', 'Vendor C'];
// };

const createEmptyWarehouse = () => ({
  ownerPartyId: 'FRESH_MART_DC',  // TODO 此处应该动态获取
  facilityId: null,
  facilityName: '',
  gln: null,
  warehouseNumber: null,
  facilitySize: null,
  businessContacts: [],
  createdBy: null,
  createdAt: null,
  modifiedAt: null,
  modifiedBy: null,
});

interface AddDialogProps {
  onAdded: () => void;
}

export function AddWarehouseDialog({ onAdded: onAdded }: AddDialogProps) {
  const [open, setOpen] = useState(false)
  // const [vendors, setVendors] = useState<string[]>([])
  const [contactstates, setContactstates] = useState<Country[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>(['warehouse-0'])

  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = useState(false)
  const [isStatePopoverOpen, setIsStatePopoverOpen] = useState(false)

  const { countries = [] } = useAppContext()

  // Contact Handle country change and fetch states/provinces
  const handleContactCountryChange = useCallback(async (countryId: string) => {
    try {
      const statesData = await getStatesAndProvinces(countryId);
      setContactstates(statesData);
    } catch (error) {
      console.error('Error fetching states/provinces:', error);
      // Handle error (e.g., show error message to user)
    }
  }, []);  

  const form = useForm<MultipleWarehousesSchema>({
    resolver: zodResolver(multipleWarehousesSchema),
    defaultValues: {
      items: [createEmptyWarehouse()],
    },
    mode: 'onChange', // Enable real-time validation
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // useEffect(() => {
  //   if (open) {
  //     fetchVendors().then(setVendors);
  //   }
  // }, [open]);

  const onSubmit = useCallback(async (data: MultipleWarehousesSchema) => {
    try {
      await addWarehouse(data)
      setOpen(false)
      form.reset({
        items: [createEmptyWarehouse()]
      });
      setExpandedItems(['warehouse-0']);
      onAdded()
    } catch (error) {
      console.error('Error adding warehouse:', error)
      // Handle error (e.g., show error message to user)
    }
  }, [form, onAdded, setOpen]);

  const handleAddAnotherItem = async () => {
    const currentValues = form.getValues().items;
    const lastIndex = currentValues.length - 1;
    
    const isValid = await form.trigger(`items.${lastIndex}`);

    if (isValid) {
      append(createEmptyWarehouse());
      const newItemIndex = `warehouse-${lastIndex + 1}`;
      setExpandedItems([newItemIndex]);
    } else {
      // Keep the current item expanded to show validation errors
      setExpandedItems([`warehouse-${lastIndex}`]);
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
      items: [createEmptyWarehouse()]
    });
    setExpandedItems(['warehouse-0']);
  };

   // Helper function to find the geoName for a given geoId
   const findCountryName = (geoId: string | undefined, countries: Country[]): string => {
    if (!geoId) return 'Select a country';
    const country = countries.find(country => country.geoId === geoId);
    return country ? country.geoName : 'Select a country';
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
            Add warehouse
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add warehouses</DialogTitle>
            <DialogDescription>
              Add one or more new warehouses to the inventory. Click the plus button to add more warehouses.
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
                    <AccordionItem key={field.id} value={`warehouse-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Warehouse {index + 1}
                          </span>
                          {form.getValues(`items.${index}.facilityName`) && (
                            <span className="text-sm text-muted-foreground">
                              - {form.getValues(`items.${index}.facilityName`)}
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
                            name={`items.${index}.facilityName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Warehouse<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''}/>
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
                            name={`items.${index}.internalId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Warehouse number</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.facilitySize`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Capacity</FormLabel>
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
                            name={`items.${index}.businessContacts.0.countryGeoId`}
                            render={({ field }) => {

                              return (
                                <FormItem>
                                  <FormLabel>Country<span className="text-red-500">*</span></FormLabel>

                                  <div className="relative">
                                    <Popover 
                                      open={isCountryPopoverOpen} 
                                      onOpenChange={setIsCountryPopoverOpen} // 控制弹出状态
                                    >
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                                          >
                                            {findCountryName(field.value??'', countries) ?? "Select a country"}
                                            {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-full p-0">
                                        <Command>
                                          <CommandInput placeholder="Search country..." />
                                          <CommandList>
                                            <CommandEmpty>No country found.</CommandEmpty>
                                            <CommandGroup>
                                              {countries?.map((country) => (
                                                <CommandItem
                                                  value={country.geoId}
                                                  key={country.geoId}
                                                  onSelect={() => {
                                                    field.onChange(country.geoId)
                                                    handleContactCountryChange(country.geoId)
                                                    setIsCountryPopoverOpen(false) // 选择后关闭下拉
                                                  }}
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      field.value === country.geoId ? "opacity-100" : "opacity-0",
                                                    )}
                                                  />
                                                  {country.geoName}
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                
                                    {/* 图标容器 */}
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                      {/* 清除按钮 */}
                                      {field.value && (
                                        <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          field.onChange("")
                                          setIsCountryPopoverOpen(false)
                                        }}
                                        >
                                        <X className="h-4 w-4" />
                                        </button>
                                      )}

                                      {/* 下拉图标 */}
                                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )
                            }}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.businessContacts.0.physicalLocationAddress`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.businessContacts.0.city`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.businessContacts.0.stateProvinceGeoId`}
                            render={({ field }) => {

                              return (
                                  <FormItem>
                                    <FormLabel>State/Province<span className="text-red-500">*</span></FormLabel>
                                    <div className="relative">
                                      <Popover 
                                        open={isStatePopoverOpen} 
                                        onOpenChange={setIsStatePopoverOpen} // 控制弹出状态
                                      >
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              role="combobox"
                                              className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                                            >
                                              {field.value ?? "Select a state"}
                                              {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                                            </Button>
                                          </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                          <Command>
                                            <CommandInput placeholder="Search state/province..." />
                                            <CommandList>
                                              <CommandEmpty>No state/province found.</CommandEmpty>
                                              <CommandGroup>
                                                {contactstates?.map((state) => (
                                                  <CommandItem
                                                    value={state.geoId}
                                                    key={state.geoId}
                                                    onSelect={() => {
                                                      field.onChange(state.geoId)
                                                      setIsStatePopoverOpen(false) // 选择后关闭下拉
                                                    }}
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-4 w-4",
                                                        field.value === state.geoId ? "opacity-100" : "opacity-0",
                                                      )}
                                                    />
                                                    {state.geoName}
                                                  </CommandItem>
                                                ))}
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                
                                      {/* 图标容器 */}
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        {/* 清除按钮 */}
                                        {field.value && (
                                          <button
                                          type="button"
                                          className="text-muted-foreground hover:text-foreground"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            field.onChange("")
                                            setIsStatePopoverOpen(false)
                                          }}
                                          >
                                          <X className="h-4 w-4" />
                                          </button>
                                        )}

                                        {/* 下拉图标 */}
                                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                      </div>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                              )
                            }}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.businessContacts.0.zipCode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal code<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} />
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
                                Remove warehouse
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
                  Add warehouse
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