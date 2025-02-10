import { z } from "zod"

// Define the status and priority options
// export const taskPriorityEnum = z.enum(["low", "medium", "high"])

// Extended item schema with number and date fields
export const itempationSchema = z.object({
  productId: z.string().nullable().optional(),
  smallImageUrl: z.string().nullable().optional(),  // Item Image
  item: z.string().nullable().optional(),
  gtin: z.string().nullable().optional(),
  vendor: z.string().nullable().optional(),
  itemNumber: z.string().nullable().optional(),
  status: z.string().nullable().optional(),       // active

  // packagingType: z.string().min(1, "Packaging type is required"),
  // quantityPerPackage: z.number().nullable().optional(),
  // weightUnits: z.string().min(1, "Weight units is required"),
  // grossWeightPerPackage: z.number().min(0, "Gross weight must be positive"),
  // netWeightPerPackage: z.number().min(0, "Net weight must be positive"),
  // brand: z.string().nullable().optional(),
  // produceVariety: z.string().nullable().optional(),
  // hsCode: z.string().nullable().optional(),
  // organicCertification: z.string().nullable().optional(),
  // description: z.string().nullable().optional(),
  // dimensions: z.string().nullable().optional(),
  // materialComposition: z.string().nullable().optional(),
  // countryofOrigin: z.string().nullable().optional(),
  // certificationCode: z.string().nullable().optional(),
  // shelfLife: z.number().nullable().optional(),
  // handlingInstructions: z.string().nullable().optional(),
  // storageConditions: z.string().nullable().optional(),
  // status: z.string().nullable().optional(),

  createdBy: z.string().nullable().optional(),
  // createdAt: z.date().nullable().optional(),
  // createdAt: z.string().nullable().optional().transform((str) => str ? new Date(str) : null),
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
  // modifiedAt: z.string().nullable().optional().transform((str) => str ? new Date(str) : null),
  modifiedAt: z.union([
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),


  itemImage: z.string().nullable().optional(),

  // New date fields
  // createdAt: z.string().transform((str) => new Date(str)),

//   priority: taskPriorityEnum,
  
  // New numerical fields
//   estimatedHours: z.number().min(0).nullable().optional(),
//   completionPercentage: z.number().min(0).max(100).nullable().optional(),

})

// Derive the TypeScript type
export type Itempation = z.infer<typeof itempationSchema>