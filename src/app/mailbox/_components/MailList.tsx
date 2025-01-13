"use client";

import { ParsedEmail } from "@/lib/types/email";
import { cn, removeNoreplyEmail } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useIntegrations } from "@/context/mailbox";
import { Integration } from "@/lib/types/integrations";

import { ablyClient } from "@/lib/ably";

export const MailList = ({
  emails,
  integrationId,
  integrations,
}: {
  emails: ParsedEmail[];
  integrationId: string;
  integrations: Integration[];
}) => {
  const [emailsList, setEmailsList] = useState(emails);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [selectedMail, setSelectedMail] = useState(pathname.split("/")[3]);

  const { setIntegrations, setCurrentIntegration } = useIntegrations();

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
      if (data.mails) {
        const sortedEmails = data.mails.sort(
          (a: ParsedEmail, b: ParsedEmail) =>
            new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
        );

        setEmailsList(sortedEmails);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const mailboxId = pathname.split("/")[2];

  const selectMailHandler = (id: string) => {
    setSelectedMail(id);
    router.push(`/mailbox/${mailboxId}/${id}`);
  };

  // const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  //   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  // });

  const gmailChannel = ablyClient(`gmail-channel-${integrationId}`);

  useEffect(() => {
    console.log("Emails: ", emails);
    console.log("IntegrationId: ", integrationId);
    console.log("Integrations : ", integrations);

    if (emails) {
      const sortedEmails = emails.sort(
        (a: ParsedEmail, b: ParsedEmail) =>
          new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
      );

      setEmailsList(sortedEmails);

      const updatededIntegrationsWithEmail = integrations?.map(
        (integration) => {
          if (integration.id === Number(integrationId)) {
            return {
              ...integration,
              mails: sortedEmails,
            };
          }
          return integration;
        }
      );

      console.log("Updated Integrations: ", updatededIntegrationsWithEmail);
      setIntegrations(updatededIntegrationsWithEmail);
      setCurrentIntegration(
        updatededIntegrationsWithEmail.find(
          (i) => i.id === Number(integrationId)
        )
      );
    }

    console.log("CHANNEL : ", gmailChannel);

    gmailChannel.subscribe(`new-email`, (data) => {
      console.log("New Email: ", data);
      fetchEmails();
      router.refresh();
    });

    // const channel = pusher.subscribe("gmail-channel");
    // channel.bind("new-email", (data: { body: string; messageId: string }) => {
    //   console.log("New Email: ", data);
    //   fetchEmails();
    //   router.refresh();
    // });
    return () => {
      gmailChannel.unsubscribe(`new-email`);
    };
  }, [emails]);

  // const sortedEmails = [...emailsList].sort(
  //   (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
  // );

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="h-fit max-h-[12%] border-b">
        <h1 className="text-lg font-semibold p-2">Emails</h1>
      </div>
      <div className="max-h-full overflow-y-auto overflow-x-hidden">
        {emailsList.map((email) => (
          <div
            role="button"
            tabIndex={0}
            key={email.id}
            className={cn(
              "text-sm border-b w-full p-2 hover:bg-gray-100 hover:cursor-pointer",
              selectedMail === email.id && "bg-gray-100"
            )}
            onClick={() => selectMailHandler(email.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                selectMailHandler(email.id);
              }
            }}
          >
            <div className="p-2 flex flex-row gap-2">
              <div>
                <p className="text-base font-semibold">
                  {removeNoreplyEmail(email.from)}
                </p>
                <p className="text-sm">{email.subject}</p>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              {email.labelIds.map((label) => (
                <p
                  key={label}
                  className="rounded-md border text-[10px] px-1 bg-gray-100"
                >
                  {label}
                </p>
              ))}
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
