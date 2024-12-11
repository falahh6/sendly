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

  const valChangeHandler = (val: string) => {
    console.log("Selected Integration : ", val);
  };

  return (
    <>
      {isLoading ? (
        <div className="h-12 w-52 border bg-gray-100 animate-pulse rounded-xl"></div>
      ) : (
        <Select onValueChange={valChangeHandler} value={integrations[0]?.id}>
          <SelectTrigger className="text-left w-fit h-fit rounded-xl ring-0">
            <SelectValue placeholder="one" className="text-left" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {integrations.map((integration) => (
              <SelectItem
                key={integration.id}
                value={integration.id}
                className="rounded-lg"
              >
                <div className="flex flex-row gap-2 w-full">
                  <div className="bg-neutral-50 h-6 w-6 rounded-full p-1">
                    {integration.provider === "Google" && <Icons.google />}
                    {integration.provider === "Outlook" && <Icons.outlook />}
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
