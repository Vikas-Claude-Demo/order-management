import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const firstNames = [
  "Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Ayaan","Krishna","Ishaan",
  "Ananya","Diya","Myra","Sara","Aadhya","Isha","Priya","Riya","Kavya","Meera",
  "Rajesh","Sunil","Amit","Vikram","Deepak","Rohit","Manish","Sanjay","Nikhil","Rahul",
  "Pooja","Neha","Swati","Sunita","Rekha","Anjali","Divya","Shruti","Pallavi","Nisha",
  "James","Robert","John","Michael","David","William","Richard","Joseph","Thomas","Daniel",
  "Mary","Patricia","Jennifer","Linda","Barbara","Elizabeth","Susan","Jessica","Sarah","Karen",
  "Ali","Mohammed","Hassan","Omar","Yusuf","Ibrahim","Fatima","Aisha","Zainab","Layla",
  "Wei","Jun","Lei","Yan","Ming","Hui","Xin","Fang","Jing","Tao",
  "Carlos","Miguel","Pedro","Juan","Luis","Ana","Maria","Sofia","Elena","Rosa",
  "Hans","Klaus","Fritz","Anna","Greta","Lars","Erik","Olga","Nina","Sven",
];

const lastNames = [
  "Patel","Shah","Mehta","Sharma","Gupta","Singh","Kumar","Verma","Joshi","Agarwal",
  "Desai","Rao","Reddy","Nair","Menon","Iyer","Pillai","Chauhan","Malhotra","Khanna",
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Moore",
  "Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Robinson","Clark",
  "Ahmed","Khan","Ali","Hassan","Rahman","Syed","Hussain","Ibrahim","Malik","Qureshi",
  "Wang","Li","Zhang","Chen","Liu","Yang","Huang","Wu","Zhou","Xu",
  "Martinez","Lopez","Gonzalez","Rodriguez","Fernandez","Perez","Sanchez","Torres","Ramirez","Flores",
  "Mueller","Schmidt","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Koch",
  "Nakamura","Tanaka","Suzuki","Watanabe","Sato","Kim","Park","Lee","Choi","Jung",
  "Santos","Oliveira","Costa","Sousa","Ferreira","Silva","Almeida","Pereira","Ribeiro","Carvalho",
];

const companies = [
  "BrightStar Electricals","LumiTech Solutions","GreenGlow Lighting","PowerLite Industries","SparkLED Co",
  "ElectraHome Pvt Ltd","ShineBright Corp","WattSaver Technologies","LightHouse Traders","BeamTech Systems",
  "PrimeWatt Distributors","ClearLight Enterprises","GlowMax Industries","VoltEdge Supplies","RadiantPath Lighting",
  "EcoLumen Solutions","SkyBright Electricals","FlashPoint Trading","NeonWave Distributors","LuxPower Corp",
  "InfraLED Technologies","OptiGlow Supplies","MegaLux Traders","SolarEdge Lighting","NovaBeam Industries",
  "PureLight Co","UltraWatt Systems","ZenithGlow Enterprises","SunRay Electricals","TrueBeam Solutions",
  "AmpLED Corp","CrystalLite Traders","DawnLight Industries","EverBright Supplies","FusionLED Co",
  "GlobalWatt Distributors","HaloLight Systems","IonBright Technologies","JetGlow Enterprises","KiloLux Traders",
  "LightCraft Solutions","MeriWatt Industries","NorthStar LED Co","OmniGlow Supplies","PeakLumen Corp",
  "QuickLight Traders","RapidWatt Systems","StarLite Enterprises","TechnoGlow Industries","UniLED Solutions",
  "VisionBright Co","WaveLight Distributors","XenonEdge Supplies","YieldLux Corp","ZenLight Technologies",
  "AlphaBeam Traders","BetaGlow Industries","CoreLED Systems","DeltaWatt Enterprises","EagleLite Co",
  "Orbit Electricals","Phoenix LED Group","Quantum Lighting","Relay Power Supplies","Sigma Bright Co",
  "Tango Electricals","Vertex LED Corp","Axiom Lighting","Blueprint Electricals","Cascade LED Supplies",
];

const cities = [
  "Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Ahmedabad","Pune","Jaipur","Lucknow",
  "Surat","Indore","Nagpur","Bhopal","Vadodara","Rajkot","Coimbatore","Visakhapatnam","Nashik","Aurangabad",
  "New York","Los Angeles","Chicago","Houston","Phoenix","Dubai","Abu Dhabi","London","Manchester","Sydney",
  "Melbourne","Toronto","Singapore","Hong Kong","Bangkok","Jakarta","Nairobi","Lagos","Cairo","Riyadh",
];

const streets = [
  "Industrial Area","Commercial Complex","Market Road","Business Park","Trade Center",
  "Main Street","Station Road","Ring Road","Highway","Mall Road",
  "Sector","Block","Phase","Zone","Plot",
];

const statuses = ["DRAFT","IN_PROGRESS","COMPLETED","CANCELLED"] as const;
const statusWeights = [15, 45, 35, 5]; // percentage distribution

function pickWeightedStatus(): string {
  const r = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < statuses.length; i++) {
    cumulative += statusWeights[i];
    if (r < cumulative) return statuses[i];
  }
  return "DRAFT";
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  return `${randInt(700,999)}-${randInt(100,999)}-${randInt(1000,9999)}`;
}

function generateEmail(firstName: string, lastName: string, company: string): string {
  const domain = company.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) + ".com";
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

async function main() {
  // Get existing users
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.error("No users found. Run the main seed first.");
    process.exit(1);
  }

  // Get existing products with variants
  const products = await prisma.product.findMany({
    include: { variants: true },
  });
  if (products.length === 0) {
    console.error("No products found. Run seed-products first.");
    process.exit(1);
  }

  // Get last order number
  const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" } });
  let orderNum = (lastOrder?.orderNumber ?? 0) + 1;

  console.log(`Starting from order #${orderNum}`);
  console.log(`Found ${users.length} users, ${products.length} products`);

  // Create 200 customers
  const customers: { id: string; name: string; email: string; phone: string; company: string }[] = [];

  for (let i = 0; i < 200; i++) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const name = `${firstName} ${lastName}`;
    const company = pick(companies);
    const email = generateEmail(firstName, lastName, company);
    const phone = generatePhone();
    const city = pick(cities);
    const street = pick(streets);
    const address = `${randInt(1,500)} ${street}, ${city}`;

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        company,
        address,
        notes: i % 5 === 0 ? "Bulk buyer" : i % 7 === 0 ? "New customer" : "",
      },
    });

    customers.push({ id: customer.id, name, email, phone, company });
  }

  console.log(`Created ${customers.length} customers`);

  // Create 200 orders
  for (let i = 0; i < 200; i++) {
    const customer = customers[i];
    const status = pickWeightedStatus();
    const createdBy = pick(users);
    const assignee = Math.random() > 0.2 ? pick(users) : null;

    // Each order gets 1-5 line items
    const itemCount = randInt(1, 5);
    const lineItems: {
      description: string;
      quantity: number;
      unitPrice: number;
      sortOrder: number;
      productId: string | null;
      productVariantId: string | null;
    }[] = [];

    const usedProducts = new Set<string>();

    for (let j = 0; j < itemCount; j++) {
      let product = pick(products);
      // Avoid duplicate products in same order
      let attempts = 0;
      while (usedProducts.has(product.id) && attempts < 10) {
        product = pick(products);
        attempts++;
      }
      usedProducts.add(product.id);

      let variant = null;
      let unitPrice = product.basePrice;
      let description = product.name;

      if (product.hasVariants && product.variants.length > 0) {
        variant = pick(product.variants);
        unitPrice = variant.price;
        description = `${product.name} - ${variant.name}`;
      }

      lineItems.push({
        description,
        quantity: randInt(1, 100),
        unitPrice,
        sortOrder: j,
        productId: product.id,
        productVariantId: variant?.id ?? null,
      });
    }

    // Set created date spread over last 6 months
    const daysAgo = randInt(0, 180);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.order.create({
      data: {
        orderNumber: orderNum++,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        status,
        notes: i % 10 === 0 ? "Urgent delivery required" : i % 8 === 0 ? "Partial shipment OK" : "",
        createdById: createdBy.id,
        assigneeId: assignee?.id ?? null,
        createdAt,
        lineItems: {
          create: lineItems,
        },
        activityLogs: {
          create: [
            {
              userId: createdBy.id,
              action: "ORDER_CREATED",
              details: `Order created for ${customer.name}`,
              createdAt,
            },
            ...(status !== "DRAFT"
              ? [
                  {
                    userId: createdBy.id,
                    action: "STATUS_CHANGED",
                    details: `Status changed from DRAFT to ${status}`,
                    createdAt: new Date(createdAt.getTime() + randInt(1, 48) * 3600000),
                  },
                ]
              : []),
          ],
        },
      },
    });

    if ((i + 1) % 50 === 0) {
      console.log(`  Created ${i + 1}/200 orders...`);
    }
  }

  console.log(`Seed complete: 200 customers and 200 orders created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
