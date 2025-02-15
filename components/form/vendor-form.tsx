import React, {useEffect, useState, useCallback } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import { TextField } from './components/field/text-field'
import { FacilitiesSection } from "./components/facilities-section"

import { vendorformSchema, Vendorform } from '@/components/tanstack/schema/formSchema/vendorformSchema'

import { useCountries, useCurrencies } from "@/hooks/use-cached-data"
import { getStatesAndProvinces, getVendorById, updateVendor } from '@/lib/api';


interface VendorFormProps {
  selectedItem: Vendorform 
  onSave: (formData: Vendorform) => void 
  onCancel: () => void
  isEditing: boolean
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

export function VendorForm({ selectedItem, onSave, onCancel, isEditing }: VendorFormProps) {

  const { data: countries = [] } = useCountries(true)
  const { data: currencies = [] } = useCurrencies(true)
  const [states, setStates] = useState<Country[]>([])
  const [contactstates, setContactstates] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<Vendorform>({
    resolver: zodResolver(vendorformSchema),
    defaultValues: {
      ...selectedItem,
      businessContacts: selectedItem.businessContacts || [{}], // Initialize with empty object if undefined
      facilities: selectedItem.facilities || [],
    },
  })

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

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors)
  }

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
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col h-full">
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">
            <TextField form={form} name="supplierShortName" label="Vendor" required isEditing={isEditing} />
            <TextField form={form} name="supplierName" label="Full Name" required isEditing={isEditing} />
            <TextField form={form} name="internalId" label="Vendor Number" isEditing={isEditing} />
            <TextField form={form} name="telephone" label="Tel" required isEditing={isEditing} />
            <TextField form={form} name="email" label="Email" isEditing={isEditing} />
            <TextField form={form} name="gs1CompanyPrefix" label="GCP" isEditing={isEditing} />
            <TextField form={form} name="gln" label="GLN" isEditing={isEditing} />

            <FormField
              control={form.control}
              name='preferredCurrencyUomId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">
                    Currency
                  </FormLabel>
                  <FormControl>
                    {isEditing ? (
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
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {findCurrencyAbbreviation(field.value?.toString() ?? '', currencies)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TextField form={form} name="taxId" label="Tax ID / VAT Number" isEditing={isEditing} />
            <TextField form={form} name="supplierTypeEnumId" label="Type" isEditing={isEditing} />
            <TextField form={form} name="bankAccountInformation" label="Bank Account Information" isEditing={isEditing} />
            <TextField form={form} name="certificationCodes" label="Certification Codes" isEditing={isEditing} />
            <TextField form={form} name="supplierProductTypeDescription" label="Relationship" isEditing={isEditing} />
            <TextField form={form} name="tpaNumber" label="Trade Partner Agreement Number" isEditing={isEditing} />
      
            <FormField
              control={form.control}
              name="businessContacts.0.businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Contact Name</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.businessName')}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Contact Phone</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.phoneNumber')}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.countryGeoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Country</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleContactCountryChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
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
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {findCountryName(getFormValue('businessContacts.0.countryGeoId'), countries)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.physicalLocationAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Address</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.physicalLocationAddress')}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">City</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.city')}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.stateProvinceGeoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">State/Province</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state/province" />
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
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {findCountryName(getFormValue('businessContacts.0.stateProvinceGeoId'), contactstates)}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />   

            <FormField
              control={form.control}
              name="businessContacts.0.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Postal Code</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.zipCode')}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.contactRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Contact Role</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.contactRole')}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessContacts.0.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-600 text-sm font-normal  leading-tight">Contact Email</FormLabel>
                  <FormControl>
                    {isEditing ? (
                      <Input
                        {...field}
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    ) : (
                      <div className="text-[#121619] text-sm font-normal leading-tight">
                        {getFormValue('businessContacts.0.email')}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />  

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
        
        {isEditing && (
          <div className="flex justify-end space-x-2 p-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        )}
      </form>
    </Form>
  )
}
