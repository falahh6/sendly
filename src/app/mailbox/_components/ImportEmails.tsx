"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pusherClient } from "@/lib/pusher";
import { ParsedEmail } from "@/lib/types/email";
import { ablyClient } from "@/lib/ably";

export const ImportEmails = ({
  integrationId,
  emails,
  type,
  integrationProfiles,
}: {
  integrationId: string;
  emails: ParsedEmail[];
  type?: "nav" | "normal";
  integrationProfiles?: Record<string, string | number | boolean>;
}) => {
  const [importStatus, setImportStatus] = useState<{
    totalEmails: number;
    importedCount: number;
    isComplete: boolean;
    importCancelled?: boolean;
  }>({
    totalEmails: (integrationProfiles?.totalEmails as number) || 0,
    importedCount: (integrationProfiles?.emailImportedCount as number) || 0,
    isComplete: false,
    importCancelled: false,
  });

  const [importLoading, setImportLoading] = useState(false);

  const startImport = async (startImport?: boolean) => {
    setImportLoading(true);
    try {
      const response = await fetch(
        `/api/integrations/mails/import?integrationId=${integrationId}&startImport=${startImport}`,
        { method: "GET" }
      );
      const { totalEmails } = await response.json();

      setImportStatus((prev) => ({
        ...prev,
        totalEmails,
      }));
    } catch (error) {
      console.error("Failed to start Gmail import:", error);
    } finally {
      setImportLoading(false);
    }
  };

  const calculateProgress = () => {
    if (importStatus.totalEmails === 0) return 0;
    return Math.round(
      (importStatus.importedCount / importStatus.totalEmails) * 100
    );
  };

  let init = false;

  const gmailChannel = ablyClient(`gmail-channel-${integrationId}`);

  useEffect(() => {
    console.log("Integration profiles: ", integrationProfiles);
    if (!init) {
      if (
        integrationProfiles?.isImportProcessing ||
        (!integrationProfiles?.isImportCancelled &&
          !integrationProfiles?.importComplete)
      ) {
        console.log(gmailChannel);

        gmailChannel.subscribe("mail-import", (message) => {
          const data = message.data as
            | {
                body: {
                  totalEmails: number;
                  importedEmailCount: number;
                  importComplete: boolean;
                };
                message: string;
              }
            | {
                message: string;
              };
          console.log("Import data: ", data);
          if ("body" in data) {
            if (
              (data.body.totalEmails === data.body.importedEmailCount ||
                data.body.importComplete) &&
              type !== "nav"
            ) {
              window.location.reload();
            }
            setImportStatus((prev) => ({
              ...prev,
              totalEmails: data.body.totalEmails,
              importedCount: data.body.importedEmailCount,
              isComplete: data.body.importComplete,
            }));
          }

          if ("body" in data && data.body.importComplete && type !== "nav") {
            window.location.reload();
            gmailChannel.unsubscribe("mail-import");
            pusherClient.unsubscribe(`gmail-channel-${integrationId}`);
          }
        });

        return () => {
          gmailChannel.unsubscribe("mail-import");
          pusherClient.unsubscribe(`gmail-channel-${integrationId}`);
        };
      }
      init = true;
    }
  }, []);

  if (type === "nav") {
    if (!integrationProfiles?.isImportProcessing || emails.length === 0)
      return <></>;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant={"outline"}
            size={"sm"}
            className="rounded-xl bg-green-100 border-green-300 text-green-500 hover:bg-green-50 hover:text-green-500 "
          >
            Email imports
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          className="w-80 p-4 mr-4 rounded-xl border text-sm"
        >
          {importStatus.importCancelled ? (
            <div className="space-y-2">
              <h3 className="text-sm mb-2">Import Cancelled</h3>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-sm mb-2">Import in progress</h3>
              </div>
              <div className="p-2 bg-neutral-100 w-full rounded-lg text-xs font-[550]">
                <div className="py-2 flex flex-row justify-between ">
                  <p>Progress</p>
                  <p>{calculateProgress()}%</p>
                </div>
                <Progress value={calculateProgress()} />
                <div className="pt-2 flex flex-row justify-between">
                  <p className=" mt-2">
                    Imported {importStatus.importedCount} of{" "}
                    {importStatus.totalEmails}
                  </p>
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="h-full text-gray-600 w-full flex justify-center items-center">
      <div className="space-y-3">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Import your emails</h3>
          <p className="text-sm">
            This action with import your previous emails from original provider
            to our db.
          </p>
        </div>
        <div>{JSON.stringify(integrationProfiles)}</div>
        <div className="mt-2 flex flex-row gap-2 items-center w-full">
          {importStatus.totalEmails !== 0 && !importStatus.isComplete ? (
            <div className="p-2 px-4 bg-neutral-100 w-full rounded-lg text-xs font-[550]">
              <div className="py-2 flex flex-row justify-between ">
                <p>Progress</p>
                <p>{calculateProgress()}%</p>
              </div>
              <Progress value={calculateProgress()} />
              <div className="pt-2 flex flex-row justify-between">
                <p className=" mt-2">
                  Imported {importStatus.importedCount} of{" "}
                  {importStatus.totalEmails}
                </p>
              </div>
            </div>
          ) : (
            <Button
              size={"sm"}
              variant={"outline"}
              className="text-sm rounded-xl"
              onClick={() => startImport(true)}
              disabled={importLoading}
            >
              {importLoading && <Loader className="h-4 w-4 animate-spin" />}{" "}
              Import
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
