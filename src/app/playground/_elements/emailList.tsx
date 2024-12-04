import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
// import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParsedEmail } from "@/lib/types/email";
import { baseUrl, formatStringDate } from "@/lib/utils";
import { getServerSession } from "next-auth";

const EmailItem = ({ email }: { email: ParsedEmail }) => (
  <div
    key={email.threadId}
    className={`p-2 border dark:border-none text-sm rounded-xl flex flex-row justify-between ${
      email.labelIds.includes("UNREAD") && "bg-neutral-200 dark:bg-neutral-600"
    }`}
  >
    <div className="">
      <p className="font-semibold">{email.from}</p>
      <p>{email.subject}</p>
    </div>
    <p>{formatStringDate(email.date || "")}</p>
  </div>
);

const getEmails = async (accessToken: string) => {
  try {
    const res = await fetch(`${baseUrl}/api/emails`, {
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching emails", error);
    return [];
  }
};

const EmailList = async () => {
  const session = await getServerSession(authOptions);

  let emails: {
    section: string;
    emails: ParsedEmail[];
  }[] = [];
  if (session?.accessToken) {
    emails = await getEmails(session.accessToken);
  }

  return (
    <Tabs defaultValue={emails && emails[0]?.section} className="w-full">
      <TabsList className="mb-2">
        {emails?.map((section, idx) => (
          <TabsTrigger key={idx} value={section.section}>
            {section.section} - {section.emails.length}
          </TabsTrigger>
        ))}
      </TabsList>

      {emails
        ?.map((section) => ({
          ...section,
          emails: section.emails.sort(
            (a, b) =>
              new Date(b.date ?? "").getTime() -
              new Date(a.date ?? "").getTime()
          ),
        }))
        .map((section, idx) => (
          <TabsContent
            key={idx}
            value={section.section}
            className="space-y-2 w-full"
          >
            {section.emails.map((email) => (
              <EmailItem key={email.threadId} email={email} />
            ))}
          </TabsContent>
        ))}
    </Tabs>
  );
};

export default EmailList;
