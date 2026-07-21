import prisma from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { cache } from "../utils/cache.js";

// @desc    Get all premium payments
// @route   GET /api/v1/payments
// @access  Protected
export const getAllPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "10", 10);
  const skip = (page - 1) * limit;
  const { paymentStatus, search } = req.query;

  const where = {
    ...(paymentStatus && { paymentStatus }),
    ...(search && {
      OR: [
        { policy: { policyNumber: { contains: search, mode: "insensitive" } } },
        { policy: { customer: { name: { contains: search, mode: "insensitive" } } } },
      ],
    }),
  };

  // If CUSTOMER role, filter by customer's policies
  if (req.user.role === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });
    if (!customer) {
      return res.status(200).json({
        success: true,
        data: { payments: [], pagination: { total: 0, page, limit, totalPages: 0 } },
      });
    }
    where.policy = { customerId: customer.id };
  }

  const [total, payments] = await Promise.all([
    prisma.premiumPayment.count({ where }),
    prisma.premiumPayment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { paymentDate: "desc" },
      include: {
        policy: {
          select: {
            id: true,
            policyNumber: true,
            policyType: true,
            customer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Record new premium payment
// @route   POST /api/v1/payments
// @access  Protected
export const recordPayment = asyncHandler(async (req, res) => {
  const { policyId, amount, paymentDate, paymentStatus } = req.body;

  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: { customer: true },
  });

  if (!policy) {
    throw new ApiError(404, "Policy not found");
  }

  const payment = await prisma.premiumPayment.create({
    data: {
      policyId,
      amount: parseFloat(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentStatus: paymentStatus || "PAID",
    },
    include: {
      policy: { select: { id: true, policyNumber: true, policyType: true, customer: true } },
    },
  });

  // Invalidate Cache
  await Promise.all([
    cache.del("payments"),
    cache.del("reports"),
  ]);

  return res.status(201).json({
    success: true,
    message: "Premium payment recorded successfully",
    data: { payment },
  });
});

// @desc    Update payment status
// @route   PUT /api/v1/payments/:id/status
// @access  Protected (ADMIN, AGENT)
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  const payment = await prisma.premiumPayment.findUnique({ where: { id } });
  if (!payment) {
    throw new ApiError(404, "Premium payment record not found");
  }

  const updatedPayment = await prisma.premiumPayment.update({
    where: { id },
    data: { paymentStatus },
  });

  // Invalidate Cache
  await Promise.all([
    cache.del("payments"),
    cache.del("reports"),
  ]);

  return res.status(200).json({
    success: true,
    message: `Payment status updated to ${paymentStatus}`,
    data: { payment: updatedPayment },
  });
});
