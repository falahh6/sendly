import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const masterPublicKey = publicKey
  .export({ type: "spki", format: "pem" })
  .toString();

const privateMasterKey = privateKey;

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const type = params.get("type");
  if (type === "private") {
    return NextResponse.json({ privateKey: privateMasterKey });
  } else if (type === "public") {
    return NextResponse.json({ publicKey: masterPublicKey });
  }
}
