import prisma from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper to generate unique policy number
function generatePolicyNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `POL-${dateStr}-${randomSuffix}`;
}

// @desc    Get all policies with search & filters
// @route   GET /api/v1/policies
// @access  Protected
export const getAllPolicies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "10", 10);
  const skip = (page - 1) * limit;
  const { status, policyType, search } = req.query;

  const where = {
    ...(status && { status }),
    ...(policyType && { policyType: { contains: policyType, mode: "insensitive" } }),
    ...(search && {
      OR: [
        { policyNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  // If role === CUSTOMER, limit to policies owned by customer
  if (req.user.role === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });
    if (!customer) {
      return res.status(200).json({
        success: true,
        data: { policies: [], pagination: { total: 0, page, limit, totalPages: 0 } },
      });
    }
    where.customerId = customer.id;
  }

  const [total, policies] = await Promise.all([
    prisma.policy.count({ where }),
    prisma.policy.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { claims: true, payments: true } },
      },
    }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      policies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get single policy details
// @route   GET /api/v1/policies/:id
// @access  Protected
export const getPolicyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const policy = await prisma.policy.findUnique({
    where: { id },
    include: {
      customer: true,
      claims: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!policy) {
    throw new ApiError(404, "Policy not found");
  }

  return res.status(200).json({
    success: true,
    data: { policy },
  });
});

// @desc    Create new insurance policy
// @route   POST /api/v1/policies
// @access  Protected (ADMIN, AGENT)
export const createPolicy = asyncHandler(async (req, res) => {
  const { customerId, policyType, policyNumber, premiumAmount, startDate, endDate } = req.body;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const pNumber = policyNumber || generatePolicyNumber();

  const policy = await prisma.policy.create({
    data: {
      customerId,
      policyType,
      policyNumber: pNumber,
      premiumAmount: parseFloat(premiumAmount),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "ACTIVE",
    },
    include: { customer: true },
  });

  return res.status(201).json({
    success: true,
    message: "Insurance policy created successfully",
    data: { policy },
  });
});

// @desc    Renew an existing policy
// @route   PUT /api/v1/policies/:id/renew
// @access  Protected (ADMIN, AGENT)
export const renewPolicy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newEndDate, newPremiumAmount } = req.body;

  const policy = await prisma.policy.findUnique({ where: { id } });
  if (!policy) {
    throw new ApiError(404, "Policy not found");
  }

  const updatedPolicy = await prisma.policy.update({
    where: { id },
    data: {
      endDate: new Date(newEndDate),
      status: "RENEWED",
      ...(newPremiumAmount && { premiumAmount: parseFloat(newPremiumAmount) }),
    },
    include: { customer: true },
  });

  return res.status(200).json({
    success: true,
    message: "Policy renewed successfully",
    data: { policy: updatedPolicy },
  });
});

// @desc    Cancel a policy
// @route   PUT /api/v1/policies/:id/cancel
// @access  Protected (ADMIN, AGENT)
export const cancelPolicy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const policy = await prisma.policy.findUnique({ where: { id } });
  if (!policy) {
    throw new ApiError(404, "Policy not found");
  }

  const updatedPolicy = await prisma.policy.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return res.status(200).json({
    success: true,
    message: "Policy cancelled successfully",
    data: { policy: updatedPolicy },
  });
});

// @desc    Delete policy
// @route   DELETE /api/v1/policies/:id
// @access  Protected (ADMIN)
export const deletePolicy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const policy = await prisma.policy.findUnique({ where: { id } });
  if (!policy) {
    throw new ApiError(404, "Policy not found");
  }

  await prisma.policy.delete({ where: { id } });

  return res.status(200).json({
    success: true,
    message: "Policy deleted successfully",
  });
});
