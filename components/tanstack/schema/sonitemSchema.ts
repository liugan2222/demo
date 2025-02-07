import { z } from "zod"

export const sonitemSchema = z.object({
  itemImage: z.string().nullable().optional(),
  id: z.string().nullable().optional(),
  item: z.string().min(1, "Item is required"), 
  gtin: z.string().nullable().optional(),
  itemNumber: z.string().nullable().optional(),
  grossWeightPerPackage: z.number().nullable().optional(),
  netWeightPerPackage: z.number().nullable().optional(),
  weightUnits: z.string().nullable().optional(),
  packagingType: z.string().nullable().optional(),
  quantity: z.number().min(0, "Quantity must be positive"), // Quantity
  weight: z.number().min(0, "Weight must be positive"),     // Weight
  description: z.string().nullable().optional(),
})

export type Sonitem = z.infer<typeof sonitemSchema>