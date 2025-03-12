import { z } from "zod"

// Extended user schema with number and date fields
export const userpationSchema = z.object({
  id: z.string().nullable().optional(),   
  firstName: z.string().nullable().optional(),  // First Name
  lastName: z.string().nullable().optional(),   // Last Name
  email: z.string().nullable().optional(),   // Email
  status: z.string().nullable().optional(),       // Status
  userNumber: z.string().nullable().optional(),    // User Number
  roles: z.string().nullable().optional(),    // Roles

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
export type Userpation = z.infer<typeof userpationSchema>