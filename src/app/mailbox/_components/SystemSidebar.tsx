"use client";

import { UserProfile } from "@/components/auth/UserProfile";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useIntegrations } from "@/context/mailbox";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

const SystemSidebar = ({
  integrationId,
  user,
}: {
  integrationId: string;
  user: {
    id: number;
    name: string;
    email?: string;
    image?: string;
  };
}) => {
  const { integrations, currentIntegration, setCurrentIntegration } =
    useIntegrations();
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (integrations.length === 0) {
      return;
    }
    setCurrentIntegration(
      integrations.find(
        (integration) => integration.id === parseInt(integrationId)
      )
    );
  }, [integrations]);

  const valChangeHandler = (val: string) => {
    if (val === "add-new") {
      startTransition(() => {
        router.push("/mailbox?m=add-new");
      });
      return;
    }
    setCurrentIntegration(
      integrations.find((integration) => integration.id === parseInt(val))
    );

    startTransition(() => {
      router.push("/mailbox/" + val);
    });
  };

  return (
    <div className="flex h-full flex-col items-center bg-white">
      <div className="p-4 space-y-4 border-zinc-200">
        <Link href="/mailbox" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg  flex items-center justify-center">
            <Image src="/logo.svg" alt="Sendly" width={28} height={28} />
          </div>
        </Link>
      </div>
      <div className="rounded-md p-4 flex flex-col gap-3 items-center justify-between h-full">
        <div className="flex flex-col gap-3 items-center">
          {integrations.map((integration, i) => (
            <Button
              variant={
                currentIntegration?.id === integration.id ? "outline" : "ghost"
              }
              onClick={() => valChangeHandler(integration.id.toString())}
              key={i}
            >
              {integration.provider === "Google" && <Icons.google />}
              {integration.provider === "Azure" && <Icons.outlook />}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => valChangeHandler("add-new")}
            className="p-2 rounded-lg border-none shadow-none"
          >
            <div className="h-6 w-6 rounded-full p-1">
              <Plus />
            </div>
          </Button>
        </div>
        <div className="py-4">
          <UserProfile user={user} />
        </div>
      </div>
    </div>
  );
};

export default SystemSidebar;
