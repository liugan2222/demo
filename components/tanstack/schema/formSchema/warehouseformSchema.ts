import { z } from "zod"
import { businessContactSchema } from './businessContactSchema'
import { glnRegex } from "../regexPatterns";

export const warehouseformSchema = z.object({
  ownerPartyId: z.string().nullable().optional(),
  facilityId: z.string().nullable().optional(), // id
  facilityName: z.string().min(1, "Warehouse name is required"),  // Warehouse
  // address: z.string().nullable().optional(),
  gln: z.string().nullable().optional().refine(
    (value) => !value || glnRegex.test(value),
    { message: "Invalid GLN format" }
  ),     // GLN
  internalId: z.string().nullable().optional(),    // internalId   Warehouse Number
  facilitySize: z.number().nullable().optional(), // capacity Capacity
  active: z.string().nullable().optional(),

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
})

// Derive the TypeScript type
export type Warehouseform = z.infer<typeof warehouseformSchema>