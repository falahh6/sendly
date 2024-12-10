"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIntegrations } from "@/context/mailbox";
import { Icons } from "../icons";

export const Selector = () => {
  const { integrations, isLoading } = useIntegrations();

  return (
    <>
      {isLoading ? (
        <div className="h-12 w-52 border bg-gray-100 animate-pulse rounded-xl"></div>
      ) : (
        <Select value={integrations[0].id}>
          <SelectTrigger className="text-left w-fit h-fit rounded-xl ring-0">
            <SelectValue placeholder="one" className="text-left" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {integrations.map((integration, idx) => (
              <SelectItem key={idx} value={integration.id}>
                <div className="flex flex-row gap-2 w-full">
                  <div className="bg-neutral-50 h-6 w-6 rounded-full p-1">
                    {integration.provider === "Google" && (
                      <Icons.google className="" />
                    )}
                    {integration.provider === "Outlook" && (
                      <Icons.outlook className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-xs">
                    <h4 className="font-bold">{integration.provider}</h4>
                    <p>{integration.email}</p>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  );
};
