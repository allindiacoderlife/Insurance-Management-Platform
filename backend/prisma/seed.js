import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
  console.log("🌱 Starting Database Seeding for Havenix Insurance Platform...");

  // Clear existing demo data cleanly
  await prisma.document.deleteMany();
  await prisma.premiumPayment.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // 1. Create System Users
  const adminUser = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@havenix.com",
      password: hashedPassword,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  const agentUser = await prisma.user.create({
    data: {
      name: "Alex Agent",
      email: "agent@havenix.com",
      password: hashedPassword,
      role: "AGENT",
      isEmailVerified: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: "Chirag Saxena",
      email: "chiragsaxena728@gmail.com",
      password: hashedPassword,
      role: "CUSTOMER",
      isEmailVerified: true,
    },
  });

  console.log("✅ Created Admin, Agent, and Customer users");

  // 2. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: "Chirag Saxena",
      email: "chiragsaxena728@gmail.com",
      phone: "+91 9876543210",
      address: "Suite 402, Cyber Heights, Tech City, New Delhi",
      dob: new Date("1996-08-15"),
      userId: customerUser.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 9812345678",
      address: "12/A Nariman Point, South Mumbai, Maharashtra",
      dob: new Date("1990-04-12"),
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 9988776655",
      address: "45 Indiranagar 100ft Road, Bangalore, Karnataka",
      dob: new Date("1994-11-20"),
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: "Amit Verma",
      email: "amit.verma@example.com",
      phone: "+91 9765432109",
      address: "88 Jubilee Hills, Hyderabad, Telangana",
      dob: new Date("1988-02-05"),
    },
  });

  console.log("✅ Created 4 Customer Profiles");

  // 3. Create Policies
  const pol1 = await prisma.policy.create({
    data: {
      customerId: customer1.id,
      policyType: "Health Insurance",
      policyNumber: "POL-202607-1001",
      premiumAmount: 750.0,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2027-01-01"),
      status: "ACTIVE",
    },
  });

  const pol2 = await prisma.policy.create({
    data: {
      customerId: customer1.id,
      policyType: "Auto Insurance",
      policyNumber: "POL-202607-1002",
      premiumAmount: 420.0,
      startDate: new Date("2025-06-01"),
      endDate: new Date("2026-06-01"),
      status: "RENEWED",
    },
  });

  const pol3 = await prisma.policy.create({
    data: {
      customerId: customer2.id,
      policyType: "Life Insurance",
      policyNumber: "POL-202607-1003",
      premiumAmount: 1200.0,
      startDate: new Date("2025-01-15"),
      endDate: new Date("2026-01-15"),
      status: "EXPIRED",
    },
  });

  const pol4 = await prisma.policy.create({
    data: {
      customerId: customer3.id,
      policyType: "Property Insurance",
      policyNumber: "POL-202607-1004",
      premiumAmount: 1500.0,
      startDate: new Date("2026-03-10"),
      endDate: new Date("2027-03-10"),
      status: "ACTIVE",
    },
  });

  const pol5 = await prisma.policy.create({
    data: {
      customerId: customer4.id,
      policyType: "Health Insurance",
      policyNumber: "POL-202607-1005",
      premiumAmount: 650.0,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2027-02-01"),
      status: "CANCELLED",
    },
  });

  console.log("✅ Created 5 Policies across Active, Renewed, Expired & Cancelled statuses");

  // 4. Create Premium Payments
  await prisma.premiumPayment.createMany({
    data: [
      { policyId: pol1.id, amount: 750.0, paymentStatus: "PAID", paymentDate: new Date("2026-01-02") },
      { policyId: pol2.id, amount: 420.0, paymentStatus: "PAID", paymentDate: new Date("2025-06-01") },
      { policyId: pol2.id, amount: 420.0, paymentStatus: "PAID", paymentDate: new Date("2026-05-28") },
      { policyId: pol3.id, amount: 1200.0, paymentStatus: "OVERDUE", paymentDate: new Date("2026-01-10") },
      { policyId: pol4.id, amount: 1500.0, paymentStatus: "PAID", paymentDate: new Date("2026-03-11") },
      { policyId: pol5.id, amount: 650.0, paymentStatus: "FAILED", paymentDate: new Date("2026-02-01") },
    ],
  });

  console.log("✅ Created 6 Premium Payment records");

  // 5. Create Claims
  await prisma.claim.createMany({
    data: [
      {
        policyId: pol1.id,
        claimAmount: 1200.0,
        reason: "Hospitalization expenses for sudden fever and diagnostic tests.",
        status: "APPROVED",
        submissionDate: new Date("2026-04-10"),
      },
      {
        policyId: pol1.id,
        claimAmount: 450.0,
        reason: "Outpatient dental treatment and prescription medicines.",
        status: "PENDING",
        submissionDate: new Date("2026-07-01"),
      },
      {
        policyId: pol2.id,
        claimAmount: 800.0,
        reason: "Car bumper repair following minor parking scratch accident.",
        status: "VERIFYING",
        submissionDate: new Date("2026-06-15"),
      },
      {
        policyId: pol4.id,
        claimAmount: 3500.0,
        reason: "Water pipe leakage damage repair for residential floor.",
        status: "APPROVED",
        submissionDate: new Date("2026-05-20"),
      },
      {
        policyId: pol5.id,
        claimAmount: 900.0,
        reason: "Claim request submitted on cancelled policy terms.",
        status: "REJECTED",
        submissionDate: new Date("2026-02-15"),
      },
    ],
  });

  console.log("✅ Created 5 Claim requests across PENDING, VERIFYING, APPROVED, & REJECTED statuses");

  // 6. Create Demo Document Records
  await prisma.document.createMany({
    data: [
      { customerId: customer1.id, fileName: "Aadhaar_ID_Proof.pdf", filePath: "demo-aadhaar.pdf" },
      { customerId: customer1.id, fileName: "Health_Medical_Certificate.pdf", filePath: "demo-medical.pdf" },
      { customerId: customer2.id, fileName: "PAN_Card_Proof.jpg", filePath: "demo-pan.jpg" },
      { customerId: customer3.id, fileName: "House_Deed_Property.pdf", filePath: "demo-property.pdf" },
    ],
  });

  console.log("✅ Created 4 Demo Customer Document records");
  console.log("\n🎉 Database Seeded Successfully!");
  console.log("\n🔑 Demo Login Credentials:");
  console.log("   • Admin:    admin@havenix.com / Password123!");
  console.log("   • Agent:    agent@havenix.com / Password123!");
  console.log("   • Customer: chiragsaxena728@gmail.com / Password123!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
