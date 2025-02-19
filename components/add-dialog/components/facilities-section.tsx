import type React from "react"
import { Plus, Check, ChevronsUpDown } from "lucide-react"
import { useFieldArray } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Country {
  geoId: string
  geoName: string
}

interface FacilitiesSectionProps {
  form: any // Use proper type from react-hook-form
  states: Country[]
  countries: Country[]
  handleCountryChange: (countryId: string) => Promise<void>
}

const createEmptyFacility = () => ({
  facilityId: null,
  ownerPartyId: null,
  facilityName: "",
  gln: null,
  ffrn: null,
  businessContacts: [
    {
      businessName: null,
      contactRole: null,
      email: null,
      phoneNumber: null,
      countryGeoId: "",
      country: null,
      stateProvinceGeoId: "",
      state: null,
      city: "",
      physicalLocationAddress: "",
      zipCode: "",
    },
  ],
})

export const FacilitiesSection: React.FC<FacilitiesSectionProps> = ({
  form,
  states,
  countries,
  handleCountryChange,
}) => {
  const {
    fields: facilityFields,
    append: appendFacility,
    remove: removeFacility,
  } = useFieldArray({
    control: form.control,
    name: `items.0.facilities`,
  })

  const copyVendorInfo = (facilityIndex: number) => {
    const vendorData = form.getValues("items.0.businessContacts.0")
    const path = `items.0.facilities.${facilityIndex}.businessContacts.0`

    if (vendorData.countryGeoId) {
      handleCountryChange(vendorData.countryGeoId)
    }

    form.setValue(`${path}.phoneNumber`, vendorData.phoneNumber)
    form.setValue(`${path}.countryGeoId`, vendorData.countryGeoId)
    form.setValue(`${path}.physicalLocationAddress`, vendorData.physicalLocationAddress)
    form.setValue(`${path}.city`, vendorData.city)
    form.setValue(`${path}.stateProvinceGeoId`, vendorData.stateProvinceGeoId)
    form.setValue(`${path}.zipCode`, vendorData.zipCode)
    form.setValue(`${path}.email`, vendorData.email)
  }

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
                  <AccordionTrigger>{`Facility ${facilityIndex + 1}`}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`copy-vendor-info-${facilityIndex}`}
                          onCheckedChange={() => copyVendorInfo(facilityIndex)}
                        />
                        <label htmlFor={`copy-vendor-info-${facilityIndex}`} className="text-sm text-muted-foreground">
                          Same as vendor information (number, address, email)
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4 p-4">
                        <FormField
                          control={form.control}
                          name={`items.0.facilities.${facilityIndex}.facilityName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Facility Name<span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                            control={form.control}
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.phoneNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country<span className="text-red-500">*</span></FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                      >
                                        {field.value ?? "Select a country"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                                handleCountryChange(country.geoId)
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.physicalLocationAddress`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Address<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.city`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  City<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province<span className="text-red-500">*</span></FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                      >
                                        {field.value ?? "Select a state"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Search state/province..." />
                                      <CommandList>
                                        <CommandEmpty>No state/province found.</CommandEmpty>
                                        <CommandGroup>
                                          {states?.map((state) => (
                                            <CommandItem
                                              value={state.geoId}
                                              key={state.geoId}
                                              onSelect={() => {
                                                field.onChange(state.geoId)
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.zipCode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Postal Code<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.0.facilities.${facilityIndex}.ffrn`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>FFRN</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.0.facilities.${facilityIndex}.gln`}
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
                          
                      </div>
                    </div>
                    {facilityFields.length > 1 && (
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
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendFacility(createEmptyFacility())}
              className="ml-4 mb-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Facility
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

