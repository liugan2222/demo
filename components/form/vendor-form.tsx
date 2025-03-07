import React, {useEffect, useState, useCallback } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { X, Edit2 } from 'lucide-react'

import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { TextField } from './components/field/text-field'
import { FacilitiesSection } from "./components/facilities-section"
import "@/app/globals.css";

import { vendorformSchema, Vendorform } from '@/components/tanstack/schema/formSchema/vendorformSchema'

import { useAppContext } from "@/contexts/AppContext"
import { getStatesAndProvinces, getVendorById, updateVendor, getSupplierType } from '@/lib/api';


interface VendorFormProps {
  selectedItem: Vendorform 
  onSave: (formData: Vendorform) => void 
  onCancel: () => void
  isEditing: boolean
  onToggleEdit: () => void 
}

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

// Define the Supplier type
interface SupplierType {
  enumId: string;
  description: string;
}

export function VendorForm({ selectedItem, onSave, onCancel, isEditing, onToggleEdit }: VendorFormProps) {

  const { countries = [], currencies = [], userPermissions, userInfo } = useAppContext()
  const isUpdate = (userInfo?.username === "admin") || (userPermissions.includes('Vendors_Update'))

  const [states, setStates] = useState<Country[]>([])
  const [contactstates, setContactstates] = useState<Country[]>([])
  const [supperlierType, setSupperlierType] = useState<SupplierType[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<Vendorform>({
    resolver: zodResolver(vendorformSchema),
    defaultValues: {
      ...selectedItem,
      businessContacts: selectedItem.businessContacts || [{}], // Initialize with empty object if undefined
      facilities: selectedItem.facilities || [],
    },
  })

  const fetchTypes = useCallback(async () => {
    try {
      const vendorTypeList = await getSupplierType('SUPPLIER_TYPE_ENUM')
      setSupperlierType(vendorTypeList)
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }, [])  

useEffect(() => {
  const fetchVendorData = async () => {
    if (selectedItem.supplierId) {
      try {
        setLoading(true)
        const vendorData = await getVendorById(selectedItem.supplierId, true)
        // Ensure businessContacts exists with at least one empty object
        const formattedData = {
          ...vendorData,
          businessContacts: vendorData.businessContacts?.length  ? vendorData.businessContacts  : [{}],
          facilities: vendorData.facilities || [],
        }
        form.reset(formattedData)

        // If there's a country selected, fetch its states
        if (formattedData.businessContacts?.[0]?.countryGeoId) {
          await handleContactCountryChange(formattedData.businessContacts[0].countryGeoId)
        }

        // Fetch states for each facility
        if (formattedData.facilities?.length) {
          const facilityStates = await Promise.all(
            formattedData.facilities.map((facility) =>
              getStatesAndProvinces(facility.businessContacts[0]?.countryGeoId || ""),
            ),
          )
          setStates(facilityStates.flat())
        }
        fetchTypes()
      } catch (error) {
        console.error("Error fetching vendor data:", error)
      } finally {
        setLoading(false)
      }
    }
  }
  fetchVendorData()
}, [selectedItem.supplierId, form])


  const onSubmit = async (data: Vendorform) => {
    try {
      console.log('Form submitted with data:', data)
      if (data.supplierId) {
        await updateVendor(data.supplierId, data)
      }
      // Call the onSave callback with the form data
      await onSave(data)
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  // const onError = (errors: any) => {
  //   console.error('Form validation errors:', errors)
  // }

   // Helper function to find the abbreviation for a given uomId
   const findCurrencyAbbreviation = (uomId: string | undefined, currencies: Currency[]): string => {
    if (!uomId) return '';
    const currency = currencies.find(currency => currency.uomId === uomId);
    return currency ? currency.abbreviation : '';
  }

   // Helper function to find the geoName for a given geoId
   const findCountryName = (geoId: string | undefined, countries: Country[]): string => {
    if (!geoId) return '';
    const country = countries.find(country => country.geoId === geoId);
    return country ? country.geoName : '';
  }

  // Helper function to find the type for a given enumId
  const findSupplierType = (enumId: string | undefined, types: SupplierType[]): string => {
    if (!enumId) return '';
    const typeItem = types.find(typeItem => typeItem.enumId === enumId);
    return typeItem ? typeItem.description : '';
  }  

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

    const handleCountryChange = useCallback(async (countryId: string) => {
      try {
        const statesData = await getStatesAndProvinces(countryId)
        setStates(statesData)
      } catch (error) {
        console.error("Error fetching states:", error)
      }
    }, [])

    const getFormValue = (path: string) => {
      return form.getValues(path as any) ?? ''
    }

    if (loading) {
      return <div>Loading...</div>
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          {!isEditing && isUpdate && (
            <Button variant="outline" size="default" onClick={onToggleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex justify-end space-x-2 p-4">
            <Button type="button" size="default" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
          )}
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">
            <TextField form={form} name="supplierShortName" label="Vendor" required isEditing={isEditing} />
            <TextField form={form} name="supplierName" label="Full Name" required isEditing={isEditing} />
            <TextField form={form} name="internalId" label="Vendor Number" isEditing={isEditing} />
            <TextField form={form} name="telephone" label="Tel" required isEditing={isEditing} />
            <TextField form={form} name="email" label="Email" isEditing={isEditing} />
            <TextField form={form} name="gs1CompanyPrefix" label="GCP" isEditing={isEditing} />
            <TextField form={form} name="gln" label="GLN" isEditing={isEditing} />

            {isEditing || form.getValues('preferredCurrencyUomId') ? (
              <FormField
                control={form.control}
                name='preferredCurrencyUomId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">
                      Currency
                    </FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                              >
                                {field.value
                                  ? currencies?.find((currency) => currency.uomId === field.value)?.abbreviation
                                  : "Select currency"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search currency..." />
                              <CommandList>
                                <CommandEmpty>No currency found.</CommandEmpty>
                                <CommandGroup>
                                  {currencies?.map((currency) => (
                                    <CommandItem
                                      value={currency.abbreviation}
                                      key={currency.uomId}
                                      onSelect={() => {
                                        field.onChange(currency.uomId)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === currency.uomId ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {currency.abbreviation}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        // <Select
                        //   value={field.value ?? undefined}
                        //   onValueChange={field.onChange}
                        // >
                        //   <FormControl>
                        //     <SelectTrigger>
                        //       <SelectValue placeholder="Select a currency" />
                        //     </SelectTrigger>
                        //   </FormControl>
                        //   <SelectContent>
                        //     {currencies?.map((currency: Currency) => (
                        //       <SelectItem key={currency.uomId} value={currency.uomId}>
                        //         {currency.abbreviation}
                        //       </SelectItem>
                        //     ))}
                        //   </SelectContent>
                        // </Select>
                      ) : (
                        <div className="form-control font-common">
                          {findCurrencyAbbreviation(field.value?.toString() ?? '', currencies)}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}


            <TextField form={form} name="taxId" label="Tax ID / VAT Number" isEditing={isEditing} />
            
            {isEditing || form.getValues('supplierTypeEnumId') ? (
              <FormField
                control={form.control}
                name='supplierTypeEnumId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">
                      Type
                    </FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {supperlierType?.map((s_type: SupplierType) => (
                              <SelectItem key={s_type.enumId} value={s_type.enumId}>
                                {s_type.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="form-control font-common">
                          {findSupplierType(field.value?.toString() ?? '', supperlierType)}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <TextField form={form} name="bankAccountInformation" label="Bank account information" isEditing={isEditing} />
            <TextField form={form} name="certificationCodes" label="Certification codes" isEditing={isEditing} />
            <TextField form={form} name="supplierProductTypeDescription" label="Relationship" isEditing={isEditing} />
            <TextField form={form} name="tpaNumber" label="Trade partner agreement number" isEditing={isEditing} />
      
            {isEditing || form.getValues('businessContacts.0.businessName') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Contact name</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.businessName')}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.phoneNumber') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Contact phone</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.phoneNumber')}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.countryGeoId') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.countryGeoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Country</FormLabel>
                    <FormControl>
                      {isEditing ? (
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
                        ) : (
                          <div className="form-control font-common">
                            {findCountryName(getFormValue('businessContacts.0.countryGeoId'), countries)}
                          </div>
                        )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              // <FormField
              //   control={form.control}
              //   name="businessContacts.0.countryGeoId"
              //   render={({ field }) => (
              //     <FormItem>
              //       <FormLabel className="form-label font-common">Country</FormLabel>
              //       <FormControl>
              //         {isEditing ? (
              //           <Select
              //             value={field.value ?? undefined}
              //             onValueChange={(value) => {
              //               field.onChange(value);
              //               handleContactCountryChange(value);
              //             }}
              //           >
              //             <FormControl>
              //               <SelectTrigger>
              //                 <SelectValue placeholder="Select a country" />
              //               </SelectTrigger>
              //             </FormControl>
              //             <SelectContent>
              //               {countries?.map((country: Country) => (
              //                 <SelectItem key={country.geoId} value={country.geoId}>
              //                   {country.geoName}
              //                 </SelectItem>
              //               ))}
              //             </SelectContent>
              //           </Select>
              //         ) : (
              //           <div className="form-control font-common">
              //             {findCountryName(getFormValue('businessContacts.0.countryGeoId'), countries)}
              //           </div>
              //         )}
              //       </FormControl>
              //       <FormMessage />
              //     </FormItem>
              //   )}
              // />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.physicalLocationAddress') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.physicalLocationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Address</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.physicalLocationAddress')}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.city') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">City</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.city')}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.stateProvinceGeoId') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.stateProvinceGeoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        {isEditing ? (
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
                          ) : (
                            <div className="form-control font-common">
                              {findCountryName(getFormValue('businessContacts.0.stateProvinceGeoId'), contactstates)}
                            </div>
                          )}
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              // <FormField
              //   control={form.control}
              //   name="businessContacts.0.stateProvinceGeoId"
              //   render={({ field }) => (
              //     <FormItem>
              //       <FormLabel className="form-label font-common">State/Province</FormLabel>
              //       <FormControl>
              //         {isEditing ? (
              //           <Select
              //             value={field.value ?? undefined}
              //             onValueChange={(value) => {
              //               field.onChange(value)
              //             }}
              //           >
              //             <FormControl>
              //               <SelectTrigger>
              //                 <SelectValue placeholder="Select a state/province" />
              //               </SelectTrigger>
              //             </FormControl>
              //             <SelectContent>
              //               {contactstates?.map((state: Country) => (
              //                 <SelectItem key={state.geoId} value={state.geoId}>
              //                   {state.geoName}
              //                 </SelectItem>
              //               ))}
              //             </SelectContent>
              //           </Select>
              //         ) : (
              //           <div className="form-control font-common">
              //             {findCountryName(getFormValue('businessContacts.0.stateProvinceGeoId'), contactstates)}
              //           </div>
              //         )}
              //       </FormControl>
              //       <FormMessage />
              //     </FormItem>
              //   )}
              // />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.zipCode') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Postal code</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.zipCode')}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.contactRole') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.contactRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Contact role</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.contactRole')}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {isEditing || form.getValues('businessContacts.0.email') ? (
              <FormField
                control={form.control}
                name="businessContacts.0.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label font-common">Contact email</FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          {...field}
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <div className="form-control font-common">
                          {getFormValue('businessContacts.0.email')}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />  
            ) : null}

            {/* Facilities Section */}
            <FacilitiesSection
              form={form}
              isEditing={isEditing}
              countries={countries}
              states={states}
              onCountryChange={handleCountryChange}
            />
          </div>
        </ScrollArea> 
      </form>
    </Form>
  )
}
