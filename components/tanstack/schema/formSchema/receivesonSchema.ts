import { z } from "zod"

export const receivesonSchema = z.object({
  receiptId: z.string().nullable().optional(),
  productId: z.string().min(1, "Item is required"),    
  productName: z.string().nullable().optional(),    // Item
  gtin: z.string().nullable().optional(),   // Item GTIN
  smallImageUrl: z.string().nullable().optional(),  // Item Image
  internalId: z.string().nullable().optional(),   // Item Number

  lotId: z.string().nullable().optional(),    // Batch/Lot Number
  quantityUomId: z.string().nullable().optional(),    // Weight Units
  caseUomId: z.string().nullable().optional(),    // Quantity Units
  casesAccepted: z.number().nullable().optional(),   // Received Quantity
  quantityAccepted: z.number().nullable().optional(),    // Received Weight
  quantityIncluded: z.number().nullable().optional(), 
  
  qaInspectionStatusId: z.string().nullable().optional(),    // Item Status (includes QA status)
  inspectedBy: z.string().nullable().optional(),      // QA
  comments: z.string().nullable().optional(),         // Notes


  locationSeqId: z.string().nullable().optional(),  //Location
  locationName: z.string().nullable().optional(),
})

export type Receiveson = z.infer<typeof receivesonSchema>