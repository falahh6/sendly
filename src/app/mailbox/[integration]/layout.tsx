import { Selector } from "@/components/mailbox/selector";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { MailList } from "../_components/MailList";
import { ImportEmails } from "../_components/ImportEmails";
import React from "react";
import { redirect } from "next/navigation";
import { Integration } from "@/lib/types/integrations";
import Link from "next/link";
import SideBar from "../_components/Sidebar";

const getIntegrations = async (authToken: string) => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_SITE_URL + "/api/integrations",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        auth: authToken,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error fetching integrations:", error);
    return null;
  }

  const data = await response.json();
  return data.integrations || [];
};

const MailboxLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { integration: string };
}) => {
  const session = await getServerSession(authOptions);
  const integrationsData = await getIntegrations(session?.accessToken ?? "");

  const integrationData = integrationsData?.find(
    (i: Integration) => i.id == Number(params.integration)
  );

  if (integrationsData?.length === 0) {
    redirect("/mailbox/?m=add-new");
  }

  console.log("Integrations -> : ", integrationsData);

  if (
    integrationsData?.find(
      (i: Integration) => i.id == Number(params.integration)
    ) === undefined
  ) {
    return "INVALID INTEGRATION, Please check if you have correct ID ";
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between p-2 h-[8vh] w-full">
        <div>
          <Link href={"/"}>logo</Link>
        </div>
        <div className="bg-gray-100 w-[40%] border text-center rounded-md p-2 flex flex-row items-center justify-center">
          Search or Quick actions
        </div>
        <div></div>
      </div>
      <div className=" w-full">
        <div className="flex flex-row items-center justify-between h-[10vh] rounded-lg w-full">
          <div>
            <Selector
              integrationId={Number(params.integration)}
              key={params.integration}
            />
          </div>
          <div>
            <ImportEmails
              integrationId={params.integration}
              type="nav"
              integrationProfiles={
                integrationsData?.find(
                  (i: Integration) => i.id == Number(params.integration)
                )?.profile
              }
            />
          </div>
        </div>
        <div className="h-[78vh] w-full">
          <ResizablePanelGroup direction="horizontal" className="space-x-1">
            <ResizablePanel
              className="p-4 bg-neutral-50 rounded-lg border"
              defaultSize={5}
              minSize={5}
              maxSize={5}
            >
              <SideBar />
            </ResizablePanel>
            <ResizableHandle className="bg-transparent dark:bg-transparent" />
            <ResizablePanel
              className="bg-white rounded-lg border"
              defaultSize={85}
              minSize={30}
              maxSize={45}
            >
              {integrationData.profile.importComplete ? (
                <MailList
                  userSession={session}
                  integrationId={params.integration}
                />
              ) : (
                <ImportEmails
                  integrationId={params.integration}
                  integrationProfiles={
                    integrationsData?.find(
                      (i: Integration) => i.id == Number(params.integration)
                    )?.profile
                  }
                />
              )}
            </ResizablePanel>
            <ResizableHandle className="bg-transparent dark:bg-transparent" />
            {children}
          </ResizablePanelGroup>
        </div>
      </div>
    </>
  );
};

export default MailboxLayout;
