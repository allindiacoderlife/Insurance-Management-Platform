import { z } from "zod";

export const recordPaymentSchema = z.object({
  policyId: z.string().uuid("Invalid policy ID"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentDate: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "OVERDUE", "FAILED"]).optional().default("PAID"),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID", "OVERDUE", "FAILED"]),
});
