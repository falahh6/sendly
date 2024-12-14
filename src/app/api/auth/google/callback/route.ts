import prisma from "@/lib/prisma";
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

  const cookies = req.cookies;
  const accessToken = cookies.get("userAccessToken")?.value;
  console.log("Access Token: ", accessToken);

  if (!code) {
    return NextResponse.json("Authorization code is missing", { status: 400 });
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log("TOKENS : ", tokens);

    // Fetch User Profile
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });

    console.log("User Profile: ", profile);

    const userEmailAddress = profile.data.emailAddress;

    const user = await prisma.user.findFirst({
      where: {
        authToken: accessToken as string,
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
        email: userEmailAddress as string,
      },
    });

    if (!integration) {
      const integration = await prisma.integration.create({
        data: {
          accessToken: tokens.access_token as string,
          refreshToken: tokens.refresh_token,
          provider: "Google",
          name: "Gmail",
          profile: {
            email: userEmailAddress,
          },
          email: userEmailAddress as string,
          userId: user.id,
        },
      });

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/mailbox/${integration.id}?redirect=google`
      );
    } else {
      console.log("Integration found : ", integration);

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/mailbox/${integration.id}?redirect=google&error=IntegrationExists`
      );
    }
  } catch (error) {
    return NextResponse.json("Failed to authenticate: " + error, {
      status: 500,
    });
  }
}
