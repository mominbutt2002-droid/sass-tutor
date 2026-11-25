import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const freePasswordHash = await bcrypt.hash("demo1234", 10);
  const proPasswordHash = await bcrypt.hash("demo1234", 10);

  await prisma.user.upsert({
    where: { email: "free@glagol.ai" },
    update: {},
    create: {
      email: "free@glagol.ai",
      name: "Анна (Free)",
      passwordHash: freePasswordHash,
      plan: "FREE",
      preferredLevel: "BEGINNER",
      timezone: "Europe/Moscow",
    },
  });

  await prisma.user.upsert({
    where: { email: "pro@glagol.ai" },
    update: {},
    create: {
      email: "pro@glagol.ai",
      name: "Дмитрий (Pro)",
      passwordHash: proPasswordHash,
      plan: "PRO",
      preferredLevel: "INTERMEDIATE",
      timezone: "Europe/Moscow",
      subscriptionStatus: "active",
    },
  });

  console.log("Seeded demo accounts: free@glagol.ai / pro@glagol.ai (password: demo1234)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
