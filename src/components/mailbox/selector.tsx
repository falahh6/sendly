"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "../icons";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export const Selector = ({
  integrationId,
  integrations,
}: {
  integrationId: number;
  integrations: Integration[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const valChangeHandler = (val: string) => {
    console.log("Selected Integration:", val);
    startTransition(() => {
      router.push("/mailbox/" + val);
    });
  };

  return (
    <>
      {integrations.length === 0 ? (
        <div className="h-12 w-52 border bg-gray-100 animate-pulse rounded-xl" />
      ) : (
        <>
          <Select
            value={integrationId.toString()}
            onValueChange={valChangeHandler}
          >
            <SelectTrigger className="text-left w-fit h-fit rounded-xl ring-0">
              {isPending ? (
                <div className="w-20 h-8 flex flex-row items-center justify-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                </div>
              ) : (
                <SelectValue
                  placeholder="Please select the value"
                  className="text-left"
                />
              )}
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {integrations.map((integration) => (
                <SelectItem
                  key={integration.id}
                  value={integration.id.toString()}
                  className="rounded-lg"
                >
                  <div className="flex flex-row gap-2 w-full">
                    <div className="bg-neutral-50 h-6 w-6 rounded-full p-1">
                      {integration.provider === "Google" && <Icons.google />}
                      {integration.provider === "Azure" && <Icons.outlook />}
                    </div>
                    <div className="text-xs">
                      <h4 className="font-bold">{integration.provider}</h4>
                      <p className="truncate">{integration.email}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </>
  );
};
