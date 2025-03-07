import { z } from "zod"
import { sonitemSchema } from '@/components/tanstack/schema/formSchema/sonitemSchema'

export const poformSchema = z.object({
  orderId: z.string().min(1, "PO Number is required"),       // PO Number
  orderDate: z.union([                              // Order Date
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),
  statusId: z.string().nullable().optional(),            // Order Status    orderStatus

  vendorGcp: z.string().nullable().optional(),              // Vendor GCP
  supplierId: z.string().min(1, "Vendor is required"),          // Vendor
  supplierName: z.string().nullable().optional(),         // Vendor

  totalQuantity: z.number().nullable().optional(),          // Total Quantity
  totalweight: z.number().nullable().optional(),            // Total weight


  memo: z.string().nullable().optional(),             // Order Notes  orderNotes
  contactDescription: z.string().nullable().optional(),     // Contact Information

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
  orderItems: z.array(sonitemSchema).optional().default([]),
})

// Derive the TypeScript type
export type Poform = z.infer<typeof poformSchema>