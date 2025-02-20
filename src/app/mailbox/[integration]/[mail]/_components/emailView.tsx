"use client";

import { useIntegrations } from "@/context/mailbox";
import { ParsedEmail } from "@/lib/types/email";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Archive,
  AtSign,
  ChevronDown,
  CircleX,
  Clock,
  Ellipsis,
  Forward,
  ImageIcon,
  Link,
  MoreHorizontal,
  MoveDiagonal,
  OctagonAlert,
  Plus,
  Reply,
  Send,
  Smile,
  Square,
  Trash,
  X,
} from "lucide-react";
import {
  formatStringDate,
  emailStrParse,
  nameStrParse,
  isGmailEmail,
  decodeHTML,
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

  const [repliesBodyCollapsed, setRepliesBodyCollapsed] = useState<string[]>([
    mail[mail.length - 1]?.id ?? "",
  ]);

  const handleRepliesBodyCollapse = (id: string) => {
    if (repliesBodyCollapsed.includes(id)) {
      setRepliesBodyCollapsed((prev) => prev.filter((i) => i !== id));
    } else {
      setRepliesBodyCollapsed((prev) => [...prev, id]);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 relative">
      <div className="flex items-center justify-between border-zinc-200 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-100"
            onClick={() => closeEmailView()}
          >
            <CircleX className="h-4 w-4" />
          </Button>
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
            <OctagonAlert className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-zinc-600"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-zinc-600"
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-zinc-600"
          >
            <Ellipsis className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <div className="bg-white px-2 py-1 rounded-xl text-xs text-zinc-500 border flex flex-row gap-1 items-center">
            <span> 2 People</span> <ChevronDown className="h-3 w-3 " />
          </div>
          <div className="bg-purple-200 px-2 py-1 rounded-xl text-xs text-zinc-500 border  flex flex-row gap-1 items-center">
            <Square strokeWidth="4" color="#a855f7" className="h-3 w-3" />
            <span>Work</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        {mail.map((email, index) => (
          <div key={email.id + index} className="p-2 px-4">
            <EmailHeader
              email={email}
              mailboxEmail={currentIntegration?.email ?? ""}
              handleRepliesBodyCollapse={
                index !== mail.length - 1 ? handleRepliesBodyCollapse : () => {}
              }
            />
            {index !== mail.length - 1 &&
              repliesBodyCollapsed.includes(email.id) && (
                <EmailBody email={email} />
              )}
            {index === mail.length - 1 && <EmailBody email={email} />}{" "}
            {/* Always show last email body */}
            {email.attachments.length > 0 && <AttachmentsSection />}
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

function EmailHeader({
  email,
  mailboxEmail,
  handleRepliesBodyCollapse,
}: {
  email: ParsedEmail;
  mailboxEmail: string;
  handleRepliesBodyCollapse: (id: string) => void;
}) {
  return (
    <div
      onClick={() =>
        handleRepliesBodyCollapse && handleRepliesBodyCollapse(email.id)
      }
      className="p-3 px-4 flex flex-row items-center justify-between border-b border-gray-200 hover:bg-gray-100 hover:cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src="https://api.dicebear.com/6.x/personas/svg?seed=km"
            alt="Kathryn Murphy"
          />
          <AvatarFallback>KM</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="text-sm font-medium">
            {nameStrParse(email.from)}{" "}
            <span className="ml-2 text-gray-400 text-xs">
              {emailStrParse(email.from)}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 text-xs">
            <div>
              <p className="">
                <span className=" text-gray-400">To : </span>{" "}
                {emailStrParse(email.to[0]) === mailboxEmail
                  ? "You"
                  : emailStrParse(email.to[0])}
              </p>
            </div>
            <p className="text-xs text-zinc-500">
              {formatStringDate(email.date ?? "")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailBody({ email }: { email: ParsedEmail }) {
  return (
    <>
      <div className="p-4 mt-0">
        <div className="space-y-4 h-full text-sm leading-relaxed text-zinc-700">
          {email.htmlMessage ? (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(email?.htmlMessage || ""),
              }}
              className="prose prose-sm max-w-none overflow-auto"
            />
          ) : (
            <p className="whitespace-pre-line">
              {decodeHTML(email?.plainTextMessage ?? email?.snippet)}
            </p>
          )}
        </div>
      </div>
    </>
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
        Attachments{" "}
        <span className="text-zinc-500">
          ({attachments.length} {attachments.length > 1 ? "files" : "file"})
        </span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {attachments.map((attachment, i) => (
          <div key={attachment.filename + i} className="group relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden border border-zinc-200"></div>
            <div className="mt-2">
              <div className="flex items-center gap-1">
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
  const [collapsed, setCollapsed] = useState(true);

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
    <div className="">
      {!collapsed ? (
        <div className="p-2 space-y-2 border rounded-xl m-2 bg-white">
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
                          className="p-0.5 group-hover:bg-blue-200 rounded-full hover:cursor-pointer"
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
                onClick={() => setCollapsed(true)}
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-full">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 flex flex-row gap-2  items-center">
          <Button
            onClick={() => setCollapsed(false)}
            className="bg-indigo-400 hover:bg-indigo-500 rounded-full"
          >
            <Reply className="h-4 w-4 mr-1" />
            Reply
          </Button>
          <Button
            variant={"outline"}
            className="rounded-full text-indigo-500 hover:text-indigo-500 hover:bg-indigo-100 border-indigo-400 "
          >
            <Forward className="h-4 w-4 mr-1" />
            Forward
          </Button>
        </div>
      )}
    </div>
  );
}
