import React from 'react'
import { Plus, X, Check, ChevronsUpDown} from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { useFieldArray } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface FacilitiesSectionProps {
  form: UseFormReturn<any>
  isEditing: boolean
  countries: Array<{ geoId: string; geoName: string }>
  states: Array<{ geoId: string; geoName: string }>
  onCountryChange: (value: string) => void
}

interface Country {
  geoId: string;
  geoName: string;
}

export function FacilitiesSection({
  form,
  isEditing,
  countries,
  states,
  onCountryChange,
}: FacilitiesSectionProps) {
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "facilities",
  })

  const findCountryName = (geoId: string | undefined, countries: Country[]): string => {
    if (!geoId) return 'Select a country';
    const country = countries.find(country => country.geoId === geoId);
    return country ? country.geoName : 'Select a country';
  }    

  // If in edit mode, show all fields expanded
  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Facilities</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                facilityName: "",
                ffrn: "",
                gln: "",
                businessContacts: [
                  {
                    telecomCountryCode: "",
                    phoneNumber: "",
                    countryGeoId: "",
                    physicalLocationAddress: "",
                    city: "",
                    stateProvinceGeoId: "",
                    zipCode: "",
                  },
                ],
              })
            }
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add facility
          </Button>
        </div>

        {fields.map((field, facilityIndex) => {
          const isCountryOpen = popoverStates[`facility-${facilityIndex}`]?.country ?? false;
          const isStateOpen = popoverStates[`facility-${facilityIndex}`]?.state ?? false;

          return (
            <div key={field.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Facility {facilityIndex + 1}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(facilityIndex)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name={`facilities.${facilityIndex}.facilityName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`facilities.${facilityIndex}.businessContacts.0.telecomCountryCode`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                          <FormControl>
                            <Input {...field} value={field.value || ""}/>
                          </FormControl>
                        </div>
                        <div className="col-span-3">
                          <FormField
                            control={form.control}
                            name={`facilities.${facilityIndex}.businessContacts.0.phoneNumber`}
                            render={({ field }) => (
                              <FormControl>
                                <Input {...field} value={field.value || ""}/>
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
                  name={`facilities.${facilityIndex}.businessContacts.0.countryGeoId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country<span className="text-red-500">*</span></FormLabel>
                      <div className="relative">
                        <Popover 
                          open={isCountryOpen}
                          onOpenChange={(value) => toggleCountryPopover(facilityIndex, value)}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                              >
                                {findCountryName(field.value, countries)}
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
                                        onCountryChange(country.geoId)
                                        toggleCountryPopover(facilityIndex, false)
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
                  )}
                />

                <FormField
                  control={form.control}
                  name={`facilities.${facilityIndex}.businessContacts.0.physicalLocationAddress`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`facilities.${facilityIndex}.businessContacts.0.city`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`facilities.${facilityIndex}.businessContacts.0.stateProvinceGeoId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Popover 
                              open={isStateOpen}
                              onOpenChange={(value) => toggleStatePopover(facilityIndex, value)}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ?? "Select a state"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search state/province..." />
                                  <CommandList>
                                    <CommandEmpty>No state/province found.</CommandEmpty>
                                    <CommandGroup>
                                      {states?.map((state, stateIndex) => (
                                        <CommandItem
                                          value={state.geoId}
                                          key={`${state.geoId}-${stateIndex}`}
                                          onSelect={() => {
                                            field.onChange(state.geoId)
                                            toggleStatePopover(facilityIndex, false)
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`facilities.${facilityIndex}.businessContacts.0.zipCode`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Postal code<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field}  value={field.value || ""}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`facilities.${facilityIndex}.ffrn`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FFRN</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`facilities.${facilityIndex}.gln`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GLN</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    )
  }

  // Read-only mode with accordion
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Facilities</h3>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {fields.map((field: any, facilityIndex) => (
          <AccordionItem key={field.id} value={`facility-${facilityIndex}`} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-col items-start">
                <span className="font-medium">{field.facilityName}</span>
                <span className="text-sm text-muted-foreground">
                  {field.businessContacts[0]?.physicalLocationAddress}, {field.businessContacts[0]?.city}{" "}
                  {field.businessContacts[0]?.state},{field.businessContacts[0]?.country},{" "}
                  {field.businessContacts[0]?.zipCode}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              <div className="grid grid-cols-[auto,1fr] gap-x-2">
                <span className="text-muted-foreground text-right pr-2">Phone:</span>
                <span>{field.businessContacts[0]?.telecomCountryCode} {field.businessContacts[0]?.phoneNumber}</span>
                <span className="text-muted-foreground text-right pr-2">FFRN:</span>
                <span>{field.ffrn}</span>
                <span className="text-muted-foreground text-right pr-2">GLN:</span>
                <span>{field.gln}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}