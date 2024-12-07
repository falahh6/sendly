import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CID,
  process.env.GOOGLE_CS,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json("Authorization code is missing", { status: 400 });
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log("TOKENS : ", tokens);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}?redirect=google`
    );
  } catch (error) {
    return NextResponse.json("Failed to authenticate: " + error, {
      status: 500,
    });
  }
}
