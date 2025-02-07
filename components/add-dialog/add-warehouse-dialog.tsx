import React, { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Import the warehouseSchema
import { warehouseformSchema } from '@/components/tanstack/schema/formSchema/warehouseformSchema'


import { useCountries } from "@/hooks/use-cached-data"
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

  const { data: countries = [] } = useCountries(true)

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

  const { fields, append } = useFieldArray({
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
      console.log("add warehouses", data)
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
    // const result = await form.trigger(`items.${lastIndex}`, { shouldFocus: true });
    // console.log('print',result)

    if (isValid) {
      append(createEmptyWarehouse());
      const newItemIndex = `warehouse-${lastIndex + 1}`;
      setExpandedItems([newItemIndex]);
    } else {
      // Keep the current item expanded to show validation errors
      setExpandedItems([`warehouse-${lastIndex}`]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    form.reset({
      items: [createEmptyWarehouse()]
    });
    setExpandedItems(['warehouse-0']);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
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
                          Item {index + 1}
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
                          name={`items.${index}.warehouseNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Warehouse Number<span className="text-red-500">*</span></FormLabel>
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
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select value={field.value ?? undefined} 
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        handleContactCountryChange(value);
                                      }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a Country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countries?.map((country: Country) => (
                                    <SelectItem key={country.geoId} value={country.geoId}>
                                      {country.geoName}
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
                          name={`items.${index}.businessContacts.0.physicalLocationAddress`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
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
                              <FormLabel>City</FormLabel>
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
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/province</FormLabel>
                              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a State/province" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {contactstates?.map((state: Country) => (
                                    <SelectItem key={state.geoId} value={state.geoId}>
                                      {state.geoName}
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
                          name={`items.${index}.businessContacts.0.zipCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal code</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> 

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
                <Button type="submit">Add all</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}