import { z } from "zod"

import { facilitySchema } from './facilitySchema'
import { telephoneRegex, glnRegex, emailRegex, zipCodeRegex } from "../regexPatterns";

const businessContactSchema = z.object({
  businessName: z.string().nullable().optional(),   // Contact Name
  contactRole: z.string().nullable().optional(),    // Contact Role
  email: z.string().nullable().optional().refine(
    (value) => !value || emailRegex.test(value),
    { message: "Invalid email format" }
  ),    // Contact Email
  phoneNumber: z.string().nullable().optional().refine(
    (value) => !value || telephoneRegex.test(value),
    { message: "Invalid telephone format" }
  ),    // Contact Phone
  countryGeoId: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  stateProvinceGeoId: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  physicalLocationAddress: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional().refine(
    (value) => !value || zipCodeRegex.test(value),
    { message: "Invalid postal code format" }
  )
})

// Extended vendor schema with number and date fields
export const vendorformSchema = z.object({
  // id: z.string().nullable().optional(),
  supplierId: z.string().nullable().optional(),   // ID
  supplierShortName: z.string().min(1, "Vendor name is required"),     // Vendor
  supplierName: z.string().min(1, "Full name is required"),       // Full Name
  // TODO required 
  address: z.string().nullable().optional(),
  telephone: z.string().min(1, "Tel is required").regex(telephoneRegex, "Invalid telephone format"),    // Tel
  email: z.string().nullable().optional().refine(
    (value) => !value || emailRegex.test(value),
    { message: "Invalid email format" }
  ),             // Email
  gs1CompanyPrefix: z.string().nullable().optional(),      // GCP
  gln: z.string().nullable().optional().refine(
    (value) => !value || glnRegex.test(value),
    { message: "Invalid GLN format" }
  ),                 // gln
  internalId: z.string().nullable().optional(),   // vendorNumber
  active: z.string().nullable().optional(),     // status
  preferredCurrencyUomId: z.string().nullable().optional(),   // Currency
  taxId: z.string().nullable().optional(),      // Tax ID / VAT Number
  supplierTypeEnumId: z.string().nullable().optional(),   // Type
  bankAccountInformation: z.string().nullable().optional(),   // Bank Account Information
  certificationCodes: z.string().nullable().optional(),     // Certification Codes
  supplierProductTypeDescription: z.string().nullable().optional(),     // Relationship
  tpaNumber: z.string().nullable().optional(),    // Trade Partner Agreement Number
  webSite: z.string().nullable().optional(),    // Website
  createdBy: z.string().nullable().optional(),
  createdAt: z.union([
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),
  modifiedBy: z.string().nullable().optional(),
  modifiedAt: z.union([
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),
  // Add business contacts array
  businessContacts: z.array(businessContactSchema).optional().default([]),

  // Add facilities array
  facilities: z.array(facilitySchema).optional().default([]),

})

// Derive the TypeScript type
export type Vendorform = z.infer<typeof vendorformSchema>


 