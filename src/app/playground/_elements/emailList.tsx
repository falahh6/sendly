import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { baseUrl } from "@/lib/utils";
import { getServerSession } from "next-auth";

const EmailItem = ({ email }: { email: ParsedEmail }) => (
  <div key={email.threadId} className="p-2 border-b">
    <p className="font-semibold">{email.from}</p>
    <p>{email.subject}</p>
    <div>
      {/* <div
          dangerouslySetInnerHTML={{ __html: email.htmlMessage || "" }}
          style={{ background: "#ebeef4" }} 
        /> */}
    </div>
    <p>{email.date}</p>
    <div className="flex flex-row gap-2 py-2">
      {email.labelIds.map((label, idx) => (
        <Badge
          variant={"secondary"}
          className="text-xs font-normal"
          key={label + idx}
        >
          {label}
        </Badge>
      ))}
    </div>
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

  let emails: ParsedEmail[] = [];
  if (session?.accessToken) {
    emails = await getEmails(session.accessToken);
  }

  const renderEmails = (priorityGrade: string) => {
    const filteredEmails = emails?.filter(
      (e) => e.priorityGrade === priorityGrade
    );
    return filteredEmails?.length > 0 ? (
      filteredEmails.map((email) => (
        <EmailItem key={email.threadId} email={email} />
      ))
    ) : (
      <div className="p-2">
        <p className="font-semibold">No emails</p>
      </div>
    );
  };

  return (
    <Tabs defaultValue="a" className="w-[800px]">
      <TabsList>
        <TabsTrigger value="a">Important</TabsTrigger>
        <TabsTrigger value="b">Work updates</TabsTrigger>
        <TabsTrigger value="c">Promotional emails</TabsTrigger>
      </TabsList>
      <TabsContent value="a">{renderEmails("A")}</TabsContent>
      <TabsContent value="b">{renderEmails("B")}</TabsContent>
      <TabsContent value="c">{renderEmails("C")}</TabsContent>
    </Tabs>
  );
};

export default EmailList;
