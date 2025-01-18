import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";

export async function GET(request: NextRequest) {
  const client_id = process.env.AZURE_CLIENT_ID as string;
  const tenant_id = process.env.AZURE_TENANT_ID as string;
  const redirect_uri = process.env.AZURE_REDIRECT_URI as string;
  const scope = "openid profile email User.Read";

  const url = new URL(request.url);
  const userAccessToken = url.searchParams.get("userAccessToken");
  const email = url.searchParams.get("email");

  const authUrl =
    `https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/authorize?` +
    new URLSearchParams({
      client_id: client_id,
      redirect_uri: redirect_uri,
      response_type: "code",
      scope: scope,
      // prompt: "consent", // Force consent screen every time
      login_hint: email ?? "",
    });

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
