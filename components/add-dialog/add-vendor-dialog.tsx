import React, { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
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

import { getStatesAndProvinces, addVendor } from '@/lib/api';
import { useCountries, useCurrencies } from "@/hooks/use-cached-data"

// Import the vendorSchema
import { vendorformSchema } from '@/components/tanstack/schema/formSchema/vendorformSchema'

// Create a schema for multiple items
const multipleVendorsSchema = z.object({
  items: z.array(vendorformSchema).min(1, "At least one vendor is required"),
})

type MultipleVendorsSchema = z.infer<typeof multipleVendorsSchema>

// Define the Country type
interface Country {
  geoId: string;
  geoName: string;
}

// Define the Currency type
interface Currency {
  uomId: string;
  abbreviation: string;
}

const createEmptyVendor = () => ({
  supplierId: null,
  supplierShortName: '',
  supplierName: '',
  address: null,
  telephone: '',
  email: null,
  gs1CompanyPrefix: null,
  gln: null,
  internalId: null,
  active: null,
  preferredCurrencyUomId: null,
  taxId: null,
  supplierTypeEnumId: null,
  bankAccountInformation: null,
  certificationCodes: null,
  supplierProductTypeDescription: null,
  tpaNumber: null,
  webSite: null,
  createdBy: null,
  createdAt: null,
  modifiedAt: null,
  modifiedBy: null,
  facilities: [createEmptyFacility()],
  businessContacts: [],
});

const createEmptyFacility = () => ({
  facilityId: null,
  ownerPartyId: null,
  facilityName: "",
  gln: "",
  ffrn: "",
  physicalLocationAddress: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  businessContacts: [
    {
      businessName: "",
      contactRole: "",
      email: "",
      phoneNumber: "",
      countryGeoId: "",
      country: "",
      stateProvinceGeoId: "",
      state: "",
      city: "",
      physicalLocationAddress: "",
      zipCode: "",
    },
  ],
});

// const createEmptyBusinessContact = () => ({
//   businessName: "",
//   contactRole: "",
//   email: "",
//   phoneNumber: "",
//   countryGeoId: "",
//   country: "",
//   stateProvinceGeoId: "",
//   state: "",
//   city: "",
//   physicalLocationAddress: "",
//   zipCode: "",
// })

interface AddDialogProps {
  onAdded: () => void;
}

interface FacilitiesSectionProps {
  index: number;
  form: any; // Use proper type from react-hook-form
  states: Country[];
  countries: Country[];
  handleCountryChange: (countryId: string) => Promise<void>;
}


const FacilitiesSection = ({ 
    index, 
    form, 
    states, 
    countries, 
    handleCountryChange 
  }: FacilitiesSectionProps) => {
    const { fields: facilityFields, append: appendFacility, remove: removeFacility } = useFieldArray({
      control: form.control,
      name: `items.${index}.facilities`,
    });

  return (
          <Accordion type="multiple" defaultValue={["facilities"]} className="w-full">
            <AccordionItem value="facilities">
              <AccordionTrigger>Facilities</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {facilityFields.map((facilityField, facilityIndex) => (
                    <Accordion
                      key={facilityField.id}
                      type="multiple"
                      defaultValue={[`facility-${facilityIndex}`]}
                      className="border rounded-lg px-4"
                    >
                      <AccordionItem value={`facility-${facilityIndex}`}>
                        <AccordionTrigger>
                          {`Facility ${facilityIndex + 1}`}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-4 p-4">
                          <FormField
                              control={form.control}
                              name={`items.${index}.facilities.${facilityIndex}.facilityName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Facility name<span className="text-red-500">*</span></FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`items.${index}.facilities.${facilityIndex}.businessContacts.0.phoneNumber`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone number</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ""} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`items.${index}.facilities.${facilityIndex}.businessContacts.0.countryGeoId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <Select value={field.value ?? undefined} 
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            handleCountryChange(value);
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
                              name={`items.${index}.facilities.${facilityIndex}.businessContacts.0.physicalLocationAddress`}
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
                              name={`items.${index}.facilities.${facilityIndex}.businessContacts.0.city`}
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
                              name={`items.${index}.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`}
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
                                      {states?.map((state: Country) => (
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
                              name={`items.${index}.facilities.${facilityIndex}.businessContacts.0.zipCode`}
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

                            <FormField
                              control={form.control}
                              name={`items.${index}.facilities.${facilityIndex}.ffrn`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>FFRN<span className="text-red-500">*</span></FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`items.${index}.facilities.${facilityIndex}.gln`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GLN<span className="text-red-500">*</span></FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                          </div>
                          <div className="flex justify-end p-4">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFacility(facilityIndex)}
                            >
                              Remove Facility
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendFacility(createEmptyFacility())}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Facility
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
  );
}

export function AddVendorDialog({ onAdded: onAdded }: AddDialogProps) {
  const [open, setOpen] = useState(false)
  const [states, setStates] = useState<Country[]>([])
  const [contactstates, setContactstates] = useState<Country[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>(['vendor-0'])

  // Use SWR hooks for data fetching
  const { data: countries = [] } = useCountries(true)
  const { data: currencies = [] } = useCurrencies(true)
  console.log('currencies list----',currencies)
 

  // Facility Handle country change and fetch states/provinces
  const handleCountryChange = useCallback(async (countryId: string) => {
    // console.log('countryId----',countryId)
    try {
      const statesData = await getStatesAndProvinces(countryId);
      // console.log('statesData list----',statesData)
      setStates(statesData);
    } catch (error) {
      console.error('Error fetching states/provinces:', error);
      // Handle error (e.g., show error message to user)
    }
  }, []);

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


  const form = useForm<MultipleVendorsSchema>({
    resolver: zodResolver(multipleVendorsSchema),
    defaultValues: {
      items: [createEmptyVendor()],
    },
    mode: 'onChange', // Enable real-time validation
  })

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const formValues = useWatch({
    control: form.control,
    name: "items",
  });

  // useEffect(() => {
  //   if (open) {
      
  //     fetchCurrencys();
  //     fetchCountries();
  //   }
  // }, [open, fetchCountries, fetchCurrencys]);

  const handleAddAnotherItem = useCallback(() => {
    append(createEmptyVendor());
    const newItemIndex = `vendor-${fields.length}`;
    setExpandedItems([newItemIndex]);
  }, [append, fields.length]);

  const handleClose = useCallback(() => {
    setOpen(false);
    form.reset({
      items: [createEmptyVendor()]
    });
    setExpandedItems(['vendor-0']);
  }, [form, setOpen]);

  const onSubmit = useCallback(async (data: MultipleVendorsSchema) => {
    console.log("add vendors", data)
    try {
      await addVendor(data)
      setOpen(false)
      form.reset({
        items: [createEmptyVendor()]
      });
      setExpandedItems(['vendor-0']);
      onAdded()
    } catch (error) {
      console.error('Error adding vendor:', error)
      // Handle error (e.g., show error message to user)
    }
  }, [form, onAdded, setOpen]);



  // const 11 = useCallback(({ index }: { index: number }) => {
 
  // }, [form.control, handleCountryChange]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add vendors</DialogTitle>
          <DialogDescription>
            Add one or more new vendors to the inventory. Click the plus button to add more vendors.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ScrollArea className="h-[60vh] pr-4">
              <Accordion
                type="multiple"
                value={expandedItems}
                onValueChange={setExpandedItems}
              >
                {fields.map((field, index) => (
                  <AccordionItem key={field.supplierId} value={`vendor-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Vendor {index + 1}
                        </span>
                        {formValues[index]?.supplierName && (
                          <span className="text-sm text-muted-foreground">
                            - {formValues[index].supplierName}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4 p-4">
                 
                        <FormField
                          control={form.control}
                          name={`items.${index}.supplierShortName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor<span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.supplierName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full name</FormLabel>
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
                              <FormLabel>Vendor number</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.telephone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tel<span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> 

                        <FormField
                          control={form.control}
                          name={`items.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />                        

                        <FormField
                          control={form.control}
                          name={`items.${index}.gs1CompanyPrefix`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GCP</FormLabel>
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
                          name={`items.${index}.preferredCurrencyUomId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency<span className="text-red-500">*</span></FormLabel>
                              <Select
                                value={field.value ?? undefined}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a Currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {currencies?.map((currency: Currency) => (
                                    <SelectItem key={currency.uomId} value={currency.uomId}>
                                      {currency.abbreviation}
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
                          name={`items.${index}.taxId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax ID / VAT Number</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.supplierTypeEnumId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.bankAccountInformation`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Account Information</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.certificationCodes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certification Codes</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.supplierProductTypeDescription`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.tpaNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trade Partner Agreement Number</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.webSite`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.businessContacts.0.businessName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.businessContacts.0.phoneNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
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

                        <FormField
                          control={form.control}
                          name={`items.${index}.businessContacts.0.contactRole`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Role</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />


                        <FormField
                          control={form.control}
                          name={`items.${index}.businessContacts.0.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />  
                         
                      </div>
                      
                      <div className="mt-6">
                        <FacilitiesSection 
                          index={index} 
                          form={form} 
                          states={states} 
                          countries={countries} 
                          handleCountryChange={handleCountryChange}
                        />
                        {/* <FacilitiesSection index={index} /> */}
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
                Add vendor
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