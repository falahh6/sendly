"use client";

import { ParsedEmail } from "@/lib/types/email";
import { removeNoreplyEmail } from "@/lib/utils";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { MailFilter } from "./MailFIlter";
import { usePathname, useRouter } from "next/navigation";

export const MailList = () => {
  const { data: sessionData, status } = useSession();
  const [emails, setEmails] = useState<ParsedEmail[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  const mailboxId = pathname.split("/")[2];

  useEffect(() => {
    const fetchEmails = async () => {
      const response = await fetch("/api/integrations/mails?integration_id=5", {
        headers: {
          auth: `${sessionData?.accessToken}`,
        },
        method: "GET",
      });

      const data = await response.json();
      console.log(data);
      setEmails(data);
    };

    if (status === "authenticated") {
      fetchEmails();
    }
  }, [status]);

  const selectMailHandler = (id: string) => {
    router.push(`/mailbox/${mailboxId}/${id}`);
  };

  return (
    <div className="">
      <div className="p-4 border-b flex flex-col ">
        <h1 className="text-lg font-semibold mb-2">Emails</h1>
        <MailFilter />
      </div>
      {emails.map((email) => (
        <div
          key={email.id}
          className="text-sm border-b w-full p-2 hover:bg-gray-100 hover:cursor-pointer"
          onClick={() => selectMailHandler(email.id)}
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
  );
};
