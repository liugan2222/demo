import { z } from "zod"

// Create a schema for business contact
export const businessContactSchema = z.object({
    businessName: z.string().nullable().optional(),   // Contact Name
    contactRole: z.string().nullable().optional(),    // Contact Role
    email: z.string().nullable().optional(),    // Contact Email
    phoneNumber: z.string().nullable().optional(),    // Contact Phone
    countryGeoId: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    stateProvinceGeoId: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    physicalLocationAddress: z.string().nullable().optional(),
    zipCode: z.string().nullable().optional()
  })
  
// businessContacts
export type BusinessContact = z.infer<typeof businessContactSchema>