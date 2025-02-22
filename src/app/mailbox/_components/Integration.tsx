"use client";

import { Icons } from "../../../components/icons";
import { Ellipsis } from "lucide-react";
import { useIntegrations } from "@/context/mailbox";
import { Button } from "@/components/ui/button";

export const Integration = () => {
  const { currentIntegration } = useIntegrations();

  return (
    <>
      {!currentIntegration ? (
        <div className="h-16 w-full border bg-gray-100 animate-pulse r" />
      ) : (
        <div className="w-full bg-white shadow-lg shadow-gray-200">
          {currentIntegration && (
            <div className="flex flex-row gap-2 w-full border-b p-4 pr-2 justify-between items-center">
              <div className="flex flex-row gap-2">
                <div className="bg-neutral-50 h-6 w-6 rounded-full p-1">
                  {currentIntegration.provider === "Google" && <Icons.google />}
                  {currentIntegration.provider === "Azure" && <Icons.outlook />}
                </div>
                <div className="text-xs">
                  <h4 className="font-bold">{currentIntegration.provider}</h4>
                  <p className="truncate">{currentIntegration.email}</p>
                </div>
              </div>
              <Button variant="ghost" className="text-xs">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
