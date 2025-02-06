"use client";

import { ParsedEmail } from "@/lib/types/email";
import {
  cn,
  formatStringDate,
  groupEmailsByThread,
  removeNoreplyEmail,
} from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useIntegrations } from "@/context/mailbox";

import { ablyClient, getAblyInstance } from "@/lib/ably";
import { Session } from "next-auth";
import { useHash } from "@/app/hooks/useHash";

import { Search, Archive, History, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export const MailList = ({
  integrationId,
  userSession,
}: {
  integrationId: string;
  userSession: Session | null;
}) => {
  const [emailsList, setEmailsList] = useState<
    { threadId: string; emails: ParsedEmail[] }[]
  >([]);
  const router = useRouter();
  const pathname = usePathname();
  const [selectedMail, setSelectedMail] = useState(pathname.split("/")[3]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const hash = useHash();

  useEffect(() => {
    if (pathname.split("/").length > 3) {
      setSelectedMail(pathname.split("/")[3]);
    } else {
      setSelectedMail("");
    }
  }, [pathname]);

  useEffect(() => {
    if (!hash) {
      router.push(`/mailbox/${integrationId}/#inbox`);
    }
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch(
        `/api/integrations/mails?integration_id=${integrationId}`,
        {
          headers: {
            auth: `${userSession?.accessToken}`,
          },
          cache: "force-cache",
          method: "GET",
        }
      );

      const data = await response.json();
      if (data.mails) {
        console.log("groupEmailsByThread : ", groupEmailsByThread(data.mails));
        updateEmailData(groupEmailsByThread(data.mails));
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

    setEmailsList(groupEmailsByThread(filteredEmails || []));
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

  const updateEmailData = (
    groupedThreads: { threadId: string; emails: ParsedEmail[] }[]
  ) => {
    setEmailsList(groupedThreads);

    const updatededIntegrationsWithEmail = IntegrationsCtx?.map(
      (integration) => {
        if (integration.id === Number(integrationId)) {
          return {
            ...integration,
            mails: groupedThreads.flatMap((thread) => thread.emails),
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
      setEmailsList(groupEmailsByThread(currentIntegration?.mails ?? []));
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
        const threadIndex = emailsList.findIndex(
          (t) => t.threadId === email.threadId
        );

        if (threadIndex !== -1) {
          // Add to existing thread
          const updatedThreads = [...emailsList];
          updatedThreads[threadIndex].emails.unshift(email);
          updateEmailData(updatedThreads);
        } else {
          // New thread
          updateEmailData([
            { threadId: email.threadId, emails: [email] },
            ...emailsList,
          ]);
        }
      }

      if (data.data.message === "label-change") {
        const messageId = data.data.body.messageId;
        const updatedLabels = data.data.body.updatedLabels;
        const updatedThreads = emailsList.map((thread) => ({
          ...thread,
          emails: thread.emails.map((email) => {
            if (email.id === messageId) {
              return updateLabels(email, updatedLabels);
            }
            return email;
          }),
        }));

        updateEmailData(updatedThreads);
      }

      if (data.data.message === "delete-email") {
        const messageId = data.data.body.messageId;
        const updatedThreads = emailsList
          .map((thread) => ({
            ...thread,
            emails: thread.emails.filter((email) => email.id !== messageId),
          }))
          .filter((thread) => thread.emails.length > 0); // Remove empty threads

        updateEmailData(updatedThreads);
      }
    });

    return () => {
      gmailChannel.unsubscribe(`email-updates`);
      getAblyInstance().channels.release(`gmail-channel-${integrationId}`);
      getAblyInstance().close();
    };
  }, [integrationId, emailsList]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Search"
              className="h-9 border-none bg-zinc-50 placeholder:text-zinc-400"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-zinc-600"
        >
          <Archive className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-zinc-600"
        >
          <History className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-zinc-600"
        >
          <Undo className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {emailsList &&
            emailsList.map(({ threadId, emails }) => {
              const latestEmail = emails[0]; // Show the most recent email as the preview

              return (
                <EmailItem
                  key={threadId}
                  email={latestEmail}
                  selectMailHandler={selectMailHandler}
                  selectedMail={selectedMail}
                />
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
};

function EmailItem({
  email,
  selectMailHandler,
  selectedMail,
}: {
  email: ParsedEmail;
  selectMailHandler: (id: string) => void;
  selectedMail: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-transparent p-3 transition-colors hover:bg-zinc-50 hover:border-zinc-200",
        email.labelIds.includes("UNREAD") && "bg-zinc-50",
        selectedMail == email.threadId && "bg-zinc-100"
      )}
      role="button"
      tabIndex={0}
      key={email.id}
      onClick={() => selectMailHandler(email.threadId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          selectMailHandler(email.id);
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-sm">
            {removeNoreplyEmail(email.from)}
          </div>
          {email.labelIds.includes("UNREAD") && (
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
          )}
        </div>
        <div className="text-xs text-zinc-500">
          {formatStringDate(email.date ?? "")}
        </div>
      </div>
      <div className="text-sm font-medium">{email.subject}</div>
      {/* <div className="text-xs text-zinc-500 line-clamp-2">
        {email.plainTextMessage}
      </div> */}
      {/* {email.threadCount > 1 && (
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <div className="h-4 w-4 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
            {email.threadCount}
          </div>
          <span>messages</span>
        </div>
      )} */}
    </div>
  );
}
