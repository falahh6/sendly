import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { parseEmail } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.headers.get("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return NextResponse.json({
        status: 401,
        body: "Unauthorized - Missing accessToken",
      });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth });

    const result = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      //   q: "is:unread",
      maxResults: 20,
    });

    const messages = result.data.messages || [];

    const emailDetailsPromises = messages.map(async (message) => {
      const messageDetails = await gmail.users.messages.get({
        userId: "me",
        id: message.id || "",
      });
      return parseEmail(messageDetails.data as Email);
    });

    const emailDetails = await Promise.all(emailDetailsPromises);

    return NextResponse.json({
      status: 200,
      body: emailDetails,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error fetching emails",
      error: error,
    });
  }
}
