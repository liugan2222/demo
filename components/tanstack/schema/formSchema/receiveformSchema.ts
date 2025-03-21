import { z } from "zod"
import { receivesonSchema } from '@/components/tanstack/schema/formSchema/receivesonSchema'
import { documentSchema } from '@/components/tanstack/schema/formSchema/documentSchema'


export const receiveformSchema = z.object({
  documentId: z.string().nullable().optional(),       // Receiving Number
  primaryOrderId: z.string().nullable().optional(),       // PO Number

  // TODO Receiving Date
  // orderDate: z.union([                              // Receiving Date
  //   z.string(),
  //   z.date(),
  //   z.null()
  // ]).optional().transform((val) => {
  //   if (val instanceof Date) return val.toISOString();
  //   if (typeof val === 'string') return val;
  //   return null;
  // }),

  partyIdFrom: z.string().nullable().optional(),          // Vendor
  partyNameFrom: z.string().nullable().optional(),         // Vendor

  destinationFacilityId: z.string().nullable().optional(),          // Warehouse
  destinationFacilityName: z.string().nullable().optional(),         // Warehouse

  statusId: z.string().nullable().optional(),            // Status

  receivedQuantity: z.number().nullable().optional(),   // Total Received Quantity
  receivedWeight: z.number().nullable().optional(),    // Total Received Weight
 
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

  receivedAt: z.union([
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),


  // Add items array
  receivingItems: z.array(receivesonSchema).optional().default([]),

  referenceDocuments: z.array(documentSchema).optional().default([]),
})

// Derive the TypeScript type
export type Receiveform = z.infer<typeof receiveformSchema>