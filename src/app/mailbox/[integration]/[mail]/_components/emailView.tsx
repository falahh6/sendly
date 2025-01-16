"use client";

import { useIntegrations } from "@/context/mailbox";
import { ParsedEmail } from "@/lib/types/email";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatStringDate } from "@/lib/utils";
import DOMPurify from "dompurify";
import { useRouter } from "next/navigation";

export const EmailView = ({ emailId }: { emailId: string }) => {
  const { integrations, currentIntegration } = useIntegrations();
  const [mail, setMail] = useState<ParsedEmail>();
  const router = useRouter();

  useEffect(() => {
    const integration = integrations.find(
      (i) => i.id == currentIntegration?.id
    );
    console.log("Integration: ", integration);
    if (integration?.mails) {
      const selectedMail = integration.mails?.find(
        (mail) => mail.id == emailId
      );
      setMail(selectedMail);
    }
  }, [integrations]);

  useEffect(() => {
    const integration = integrations.find(
      (i) => i.id == currentIntegration?.id
    );
    const selectedMail =
      integration && integration.mails?.find((mail) => mail.id == emailId);
    console.log("Selected Mail: ", selectedMail);
    setMail(selectedMail);
  }, [emailId]);

  return (
    <div className="h-full w-full overflow-y-auto">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-row items-center space-x-4">
            <Button
              size={"icon"}
              className="rounded-xl"
              variant={"secondary"}
              onClick={() => {
                router.push("/mailbox/" + currentIntegration?.id);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-sm font-semibold">From : {mail?.from}</h2>
              <p className="text-sm text-muted-foreground">To : {mail?.to}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">{mail?.subject}</h3>
              <p className="text-sm text-muted-foreground">
                {formatStringDate(mail?.date ?? "")}
              </p>
            </div>
            {mail?.htmlMessage ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(mail?.htmlMessage || ""),
                }}
                className="prose prose-sm max-w-none overflow-y-auto"
              />
            ) : (
              <div>{mail?.plainTextMessage ?? mail?.snippet}</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div> */}
          {/* <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Previous email</span>
            </Button>
            <Button variant="outline" size="icon">
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Next email</span>
            </Button>
          </div> */}
        </CardFooter>
      </Card>
    </div>
  );
};
