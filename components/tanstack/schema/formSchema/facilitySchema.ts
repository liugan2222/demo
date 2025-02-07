import { z } from "zod"

import { businessContactSchema } from './businessContactSchema'

export const facilitySchema = z.object({
    facilityId: z.string().nullable().optional(),   // Contact Name
    ownerPartyId: z.string().nullable().optional(),    // Contact Role
    facilityName: z.string().nullable().optional(),    // Name
    gln: z.string().nullable().optional(),        // GLN
    ffrn: z.string().nullable().optional(),       // FFRN

    // Add business contacts array
    businessContacts: z.array(businessContactSchema).optional().default([]),
  })
  
// Facility
export type Facility = z.infer<typeof facilitySchema>