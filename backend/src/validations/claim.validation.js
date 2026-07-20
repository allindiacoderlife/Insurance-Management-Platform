import { z } from "zod";

export const submitClaimSchema = z.object({
  policyId: z.string().uuid("Invalid policy ID"),
  claimAmount: z.number().positive("Claim amount must be greater than 0"),
  reason: z.string().min(5, "Claim reason must be at least 5 characters"),
});

export const updateClaimStatusSchema = z.object({
  status: z.enum(["PENDING", "VERIFYING", "APPROVED", "REJECTED"]),
});
