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

const fetchEmails = async (authToken: string, integrationId: string) => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_SITE_URL +
      `/api/integrations/mails?integration_id=${integrationId}`,
    {
      headers: {
        auth: `${authToken}`,
      },
      method: "GET",
    }
  );

  const data = await response.json();
  return data.mails;
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

  if (integrationsData?.length === 0) {
    redirect("/mailbox/?m=add-new");
  }

  console.log("Integrations : ", integrationsData);

  if (
    integrationsData?.find((i: Integration) => i.id == params.integration) ===
    undefined
  ) {
    return "INVALID INTEGRATION, Please check if you have correct ID ";
  }

  const emails = await fetchEmails(
    session?.accessToken ?? "",
    params.integration
  );

  return (
    <>
      <div className="flex flex-row items-center justify-between p-2 h-[8vh] w-full">
        <div>logo</div>
        <div className="bg-gray-100 w-[40%] border text-center rounded-md p-2 flex flex-row items-center justify-center">
          Search or Quick actions
        </div>
        <div></div>
      </div>
      <div className="flex flex-row items-center justify-between h-[7vh] rounded-lg w-full">
        <div>
          <Selector
            integrationId={Number(params.integration)}
            integrations={integrationsData}
            key={params.integration}
          />
        </div>
        <div>
          <ImportEmails
            integrationId={params.integration}
            type="nav"
            integrationProfiles={
              integrationsData?.find(
                (i: Integration) => i.id == params.integration
              )?.profile
            }
          />
        </div>
      </div>
      <div className="h-[78vh] w-full">
        <ResizablePanelGroup direction="horizontal" className="space-x-1">
          {/* <ResizablePanel
            className="p-4 bg-neutral-50 rounded-lg border"
            defaultSize={15}
            minSize={5}
            maxSize={15}
          >
            Tools . sidebar
          </ResizablePanel> */}
          <ResizableHandle className="bg-transparent dark:bg-transparent" />
          <ResizablePanel
            className="bg-white rounded-lg border"
            defaultSize={85}
            minSize={30}
          >
            {emails?.length > 0 ? (
              <MailList emails={emails} />
            ) : (
              <ImportEmails integrationId={params.integration} />
            )}
          </ResizablePanel>
          <ResizableHandle className="bg-transparent dark:bg-transparent" />
          {children}
        </ResizablePanelGroup>
      </div>
    </>
  );
};

export default MailboxLayout;
