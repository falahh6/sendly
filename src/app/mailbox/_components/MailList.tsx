"use client";

import { ParsedEmail } from "@/lib/types/email";
import { removeNoreplyEmail } from "@/lib/utils";
import { User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useSession } from "next-auth/react";

export const MailList = ({
  emails,
  integrationId,
}: {
  emails: ParsedEmail[];
  integrationId: string;
}) => {
  const [emailsList, setEmailsList] = useState(emails);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const fetchEmails = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_SITE_URL +
          `/api/integrations/mails?integration_id=${integrationId}`,
        {
          headers: {
            auth: `${session?.accessToken}`,
          },
          method: "GET",
        }
      );

      const data = await response.json();
      console.log("Emails: ", data.mails);
      setEmailsList(data.mails);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const mailboxId = pathname.split("/")[2];

  const selectMailHandler = (id: string) => {
    router.push(`/mailbox/${mailboxId}/${id}`);
  };

  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });

  useEffect(() => {
    const channel = pusher.subscribe("gmail-channel");
    channel.bind("new-email", (data: { body: string; messageId: string }) => {
      console.log("New Email: ", data);
      fetchEmails();
      router.refresh();
    });
    return () => {
      pusher.unsubscribe("gmail-channel");
    };
  }, []);

  const sortedEmails = [...emailsList].sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="h-fit max-h-[12%] border-b">
        <h1 className="text-lg font-semibold p-2">Emails</h1>
      </div>
      <div className="max-h-full overflow-y-auto">
        {sortedEmails.map((email) => (
          <div
            role="button"
            tabIndex={0}
            key={email.id}
            className="text-sm border-b w-full p-2 hover:bg-gray-100 hover:cursor-pointer"
            onClick={() => selectMailHandler(email.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                selectMailHandler(email.id);
              }
            }}
          >
            <div className="p-2 flex flex-row gap-2">
              <div>
                <div className="w-fit bg-gray-100 p-1.5 rounded-2xl border">
                  <User className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p>{removeNoreplyEmail(email.from)}</p>
                <p className="">{email.subject}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-fit max-h-[8%] bg-gray-100 text-sm text-right w-full mr-2">
        <p className="p-2">Total emails: {emailsList.length}</p>
      </div>
    </div>
  );
};
