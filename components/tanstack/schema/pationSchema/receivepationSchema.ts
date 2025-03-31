import { z } from "zod"

export const receivepationSchema = z.object({
  id: z.string().nullable().optional(),
  documentId: z.string().nullable().optional(),
  receivingNumber: z.string().nullable().optional(),       // Receiving Number  documentId
  PO: z.string().nullable().optional(),       // PO Number    primaryOrderId
  // receivingDate: z.union([                              // Receiving Date    createdAt
  //   z.string(),
  //   z.date(),
  //   z.null()
  // ]).optional().transform((val) => {
  //   if (val instanceof Date) return val.toISOString();
  //   if (typeof val === 'string') return val;
  //   return null;
  // }),

  receivingDate: z.union([
    z.string().transform(val => {
      // 确保字符串格式为ISO
      const date = new Date(val);
      return isNaN(date.getTime()) ? val : date.toISOString();
    }),
    z.date().transform(val => val.toISOString()),
    z.null()
  ]).optional(),
  
  vendor: z.string().nullable().optional(),           // Vendor   partyNameFrom
  status: z.string().nullable().optional(),            // Status   statusId
  
})

// Derive the TypeScript type
export type Receivepation = z.infer<typeof receivepationSchema>