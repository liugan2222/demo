import { z } from "zod"

// Extended location schema with number and date fields
export const locationpationSchema = z.object({
  facilityId: z.string().nullable().optional(),  // facilityId
  locationSeqId: z.string().nullable().optional(),  // id
  location: z.string().nullable().optional(),
  locationNumber: z.string().nullable().optional(),
  status: z.string().nullable().optional(),       // active
  warehouse: z.string().nullable().optional(),

  // gln: z.string().nullable().optional(),
  // status: z.string().nullable().optional(),
  // warehouseZone: z.string().nullable().optional(),
  // description: z.string().nullable().optional(),
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
export type Locationpation = z.infer<typeof locationpationSchema>