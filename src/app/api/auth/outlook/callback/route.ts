import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const client_id = process.env.AZURE_CLIENT_ID as string;
  const client_secret = process.env.AZURE_CLIENT_SECRET as string;
  const redirect_uri = process.env.AZURE_REDIRECT_URI as string;
  const tenant_id = process.env.AZURE_TENANT_ID as string;

  if (!code) {
    return NextResponse.json("Authorization code is missing", { status: 400 });
  }

  try {
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: client_id,
          client_secret: client_secret,
          code: code,
          redirect_uri: redirect_uri,
          grant_type: "authorization_code",
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    console.log("TOKEN DATA : ", tokenData);

    if (tokenData.error) {
      return NextResponse.json("Error: " + tokenData.error_description, {
        status: 500,
      });
    }

    // Store tokens or pass them to a function to send an email
    const accessToken = tokenData.access_token;

    const profileResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("PROFILE RESPONSE : ", profileResponse);
    if (!profileResponse.ok) {
      console.log("ERROR");
      throw new Error(
        "Failed to fetch user profile: " + (await profileResponse.text())
      );
    }

    const profileResponseData = await profileResponse.json();

    const profileData = {
      displayName: profileResponseData.displayName,
      mail:
        profileResponseData.mail ||
        profileResponseData.userPrincipalName
          ?.split("#EXT#")[0]
          ?.replace(/_/g, "@"),
      userPrincipalName: profileResponseData.userPrincipalName,
    };

    console.log("PROFILE DATA : ", profileData);

    // You can store tokens in a session or database (e.g., Redis, database, etc.)

    return NextResponse.redirect(`http://localhost:3000?redirect=outlook`);
  } catch (error) {
    return NextResponse.json("Failed to authenticate: " + error, {
      status: 500,
    });
  }
}
