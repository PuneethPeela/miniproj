import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

async function main() {
  console.log("Seeding database...");

  const passwordHash = hashPassword("password");

  // ── Demo Users ────────────────────────────────────────────────────────
  const student1 = await prisma.user.upsert({
    where: { email: "cse24733206@matrusri.edu.in" },
    update: {},
    create: {
      name: "Rahul Kumar",
      email: "cse24733206@matrusri.edu.in",
      rollNumber: "cse24733206",
      passwordHash,
      role: "STUDENT",
      provider: "local",
      profileComplete: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "cse24733207@matrusri.edu.in" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "cse24733207@matrusri.edu.in",
      rollNumber: "cse24733207",
      passwordHash,
      role: "STUDENT",
      provider: "local",
      profileComplete: true,
    },
  });

  const kitchenStaff = await prisma.user.upsert({
    where: { email: "staff@matrusri.edu.in" },
    update: {},
    create: {
      name: "Kitchen Staff",
      email: "staff@matrusri.edu.in",
      rollNumber: "staff",
      passwordHash,
      role: "KITCHEN_STAFF",
      provider: "local",
      profileComplete: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@matrusri.edu.in" },
    update: {},
    create: {
      name: "Canteen Manager",
      email: "manager@matrusri.edu.in",
      rollNumber: "manager",
      passwordHash,
      role: "MANAGER",
      provider: "local",
      profileComplete: true,
    },
  });

  const professor = await prisma.user.upsert({
    where: { email: "prof@matrusri.edu.in" },
    update: {},
    create: {
      name: "Dr. Professor",
      email: "prof@matrusri.edu.in",
      rollNumber: "prof",
      passwordHash,
      role: "PROFESSOR",
      provider: "local",
      profileComplete: true,
    },
  });

  console.log(`Created users: ${student1.name}, ${student2.name}, ${kitchenStaff.name}, ${manager.name}, ${professor.name}`);

  // ── Menu Items ────────────────────────────────────────────────────────
  const menuItems = [
    // South Indian
    {
      name: "Masala Dosa",
      description: "Crispy rice crepe filled with spiced potato masala, served with sambar and chutney",
      price: 60,
      category: "South Indian",
      quantityAvailable: 40,
      avgPrepSeconds: 300,
      imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Idli Sambar (2 pcs)",
      description: "Steamed rice cakes served with sambar and coconut chutney",
      price: 40,
      category: "South Indian",
      quantityAvailable: 35,
      avgPrepSeconds: 240,
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Vada (2 pcs)",
      description: "Crispy lentil fritters served with sambar and chutney",
      price: 35,
      category: "South Indian",
      quantityAvailable: 30,
      avgPrepSeconds: 300,
      imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80",
    },
    // Hot Snacks
    {
      name: "Samosa (2 pcs)",
      description: "Crispy pastry filled with spiced potatoes and peas, served with chutney",
      price: 30,
      category: "Hot Snacks",
      quantityAvailable: 50,
      avgPrepSeconds: 300,
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Poori Masala",
      description: "Fluffy deep-fried bread served with spiced potato curry",
      price: 30,
      category: "Hot Snacks",
      quantityAvailable: 35,
      avgPrepSeconds: 360,
      imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Veg Spring Rolls (4 pcs)",
      description: "Crunchy rolls stuffed with mixed vegetables, served with sweet chili sauce",
      price: 60,
      category: "Hot Snacks",
      quantityAvailable: 40,
      avgPrepSeconds: 420,
      imageUrl: "https://images.unsplash.com/photo-1606525436861-e28d2066679a?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Chicken Momos (8 pcs)",
      description: "Steamed dumplings with spiced chicken filling, served with spicy sauce",
      price: 80,
      category: "Hot Snacks",
      quantityAvailable: 20,
      avgPrepSeconds: 720,
      imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop&q=80",
    },
    // Main Course
    {
      name: "Chicken Biryani Bowl",
      description: "Aromatic basmati rice with tender chicken, saffron, and Indian spices",
      price: 120,
      category: "Main Course",
      quantityAvailable: 30,
      avgPrepSeconds: 900,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Paneer Butter Masala Bowl",
      description: "Creamy tomato curry with soft paneer cubes, served with steamed rice",
      price: 100,
      category: "Main Course",
      quantityAvailable: 25,
      avgPrepSeconds: 600,
      imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Egg Fried Rice Bowl",
      description: "Wok-tossed rice with scrambled eggs, vegetables, and soy sauce",
      price: 80,
      category: "Main Course",
      quantityAvailable: 35,
      avgPrepSeconds: 480,
      imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
    },
    // Beverages
    {
      name: "Masala Chai",
      description: "Traditional Indian tea brewed with aromatic spices and fresh milk",
      price: 20,
      category: "Beverages",
      quantityAvailable: 100,
      avgPrepSeconds: 180,
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Mango Lassi",
      description: "Refreshing yogurt-based drink blended with ripe mangoes",
      price: 50,
      category: "Beverages",
      quantityAvailable: 60,
      avgPrepSeconds: 180,
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    },
    {
      name: "Cold Coffee",
      description: "Iced coffee blended with milk and chocolate syrup, topped with cream",
      price: 60,
      category: "Beverages",
      quantityAvailable: 45,
      avgPrepSeconds: 240,
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    },
    // Desserts
    {
      name: "Chocolate Brownie",
      description: "Rich, fudgy brownie made with dark chocolate and walnuts",
      price: 70,
      category: "Desserts",
      quantityAvailable: 15,
      avgPrepSeconds: 120,
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    },
  ];

  for (const item of menuItems) {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    await prisma.menuItem.upsert({
      where: { id: slug },
      update: {
        quantityAvailable: item.quantityAvailable,
        avgPrepSeconds: item.avgPrepSeconds,
      },
      create: {
        id: slug,
        ...item,
      },
    });
  }

  console.log(`Created ${menuItems.length} menu items`);

  // ── Queue Status ──────────────────────────────────────────────────────
  const existingQueue = await prisma.queueStatus.findFirst();
  if (!existingQueue) {
    await prisma.queueStatus.create({
      data: {
        currentToken: 0,
        estimatedWait: 0,
        activeOrders: 0,
      },
    });
  }

  console.log("Seeding complete!");
  console.log("\n── Demo Accounts ─────────────────────────────────────");
  console.log("Student 1:  cse24733206@matrusri.edu.in / password");
  console.log("Student 2:  cse24733207@matrusri.edu.in / password");
  console.log("Staff:      staff@matrusri.edu.in / password");
  console.log("Manager:    manager@matrusri.edu.in / password");
  console.log("Professor:  prof@matrusri.edu.in / password");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
