import prisma from "../lib/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get aggregate metrics & statistics for Reports & Dashboard
// @route   GET /api/v1/reports/summary
// @access  Protected (ADMIN, AGENT, CUSTOMER)
export const getDashboardSummary = asyncHandler(async (req, res) => {
  let policyWhere = {};
  let claimWhere = {};
  let paymentWhere = { paymentStatus: "PAID" };

  // If role is CUSTOMER, filter metrics to customer's own policies and claims
  if (req.user.role === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    if (customer) {
      policyWhere.customerId = customer.id;
      claimWhere.policy = { customerId: customer.id };
      paymentWhere.policy = { customerId: customer.id };
    }
  }

  const [
    totalCustomers,
    totalPolicies,
    activePolicies,
    expiredPolicies,
    cancelledPolicies,
    renewedPolicies,
    totalClaims,
    pendingClaims,
    approvedClaims,
    rejectedClaims,
    premiumPayments,
  ] = await Promise.all([
    req.user.role === "CUSTOMER" ? 1 : prisma.customer.count(),
    prisma.policy.count({ where: policyWhere }),
    prisma.policy.count({ where: { ...policyWhere, status: "ACTIVE" } }),
    prisma.policy.count({ where: { ...policyWhere, status: "EXPIRED" } }),
    prisma.policy.count({ where: { ...policyWhere, status: "CANCELLED" } }),
    prisma.policy.count({ where: { ...policyWhere, status: "RENEWED" } }),
    prisma.claim.count({ where: claimWhere }),
    prisma.claim.count({ where: { ...claimWhere, status: "PENDING" } }),
    prisma.claim.count({ where: { ...claimWhere, status: "APPROVED" } }),
    prisma.claim.count({ where: { ...claimWhere, status: "REJECTED" } }),
    prisma.premiumPayment.aggregate({
      where: paymentWhere,
      _sum: { amount: true },
    }),
  ]);

  const totalPremiumCollected = premiumPayments._sum.amount || 0;

  // Monthly breakdown for analytics chart
  const recentPayments = await prisma.premiumPayment.findMany({
    where: paymentWhere,
    select: { amount: true, paymentDate: true },
    orderBy: { paymentDate: "asc" },
  });

  const monthlyCollections = recentPayments.reduce((acc, curr) => {
    const month = new Date(curr.paymentDate).toLocaleString("default", { month: "short", year: "numeric" });
    acc[month] = (acc[month] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyCollections).map(([month, amount]) => ({
    month,
    amount,
  }));

  return res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalCustomers,
        totalPolicies,
        activePolicies,
        expiredPolicies,
        cancelledPolicies,
        renewedPolicies,
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        totalPremiumCollected,
      },
      chartData,
    },
  });
});
