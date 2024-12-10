import { Selector } from "@/components/mailbox/selector";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MailboxProvider } from "@/context/mailbox";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";

const MailboxLayout = async () => {
  const data = await getServerSession(authOptions);

  return (
    <MailboxProvider userSessionData={data}>
      <main className="w-full bg-white flex flex-row justify-center items-center text-sm md:text-base">
        <div className="w-full p-4 max-w-[1440px] h-screen space-y-3 flex flex-col items-center justify-center">
          <div className="flex flex-row justify-between items-center p-2 h-[8vh] w-full">
            <div>logo</div>
            <div className="bg-gray-100 w-[40%] border text-center rounded-md p-2 flex flex-row items-center justify-center">
              Search or Quick actions
            </div>
            <div>profile </div>
          </div>
          <div className="flex flex-row items-center justify-between h-[7vh] rounded-lg w-full">
            <div>
              <Selector />
            </div>
            <div>Mail, compose tools</div>
          </div>
          <div className="h-[80vh] w-full">
            <ResizablePanelGroup direction="horizontal" className="space-x-1">
              <ResizablePanel
                className="p-4 bg-neutral-50 rounded-lg border"
                defaultSize={15}
                minSize={5}
              >
                Tools . sidebar
              </ResizablePanel>
              <ResizableHandle className="bg-transparent dark:bg-transparen" />
              <ResizablePanel
                className="p-4 bg-neutral-200 rounded-lg border"
                defaultSize={30}
                minSize={30}
              >
                Message . list
              </ResizablePanel>
              <ResizableHandle className="bg-transparent dark:bg-transparen" />
              <ResizablePanel
                className="p-4 bg-neutral-300 rounded-lg border border-gray-400"
                defaultSize={55}
                minSize={45}
              >
                Message . view
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </main>
    </MailboxProvider>
  );
};

export default MailboxLayout;
