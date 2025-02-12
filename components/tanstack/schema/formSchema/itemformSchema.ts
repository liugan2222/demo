import { z } from "zod"

// Define the status and priority options
// export const taskPriorityEnum = z.enum(["low", "medium", "high"])

// Extended item schema with number and date fields
export const itemformSchema = z.object({
  productId: z.string().nullable().optional(),
  productName: z.string().min(1, "Item name is required"),    // Item
  gtin: z.string().nullable().optional(),
  supplierId: z.string().min(1, "Vendor is required"),     // Vendor
  supplierName: z.string().nullable().optional(),  
  internalId: z.string().min(1, "Item number is required"), // Item number
  caseUomId: z.string().min(1, "Packaging type is required"), // Packaging Type
  quantityIncluded: z.number().gt(0, "Gross weight must be greater than 0"),   // Gross Weight Per Package
  quantityUomId: z.string().min(1, "Weight units is required"), // Weight Units
  individualsPerPackage: z.number().nullable().optional(),     // Quantity Per Package
  productWeight: z.number().nullable().optional(),   // Net Weight Per Package
  brandName: z.string().nullable().optional(), // Brand
  produceVariety: z.string().nullable().optional(), // Produce Variety
  hsCode: z.string().nullable().optional(), // HS Code
  organicCertifications: z.string().nullable().optional(),   // Organic Certification
  description: z.string().nullable().optional(),    // Description
  dimensionsDescription: z.string().nullable().optional(),    // Dimensions
  materialCompositionDescription: z.string().nullable().optional(),    // Material Composition
  countryOfOrigin: z.string().nullable().optional(),    // Country of Origin
  certificationCodes: z.string().nullable().optional(),    // Certification Code
  shelfLifeDescription: z.string().nullable().optional(),    // Shelf Life
  handlingInstructions: z.string().nullable().optional(),   // Handling Instructions
  storageConditions: z.string().nullable().optional(),      // Storage Conditions
  active: z.string().nullable().optional(),     // status
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


  smallImageUrl: z.string().nullable().optional(),      // Item Image

  // New date fields
  // createdAt: z.string().transform((str) => new Date(str)),

//   priority: taskPriorityEnum,
  
  // New numerical fields
//   estimatedHours: z.number().min(0).nullable().optional(),
//   completionPercentage: z.number().min(0).max(100).nullable().optional(),

})

// Derive the TypeScript type
export type Itemform = z.infer<typeof itemformSchema>