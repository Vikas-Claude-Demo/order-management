import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing products and variants only
  await prisma.lineItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  // ── Products WITH Variants (10 products) ──────────────────────────────

  await prisma.product.create({
    data: {
      name: "LED Bulb A60",
      description: "Standard A60 shape LED bulb for residential and commercial use",
      sku: "LED-A60",
      category: "LED Bulbs",
      basePrice: 3.50,
      hasVariants: true,
      variants: {
        create: [
          { name: "5W Warm White", sku: "LED-A60-5W-WW", price: 2.80, sortOrder: 0 },
          { name: "9W Warm White", sku: "LED-A60-9W-WW", price: 3.50, sortOrder: 1 },
          { name: "12W Cool White", sku: "LED-A60-12W-CW", price: 4.20, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "LED Bulb B22",
      description: "Bayonet cap LED bulb compatible with B22 fixtures",
      sku: "LED-B22",
      category: "LED Bulbs",
      basePrice: 3.80,
      hasVariants: true,
      variants: {
        create: [
          { name: "7W Daylight", sku: "LED-B22-7W-DL", price: 3.20, sortOrder: 0 },
          { name: "12W Daylight", sku: "LED-B22-12W-DL", price: 4.10, sortOrder: 1 },
          { name: "15W Warm White", sku: "LED-B22-15W-WW", price: 5.00, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "LED Candle Bulb",
      description: "Decorative candle-shaped LED bulb for chandeliers and wall sconces",
      sku: "LED-CND",
      category: "LED Bulbs",
      basePrice: 4.50,
      hasVariants: true,
      variants: {
        create: [
          { name: "5W E14 Warm White", sku: "LED-CND-5W-E14", price: 4.00, sortOrder: 0 },
          { name: "5W E27 Warm White", sku: "LED-CND-5W-E27", price: 4.20, sortOrder: 1 },
          { name: "7W E14 Cool White", sku: "LED-CND-7W-E14", price: 5.00, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "LED Tube Light T8",
      description: "T8 LED tube replacement for fluorescent fixtures",
      sku: "LED-T8",
      category: "LED Tubes",
      basePrice: 8.00,
      hasVariants: true,
      variants: {
        create: [
          { name: "2ft 10W", sku: "LED-T8-2FT-10W", price: 6.50, sortOrder: 0 },
          { name: "4ft 18W", sku: "LED-T8-4FT-18W", price: 8.50, sortOrder: 1 },
          { name: "4ft 22W", sku: "LED-T8-4FT-22W", price: 10.00, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "LED Panel Light",
      description: "Slim recessed LED panel for office and commercial ceilings",
      sku: "LED-PNL",
      category: "LED Panels",
      basePrice: 22.00,
      hasVariants: true,
      variants: {
        create: [
          { name: "1x1 ft 15W", sku: "LED-PNL-1X1-15W", price: 18.00, sortOrder: 0 },
          { name: "2x2 ft 40W", sku: "LED-PNL-2X2-40W", price: 32.00, sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "LED Downlight",
      description: "Recessed LED downlight for residential and hospitality projects",
      sku: "LED-DL",
      category: "LED Downlights",
      basePrice: 7.50,
      hasVariants: true,
      variants: {
        create: [
          { name: "3W 2-inch", sku: "LED-DL-3W-2IN", price: 5.00, sortOrder: 0 },
          { name: "7W 4-inch", sku: "LED-DL-7W-4IN", price: 7.50, sortOrder: 1 },
          { name: "12W 6-inch", sku: "LED-DL-12W-6IN", price: 11.00, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "LED Flood Light",
      description: "Outdoor LED flood light for security and landscape lighting",
      sku: "LED-FL",
      category: "LED Outdoor",
      basePrice: 28.00,
      hasVariants: true,
      variants: {
        create: [
          { name: "20W", sku: "LED-FL-20W", price: 18.00, sortOrder: 0 },
          { name: "50W", sku: "LED-FL-50W", price: 32.00, sortOrder: 1 },
          { name: "100W", sku: "LED-FL-100W", price: 55.00, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "LED Street Light",
      description: "High-power LED street light for road and highway illumination",
      sku: "LED-STR",
      category: "LED Outdoor",
      basePrice: 85.00,
      hasVariants: true,
      variants: {
        create: [
          { name: "50W", sku: "LED-STR-50W", price: 65.00, sortOrder: 0 },
          { name: "100W", sku: "LED-STR-100W", price: 95.00, sortOrder: 1 },
          { name: "150W", sku: "LED-STR-150W", price: 130.00, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "LED Strip Light",
      description: "Flexible LED strip for accent and decorative lighting",
      sku: "LED-STRIP",
      category: "LED Strips",
      basePrice: 12.00,
      hasVariants: true,
      variants: {
        create: [
          { name: "5m Warm White", sku: "LED-STRIP-5M-WW", price: 10.00, sortOrder: 0 },
          { name: "5m RGB", sku: "LED-STRIP-5M-RGB", price: 16.00, sortOrder: 1 },
          { name: "5m RGBW", sku: "LED-STRIP-5M-RGBW", price: 22.00, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "LED High Bay Light",
      description: "Industrial high bay LED light for warehouses and factories",
      sku: "LED-HB",
      category: "LED Industrial",
      basePrice: 75.00,
      hasVariants: true,
      variants: {
        create: [
          { name: "100W", sku: "LED-HB-100W", price: 60.00, sortOrder: 0 },
          { name: "150W", sku: "LED-HB-150W", price: 85.00, sortOrder: 1 },
          { name: "200W", sku: "LED-HB-200W", price: 110.00, sortOrder: 2 },
        ],
      },
    },
  });

  // ── Products WITHOUT Variants (30 products) ──────────────────────────

  const simpleProducts = [
    { name: "LED Corn Bulb 30W", description: "High lumen corn-style LED bulb for post-top and area lights", sku: "LED-CORN-30W", category: "LED Bulbs", basePrice: 14.00 },
    { name: "LED Corn Bulb 50W", description: "High output corn bulb for street light retrofits", sku: "LED-CORN-50W", category: "LED Bulbs", basePrice: 22.00 },
    { name: "LED GU10 Spotlight 5W", description: "GU10 base LED spotlight for track and recessed fixtures", sku: "LED-GU10-5W", category: "LED Spotlights", basePrice: 3.50 },
    { name: "LED MR16 Spotlight 7W", description: "MR16 base LED spotlight for display and accent lighting", sku: "LED-MR16-7W", category: "LED Spotlights", basePrice: 4.00 },
    { name: "LED Track Light 15W", description: "Adjustable LED track light for retail and gallery use", sku: "LED-TRK-15W", category: "LED Track Lights", basePrice: 18.00 },
    { name: "LED Track Light 30W", description: "High power track light for commercial showrooms", sku: "LED-TRK-30W", category: "LED Track Lights", basePrice: 28.00 },
    { name: "LED Surface Mount Round 12W", description: "Round surface-mount ceiling light for corridors", sku: "LED-SFC-RND-12W", category: "LED Surface Lights", basePrice: 9.50 },
    { name: "LED Surface Mount Square 18W", description: "Square surface-mount ceiling light for bathrooms and kitchens", sku: "LED-SFC-SQR-18W", category: "LED Surface Lights", basePrice: 12.00 },
    { name: "LED Slim Panel Round 6W", description: "Ultra-slim recessed round panel light", sku: "LED-SPNL-R-6W", category: "LED Panels", basePrice: 5.50 },
    { name: "LED Slim Panel Round 12W", description: "Ultra-slim recessed round panel light for living spaces", sku: "LED-SPNL-R-12W", category: "LED Panels", basePrice: 8.00 },
    { name: "LED Batten Light 20W", description: "Linear batten light for garages and utility rooms", sku: "LED-BAT-20W", category: "LED Battens", basePrice: 10.00 },
    { name: "LED Batten Light 36W", description: "4ft linear batten for workshops and storage rooms", sku: "LED-BAT-36W", category: "LED Battens", basePrice: 14.00 },
    { name: "LED Wall Washer 18W", description: "Linear wall washer for architectural facade lighting", sku: "LED-WW-18W", category: "LED Outdoor", basePrice: 35.00 },
    { name: "LED Garden Light 7W", description: "Bollard-style garden path light with spike mount", sku: "LED-GDN-7W", category: "LED Outdoor", basePrice: 15.00 },
    { name: "LED Solar Wall Light", description: "Solar-powered LED wall light for gates and pathways", sku: "LED-SOL-WL", category: "LED Solar", basePrice: 12.00 },
    { name: "LED Solar Flood Light 50W", description: "Solar-powered flood light with remote control", sku: "LED-SOL-FL-50W", category: "LED Solar", basePrice: 45.00 },
    { name: "LED Driver 12V 60W", description: "Constant voltage LED driver for strip light installations", sku: "DRV-12V-60W", category: "LED Drivers", basePrice: 8.00 },
    { name: "LED Driver 24V 100W", description: "Constant voltage driver for commercial strip installations", sku: "DRV-24V-100W", category: "LED Drivers", basePrice: 14.00 },
    { name: "LED Driver Dimmable 40W", description: "Dimmable constant current driver for panel lights", sku: "DRV-DIM-40W", category: "LED Drivers", basePrice: 12.00 },
    { name: "LED Emergency Bulb 9W", description: "Rechargeable LED bulb with built-in battery backup", sku: "LED-EMG-9W", category: "LED Emergency", basePrice: 6.50 },
    { name: "LED Emergency Exit Sign", description: "Illuminated emergency exit sign with battery backup", sku: "LED-EXIT-SGN", category: "LED Emergency", basePrice: 18.00 },
    { name: "LED Tri-Proof Light 36W", description: "IP65 waterproof dustproof vapour-proof LED fixture", sku: "LED-TP-36W", category: "LED Industrial", basePrice: 22.00 },
    { name: "LED Linear Pendant 40W", description: "Suspended linear LED light for modern office interiors", sku: "LED-LNP-40W", category: "LED Commercial", basePrice: 45.00 },
    { name: "LED Ceiling Fan Light Kit", description: "Retrofit LED light kit for ceiling fan installations", sku: "LED-FAN-KIT", category: "LED Accessories", basePrice: 8.00 },
    { name: "LED PIR Sensor Bulb 9W", description: "Motion-sensor LED bulb for automatic on/off", sku: "LED-PIR-9W", category: "LED Smart", basePrice: 7.00 },
    { name: "LED Smart Bulb WiFi 10W", description: "WiFi-enabled smart LED bulb with app control and colour change", sku: "LED-SMART-10W", category: "LED Smart", basePrice: 11.00 },
    { name: "LED COB Chip 10W", description: "Raw COB LED chip module for custom fixture assembly", sku: "LED-COB-10W", category: "LED Components", basePrice: 2.50 },
    { name: "LED COB Chip 30W", description: "High-power COB chip for industrial luminaire assembly", sku: "LED-COB-30W", category: "LED Components", basePrice: 5.00 },
    { name: "LED PCB Board Round", description: "Aluminium PCB board for LED bulb assembly", sku: "LED-PCB-RND", category: "LED Components", basePrice: 0.80 },
    { name: "LED Heat Sink A60", description: "Aluminium heat sink housing for A60 bulb assembly", sku: "LED-HS-A60", category: "LED Components", basePrice: 1.20 },
  ];

  for (const p of simpleProducts) {
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        sku: p.sku,
        category: p.category,
        basePrice: p.basePrice,
        hasVariants: false,
      },
    });
  }

  console.log("Seed complete: 40 LED products created (10 with variants, 30 without)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
