import { z } from "zod"

import { businessContactSchema } from './businessContactSchema'
import { ffrnRegex, glnRegex } from "../regexPatterns";

export const facilitySchema = z.object({
    facilityId: z.string().nullable().optional(),   // Contact Name
    ownerPartyId: z.string().nullable().optional(),    // Contact Role
    facilityName: z.string().min(1, "Facility name is required"),    // Name
    gln: z.string().nullable().optional().refine(
      (value) => !value || glnRegex.test(value),
      { message: "Invalid GLN format" }
    ),         // GLN
    ffrn: z.string().nullable().optional().refine(
      (value) => !value || ffrnRegex.test(value),
      { message: "Invalid FFRN format" }
    ),       // FFRN

    // Add business contacts array
    businessContacts: z.array(businessContactSchema).optional().default([]),
  })
  
// Facility
export type Facility = z.infer<typeof facilitySchema>