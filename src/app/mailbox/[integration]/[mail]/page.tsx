import { ResizablePanel } from "@/components/ui/resizable";
import { EmailView } from "./_components/emailView";

const Page = ({
  params,
}: {
  params: {
    mail: string;
  };
}) => {
  return (
    <ResizablePanel
      className="p-4 bg-neutral-100 rounded-lg border"
      defaultSize={55}
      minSize={55}
    >
      <EmailView emailId={params.mail} />
    </ResizablePanel>
  );
};

export default Page;
