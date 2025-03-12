import { z } from "zod"

import { 
  glnRegex, emailRegex
} from "../regexPatterns";

// Extended user schema with number and date fields
export const userformSchema = z.object({
  oneTimePassword: z.string().nullable().optional(),
  id: z.string().nullable().optional(),
  username: z.string().min(1, "Email is required").refine(
    (value) => !value || emailRegex.test(value),
    { message: "Invalid email format" }
  ),
  firstName: z.string().min(1, "First name is required"),  // First Name
  lastName: z.string().min(1, "Last name is required"),   // Last Name
  email: z.string().nullable().optional(),   // Email
  status: z.string().nullable().optional(),       // Status
  employeeNumber: z.string().nullable().optional(),    // User Number

  roles: z.string().array().min(1, "Roles is required"),    // Roles  
  rolseNms: z.string().array().nullable().optional(),    // Roles  
  groupIds: z.number().array().nullable().optional(),    // Roles 要传一个 number[]

  departmentId: z.string().nullable().optional(),    // Department
  // TODO departmentName
  directManagerName: z.string().nullable().optional(),    // Direct Manager
  telephoneNumber: z.string().nullable().optional(),    // Tel
  mobileNumber: z.string().nullable().optional(),    // Cellphone
  employeeType: z.string().nullable().optional(),    // Employee Type
  fromDate: z.union([                              // Start Date
    z.string(),
    z.date(),
    z.null()
  ]).optional().transform((val) => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  }),

  employeeContractNumber: z.string().nullable().optional(),    // Contract Number
  certificationDescription: z.string().nullable().optional(),    // Certifications
  skillSetDescription: z.string().nullable().optional(),    // Skill Set
  languageSkills: z.string().nullable().optional(),    // Language Proficiency
  associatedGln: z.string().nullable().optional().refine(
    (value) => !value || glnRegex.test(value),
    { message: "Invalid GLN format" }
  ),    // Linked GLN
  profileImageUrl: z.string().nullable().optional(),    // User Image

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
export type Userform = z.infer<typeof userformSchema>