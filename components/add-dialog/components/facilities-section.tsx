import React from 'react'
import { Plus, Check, ChevronsUpDown, X } from "lucide-react"
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
  form: any
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
      telecomCountryCode: null,
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

  // Create a map of open states for each facility's popovers
  const [popoverStates, setPopoverStates] = React.useState<{
    [key: string]: {
      country: boolean;
      state: boolean;
    };
  }>({})

  const toggleCountryPopover = (facilityIndex: number, value: boolean) => {
    setPopoverStates(prev => ({
      ...prev,
      [`facility-${facilityIndex}`]: {
        ...prev[`facility-${facilityIndex}`],
        country: value
      }
    }))
  }

  const toggleStatePopover = (facilityIndex: number, value: boolean) => {
    setPopoverStates(prev => ({
      ...prev,
      [`facility-${facilityIndex}`]: {
        ...prev[`facility-${facilityIndex}`],
        state: value
      }
    }))
  }

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

  const findCountryName = (geoId: string | undefined, countries: Country[]): string => {
    if (!geoId) return 'Select a country';
    const country = countries.find(country => country.geoId === geoId);
    return country ? country.geoName : 'Select a country';
  }

  // Create refs for all form fields to manage tab navigation
  const formFieldRefs = React.useRef<Record<string, HTMLElement | null>>({})  

  // Function to focus the next element in the tab order within a facility
  const focusNextElement = (currentFieldName: string, facilityIndex: number) => {
    // Define the tab order for form fields within each facility
    const tabOrder = [
      `items.0.facilities.${facilityIndex}.facilityName`,
      `items.0.facilities.${facilityIndex}.businessContacts.0.telecomCountryCode`,
      `items.0.facilities.${facilityIndex}.businessContacts.0.phoneNumber`,
      `items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`,
      `items.0.facilities.${facilityIndex}.businessContacts.0.physicalLocationAddress`,
      `items.0.facilities.${facilityIndex}.businessContacts.0.city`,
      `items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`,
      `items.0.facilities.${facilityIndex}.businessContacts.0.zipCode`,
      `items.0.facilities.${facilityIndex}.ffrn`,
      `items.0.facilities.${facilityIndex}.gln`,
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
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string, facilityIndex: number) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault()
      focusNextElement(fieldName, facilityIndex)
    }
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
                                <Input {...field} value={field.value ?? ""} 
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, `items.0.facilities.${facilityIndex}.facilityName`, facilityIndex)
                                  }
                                  ref={(el: HTMLInputElement | null) => {
                                    formFieldRefs.current[`items.0.facilities.${facilityIndex}.facilityName`] = el
                                  }}/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.0.facilities.${facilityIndex}.businessContacts.0.telecomCountryCode`}
                          render={({ field: telField }) => (
                            <FormItem>
                              <FormLabel>Phone number</FormLabel>
                              <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-1">
                                  <FormControl>
                                    <Input {...telField} value={telField.value ?? ""}
                                      onKeyDown={(e) =>
                                        handleKeyDown(
                                          e,
                                          `items.0.facilities.${facilityIndex}.businessContacts.0.telecomCountryCode`,
                                          facilityIndex,
                                        )
                                      }
                                      ref={(el: HTMLInputElement | null) => {
                                        formFieldRefs.current[
                                          `items.0.facilities.${facilityIndex}.businessContacts.0.telecomCountryCode`
                                        ] = el
                                      }}/>
                                  </FormControl>
                                </div>
                                <div className="col-span-3">
                                  <FormField
                                    control={form.control}
                                    name={`items.0.facilities.${facilityIndex}.businessContacts.0.phoneNumber`}
                                    render={({ field: mobileField }) => (
                                      <FormControl>
                                        <Input {...mobileField} value={mobileField.value ?? ""} 
                                          onKeyDown={(e) => {
                                            if (e.key === "Tab" && !e.shiftKey) {
                                              e.preventDefault()
                                              // Directly focus the country button
                                              const countryButton =
                                                formFieldRefs.current[
                                                  `items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`
                                                ]
                                              if (countryButton) {
                                                countryButton.focus()
                                              }
                                            } else {
                                              handleKeyDown(
                                                e,
                                                `items.0.facilities.${facilityIndex}.businessContacts.0.phoneNumber`,
                                                facilityIndex,
                                              )
                                            }
                                          }}
                                          ref={(el: HTMLInputElement | null) => {
                                            formFieldRefs.current[
                                              `items.0.facilities.${facilityIndex}.businessContacts.0.phoneNumber`
                                            ] = el
                                          }}/>
                                      </FormControl>
                                    )}
                                  />
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`}
                          render={({ field }) => {
                            const isOpen = popoverStates[`facility-${facilityIndex}`]?.country ?? false;

                            return (
                              <FormItem>
                                <FormLabel>Country<span className="text-red-500">*</span></FormLabel>
                                <div className="relative">
                                  <Popover 
                                    open={isOpen} 
                                    onOpenChange={(value) => toggleCountryPopover(facilityIndex, value)}
                                  >
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                                          tabIndex={0}
                                          name={`items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`}
                                          onKeyDown={(e) => {
                                            if (e.key === "Tab" && !e.shiftKey) {
                                              e.preventDefault()
                                              focusNextElement(
                                                `items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`,
                                                facilityIndex,
                                              )
                                            } else if (e.key === "Enter" || e.key === " ") {
                                              e.preventDefault()
                                              toggleCountryPopover(facilityIndex, true)
                                            }
                                          }}
                                          ref={(el: HTMLButtonElement | null) => {
                                            formFieldRefs.current[
                                              `items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`
                                            ] = el
                                          }}
                                        >
                                          {findCountryName(field.value, countries)}
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command
                                        onKeyDown={(e) => {
                                          if (e.key === "Tab") {
                                            e.preventDefault()
                                            toggleCountryPopover(facilityIndex, false)
                                            focusNextElement(
                                              `items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`,
                                              facilityIndex,
                                            )
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
                                                  handleCountryChange(country.geoId)
                                                  toggleCountryPopover(facilityIndex, false)
                                                  setTimeout(
                                                    () =>
                                                      focusNextElement(
                                                        `items.0.facilities.${facilityIndex}.businessContacts.0.countryGeoId`,
                                                        facilityIndex,
                                                      ),
                                                    0,
                                                  )
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
                            
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {field.value && (
                                      <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          field.onChange("")
                                          toggleCountryPopover(facilityIndex, false)
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    )}
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
                          name={`items.0.facilities.${facilityIndex}.businessContacts.0.physicalLocationAddress`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Address<span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} 
                                  onKeyDown={(e) =>
                                    handleKeyDown(
                                      e,
                                      `items.0.facilities.${facilityIndex}.businessContacts.0.physicalLocationAddress`,
                                      facilityIndex,
                                    )
                                  }
                                  ref={(el: HTMLInputElement | null) => {
                                    formFieldRefs.current[
                                      `items.0.facilities.${facilityIndex}.businessContacts.0.physicalLocationAddress`
                                    ] = el
                                  }}/>
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
                                <Input {...field} value={field.value ?? ""} 
                                  onKeyDown={(e) => {
                                    if (e.key === "Tab" && !e.shiftKey) {
                                      e.preventDefault()
                                      // Directly focus the state button
                                      const stateButton =
                                        formFieldRefs.current[
                                          `items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`
                                        ]
                                      if (stateButton) {
                                        stateButton.focus()
                                      }
                                    } else {
                                      handleKeyDown(
                                        e,
                                        `items.0.facilities.${facilityIndex}.businessContacts.0.city`,
                                        facilityIndex,
                                      )
                                    }
                                  }}
                                  ref={(el: HTMLInputElement | null) => {
                                    formFieldRefs.current[
                                      `items.0.facilities.${facilityIndex}.businessContacts.0.city`
                                    ] = el
                                  }}/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`}
                          render={({ field }) => {
                            const isOpen = popoverStates[`facility-${facilityIndex}`]?.state ?? false;

                            return (
                              <FormItem>
                                <FormLabel>State/Province<span className="text-red-500">*</span></FormLabel>
                                <div className="relative">
                                  <Popover 
                                    open={isOpen} 
                                    onOpenChange={(value) => toggleStatePopover(facilityIndex, value)}
                                  >
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                                          tabIndex={0}
                                          name={`items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`}
                                          onKeyDown={(e) => {
                                            if (e.key === "Tab" && !e.shiftKey) {
                                              e.preventDefault()
                                              focusNextElement(
                                                `items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`,
                                                facilityIndex,
                                              )
                                            } else if (e.key === "Enter" || e.key === " ") {
                                              e.preventDefault()
                                              toggleStatePopover(facilityIndex, true)
                                            }
                                          }}
                                          ref={(el: HTMLButtonElement | null) => {
                                            formFieldRefs.current[
                                              `items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`
                                            ] = el
                                          }}
                                        >
                                          {field.value ?? "Select a state"}
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command
                                        onKeyDown={(e) => {
                                          if (e.key === "Tab") {
                                            e.preventDefault()
                                            toggleStatePopover(facilityIndex, false)
                                            focusNextElement(
                                              `items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`,
                                              facilityIndex,
                                            )
                                          }
                                        }}>
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
                                                  toggleStatePopover(facilityIndex, false)
                                                  setTimeout(
                                                    () =>
                                                      focusNextElement(
                                                        `items.0.facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`,
                                                        facilityIndex,
                                                      ),
                                                    0,
                                                  )
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
                            
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {field.value && (
                                      <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          field.onChange("")
                                          toggleStatePopover(facilityIndex, false)
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    )}
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
                          name={`items.0.facilities.${facilityIndex}.businessContacts.0.zipCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Postal code<span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} 
                                  onKeyDown={(e) =>
                                    handleKeyDown(
                                      e,
                                      `items.0.facilities.${facilityIndex}.businessContacts.0.zipCode`,
                                      facilityIndex,
                                    )
                                  }
                                  ref={(el: HTMLInputElement | null) => {
                                    formFieldRefs.current[
                                      `items.0.facilities.${facilityIndex}.businessContacts.0.zipCode`
                                    ] = el
                                  }}/>
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
                                <Input {...field} value={field.value ?? ''} 
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, `items.0.facilities.${facilityIndex}.ffrn`, facilityIndex)
                                  }
                                  ref={(el: HTMLInputElement | null) => {
                                    formFieldRefs.current[`items.0.facilities.${facilityIndex}.ffrn`] = el
                                  }}/>
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
                                <Input {...field} value={field.value ?? ''} 
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, `items.0.facilities.${facilityIndex}.gln`, facilityIndex)
                                  }
                                  ref={(el: HTMLInputElement | null) => {
                                    formFieldRefs.current[`items.0.facilities.${facilityIndex}.gln`] = el
                                  }}/>
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