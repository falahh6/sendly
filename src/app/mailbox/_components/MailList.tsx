"use client";

import { ParsedEmail } from "@/lib/types/email";
import { cn, formatStringDate, removeNoreplyEmail } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [selectedMail, setSelectedMail] = useState(pathname.split("/")[3]);

  const { setIntegrations, setCurrentIntegration } = useIntegrations();

  const mailboxId = pathname.split("/")[2];

  const selectMailHandler = (id: string) => {
    setSelectedMail(id);
    router.push(`/mailbox/${mailboxId}/${id}`);
  };

  const gmailChannel = ablyClient(`gmail-channel-${integrationId}`);

  const updateLabels = (email: ParsedEmail, labels: string[]) => {
    console.log("updating email : ", email);
    const updatedEmail: ParsedEmail = {
      ...email,
      labelIds: labels,
    };

    console.log("Updated Email: ", updatedEmail);
    return updatedEmail;
  };

  const updateEmailData = (emails: ParsedEmail[]) => {
    const sortedEmails = emails.sort(
      (a: ParsedEmail, b: ParsedEmail) =>
        new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    );

    setEmailsList(sortedEmails);

    const updatededIntegrationsWithEmail = integrations?.map((integration) => {
      if (integration.id === Number(integrationId)) {
        return {
          ...integration,
          mails: sortedEmails,
        };
      }
      return integration;
    });

    console.log("Updated Integrations: ", updatededIntegrationsWithEmail);
    setIntegrations(updatededIntegrationsWithEmail);
    setCurrentIntegration(
      updatededIntegrationsWithEmail.find((i) => i.id === Number(integrationId))
    );
  };

  useEffect(() => {
    console.log("Emails: ", emails);
    console.log("IntegrationId: ", integrationId);
    console.log("Integrations : ", integrations);

    if (emails) {
      updateEmailData(emails);
    }

    console.log("CHANNEL : ", gmailChannel);

    gmailChannel.subscribe(`email-updates`, (data) => {
      console.log("EMAIL updates", data);

      if (data.data.message === "new-email") {
        const email = data.data.body.email;
        updateEmailData([email, ...emailsList]);
      }

      if (data.data.message === "delete-email") {
        const messageId = data.data.body.messageId;
        updateEmailData(emails.filter((email) => email.id !== messageId));
      }

      if (data.data.message === "label-change") {
        const messageId = data.data.body.messageId;
        const email = emailsList.find((email) => email.messageId == messageId)!;
        if (email) {
          const labels = data.data.body.updatedLabels;
          const updatedEmail = updateLabels(email, labels);

          updateEmailData([
            updatedEmail,
            ...emailsList.filter((email) => email.messageId !== messageId),
          ]);
        }
      }
    });

    return () => {
      gmailChannel.unsubscribe(`email-updates`);
    };
  }, [emails]);

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
              selectedMail === email.id && "bg-gray-100",
              email.labelIds.includes("UNREAD") && "font-semibold"
            )}
            onClick={() => selectMailHandler(email.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                selectMailHandler(email.id);
              }
            }}
          >
            <div className="p-2 flex flex-row gap-2">
              <div className="w-full">
                <div className="w-full flex flex-row justify-between items-center">
                  <p className="text-base font-semibold">
                    {removeNoreplyEmail(email.from)}
                  </p>
                  <span className="text-xs">
                    {formatStringDate(email.date!)}
                  </span>
                </div>
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
