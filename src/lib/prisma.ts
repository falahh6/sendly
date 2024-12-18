import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

export const authTokenValidation = async (
  authToken: string | null | undefined
) => {
  if (!authToken) {
    return {
      error: "No auth token provided",
      statusCode: 401,
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      authToken: authToken,
    },
  });

  if (!user) {
    return {
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  return user;
};
