"use client";

import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { EmailView } from "./_components/emailView";

const Page = ({
  params,
}: {
  params: {
    mail: string;
  };
}) => {
  return (
    <>
      <ResizableHandle className="bg-zinc-200" />
      <ResizablePanel defaultSize={60} minSize={60}>
        <EmailView emailTheadId={params.mail} />
      </ResizablePanel>
    </>
  );
};

export default Page;
