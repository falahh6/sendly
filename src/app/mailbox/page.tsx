"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIntegrations } from "@/context/mailbox";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AddNewIntegration } from "./_components/addNewIntegration";

const Page = () => {
  const { integrations, isLoading } = useIntegrations();
  const [selectedIntegration, setSelectedIntegration] = useState<
    string | null
  >();
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("m");

  useEffect(() => {
    if (!isLoading && integrations.length > 0) {
      setSelectedIntegration(integrations[0].id);
    }
  }, [isLoading]);

  return (
    <div className="flex items-center justify-center h-screen text-neutral-600">
      {mode !== "add-new" ? (
        <div className="text-center">
          <h1 className="text-sm font-normal text-left">Select your mailbox</h1>
          <div className="mt-2 flex flex-row gap-2 items-center">
            {isLoading ? (
              <div className="h-12 w-52 border bg-gray-100 animate-pulse rounded-xl" />
            ) : (
              <Select
                onValueChange={(val) => {
                  console.log(val);

                  if (val === "add-new") {
                    router.push("/mailbox?m=add-new");
                  } else {
                    setSelectedIntegration(val);
                  }
                }}
                defaultValue={integrations[0]?.id}
                value={selectedIntegration ?? integrations[0]?.id}
              >
                <SelectTrigger className="text-left w-fit h-fit rounded-xl ring-0">
                  <SelectValue
                    placeholder="Select your Integration"
                    className="text-left"
                  />
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
                          {integration.provider === "Google" && (
                            <Icons.google />
                          )}
                          {integration.provider === "Azure" && (
                            <Icons.outlook />
                          )}
                        </div>
                        <div className="text-xs">
                          <h4 className="font-bold">{integration.provider}</h4>
                          <p>{integration.email}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem key={integrations.length} value="add-new">
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

            <div>
              <Button
                variant={"outline"}
                className="p-2 rounded-xl bg-gray-50"
                asChild={!isLoading}
                disabled={isLoading}
              >
                <Link href={`/mailbox/${selectedIntegration}`}>
                  {" "}
                  <ChevronRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <AddNewIntegration />
      )}
    </div>
  );
};

export default Page;