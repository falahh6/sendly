const { PrismaClient } = require("@prisma/client");
const { promises: fs } = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  //not seeding any data for now
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
