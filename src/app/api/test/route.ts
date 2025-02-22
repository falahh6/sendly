import { Integration } from "@prisma/client";
import { NextResponse } from "next/server";
import { gmail_v1, google } from "googleapis";
import { evervault } from "@/lib/evervault";
import { Email } from "@/lib/types/email";
import { parseEmail } from "@/lib/emails/utils";

export const GET = async () => {
  const integration = {
    id: 1,
    name: "Gmail",
    profile: {
      email: "try.falah6@gmail.com",
      historyId: "27798",
      totalEmails: 74,
      importComplete: true,
      lastImportedAt: "2025-02-18T16:33:03.251Z",
      emailImportedCount: 74,
      isImportProcessing: false,
      lastImportCompletedAt: "2025-02-18T16:34:45.360Z",
    },
    accessToken:
      "ev:RFVC:7QE2QtFxjy18blkT:AtYTbujWe9zfms5NUmf8ii7gcYkJ+f6EwOcdvaly5IaX:OPv0k1mk5GfnOQQbw4JV1rATtzTcZ3ixCOLyd22ydtNB1ccwWO84DLv8fBiN2HhV+6SHeMXbcpF934WC04H1pVdBeoiqfvk1CDOgYqeM6xDTOJR9nSCAbZ5bwTkCm/nl8tmYXGx2O/cz0G9s32PBuLuz2+Tr9AqdXl/gmr6fuBc54GDuuKO0BE2ExAqY+0iLvM41GkBVFbqQmUCIAHDG1/9E/7asmW5/DTwmn8VwEbzksDwEVF7cCHYn+VwlmEcOoIBZJu07UEqwI4Vv2mmyue04ySC6/eYspvGXNcCPwIgxsrisgghBx4n4bMGXMA:$",
    refreshToken:
      "ev:RFVC:rO3oFUwG1epx8KBi:AtYTbujWe9zfms5NUmf8ii7gcYkJ+f6EwOcdvaly5IaX:IhxlDM0C3SBxdPGUrVhOCZi+n8JY/XAxOjRoP7gYeJIFPod0+shYGMXoCxiQEEZgN/mI3PrpLfGbs8YuA8GT2llR1k2IosLJ2HUK5KIV1yJus4ZoHnzUga6z8K99TUJG6v5s+pAgp3SXwS0I5xrKvah4F8x7Ldw:$",
    provider: "Google",
    userId: "efbe7530-c6e7-4c86-b474-45bbc1a40a74",
    email: "try.falah6@gmail.com",
  };

  try {
    const oauth2Client = await getOAuthClient(integration);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const result = await fetchEmailDetails(gmail, "1951960c246700ec");

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { error: "Failed to fetch email details" },
      { status: 500 }
    );
  }
};

const fetchEmailDetails = async (gmail: gmail_v1.Gmail, messageId: string) => {
  try {
    const emailResponse = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
    });

    return {
      emailResponse: emailResponse.data,
      parsedEmail: await parseEmail(emailResponse.data as Email, gmail),
    };
  } catch (error) {
    console.error("Error fetching email details:", error);
    throw error;
  }
};

const getOAuthClient = async (integration: Integration) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CID,
    process.env.GOOGLE_CS
  );

  oauth2Client.setCredentials({
    access_token: await evervault.decrypt(integration.accessToken),
    refresh_token: await evervault.decrypt(integration.refreshToken),
  });

  return oauth2Client;
};
