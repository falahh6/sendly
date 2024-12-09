import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const client_id = process.env.AZURE_CLIENT_ID as string;
  const client_secret = process.env.AZURE_CLIENT_SECRET as string;
  const redirect_uri = process.env.AZURE_REDIRECT_URI as string;
  const tenant_id = process.env.AZURE_TENANT_ID as string;

  const cookies = req.cookies;
  const userAccessToken = cookies.get("userAccessToken")?.value;
  console.log("Access Token: ", userAccessToken);

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
      email:
        profileResponseData.mail ||
        profileResponseData.userPrincipalName
          ?.split("#EXT#")[0]
          ?.replace(/_/g, "@"),
      userPrincipalName: profileResponseData.userPrincipalName,
    };

    const user = await prisma.user.findFirst({
      where: {
        authToken: userAccessToken as string,
      },
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?error=NoUserFound`
      );
    } else {
      console.log("User found:", user);
    }

    const integration = await prisma.integration.findFirst({
      where: {
        email: profileData.email,
      },
    });

    console.log("Integration : ", integration);

    if (!integration) {
      await prisma.integration.create({
        data: {
          accessToken: accessToken as string,
          refreshToken: "",
          provider: "Azure",
          name: "Outlook",
          profile: {
            email: profileData.email,
          },
          email: profileData.email,
          userId: user.id,
        },
      });

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?redirect=outlook`
      );
    } else {
      console.log("Integration found : ", integration);

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?redirect=outlook&error=IntegrationExists`
      );
    }
  } catch (error) {
    return NextResponse.json("Failed to authenticate: " + error, {
      status: 500,
    });
  }
}
