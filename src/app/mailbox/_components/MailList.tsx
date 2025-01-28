"use client";

import { ParsedEmail } from "@/lib/types/email";
import { cn, formatStringDate, removeNoreplyEmail } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useIntegrations } from "@/context/mailbox";

import { ablyClient, getAblyInstance } from "@/lib/ably";
import { Session } from "next-auth";
import { Loader } from "lucide-react";
import { useHash } from "@/app/hooks/useHash";

export const MailList = ({
  integrationId,
  userSession,
}: {
  integrationId: string;
  userSession: Session | null;
}) => {
  const [emailsList, setEmailsList] = useState<ParsedEmail[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [selectedMail, setSelectedMail] = useState(pathname.split("/")[3]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const hash = useHash();

  const fetchEmails = async () => {
    try {
      const response = await fetch(
        `/api/integrations/mails?integration_id=${integrationId}`,
        {
          headers: {
            auth: `${userSession?.accessToken}`,
          },
          // cache: "force-cache",
          method: "GET",
        }
      );

      const data = await response.json();
      if (data.mails) {
        updateEmailData(data.mails);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const {
    setIntegrations,
    setCurrentIntegration,
    integrations: IntegrationsCtx,
  } = useIntegrations();

  const mailboxId = pathname.split("/")[2];

  const selectMailHandler = (id: string) => {
    setSelectedMail(id);
    router.push(`/mailbox/${mailboxId}/${id}`);
  };

  const updateLabels = (email: ParsedEmail, labels: string[]) => {
    console.log("updating email : ", email);
    const updatedEmail: ParsedEmail = {
      ...email,
      labelIds: labels,
    };

    console.log("Updated Email: ", updatedEmail);
    return updatedEmail;
  };

  useEffect(() => {
    if (fetchLoading) return;
    const emailsList = IntegrationsCtx.find(
      (i) => i.id === Number(integrationId)
    )?.mails;

    const filteredEmails = filterByHash(emailsList ?? [], hash);

    console.log("Filtered Emails: ", filteredEmails);

    setEmailsList(filteredEmails || []);
  }, [hash, fetchLoading]);

  const filterByHash = (emails: ParsedEmail[], hash: string) => {
    console.log("Filtering by hash: ", hash);
    if (hash === "#inbox") {
      const inboxEmails = emails.filter((email) =>
        email.labelIds.includes("INBOX")
      );

      console.log("Inbox Emails: ", inboxEmails);

      return inboxEmails;
    }
    if (hash === "#starred") {
      const starredEmails = emails.filter((email) =>
        email.labelIds.includes("STARRED")
      );

      console.log("Starred Emails: ", starredEmails);

      return starredEmails;
    }

    if (hash === "#sent") {
      const sentEmails = emails.filter((email) =>
        email.labelIds.includes("SENT")
      );

      console.log("Sent Emails: ", sentEmails);

      return sentEmails;
    }

    if (hash === "#drafts") {
      const draftEmails = emails.filter((email) =>
        email.labelIds.includes("DRAFT")
      );

      console.log("Draft Emails: ", draftEmails);

      return draftEmails;
    }

    if (hash === "#trash") {
      const trashEmails = emails.filter((email) =>
        email.labelIds.includes("TRASH")
      );

      console.log("Trash Emails: ", trashEmails);

      return trashEmails;
    }

    return emails;
  };

  const updateEmailData = (emails: ParsedEmail[]) => {
    const sortedEmails = emails.sort(
      (a: ParsedEmail, b: ParsedEmail) =>
        new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    );

    setEmailsList(sortedEmails);

    const updatededIntegrationsWithEmail = IntegrationsCtx?.map(
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
      updatededIntegrationsWithEmail.find((i) => i.id === Number(integrationId))
    );
  };

  useEffect(() => {
    console.log("Integrations DATA : ", IntegrationsCtx);

    const currentIntegration = IntegrationsCtx.find(
      (integration) => integration.id === Number(integrationId)
    );

    if ((currentIntegration?.mails?.length ?? 0) > 0) {
      setEmailsList(currentIntegration?.mails ?? []);
      setFetchLoading(false);
    }

    if ((currentIntegration?.mails?.length ?? 0) === 0) {
      fetchEmails();
    }
  }, []);

  useEffect(() => {
    if (emailsList.length === 0) {
      return;
    }

    const gmailChannel = ablyClient(`gmail-channel-${integrationId}`);

    console.log("Gmail Channel: ", gmailChannel);

    gmailChannel.subscribe(`email-updates`, (data) => {
      console.log("EMAIL updates", data);

      if (data.data.message === "new-email") {
        const email = data.data.body.email;
        updateEmailData([email, ...emailsList]);
      }

      if (data.data.message === "delete-email") {
        const messageId = data.data.body.messageId;
        updateEmailData(emailsList.filter((email) => email.id !== messageId));
      }

      if (data.data.message === "label-change") {
        const messageId = data.data.body.messageId;
        console.log("EMAILs : ", emailsList);
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
      getAblyInstance().channels.release(`gmail-channel-${integrationId}`);
      getAblyInstance().close();
    };
  }, [integrationId, emailsList]);

  return (
    <div className="h-full flex flex-col justify-between">
      {/* <div className="h-fit max-h-[12%] border-b">
        <h1 className="text-lg font-semibold p-2">Emails</h1>
      </div> */}
      <div className="max-h-full overflow-y-auto overflow-x-hidden">
        {fetchLoading && (
          <div className="w-full flex flex-row justify-center items-center h-full">
            <Loader className="mr-2 animate-spin h-4 w-4" />{" "}
            <span>Loading...</span>
          </div>
        )}
        {emailsList?.length === 0 && (
          <div className="w-full flex flex-row justify-center items-center h-full py-6">
            <p>No emails found</p>
          </div>
        )}
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
