import { z } from "zod"

export const documentSchema = z.object({
    documentId: z.string().nullable().optional(),   
    documentTypeId: z.string().nullable().optional(), 
    comments: z.string().nullable().optional(),
    documentLocation: z.string().nullable().optional(),
    documentText: z.string().nullable().optional(),
    contentType: z.string().nullable().optional(),
  })
  
// Document
export type Document = z.infer<typeof documentSchema>