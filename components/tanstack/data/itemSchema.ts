import { z } from "zod"

// Define the status and priority options
// export const taskPriorityEnum = z.enum(["low", "medium", "high"])

// Extended task schema with number and date fields
export const itemSchema = z.object({
  image: z.string(),
  id: z.string(),
  name: z.string(),
  gtin: z.string().optional(),
  weight: z.number().optional(),
  vendor: z.string().optional(),
  status: z.string().optional(),
  // New date fields
  createdAt: z.string().transform((str) => new Date(str)),


//   priority: taskPriorityEnum,
  
  // New numerical fields
//   estimatedHours: z.number().min(0).optional(),
//   completionPercentage: z.number().min(0).max(100).optional(),

})

// Derive the TypeScript type
export type Item = z.infer<typeof itemSchema>