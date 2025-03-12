import { z } from "zod"

// Extended role schema with number and date fields
export const roleformSchema = z.object({
  id: z.string().nullable().optional(),   
  groupName: z.string().min(1, "Role is required"),  // Role
  description: z.string().nullable().optional(),   // Description
  permissions: z.array(z.string()).min(1, "Permissions is required"),   // Permissions
  // permissions: z.array(z.string()).nullable().optional(),
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
export type Roleform = z.infer<typeof roleformSchema>