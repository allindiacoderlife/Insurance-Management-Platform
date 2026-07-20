import path from "path";
import fs from "fs";
import prisma from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Upload document for customer
// @route   POST /api/v1/documents/upload
// @access  Protected
export const uploadDocument = asyncHandler(async (req, res) => {
  const { customerId } = req.body;
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "Please upload a file");
  }

  if (!customerId) {
    throw new ApiError(400, "Customer ID is required");
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    // Cleanup uploaded file if customer doesn't exist
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new ApiError(404, "Customer not found");
  }

  const document = await prisma.document.create({
    data: {
      customerId,
      fileName: file.originalname,
      filePath: file.filename,
      uploadedAt: new Date(),
    },
  });

  return res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    data: { document },
  });
});

// @desc    Get customer documents
// @route   GET /api/v1/documents/customer/:customerId
// @access  Protected
export const getCustomerDocuments = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const documents = await prisma.document.findMany({
    where: { customerId },
    orderBy: { uploadedAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    data: { documents },
  });
});

// @desc    Download document
// @route   GET /api/v1/documents/download/:id
// @access  Protected
export const downloadDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    throw new ApiError(404, "Document record not found");
  }

  const fullPath = path.resolve("uploads", document.filePath);
  if (!fs.existsSync(fullPath)) {
    throw new ApiError(404, "File not found on server disk");
  }

  return res.download(fullPath, document.fileName);
});

// @desc    Delete document
// @route   DELETE /api/v1/documents/:id
// @access  Protected (ADMIN, AGENT)
export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const fullPath = path.resolve("uploads", document.filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  await prisma.document.delete({ where: { id } });

  return res.status(200).json({
    success: true,
    message: "Document deleted successfully",
  });
});
