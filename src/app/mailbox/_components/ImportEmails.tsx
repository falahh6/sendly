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
}: {
  integrationId: string;
  type?: "nav" | "normal";
}) => {
  const [importStatus, setImportStatus] = useState<{
    totalEmails: number;
    importedCount: number;
    isComplete: boolean;
  }>({
    totalEmails: 0,
    importedCount: 0,
    isComplete: false,
  });
  const [stopped, setStopped] = useState(false);

  const [importLoading, setImportLoading] = useState(false);

  const startImport = async () => {
    setImportLoading(true);
    try {
      const response = await fetch(
        `/api/integrations/mails/import?integrationId=${integrationId}`,
        { method: "GET" }
      );
      const { totalEmails } = await response.json();

      setImportStatus((prev) => ({
        ...prev,
        totalEmails,
      }));

      if (!stopped) return pollImportProgress(Number(integrationId));
    } catch (error) {
      console.error("Failed to start Gmail import:", error);
    } finally {
      setImportLoading(false);
    }
  };

  const pollImportProgress = async (id: number) => {
    try {
      const response = await fetch(`/api/integrations/mails/import`, {
        method: "POST",
        body: JSON.stringify({ integrationId: id }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { totalEmails, importedCount, isComplete } = await response.json();

      setImportStatus({
        totalEmails,
        importedCount,
        isComplete,
      });

      if (!isComplete && !totalEmails) {
        setTimeout(() => pollImportProgress(id), 3000);
      }
    } catch (error) {
      console.error("Failed to fetch import progress:", error);
    }
  };

  const calculateProgress = () => {
    if (importStatus.totalEmails === 0) return 0;
    return Math.round(
      (importStatus.importedCount / importStatus.totalEmails) * 100
    );
  };

  const stopImport = async () => {
    setStopped(true);
    try {
      await fetch(`/api/integrations/mails/import`, {
        method: "DELETE",
        body: JSON.stringify({ integrationId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setImportStatus((prev) => ({
        ...prev,
        isComplete: true,
      }));
    } catch (error) {
      console.error("Failed to stop Gmail import:", error);
    }
  };

  useEffect(() => {
    if (type === "nav") {
      pollImportProgress(Number(integrationId));
    }
  }, [integrationId]);

  if (type === "nav") {
    if (importStatus.isComplete) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant={"outline"}
            size={"sm"}
            className="rounded-xl bg-green-100 border-green-300 text-green-500 hover:bg-green-50 hover:text-green-500 "
          >
            Import Emails
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          className="w-80 p-4 mr-4 rounded-xl border text-sm"
        >
          <div className="space-y-2">
            <h3 className="text-sm mb-2">Import in progress</h3>
          </div>
          <div className="p-2 bg-neutral-100 w-full rounded-lg">
            <Progress value={calculateProgress()} />
            <div className="p-1 pt-2 flex flex-row justify-between">
              <p className="text-xs mt-2">
                Imported {importStatus.importedCount} of{" "}
                {importStatus.totalEmails}
              </p>
              <Button
                variant={"destructive"}
                size={"sm"}
                onClick={stopImport}
                className="px-2 py-1 text-xs h-fit bg-red-100 hover:bg-red-200 text-red-500 rounded-lg font-semibold"
              >
                Stop
              </Button>
            </div>
          </div>
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
            <div className="p-2 bg-neutral-100 w-full rounded-lg">
              <Progress value={calculateProgress()} />
              <div className="p-1 pt-2 flex flex-row justify-between">
                <p className="text-xs mt-2">
                  Imported {importStatus.importedCount} of{" "}
                  {importStatus.totalEmails}
                </p>
                <Button
                  variant={"destructive"}
                  size={"sm"}
                  onClick={stopImport}
                  className="px-2 py-1 h-fit bg-red-100 hover:bg-red-200 text-red-500 rounded-lg font-semibold"
                >
                  Stop
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size={"sm"}
              variant={"outline"}
              className="text-sm rounded-xl"
              onClick={startImport}
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
