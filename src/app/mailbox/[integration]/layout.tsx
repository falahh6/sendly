import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { MailList } from "../_components/MailList";
import { redirect } from "next/navigation";
import { Integration } from "@/lib/types/integrations";
import Sidebar from "../_components/Sidebar";
import { ImportEmails } from "../_components/ImportEmails";

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
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen bg-zinc-50"
      >
        <ResizablePanel
          defaultSize={20}
          minSize={8}
          maxSize={25}
          className="min-w-[50px] border-r border-zinc-200"
        >
          <Sidebar isCollapsed={false} integrationId={params.integration} />
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-zinc-200" />
        <ResizablePanel
          defaultSize={30}
          minSize={25}
          maxSize={40}
          className="border-r border-zinc-200"
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
        <ResizableHandle withHandle className="bg-zinc-200" />
        <ResizablePanel defaultSize={50} minSize={30}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default MailboxLayout;
