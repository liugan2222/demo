import { z } from "zod"

import { glnRegex } from "../regexPatterns";

// Extended location schema with number and date fields
export const locationformSchema = z.object({
  facilityId: z.string().min(1, "Warehouse is required"),  // facilityId
  locationSeqId: z.string().nullable().optional(),  // id
  locationName: z.string().min(1, "Location is required"),   // location
  gln: z.string().nullable().optional().refine(
    (value) => !value || glnRegex.test(value),
    { message: "Invalid GLN format" }
  ), 
  locationCode: z.string().nullable().optional(),   // locationNumber
  active: z.string().nullable().optional(),
  facilityName: z.string().nullable().optional(),      // Warehouse 
  areaId: z.string().nullable().optional(),     // warehouseZone
  description: z.string().nullable().optional(),
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
export type Locationform = z.infer<typeof locationformSchema>