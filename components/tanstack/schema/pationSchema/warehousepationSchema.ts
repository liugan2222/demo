import { z } from "zod"
import { businessContactSchema } from '../formSchema/businessContactSchema'

export const warehousepationSchema = z.object({
  id: z.string().nullable().optional(),
  facilityId: z.string().nullable().optional(), // id
  warehouse: z.string().nullable().optional(),  // warehouse
  address: z.string().nullable().optional(),
  warehouseNumber: z.string().nullable().optional(),    // internalId
  status: z.string().nullable().optional(),       // active
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
export type Warehousepation = z.infer<typeof warehousepationSchema>