"use client";

import { useIntegrations } from "@/context/mailbox";
import { ParsedEmail } from "@/lib/types/email";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AtSign,
  CircleX,
  Download,
  Forward,
  ImageIcon,
  Link,
  MoreHorizontal,
  MoreVertical,
  MoveDiagonal,
  Plus,
  Reply,
  Send,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import {
  formatStringDate,
  emailStrParse,
  nameStrParse,
  isGmailEmail,
} from "@/lib/utils";
import DOMPurify from "dompurify";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const EmailView = ({ emailTheadId }: { emailTheadId: string }) => {
  const { integrations, currentIntegration } = useIntegrations();
  const [mail, setMail] = useState<ParsedEmail[]>([]);
  const router = useRouter();

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

  const closeEmailView = () => {
    router.push(`/mailbox/${currentIntegration?.id}`);
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex items-center justify-between border-b border-zinc-200 p-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-zinc-600"
            onClick={() => closeEmailView()}
          >
            <CircleX className="h-4 w-4" />
          </Button>
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
        {mail.map((email, index) => (
          <div key={email.id + index} className="p-2 space-y-2">
            <EmailHeader email={email} />
            <EmailBody email={email} />
            {email.attachments.length > 0 && <AttachmentsSection />}{" "}
          </div>
        ))}
      </ScrollArea>
      {mail[0] && (
        <div className="">
          <ReplyComposer email={mail[0]} />
        </div>
      )}
    </div>
  );
};

function EmailHeader({ email }: { email: ParsedEmail }) {
  return (
    <div className="p-3 flex flex-row items-center justify-between border-b border-gray-200">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src="https://api.dicebear.com/6.x/personas/svg?seed=km"
            alt="Kathryn Murphy"
          />
          <AvatarFallback>KM</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <h1 className="text-sm font-semibold">{nameStrParse(email.from)}</h1>
          <p className="text-xs text-zinc-500">
            {formatStringDate(email.date ?? "")}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs bg-white p-1 rounded-lg w-fit border border-zinc-200">
          <p className=""> To: {emailStrParse(email.to[0])}</p>
        </div>
      </div>
    </div>
  );
}

function EmailBody({ email }: { email: ParsedEmail }) {
  return (
    <div className="p-4 mt-0">
      <h2 className="text-lg font-semibold mb-4">{email.subject}</h2>
      <div className="space-y-4 h-full text-sm leading-relaxed text-zinc-700">
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
    </div>
  );
}

function AttachmentsSection({
  attachments = [],
}: {
  attachments?: {
    filename: string;
    mimeType: string;
    data: string | null;
  }[];
}) {
  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        Attachments <span className="text-zinc-500">(4 files)</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {attachments.map((attachment, i) => (
          <div key={attachment.filename + i} className="group relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden border border-zinc-200"></div>
            <div className="mt-2">
              <div className="flex items-center gap-1">
                <img
                  src="/placeholder.svg?height=16&width=16"
                  className="w-4 h-4"
                  alt="Figma icon"
                />
                <span className="text-sm font-medium">
                  {attachment.filename}
                </span>
              </div>
              <p className="text-xs text-zinc-500">{attachment.mimeType}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReplyComposer({ email }: { email: ParsedEmail }) {
  console.log("Email: ", email);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [replyToEmails, setReplyToEmails] = useState<string[]>([
    emailStrParse((email && email.from) ?? ""),
  ]);
  const [emailToInput, setEmailToInput] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const clearHandler = (email: string) => {
    if (replyToEmails.length === 1 && emailToInput.length === 0) return;
    setReplyToEmails((prev) => prev.filter((e) => e !== email));
  };

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [replyMessage]);

  return (
    <div className="border rounded-xl m-2 bg-white">
      <div className="p-2 space-y-2">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">To:</span>
            <div className="flex items-center gap-1">
              <div className="w-fit flex flex-row gap-1">
                {replyToEmails.map((email, i) => (
                  <span
                    key={i}
                    className="text-xs whitespace-nowrap text-blue-500 border border-blue-200 bg-blue-100 rounded-lg p-1 w-fit flex flex-row gap-1 items-center"
                  >
                    <p>{email}</p>
                    {i !== 0 && (
                      <button
                        onClick={() => clearHandler(email)}
                        className="p-0.5 hover:bg-blue-200 rounded-full hover:cursor-pointer"
                      >
                        <CircleX className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <Input
                ref={inputRef}
                value={emailToInput}
                aria-label={`Remove ${email}`}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmailToInput(value);
                  if (isGmailEmail(value)) {
                    setReplyToEmails((prev) => [...prev, value]);

                    setEmailToInput("");
                  }
                }}
                placeholder="Add more people"
                onKeyDown={(e) => {
                  console.log("Key: ", e.key);
                  if (e.key === "Backspace" && emailToInput === "") {
                    clearHandler(replyToEmails[replyToEmails.length - 1]);
                  }
                }}
                className="h-fit p-0 text-xs border-none ring-0 focus-visible:ring-0 shadow-none w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6">
              <MoveDiagonal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 hover:bg-red-100"
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        <div className="border-b" />
        <Textarea
          ref={textareaRef}
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Hey Kathryn,"
          className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 p-0 text-sm shadow-none mx-2 rounded-none"
        />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AtSign className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
