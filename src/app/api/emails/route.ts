import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { categorizeEmails } from "@/lib/emails/email-categorisation-service";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.headers.get("Authorization")?.split(" ")[1];

    console.log("ACCESS TOKEN", accessToken);

    if (!accessToken) {
      return NextResponse.json({
        status: 401,
        body: "Unauthorized - Missing accessToken",
      });
    }

    // const auth = new google.auth.OAuth2();
    // auth.setCredentials({ access_token: accessToken });

    // console.log("AUTH : ", auth);

    // const gmail = google.gmail({ version: "v1", auth });

    // const result = await gmail.users.messages.list({
    //   userId: "me",
    //   maxResults: 200,
    // });

    // console.log("RESULTS : ", result.status, result.statusText, result.data);

    // const messages = result.data.messages ?? [];

    // const emailDetailsPromises = messages.map(async (message) => {
    //   const messageDetails = await gmail.users.messages.get({
    //     userId: "me",
    //     id: message.id ?? "",
    //   });
    //   return parseEmail(messageDetails.data as Email);
    // });

    // const emailDetails = await Promise.all(emailDetailsPromises);

    const filePath = path.join(process.cwd(), "emailDetails.json");

    const emailDetailsRaw = await fs.readFile(filePath, "utf-8");
    const emailDetails = JSON.parse(emailDetailsRaw);

    return NextResponse.json({
      status: 200,
      data: await categorizeEmails(emailDetails),
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error fetching emails",
      error: error,
    });
  }
}
