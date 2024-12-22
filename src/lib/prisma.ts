import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";

// import ws from "ws";
// neonConfig.webSocketConstructor = ws;

neonConfig.poolQueryViaFetch = true;

declare global {
  let globalPrisma: PrismaClient | undefined;
}

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

//@ts-expect-error: error but works as it's offical way to do it
const prisma = global.globalPrisma || new PrismaClient({ adapter });

//@ts-expect-error: error but works as it's offical way to do it
if (process.env.NODE_ENV === "development") global.globalPrisma = prisma;

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
