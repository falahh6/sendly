import { Selector } from "@/components/mailbox/selector";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

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

  return (
    <>
      <div className="flex flex-row items-center justify-between p-2 h-[8vh] w-full">
        <div>logo</div>
        <div className="bg-gray-100 w-[40%] border text-center rounded-md p-2 flex flex-row items-center justify-center">
          Search or Quick actions
        </div>
        <div>profile </div>
      </div>
      <div className="flex flex-row items-center justify-between h-[7vh] rounded-lg w-full">
        <div>
          <Selector
            integrationId={Number(params.integration)}
            integrations={integrationsData}
            key={params.integration}
          />
        </div>
        <div>Mail, compose tools</div>
      </div>
      <div className="h-[80vh] w-full">
        <ResizablePanelGroup direction="horizontal" className="space-x-1">
          <ResizablePanel
            className="p-4 bg-neutral-50 rounded-lg border"
            defaultSize={15}
            minSize={5}
            maxSize={15}
          >
            Tools . sidebar
          </ResizablePanel>
          <ResizableHandle className="bg-transparent dark:bg-transparent" />
          <ResizablePanel
            className="bg-white rounded-lg border"
            defaultSize={30}
            minSize={30}
          >
            {/* <MailList /> */}
          </ResizablePanel>
          <ResizableHandle className="bg-transparent dark:bg-transparent" />
          {children}
        </ResizablePanelGroup>
      </div>
    </>
  );
};

export default MailboxLayout;
