import prisma from "../lib/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get aggregate metrics & statistics for Reports Dashboard
// @route   GET /api/v1/reports/summary
// @access  Protected (ADMIN, AGENT)
export const getDashboardSummary = asyncHandler(async (req, res) => {
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
    prisma.customer.count(),
    prisma.policy.count(),
    prisma.policy.count({ where: { status: "ACTIVE" } }),
    prisma.policy.count({ where: { status: "EXPIRED" } }),
    prisma.policy.count({ where: { status: "CANCELLED" } }),
    prisma.policy.count({ where: { status: "RENEWED" } }),
    prisma.claim.count(),
    prisma.claim.count({ where: { status: "PENDING" } }),
    prisma.claim.count({ where: { status: "APPROVED" } }),
    prisma.claim.count({ where: { status: "REJECTED" } }),
    prisma.premiumPayment.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  const totalPremiumCollected = premiumPayments._sum.amount || 0;

  // Monthly breakdown for analytics chart
  const recentPayments = await prisma.premiumPayment.findMany({
    where: { paymentStatus: "PAID" },
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
