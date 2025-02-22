import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());
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
