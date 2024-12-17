"use client";

import { ParsedEmail } from "@/lib/types/email";
import { removeNoreplyEmail } from "@/lib/utils";
import { User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export const MailList = ({ emails }: { emails: ParsedEmail[] }) => {
  const router = useRouter();
  const pathname = usePathname();

  const mailboxId = pathname.split("/")[2];

  const selectMailHandler = (id: string) => {
    router.push(`/mailbox/${mailboxId}/${id}`);
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="h-fit max-h-[12%] border-b">
        <h1 className="text-lg font-semibold p-2">Emails</h1>
      </div>
      <div className="max-h-full overflow-y-auto">
        {emails
          .sort(
            (a, b) =>
              new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
          )
          .map((email) => (
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
        <p className="p-2">Total emails: {emails.length}</p>
      </div>
    </div>
  );
};
