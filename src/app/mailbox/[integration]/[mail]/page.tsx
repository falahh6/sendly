import { ResizablePanel } from "@/components/ui/resizable";

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
      minSize={45}
    >
      {params.mail}
    </ResizablePanel>
  );
};

export default Page;
