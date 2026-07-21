import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { cache } from "../utils/cache.js";
import {
  sendAgentCredentialsEmail,
  sendAdminAgentCreatedAlertEmail,
} from "../services/email.service.js";

// Helper to generate unique Agent ID Code
function generateAgentCode() {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AGT-2026-${randomSuffix}`;
}

// @desc    Get all registered Agent accounts
// @route   GET /api/v1/agents
// @access  Protected (ADMIN)
export const getAllAgents = asyncHandler(async (req, res) => {
  const search = req.query.search || "";

  const where = {
    role: "AGENT",
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const agents = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Attach Agent policy deals count
  const agentsWithMetrics = await Promise.all(
    agents.map(async (agent) => {
      const policyCount = await prisma.policy.count();
      return {
        ...agent,
        agentCode: `AGT-2026-${agent.id.slice(0, 4).toUpperCase()}`,
        policiesDeals: policyCount,
      };
    }),
  );

  return res.status(200).json({
    success: true,
    data: {
      agents: agentsWithMetrics,
    },
  });
});

// @desc    Create new Agent Account & Send Email Credentials
// @route   POST /api/v1/agents
// @access  Protected (ADMIN)
export const createAgentAccount = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and initial password are required.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new ApiError(
      400,
      "An account with this email address already exists.",
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const agentCode = generateAgentCode();

  const agent = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "AGENT",
      isEmailVerified: true, // Admin-verified account
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  // Send Email Credentials to Agent
  await sendAgentCredentialsEmail(agent.email, agent.name, password, agentCode);

  // Send Notification Alert to Admin
  if (req.user?.email) {
    await sendAdminAgentCreatedAlertEmail(
      req.user.email,
      agent.name,
      agent.email,
      agentCode,
    );
  }

  // Invalidate Cache
  await Promise.all([cache.del("agents"), cache.del("reports")]);

  return res.status(201).json({
    success: true,
    message: `Agent account created successfully for ${agent.name}. Credentials have been emailed to ${agent.email}.`,
    data: {
      agent: {
        ...agent,
        agentCode,
      },
    },
  });
});

// @desc    Toggle Agent Verification / Active Status
// @route   PUT /api/v1/agents/:id/toggle-verify
// @access  Protected (ADMIN)
export const toggleAgentVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const agent = await prisma.user.findUnique({ where: { id } });
  if (!agent || agent.role !== "AGENT") {
    throw new ApiError(404, "Agent account not found.");
  }

  const updatedAgent = await prisma.user.update({
    where: { id },
    data: {
      isEmailVerified: !agent.isEmailVerified,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isEmailVerified: true,
    },
  });

  await Promise.all([cache.del("agents"), cache.del("reports")]);

  return res.status(200).json({
    success: true,
    message: `Agent verification status updated to ${updatedAgent.isEmailVerified ? "VERIFIED" : "UNVERIFIED"}.`,
    data: { agent: updatedAgent },
  });
});

// @desc    Resend Credentials Email to Agent
// @route   POST /api/v1/agents/:id/resend-credentials
// @access  Protected (ADMIN)
export const resendAgentCredentials = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const agent = await prisma.user.findUnique({ where: { id } });
  if (!agent || agent.role !== "AGENT") {
    throw new ApiError(404, "Agent account not found.");
  }

  const newTempPassword = `AgentPass${Math.floor(100 + Math.random() * 900)}!`;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newTempPassword, salt);
  const agentCode = `AGT-2026-${agent.id.slice(0, 4).toUpperCase()}`;

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  await sendAgentCredentialsEmail(
    agent.email,
    agent.name,
    newTempPassword,
    agentCode,
  );

  return res.status(200).json({
    success: true,
    message: `Fresh login credentials emailed to ${agent.email}.`,
  });
});

// @desc    Delete Agent Account
// @route   DELETE /api/v1/agents/:id
// @access  Protected (ADMIN)
export const deleteAgentAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const agent = await prisma.user.findUnique({ where: { id } });
  if (!agent || agent.role !== "AGENT") {
    throw new ApiError(404, "Agent account not found.");
  }

  await prisma.user.delete({ where: { id } });

  await Promise.all([cache.del("agents"), cache.del("reports")]);

  return res.status(200).json({
    success: true,
    message: "Agent account deleted successfully.",
  });
});
