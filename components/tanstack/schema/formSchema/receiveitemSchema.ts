import { z } from "zod"

export const receiveitemSchema = z.object({
  receiptId: z.string().nullable().optional(),       // Receiving Order ID    receivingOrderId
  shipmentId: z.string().nullable().optional(),       // Receiving Order ID    receivingOrderId
  receivedAt : z.union([                                   // Received Date    receivedDate
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),

  allocatedQuantity: z.number().nullable().optional(),  // Received Quantity 
  receivedNum: z.number().nullable().optional(),  // quantity/(quantityIncluded*piecesIncluded)
  shipmentQaInspectionStatusId: z.string().nullable().optional(),               // QA Status QA Status 
})

export type Receiveitem = z.infer<typeof receiveitemSchema>