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

  console.log("userAccessToken : ", userAccessToken);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly", // Read-only access to emails
      "https://www.googleapis.com/auth/gmail.send", // To send emails
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.metadata",
    ],
    prompt: "consent",
  });

  // Create the response object
  const response = NextResponse.redirect(authUrl);

  // If there is a userAccessToken, set it in the cookies
  if (userAccessToken) {
    response.headers.set(
      "Set-Cookie",
      serialize("userAccessToken", userAccessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only set secure cookies in production
      })
    );
  }

  return response;
}
