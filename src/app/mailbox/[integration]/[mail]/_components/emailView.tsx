"use client";

import { useIntegrations } from "@/context/mailbox";
import { ParsedEmail } from "@/lib/types/email";
import { Fragment, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Download, Forward, MoreVertical, Reply } from "lucide-react";
import { formatStringDate } from "@/lib/utils";
import DOMPurify from "dompurify";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export const EmailView = ({ emailTheadId }: { emailTheadId: string }) => {
  const { integrations, currentIntegration } = useIntegrations();
  const [mail, setMail] = useState<ParsedEmail[]>([]);

  useEffect(() => {
    const integration = integrations.find(
      (i) => i.id == currentIntegration?.id
    );
    console.log("Integration: ", integration);
    if (integration?.mails) {
      const selectedMail = integration.mails?.filter(
        (mail) => mail.threadId == emailTheadId
      );
      setMail(selectedMail);
    }
  }, [integrations]);

  useEffect(() => {
    const integration = integrations.find(
      (i) => i.id == currentIntegration?.id
    );
    const selectedMail =
      integration &&
      integration.mails?.filter((mail) => mail.threadId == emailTheadId);
    console.log("Selected Mail: ", selectedMail);
    setMail(selectedMail || []);
  }, [emailTheadId]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-zinc-600"
          >
            <Reply className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-zinc-600"
          >
            <Forward className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-zinc-600"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-zinc-600"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          <EmailThread mail={mail} />
        </div>
      </ScrollArea>
    </div>
  );
};

function EmailThread({ mail }: { mail: ParsedEmail[] }) {
  return (
    <div className="space-y-6">
      {mail.map((email, index) => (
        <Fragment key={email.id}>
          {index > 0 && <Separator className="my-6" />}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{email.subject}</h2>
              <div className="text-sm text-zinc-500">
                {formatStringDate(email.date ?? "")}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <div>From: {email.from}</div>
              <Separator orientation="vertical" className="h-4" />
              <div>To: {email.to}</div>
            </div>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
            {email.htmlMessage ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(email?.htmlMessage || ""),
                }}
                className="prose prose-sm max-w-none overflow-y-auto"
              />
            ) : (
              <div>{email?.plainTextMessage ?? email?.snippet}</div>
            )}
          </div>
          {email.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Attachments</h3>
              <div className="flex gap-4">
                {email.attachments.map((attachment, i) => (
                  <AttachmentCard
                    key={attachment.filename ?? "File" + i}
                    {...attachment}
                  />
                ))}
              </div>
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function AttachmentCard({
  filename,
  mimeType,
}: // data,
{
  filename: string;
  // data: string | null;
  mimeType: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-3 text-sm hover:bg-zinc-50 transition-colors">
      <div className="font-medium">{filename}</div>
      <div className="text-zinc-500">{mimeType}</div>
    </div>
  );
}
