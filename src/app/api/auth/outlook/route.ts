import { NextResponse } from "next/server";
import { URLSearchParams } from "url";

export async function GET() {
  const client_id = process.env.AZURE_CLIENT_ID as string;
  const tenant_id = process.env.AZURE_TENANT_ID as string;
  const redirect_uri = process.env.AZURE_REDIRECT_URI as string;
  const scope = "openid profile email User.Read";

  const authUrl =
    `https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/authorize?` +
    new URLSearchParams({
      client_id: client_id,
      redirect_uri: redirect_uri,
      response_type: "code",
      scope: scope,
      prompt: "consent", // Force consent screen every time
    });

  console.log("AUTH URL : ", authUrl);

  return NextResponse.redirect(authUrl);
}
