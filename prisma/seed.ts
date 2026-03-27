import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.orderStatus.deleteMany();

  // Create order statuses
  await prisma.orderStatus.createMany({
    data: [
      { key: "DRAFT", label: "Draft", color: "slate", sortOrder: 0, isDefault: true },
      { key: "IN_PROGRESS", label: "In Progress", color: "amber", sortOrder: 1 },
      { key: "COMPLETED", label: "Completed", color: "emerald", sortOrder: 2 },
      { key: "CANCELLED", label: "Cancelled", color: "rose", sortOrder: 3 },
    ],
  });

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      name: "Admin User",
      hashedPassword: hashSync("admin123", 10),
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.create({
    data: {
      username: "manager",
      name: "Manager User",
      hashedPassword: hashSync("manager123", 10),
      role: "MANAGER",
    },
  });

  const staff = await prisma.user.create({
    data: {
      username: "staff",
      name: "Staff User",
      hashedPassword: hashSync("staff123", 10),
      role: "STAFF",
    },
  });

  // Create customers
  const acme = await prisma.customer.create({
    data: {
      name: "Acme Corp",
      email: "orders@acme.com",
      phone: "555-0100",
      company: "Acme Corporation",
      address: "123 Business Ave, Suite 100",
      notes: "Priority customer, net-30 terms",
    },
  });

  const techstart = await prisma.customer.create({
    data: {
      name: "TechStart Inc",
      email: "hello@techstart.io",
      phone: "555-0200",
      company: "TechStart Inc",
      address: "456 Innovation Blvd",
    },
  });

  const localshop = await prisma.customer.create({
    data: {
      name: "Local Shop",
      email: "info@localshop.com",
      phone: "555-0300",
      company: "Local Shop LLC",
      address: "789 Main Street",
    },
  });

  await prisma.customer.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "555-0400",
      company: "Freelance Designer",
    },
  });

  await prisma.customer.create({
    data: {
      name: "Global Trading Co",
      email: "orders@globaltrading.com",
      phone: "555-0500",
      company: "Global Trading Co",
      address: "321 Commerce Dr, Building B",
      notes: "International shipping required",
    },
  });

  // Create products
  await prisma.product.create({
    data: {
      name: "Widget A",
      description: "Standard widget for general use",
      sku: "WDG-A",
      category: "Widgets",
      basePrice: 25.0,
      hasVariants: false,
    },
  });

  await prisma.product.create({
    data: {
      name: "Widget B",
      description: "Premium widget with enhanced features",
      sku: "WDG-B",
      category: "Widgets",
      basePrice: 50.0,
      hasVariants: false,
    },
  });

  await prisma.product.create({
    data: {
      name: "Custom T-Shirt",
      description: "Branded custom t-shirt",
      sku: "TSH-001",
      category: "Apparel",
      basePrice: 20.0,
      hasVariants: true,
      variants: {
        create: [
          { name: "Small", sku: "TSH-001-S", price: 18.0, sortOrder: 0 },
          { name: "Medium", sku: "TSH-001-M", price: 20.0, sortOrder: 1 },
          { name: "Large", sku: "TSH-001-L", price: 22.0, sortOrder: 2 },
          { name: "XL", sku: "TSH-001-XL", price: 24.0, sortOrder: 3 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Coffee Beans",
      description: "Premium roasted coffee beans",
      sku: "COF-001",
      category: "Beverages",
      basePrice: 15.0,
      hasVariants: true,
      variants: {
        create: [
          { name: "250g", sku: "COF-001-250", price: 12.0, sortOrder: 0 },
          { name: "500g", sku: "COF-001-500", price: 20.0, sortOrder: 1 },
          { name: "1kg", sku: "COF-001-1K", price: 35.0, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Consulting Hours",
      description: "Professional consulting service",
      sku: "SVC-CONSULT",
      category: "Services",
      basePrice: 150.0,
      hasVariants: false,
    },
  });

  await prisma.product.create({
    data: {
      name: "Setup Fee",
      description: "One-time setup and onboarding fee",
      sku: "SVC-SETUP",
      category: "Services",
      basePrice: 500.0,
      hasVariants: false,
    },
  });

  // Create orders linked to customers
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 1,
      customerId: acme.id,
      customerName: "Acme Corp",
      customerEmail: "orders@acme.com",
      customerPhone: "555-0100",
      status: "IN_PROGRESS",
      notes: "Priority customer",
      createdById: admin.id,
      assigneeId: staff.id,
      lineItems: {
        create: [
          { description: "Widget A", quantity: 10, unitPrice: 25.0, sortOrder: 0 },
          { description: "Widget B", quantity: 5, unitPrice: 50.0, sortOrder: 1 },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 2,
      customerId: techstart.id,
      customerName: "TechStart Inc",
      customerEmail: "hello@techstart.io",
      customerPhone: "555-0200",
      status: "DRAFT",
      createdById: manager.id,
      lineItems: {
        create: [
          { description: "Consulting hours", quantity: 20, unitPrice: 150.0, sortOrder: 0 },
          { description: "Setup fee", quantity: 1, unitPrice: 500.0, sortOrder: 1 },
          { description: "Monthly license", quantity: 12, unitPrice: 99.0, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 3,
      customerId: localshop.id,
      customerName: "Local Shop",
      customerEmail: "info@localshop.com",
      status: "COMPLETED",
      createdById: admin.id,
      assigneeId: manager.id,
      lineItems: {
        create: [
          { description: "Product Display", quantity: 2, unitPrice: 350.0, sortOrder: 0 },
        ],
      },
    },
  });

  // Add some comments and activity
  await prisma.comment.create({
    data: {
      orderId: order1.id,
      userId: admin.id,
      content: "Please prioritize this order for next week delivery.",
    },
  });

  await prisma.activityLog.create({
    data: {
      orderId: order1.id,
      userId: admin.id,
      action: "ORDER_CREATED",
      details: "Order created for Acme Corp",
    },
  });

  await prisma.activityLog.create({
    data: {
      orderId: order1.id,
      userId: admin.id,
      action: "STATUS_CHANGED",
      details: "Status changed from DRAFT to IN_PROGRESS",
    },
  });

  await prisma.activityLog.create({
    data: {
      orderId: order2.id,
      userId: manager.id,
      action: "ORDER_CREATED",
      details: "Order created for TechStart Inc",
    },
  });

  console.log("Seed complete: 4 statuses, 3 users, 5 customers, 6 products, 3 orders created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
