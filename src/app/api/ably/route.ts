import { NextRequest, NextResponse } from "next/server";
import Ably from "ably";

export async function GET(req: NextRequest) {
  const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY || "" });

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: req.nextUrl.searchParams.get("clientId") || "anonymous",
  });

  return NextResponse.json(tokenRequest);
}
