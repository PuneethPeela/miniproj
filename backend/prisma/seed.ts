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

  const student = await prisma.user.upsert({
    where: { email: "student@college.edu" },
    update: {},
    create: {
      name: "Rahul Kumar",
      email: "student@college.edu",
      passwordHash,
      role: "STUDENT",
    },
  });

  const kitchenStaff = await prisma.user.upsert({
    where: { email: "kitchen@college.edu" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "kitchen@college.edu",
      passwordHash,
      role: "KITCHEN_STAFF",
    },
  });

  console.log(`Created users: ${student.name}, ${kitchenStaff.name}`);

  const menuItems = [
    {
      name: "Chicken Biryani Bowl",
      description: "Aromatic basmati rice with tender chicken, saffron, and Indian spices",
      price: 120,
      category: "Rice Bowls",
      quantityAvailable: 30,
      avgPrepSeconds: 900,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
    },
    {
      name: "Paneer Butter Masala Bowl",
      description: "Creamy tomato curry with soft paneer cubes, served with steamed rice",
      price: 100,
      category: "Rice Bowls",
      quantityAvailable: 25,
      avgPrepSeconds: 600,
      imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
    },
    {
      name: "Egg Fried Rice Bowl",
      description: "Wok-tossed rice with scrambled eggs, vegetables, and soy sauce",
      price: 80,
      category: "Rice Bowls",
      quantityAvailable: 35,
      avgPrepSeconds: 480,
      imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
    },
    {
      name: "Samosa (2 pcs)",
      description: "Crispy pastry filled with spiced potatoes and peas, served with chutney",
      price: 40,
      category: "Snacks",
      quantityAvailable: 50,
      avgPrepSeconds: 300,
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    },
    {
      name: "Veg Spring Rolls (4 pcs)",
      description: "Crunchy rolls stuffed with mixed vegetables, served with sweet chili sauce",
      price: 60,
      category: "Snacks",
      quantityAvailable: 40,
      avgPrepSeconds: 420,
      imageUrl: "https://images.unsplash.com/photo-1606525436861-e28d2066679a?w=400",
    },
    {
      name: "Chicken Momos (8 pcs)",
      description: "Steamed dumplings with spiced chicken filling, served with spicy sauce",
      price: 80,
      category: "Snacks",
      quantityAvailable: 20,
      avgPrepSeconds: 720,
      imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
    },
    {
      name: "Masala Chai",
      description: "Traditional Indian tea brewed with aromatic spices and fresh milk",
      price: 30,
      category: "Drinks",
      quantityAvailable: 100,
      avgPrepSeconds: 180,
      imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400",
    },
    {
      name: "Mango Lassi",
      description: "Refreshing yogurt-based drink blended with ripe mangoes",
      price: 50,
      category: "Drinks",
      quantityAvailable: 60,
      avgPrepSeconds: 180,
      imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400",
    },
    {
      name: "Cold Coffee",
      description: "Iced coffee blended with milk and chocolate syrup, topped with cream",
      price: 60,
      category: "Drinks",
      quantityAvailable: 45,
      avgPrepSeconds: 240,
      imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
    },
    {
      name: "Chocolate Brownie",
      description: "Rich, fudgy brownie made with dark chocolate and walnuts",
      price: 70,
      category: "Desserts",
      quantityAvailable: 15,
      avgPrepSeconds: 120,
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
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

  await prisma.queueStatus.create({
    data: {
      currentToken: 0,
      estimatedWait: 0,
      activeOrders: 0,
    },
  });

  console.log("Created initial queue status");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
