"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { Plus, Check, ChevronsUpDown, X } from "lucide-react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Dialog,
  DialogContent,
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { getStatesAndProvinces, addVendor, getSupplierType } from '@/lib/api';
import { useAppContext } from "@/contexts/AppContext"

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/common/info-alert-dialog"

// Import the vendorSchema
import { vendorformSchema } from '@/components/tanstack/schema/formSchema/vendorformSchema'
import { FacilitiesSection } from "./components/facilities-section"


// Define the Country type
interface Country {
  geoId: string;
  geoName: string;
}

// Define the Supplier type
interface SupplierType {
  enumId: string;
  description: string;
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
  internalId: '',
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
  businessContacts: [
    {
      businessName: null,
      contactRole: null,
      email: null,
      phoneNumber: null,
      countryGeoId: null,
      country: null,
      stateProvinceGeoId: null,
      state: null,
      city: null,
      physicalLocationAddress: null,
      zipCode: null,
    }
  ],
});

const createEmptyFacility = () => ({
  facilityId: null,
  ownerPartyId: null,
  facilityName: "",
  gln: null,
  ffrn: null,
  businessContacts: [
    {
      businessName: "",
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

const multipleVendorsSchema = z.object({
  items: z.array(vendorformSchema).min(1, "At least one vendor is required"),
})

type MultipleVendorsSchema = z.infer<typeof multipleVendorsSchema>

export function AddVendorDialog({ onAdded: onAdded }: AddDialogProps) {
  const [open, setOpen] = useState(false)
  const [states, setStates] = useState<Country[]>([])
  const [contactstates, setContactstates] = useState<Country[]>([])
  const [supperlierType, setSupperlierType] = useState<SupplierType[]>([])

  const [isCurrencyPopoverOpen, setIsCurrencyPopoverOpen] = useState(false)
  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = useState(false)
  const [isStatePopoverOpen, setIsStatePopoverOpen] = useState(false)

  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  // Use SWR hooks for data fetching
  const { countries = [] } = useAppContext()
  const { currencies = [] } = useAppContext()

  const fetchTypes = useCallback(async () => {
    try {
      const vendorTypeList = await getSupplierType('SUPPLIER_TYPE_ENUM')
      setSupperlierType(vendorTypeList)
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }, [])  

  useEffect(() => {
    if (open) {
      fetchTypes();
    }
  }, [open, fetchTypes]); 
 
  const form = useForm<MultipleVendorsSchema>({
    resolver: zodResolver(multipleVendorsSchema),
    defaultValues: {
      items: [createEmptyVendor()],
    },
    mode: "onChange",
  })

  // Facility Handle country change and fetch states/provinces
  const handleCountryChange = useCallback(async (countryId: string) => {
    try {
      const statesData = await getStatesAndProvinces(countryId);
      setStates(statesData);
    } catch (error) {
      console.error('Error fetching states/provinces:', error);
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

  // Helper function to find the geoName for a given geoId
  const findCountryName = (geoId: string | undefined, countries: Country[]): string => {
    if (!geoId) return 'Select a country';
    const country = countries.find(country => country.geoId === geoId);
    return country ? country.geoName : 'Select a country';
  }


  const handleClose = useCallback(() => {
    // Check if form is dirty (has been modified)
    if (form.formState.isDirty) {
      setShowDiscardDialog(true)
    } else {
      // If form is not dirty, close directly
      closeForm()
    }
  }, [form.formState.isDirty])

  const closeForm = useCallback(() => {
    setOpen(false);
    form.reset({
      items: [createEmptyVendor()]
    });
  }, [form]);

  const onSubmit = useCallback(async (data: MultipleVendorsSchema) => {
    try {
      await addVendor(data)
      setOpen(false)
      form.reset({
        items: [createEmptyVendor()]
      });
      onAdded()
    } catch (error) {
      console.error('Error adding vendor:', error)
      // Handle error (e.g., show error message to user)
    }
  }, [form, onAdded]);

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
            Add vendor
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add vendor</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid grid-cols-2 gap-4 p-4">
            
                  <FormField
                    control={form.control}
                    name={`items.0.supplierShortName`}
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
                    name={`items.0.supplierName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`items.0.internalId`}
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
                    name={`items.0.telephone`}
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
                    name={`items.0.email`}
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
                    name={`items.0.gs1CompanyPrefix`}
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
                    name={`items.0.gln`}
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
                    name={`items.0.preferredCurrencyUomId`}
                    render={({ field }) => {
                      // 添加状态控制

                      return (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <div className="relative">
                            <Popover 
                              open={isCurrencyPopoverOpen} 
                              onOpenChange={setIsCurrencyPopoverOpen} // 控制弹出状态
                            >
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                                  >
                                    {field.value
                                      ? currencies?.find((currency) => currency.uomId === field.value)?.abbreviation
                                      : "Select currency"}
                                    {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
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
                                            setIsCurrencyPopoverOpen(false) // 选择后关闭下拉
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
                                    setIsCurrencyPopoverOpen(false)
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
                    name={`items.0.taxId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID / VAT number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.0.supplierTypeEnumId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.0.bankAccountInformation`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank account information</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.0.certificationCodes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certification codes</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.0.supplierProductTypeDescription`}
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
                    name={`items.0.tpaNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trade partner agreement number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.0.webSite`}
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
                    name={`items.0.businessContacts.0.businessName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.0.businessContacts.0.phoneNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.0.businessContacts.0.countryGeoId`}
                    render={({ field }) => {
                      // 添加状态控制

                      return (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
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
                                      >
                                        {/* {field.value ?? "Select a country"} */}
                                        {findCountryName(field.value??'', countries) ?? "Select a country"}
                                        {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
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
                                                handleContactCountryChange(country.geoId)
                                                setIsCountryPopoverOpen(false) // 选择后关闭下拉
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
                    name={`items.0.businessContacts.0.physicalLocationAddress`}
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
                    name={`items.0.businessContacts.0.city`}
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
                    name={`items.0.businessContacts.0.stateProvinceGeoId`}
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
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
                                  >
                                    {field.value ?? "Select a state"}
                                    {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
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
                    name={`items.0.businessContacts.0.zipCode`}
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
                    name={`items.0.businessContacts.0.contactRole`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact role</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name={`items.0.businessContacts.0.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact email</FormLabel>
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
                    form={form} 
                    states={states} 
                    countries={countries} 
                    handleCountryChange={handleCountryChange}
                  />
                </div>
              
              </ScrollArea>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Add..." : "Add"}
                  </Button>
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