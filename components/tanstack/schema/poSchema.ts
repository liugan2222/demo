import { z } from "zod"

import { sonitemSchema } from '@/components/tanstack/schema/sonitemSchema'

export const poSchema = z.object({
  id: z.string().nullable().optional(),             // ID
  poNumber: z.string().nullable().optional(),       // PO Number
  orderDate: z.union([                              // Order Date
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),
  orderStatus: z.string().nullable().optional(),            // Order Status
  vendorGcp: z.string().nullable().optional(),              // Vendor GCP
  vendor: z.string().min(1, "Vendor is required"),          // Vendor

  // itemImage: z.string().nullable().optional(),              // Item Image
  // itemGtin: z.string().nullable().optional(),               // Item GTIN
  // item: z.string().min(1, "Item is required"),              // Item
  // itemNumber: z.string().min(1, "Item number is required"), // Item Number
  // itemDescription: z.string().nullable().optional(),        // Item Description
  // grossWeightPerPackage: z.number().nullable().optional(),  // Gross Weight Per Package
  // netWeightPerPackage: z.number().nullable().optional(),    // Net Weight Per Package
  // weightUnits: z.string().nullable().optional(),            // Weight Units
  // quantityUnits: z.string().nullable().optional(),          // Quantity Units    packaging type
  // quantity: z.number().min(0, "Quantity must be positive"), // Quantity
  // weight: z.number().min(0, "Weight must be positive"),     // Weight

  totalQuantity: z.number().nullable().optional(),          // Total Quantity
  totalweight: z.number().nullable().optional(),            // Total weight

  receivingOrderId: z.string().nullable().optional(),       // Receiving Order ID
  receivedDate: z.union([                                   // Received Date
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),
  qaStatus: z.string().nullable().optional(),               // QA Status 
  orderNotes: z.string().nullable().optional(),             // Order Notes
  contactInformation: z.string().nullable().optional(),     // Contact Information

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

  // Add items array
  items: z.array(sonitemSchema).optional().default([]),
})

// Derive the TypeScript type
export type Po = z.infer<typeof poSchema>