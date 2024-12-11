import { Selector } from "@/components/mailbox/selector";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MailList } from "../_components/MailList";

const MailboxLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
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
            <MailList />
          </ResizablePanel>
          <ResizableHandle className="bg-transparent dark:bg-transparent" />
          {children}
        </ResizablePanelGroup>
      </div>
    </>
  );
};

export default MailboxLayout;
