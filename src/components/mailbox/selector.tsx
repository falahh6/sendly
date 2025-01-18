"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "../icons";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader, Plus } from "lucide-react";
import { useIntegrations } from "@/context/mailbox";

export const Selector = ({ integrationId }: { integrationId: number }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { setCurrentIntegration, integrations: integrationsCtx } =
    useIntegrations();

  useEffect(() => {
    if (integrationsCtx.length === 0) {
      return;
    }
    setCurrentIntegration(
      integrationsCtx.find((integration) => integration.id === integrationId)
    );
  }, [integrationsCtx]);

  const valChangeHandler = (val: string) => {
    if (val === "add-new") {
      startTransition(() => {
        router.push("/mailbox?m=add-new");
      });
      return;
    }
    setCurrentIntegration(
      integrationsCtx.find((integration) => integration.id === parseInt(val))
    );

    startTransition(() => {
      router.push("/mailbox/" + val);
    });
  };

  return (
    <>
      {integrationsCtx.length === 0 ? (
        <div className="h-12 w-52 border bg-gray-100 animate-pulse rounded-xl" />
      ) : (
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
            {integrationsCtx.map((integration) => (
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
            <SelectItem key={integrationsCtx.length} value="add-new">
              <div className="flex flex-row gap-2 w-full">
                <div className="bg-neutral-50 h-6 w-6 rounded-full p-1">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold">Add new</h4>
                  <p>Connect a new mailbox</p>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </>
  );
};
