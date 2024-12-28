import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { authToken, encryptedUserKey } = await req.json();

  if (authToken) {
    const user = await prisma.user.findFirst({
      where: {
        authToken: authToken,
      },
    });

    console.log("DB USER : ", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    } else if (user.encryptionkey && user.encryptionkey?.length > 0) {
      return NextResponse.json({
        message: "User already has an encryption key",
      });
    } else {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          encryptionkey: encryptedUserKey,
        },
      });

      console.log(`Key stored for user '${user.name}' : ${encryptedUserKey}`);
    }
  }
  return NextResponse.json({ message: "Key stored successfully" });
}
