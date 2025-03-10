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
import MailBoxSidebar from "../_components/MailboxSidebar";
import { ImportEmails } from "../_components/ImportEmails";
import AggMails from "../_components/AggMails";
import SystemSidebar from "../_components/SystemSidebar";
import { cn } from "@/lib/utils";

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
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen bg-zinc-50"
    >
      <ResizablePanel
        defaultSize={6}
        minSize={6}
        maxSize={6}
        className="min-w-[50px] border-r border-zinc-200"
      >
        {session?.user && (
          <SystemSidebar
            integrationId={params.integration}
            user={
              session.user as {
                id: number;
                name: string;
                email?: string;
                image?: string;
              }
            }
          />
        )}
      </ResizablePanel>
      <ResizableHandle className="bg-zinc-200" />
      <ResizablePanel
        defaultSize={18}
        maxSize={18}
        minSize={18}
        className="min-w-[50px] border-r border-zinc-200"
      >
        <MailBoxSidebar
          isCollapsed={false}
          integrationId={params.integration}
          user={{
            id: session?.user.id ?? 0,
            name: session?.user.name ?? "",
            email: session?.user.email ?? "",
            image: session?.user.image ?? "",
          }}
        />
      </ResizablePanel>
      <ResizableHandle className="bg-zinc-200" />
      <ResizablePanel defaultSize={76} minSize={76}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40} minSize={40}>
            <div className="h-screen">
              {integrationData.profile.importComplete && (
                <div className="h-[12vh]">
                  <AggMails />
                </div>
              )}
              <div
                className={cn(
                  "h-screen bg-white",
                  integrationData.profile.importComplete && "h-[88vh]"
                )}
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
              </div>
            </div>
          </ResizablePanel>
          {children}
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default MailboxLayout;
