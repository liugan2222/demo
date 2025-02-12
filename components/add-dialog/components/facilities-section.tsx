import type React from "react"
import { Plus } from "lucide-react"
import { useFieldArray } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
  gln: "",
  ffrn: "",
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
                                Facility name<span className="text-red-500">*</span>
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
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`}
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
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.physicalLocationAddress`}
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
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.city`}
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
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`}
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
                            name={`items.0.facilities.${facilityIndex}.businessContacts.0.zipCode`}
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
                            name={`items.0.facilities.${facilityIndex}.ffrn`}
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
                            name={`items.0.facilities.${facilityIndex}.gln`}
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

