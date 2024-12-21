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

export const ImportEmails = ({
  integrationId,
  type,
  integrationProfiles,
}: {
  integrationId: string;
  type?: "nav" | "normal";
  integrationProfiles?: Record<string, string | number | boolean>;
}) => {
  const [importStatus, setImportStatus] = useState<{
    totalEmails: number;
    importedCount: number;
    isComplete: boolean;
    importCancelled?: boolean;
  }>({
    totalEmails: 0,
    importedCount: 0,
    isComplete: false,
    importCancelled: false,
  });
  const [stopped] = useState(false);

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

      if (!stopped) return importProgressEvent(); //pollImportProgress(Number(integrationId));
    } catch (error) {
      console.error("Failed to start Gmail import:", error);
    } finally {
      setImportLoading(false);
    }
  };

  const calculateProgress = () => {
    if (importStatus.totalEmails === 0) return 0;
    return Math.round(
      ((importStatus.importedCount + 1) / importStatus.totalEmails) * 100
    );
  };

  const importProgressEvent = () => {
    const eventSource = new EventSource(
      `/api/events/email-import?integrationId=${integrationId}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Data from event source: ", data);

      if (data.error) {
        console.error(data.error);
        eventSource.close();
      }

      if (data.isComplete) {
        setImportStatus({
          totalEmails: data.totalEmails,
          importedCount: data.importedCount,
          isComplete: data.isComplete,
          importCancelled: data.isCancelled,
        });
        console.log("Import complete!");
        eventSource.close();

        window.location.reload();
      } else {
        setImportStatus({
          totalEmails: data.totalEmails,
          importedCount: data.importedCount,
          isComplete: data.isComplete,
          importCancelled: data.isCancelled,
        });

        if (data.isCancelled) {
          console.log("Import cancelled! DATA : ", data);
          eventSource.close();
        }
      }
    };

    eventSource.onerror = () => {
      console.error("Failed to receive updates");
      eventSource.close();
    };
  };

  let init = false;
  useEffect(() => {
    if (type === "nav" && !init) {
      if (integrationProfiles?.isImportProcessing) {
        importProgressEvent();
      }
      init = true;
    }
  }, []);

  if (type === "nav") {
    if (importStatus.totalEmails === 0) return null;

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
                  {/* <Button
                    variant={"destructive"}
                    size={"sm"}
                    onClick={stopImport}
                    className="px-2 py-1 h-fit bg-red-100 hover:bg-red-200 text-red-500 rounded-lg font-semibold"
                  >
                    Stop
                  </Button> */}
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
                  Imported {importStatus.importedCount + 1} of{" "}
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
