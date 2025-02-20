import { z } from "zod"

// Extended vendor schema with number and date fields
export const vendorpationSchema = z.object({
  id: z.string().nullable().optional(),
  supplierId: z.string().nullable().optional(),   // id
  vendor: z.string().nullable().optional(),   // supplierShortName
  address: z.string().nullable().optional(),
  tel: z.string().nullable().optional(),    // telephone
  email: z.string().nullable().optional(),
  gcp: z.string().nullable().optional(),      // gs1CompanyPrefix
  gln: z.string().nullable().optional(),
  vendorNumber: z.string().nullable().optional(),   // internalId
  status: z.string().nullable().optional(),       // active
  preferredCurrencyUomId: z.string().nullable().optional(),   // Currency
  // taxId: z.string().nullable().optional(),      // Tax ID / VAT Number
  // supplierTypeEnumId: z.string().nullable().optional(),   // Type
  // bankAccountInformation: z.string().nullable().optional(),   // Bank Account Information
  // certificationCodes: z.string().nullable().optional(),     // Certification Codes
  // supplierProductTypeDescription: z.string().nullable().optional(),     // Relationship
  // tpaNumber: z.string().nullable().optional(),    // Trade Partner Agreement Number
  // webSite: z.string().nullable().optional(),    // Website
  // contactName: z.string().nullable().optional(),
  // contactRole: z.string().nullable().optional(),
  // contactEmail: z.string().nullable().optional(),
  // contactPhone: z.string().nullable().optional(),
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

})

// Derive the TypeScript type
export type Vendorpation = z.infer<typeof vendorpationSchema>