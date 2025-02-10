import { z } from "zod"
import { receiveitemSchema } from '@/components/tanstack/schema/formSchema/receiveitemSchema'

export const sonitemSchema = z.object({
  orderItemSeqId: z.string().nullable().optional(),
  smallImageUrl: z.string().nullable().optional(),  // Item Image
  gtin: z.string().nullable().optional(),   // Item GTIN
  productId: z.string().min(1, "Item is required"),    
  productName: z.string().nullable().optional(),    // Item
  internalId: z.string().nullable().optional(),   // Item Number

  shippingWeight: z.number().nullable().optional(),   // Gross Weight Per Package
  productWeight: z.number().nullable().optional(),    // Net Weight Per Package
  description: z.string().nullable().optional(),    //Item Description
  quantityUomId: z.string().nullable().optional(),    // Weight Units
  caseUomId: z.string().nullable().optional(),    // Quantity Units

  quantity: z.number().nullable().optional(), // Quantity  
  amount: z.number().min(0, "Quantity must be positive"),      //    quantity/(quantityIncluded*piecesIncluded) 

  quantityIncluded: z.number().nullable().optional(), 

  fulfillmentStatusId: z.string().nullable().optional(),

  // Add receives array
  fulfillments: z.array(receiveitemSchema).optional().default([]),
})

export type Sonitem = z.infer<typeof sonitemSchema>