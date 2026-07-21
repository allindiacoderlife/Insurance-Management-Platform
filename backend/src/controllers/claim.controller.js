import prisma from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { cache } from "../utils/cache.js";

// @desc    Get all claims with status filter & pagination
// @route   GET /api/v1/claims
// @access  Protected
export const getAllClaims = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "10", 10);
  const skip = (page - 1) * limit;
  const { status, search } = req.query;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { reason: { contains: search, mode: "insensitive" } },
        { policy: { policyNumber: { contains: search, mode: "insensitive" } } },
        { policy: { customer: { name: { contains: search, mode: "insensitive" } } } },
      ],
    }),
  };

  // If CUSTOMER, restrict to own customer claims
  if (req.user.role === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });
    if (!customer) {
      return res.status(200).json({
        success: true,
        data: { claims: [], pagination: { total: 0, page, limit, totalPages: 0 } },
      });
    }
    where.policy = { customerId: customer.id };
  }

  const [total, claims] = await Promise.all([
    prisma.claim.count({ where }),
    prisma.claim.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submissionDate: "desc" },
      include: {
        policy: {
          select: {
            id: true,
            policyNumber: true,
            policyType: true,
            customer: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
    }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      claims,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get single claim details
// @route   GET /api/v1/claims/:id
// @access  Protected
export const getClaimById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const claim = await prisma.claim.findUnique({
    where: { id },
    include: {
      policy: {
        include: {
          customer: {
            include: { documents: true },
          },
        },
      },
    },
  });

  if (!claim) {
    throw new ApiError(404, "Claim request not found");
  }

  return res.status(200).json({
    success: true,
    data: { claim },
  });
});

// @desc    Submit a new insurance claim
// @route   POST /api/v1/claims
// @access  Protected
export const submitClaim = asyncHandler(async (req, res) => {
  const { policyId, claimAmount, reason } = req.body;

  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: { customer: true },
  });

  if (!policy) {
    throw new ApiError(404, "Policy not found");
  }

  if (policy.status === "CANCELLED" || policy.status === "EXPIRED") {
    throw new ApiError(400, `Cannot submit claim for a policy with status '${policy.status}'`);
  }

  const claim = await prisma.claim.create({
    data: {
      policyId,
      claimAmount: parseFloat(claimAmount),
      reason,
      status: "PENDING",
      submissionDate: new Date(),
    },
    include: {
      policy: {
        select: { id: true, policyNumber: true, policyType: true, customer: true },
      },
    },
  });

  // Invalidate Cache
  await Promise.all([
    cache.del("claims"),
    cache.del("claim_detail"),
    cache.del("reports"),
  ]);

  return res.status(201).json({
    success: true,
    message: "Insurance claim submitted successfully. Status is currently PENDING review.",
    data: { claim },
  });
});

// @desc    Update claim status (Approve / Reject / Verify)
// @route   PUT /api/v1/claims/:id/status
// @access  Protected (ADMIN, AGENT)
export const updateClaimStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const claim = await prisma.claim.findUnique({ where: { id } });
  if (!claim) {
    throw new ApiError(404, "Claim request not found");
  }

  const updatedClaim = await prisma.claim.update({
    where: { id },
    data: { status },
    include: {
      policy: { select: { id: true, policyNumber: true, customer: true } },
    },
  });

  // Invalidate Cache
  await Promise.all([
    cache.del("claims"),
    cache.del("claim_detail"),
    cache.del("reports"),
  ]);

  return res.status(200).json({
    success: true,
    message: `Claim status updated to ${status}`,
    data: { claim: updatedClaim },
  });
});

// @desc    Delete claim
// @route   DELETE /api/v1/claims/:id
// @access  Protected (ADMIN)
export const deleteClaim = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const claim = await prisma.claim.findUnique({ where: { id } });
  if (!claim) {
    throw new ApiError(404, "Claim not found");
  }

  await prisma.claim.delete({ where: { id } });

  // Invalidate Cache
  await Promise.all([
    cache.del("claims"),
    cache.del("claim_detail"),
    cache.del("reports"),
  ]);

  return res.status(200).json({
    success: true,
    message: "Claim record deleted successfully",
  });
});
