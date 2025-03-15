import { z } from "zod"

import { 
    // telephoneRegex, 
    emailRegex
    // , zipCodeRegex 
  } from "../regexPatterns";

// Create a schema for business contact
export const businessContactSchema = z.object({
    businessName: z.string().nullable().optional(),   // Contact Name
    contactRole: z.string().nullable().optional(),    // Contact Role
    email: z.string().nullable().optional().refine(
      (value) => !value || emailRegex.test(value),
      { message: "Invalid email format" }
    ),    // Contact Email
    telecomCountryCode: z.string().nullable().optional(),
    phoneNumber: z.string().nullable().optional()
    // .refine(
    //   (value) => !value || telephoneRegex.test(value),
    //   { message: "Invalid telephone format" }
    // )
    ,
    countryGeoId: z.string().min(1, "Country is required"),
    country: z.string().nullable().optional(),
    stateProvinceGeoId: z.string().min(1, "State is required"),
    state: z.string().nullable().optional(),
    city: z.string().min(1, "City is required"),
    physicalLocationAddress: z.string().min(1, "Address is required"),
    zipCode: z.string().min(1, "Postal code is required")
    // .regex(zipCodeRegex, "Invalid postal code format")
  })
  
// businessContacts
export type BusinessContact = z.infer<typeof businessContactSchema>