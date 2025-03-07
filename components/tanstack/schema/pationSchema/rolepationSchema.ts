import { z } from "zod"

// Extended role schema with number and date fields
export const rolepationSchema = z.object({
  id: z.string().nullable().optional(),   
  role: z.string().nullable().optional(),  // Role
  description: z.string().nullable().optional(),   // Description
  permissions: z.string().nullable().optional(),   // Permissions
  status: z.string().nullable().optional(),       // Status

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
  modifiedAt: z.union([
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),
})

// Derive the TypeScript type
export type Rolepation = z.infer<typeof rolepationSchema>