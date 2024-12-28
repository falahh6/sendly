import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { encryptedUserKey } = await req.json();

  const response = await fetch(
    process.env.NEXT_PUBLIC_SITE_URL + "/api/enc/keys?type=private"
  );
  const { privateMasterKey } = await response.json();

  const decryptedKey = crypto.privateDecrypt(
    {
      key: privateMasterKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encryptedUserKey, "base64")
  );

  return NextResponse.json({ decryptedKey: decryptedKey.toString("base64") });
}
