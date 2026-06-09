import 'dotenv/config';
 
import { PrismaClient } from "../prisma/generated/client";
const prisma = new PrismaClient();

async function main() {
  const roles = [
    { code: 'CUSTOMER', name: 'Customer', description: 'Default customer role' },
    { code: 'ADMIN', name: 'Admin', description: 'Administrative role' },
    { code: 'SUPPORT', name: 'Support', description: 'Customer support role' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
