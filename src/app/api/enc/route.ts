import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const auth = request.headers.get("auth");
  if (!auth) {
    return NextResponse.json("Authorization token is missing", { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      authToken: auth,
    },
  });

  if (user) {
    if (user.encryptionkey && user.encryptionkey?.length > 0) {
      return NextResponse.json("Found encrypted key", { status: 200 });
    } else {
      return NextResponse.json("No key found", { status: 404 });
    }
  }

  return NextResponse.json("User not found", { status: 404 });
};
