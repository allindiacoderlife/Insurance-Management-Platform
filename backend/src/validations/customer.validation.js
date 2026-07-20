import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Customer name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  address: z.string().min(3, "Address is required"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format for DOB (expected YYYY-MM-DD)",
  }),
  userId: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
});
