import React, { useState, useCallback, useRef } from 'react'
import { Plus, X, Check, ChevronsUpDown, AlertCircle } from 'lucide-react'
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

// Import the warehouseSchema
import { warehouseformSchema } from '@/components/tanstack/schema/formSchema/warehouseformSchema'

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/common/info-alert-dialog"


import { useAppContext } from "@/contexts/AppContext"
import { getStatesAndProvinces, addWarehouse, FacilityNumberWhenCreate, FacilityNameWhenCreate } from '@/lib/api';

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
  const [formError, setFormError] = useState<string | null>(null)

  // Create refs for all form fields to manage tab navigation
  const formFieldRefs = useRef<Record<string, HTMLElement | null>>({})

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
      setFormError(null)
      await addWarehouse(data)
      setOpen(false)
      form.reset({
        items: [createEmptyWarehouse()]
      });
      setExpandedItems(['warehouse-0']);
      onAdded()
    } catch (error: any) {
      // Extract error message from the response
      const errorMessage = error.response?.data?.detail || "An error occurred while adding the warehouse"
      // Set a form-level error message
      setFormError(errorMessage)
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
    setFormError(null)
    setExpandedItems(['warehouse-0']);
  };

   // Helper function to find the geoName for a given geoId
   const findCountryName = (geoId: string | undefined, countries: Country[]): string => {
    if (!geoId) return 'Select a country';
    const country = countries.find(country => country.geoId === geoId);
    return country ? country.geoName : 'Select a country';
  }

  // Function to focus the next element in the tab order
  const focusNextElement = (currentFieldName: string, index: number) => {
    // Define the tab order for form fields within each location
    const tabOrder = [
      `items.${index}.facilityName`,
      `items.${index}.gln`,
      `items.${index}.internalId`,
      `items.${index}.facilitySize`,
      `items.${index}.businessContacts.0.countryGeoId`,
      `items.${index}.businessContacts.0.physicalLocationAddress`,
      `items.${index}.businessContacts.0.city`,
      `items.${index}.businessContacts.0.stateProvinceGeoId`,
      `items.${index}.businessContacts.0.zipCode`,
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
                                  <Input 
                                    {...field} 
                                    value={field.value ?? ''}
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.facilityName`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.facilityName`] = el
                                    }}
                                    onBlur={async (e) => {
                                      field.onBlur() // Call the original onBlur handler
                                      // Clear the error if it exists
                                      form.clearErrors(`items.${index}.facilityName`)
                                      const value = e.target.value
                                      if (value) {
                                        try {
                                          await FacilityNameWhenCreate(value)
                                        } catch (error : any) {
                                          // Check if the error has a response with status 400
                                          if (error.response && error.response.status === 400) {
                                            // Extract the error message from the response
                                            const errorMessage = "This warehouse name already exists"
                                            // Set the form error
                                            form.setError(`items.${index}.facilityName`, {
                                              type: "manual",
                                              message: errorMessage,
                                            })
                                          } else {
                                            // Handle other types of errors
                                            form.setError(`items.${index}.facilityName`, {
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
                            name={`items.${index}.gln`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GLN</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.gln`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.gln`] = el
                                    }}/>
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
                                  <Input 
                                    {...field} 
                                    value={field.value ?? ''} 
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
                                          await FacilityNumberWhenCreate(value)
                                        } catch (error : any) {
                                          // Check if the error has a response with status 400
                                          if (error.response && error.response.status === 400) {
                                            // Extract the error message from the response
                                            const errorMessage = "This warehouse number already exists"
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
                            name={`items.${index}.facilitySize`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    value={field.value ?? ''} 
                                    onKeyDown={(e) => {
                                      if (e.key === "Tab" && !e.shiftKey) {
                                        e.preventDefault()
                                        // Directly focus the currency button
                                        const currencyButton = formFieldRefs.current[`items.${index}.businessContacts.0.countryGeoId`]
                                        if (currencyButton) {
                                          currencyButton.focus()
                                        }
                                      } else {
                                        handleKeyDown(e, `items.${index}.facilitySize`, index)
                                      }
                                    }}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.facilitySize`] = el
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
                                            tabIndex={0}
                                            name={`items.${index}.businessContacts.0.countryGeoId`}
                                            onKeyDown={(e) => {
                                              if (e.key === "Tab" && !e.shiftKey) {
                                                e.preventDefault()
                                                focusNextElement(`items.${index}.businessContacts.0.countryGeoId`, index)
                                              } else if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                setIsCountryPopoverOpen(true)
                                              }
                                            }}
                                            ref={(el: HTMLButtonElement | null) => {
                                              formFieldRefs.current[`items.${index}.businessContacts.0.countryGeoId`] = el;
                                            }}
                                          >
                                            {findCountryName(field.value??'', countries) ?? "Select a country"}
                                            {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-full p-0">
                                      <Command
                                        onKeyDown={(e) => {
                                          if (e.key === "Tab") {
                                            e.preventDefault()
                                            setIsCountryPopoverOpen(false)
                                            focusNextElement(`items.${index}.businessContacts.0.countryGeoId`, index)
                                          }
                                        }}>
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
                                                    setTimeout(() => focusNextElement(`items.${index}.businessContacts.0.countryGeoId`, index), 0)
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
                                  <Input {...field} value={field.value ?? ""} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.businessContacts.0.physicalLocationAddress`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.businessContacts.0.physicalLocationAddress`] = el
                                    }}/>
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
                                  <Input {...field} value={field.value ?? ""} 
                                    onKeyDown={(e) => {
                                      if (e.key === "Tab" && !e.shiftKey) {
                                        e.preventDefault()
                                        // Directly focus the currency button
                                        const currencyButton = formFieldRefs.current[`items.${index}.businessContacts.0.stateProvinceGeoId`]
                                        if (currencyButton) {
                                          currencyButton.focus()
                                        }
                                      } else {
                                        handleKeyDown(e, `items.${index}.businessContacts.0.city`, index)
                                      }
                                    }}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.businessContacts.0.city`] = el
                                    }}/>
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
                                              tabIndex={0}
                                              name={`items.${index}.businessContacts.0.stateProvinceGeoId`}
                                              onKeyDown={(e) => {
                                                if (e.key === "Tab" && !e.shiftKey) {
                                                  e.preventDefault()
                                                  focusNextElement(`items.${index}.businessContacts.0.stateProvinceGeoId`, index)
                                                } else if (e.key === "Enter" || e.key === " ") {
                                                  e.preventDefault()
                                                  setIsStatePopoverOpen(true)
                                                }
                                              }}
                                              ref={(el: HTMLButtonElement | null) => {
                                                formFieldRefs.current[`items.${index}.businessContacts.0.stateProvinceGeoId`] = el;
                                              }}
                                            >
                                              {field.value ?? "Select a state"}
                                              {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                                            </Button>
                                          </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                          <Command
                                            onKeyDown={(e) => {
                                              if (e.key === "Tab") {
                                                e.preventDefault()
                                                setIsStatePopoverOpen(false)
                                                focusNextElement(`items.${index}.businessContacts.0.stateProvinceGeoId`, index)
                                              }
                                            }}>
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
                                                      setTimeout(() => focusNextElement(`items.${index}.businessContacts.0.stateProvinceGeoId`, index), 0)
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
                                  <Input {...field} value={field.value ?? ""} 
                                    onKeyDown={(e) => handleKeyDown(e, `items.${index}.businessContacts.0.zipCode`, index)}
                                    ref={(el: HTMLInputElement | null) => {
                                      formFieldRefs.current[`items.${index}.businessContacts.0.zipCode`] = el
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