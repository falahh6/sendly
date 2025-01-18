import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";

const oAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CID,
  clientSecret: process.env.GOOGLE_CS,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userAccessToken = url.searchParams.get("userAccessToken");
  const email = url.searchParams.get("email");

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://mail.google.com/"], //all remail access
    prompt: "consent",
    login_hint: email ?? "",
  });

  const response = NextResponse.redirect(authUrl);

  if (userAccessToken) {
    response.headers.set(
      "Set-Cookie",
      serialize("userAccessToken", userAccessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
    );
  }

  return response;
}
