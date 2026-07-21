import prisma from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { cache } from "../utils/cache.js";

// @desc    Get all customers with search and pagination
// @route   GET /api/v1/customers
// @access  Protected (ADMIN, AGENT)
export const getAllCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "10", 10);
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { policies: true, documents: true },
        },
      },
    }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get customer profile by ID
// @route   GET /api/v1/customers/:id
// @access  Protected
export const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, isEmailVerified: true } },
      policies: {
        orderBy: { createdAt: "desc" },
        include: {
          claims: { orderBy: { createdAt: "desc" } },
          payments: { orderBy: { createdAt: "desc" } },
        },
      },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!customer) {
    throw new ApiError(404, "Customer profile not found");
  }

  // Customers can only view their own profile unless they are ADMIN or AGENT
  if (req.user.role === "CUSTOMER" && customer.userId !== req.user.id) {
    throw new ApiError(403, "Access denied to this customer profile");
  }

  return res.status(200).json({
    success: true,
    data: { customer },
  });
});

// @desc    Create a new customer
// @route   POST /api/v1/customers
// @access  Protected (ADMIN, AGENT)
export const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, address, dob, userId } = req.body;

  const existingCustomer = await prisma.customer.findUnique({
    where: { email },
  });

  if (existingCustomer) {
    throw new ApiError(400, "Customer with this email address already exists");
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      phone,
      address,
      dob: new Date(dob),
      userId: userId || null,
    },
  });

  // Invalidate Cache
  await Promise.all([
    cache.del("customers"),
    cache.del("customer_detail"),
    cache.del("reports"),
  ]);

  return res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: { customer },
  });
});

// @desc    Update customer profile
// @route   PUT /api/v1/customers/:id
// @access  Protected (ADMIN, AGENT)
export const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, dob } = req.body;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  if (email && email !== customer.email) {
    const emailExists = await prisma.customer.findUnique({ where: { email } });
    if (emailExists) {
      throw new ApiError(400, "Email address is already in use by another customer");
    }
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(dob && { dob: new Date(dob) }),
    },
  });

  // Invalidate Cache
  await Promise.all([
    cache.del("customers"),
    cache.del("customer_detail"),
    cache.del("reports"),
  ]);

  return res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: { customer: updatedCustomer },
  });
});

// @desc    Delete customer
// @route   DELETE /api/v1/customers/:id
// @access  Protected (ADMIN)
export const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  await prisma.customer.delete({ where: { id } });

  // Invalidate Cache
  await Promise.all([
    cache.del("customers"),
    cache.del("customer_detail"),
    cache.del("reports"),
  ]);

  return res.status(200).json({
    success: true,
    message: "Customer record deleted successfully",
  });
});
