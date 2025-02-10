import { Plus, X } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { useFieldArray } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FacilitiesSectionProps {
  form: UseFormReturn<any>
  index: number
  isEditing: boolean
  countries: Array<{ geoId: string; geoName: string }>
  states: Array<{ geoId: string; geoName: string }>
  onCountryChange: (value: string) => void
}

export function FacilitiesSection({
  form,
  index,
  isEditing,
  countries,
  states,
  onCountryChange,
}: FacilitiesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `items.${index}.facilities`,
  })

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
                phoneNumber: "",
                countryGeoId: "",
                physicalLocationAddress: "",
                city: "",
                stateProvinceGeoId: "",
                zipCode: "",
                ffrn: "",
                gln: "",
              })
            }
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add facility
          </Button>
        </div>

        {fields.map((field, facilityIndex) => (
          <div key={field.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Facility {facilityIndex + 1}</h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(facilityIndex)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`items.${index}.facilities.${facilityIndex}.facilityName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.facilities.${facilityIndex}.phoneNumber`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone number<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.facilities.${facilityIndex}.countryGeoId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Country<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        onCountryChange(value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
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
                name={`items.${index}.facilities.${facilityIndex}.physicalLocationAddress`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Address<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.facilities.${facilityIndex}.city`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      City<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.facilities.${facilityIndex}.stateProvinceGeoId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      State/province<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state) => (
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
                name={`items.${index}.facilities.${facilityIndex}.zipCode`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Postal code<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>FFRN</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>GLN</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
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
                  {field.physicalLocationAddress}, {field.city}, {field.state},{field.country}, {field.zipCode}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              <div className="grid grid-cols-[auto,1fr] gap-x-2">
                <span className="text-muted-foreground">Phone:</span>
                <span>{field.phoneNumber}</span>
                <span className="text-muted-foreground">FFRN:</span>
                <span>{field.ffrn || "-"}</span>
                <span className="text-muted-foreground">GLN:</span>
                <span>{field.gln || "-"}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

