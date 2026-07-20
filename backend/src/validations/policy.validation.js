import { z } from "zod";

export const createPolicySchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  policyType: z.string().min(2, "Policy type is required (e.g., Health, Auto, Life, Property)"),
  policyNumber: z.string().optional(),
  premiumAmount: z.number().positive("Premium amount must be greater than 0"),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
});

export const updatePolicyStatusSchema = z.object({
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "RENEWED"]),
});

export const renewPolicySchema = z.object({
  newEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid renewal end date",
  }),
  newPremiumAmount: z.number().positive().optional(),
});
