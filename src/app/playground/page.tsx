import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import EmailList from "./_elements/emailList";

const Page = async () => {
  return (
    <main className="text-neutral-600 dark:text-neutral-100">
      <div className="h-[20vh] flex items-center bg-neutral-100 dark:bg-neutral-800 p-10">
        <div className="flex flex-row gap-4 items-center ">
          <Button asChild variant={"default"} className="p-1 h-fit" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>{" "}
          <h4 className="text-lg font-semibold">Your emails (10)</h4>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="p-10 h-[80vh] overflow-y-auto dark:bg-neutral-700">
            <div className="animate-pulse">
              <div className="flex flex-col gap-2">
                <div className="h-8 bg-neutral-200 dark:bg-neutral-600 w-1/2"></div>
                <div className="h-8 bg-neutral-200 dark:bg-neutral-600 w-1/2"></div>
                <div className="h-8 bg-neutral-200 dark:bg-neutral-600 w-1/2"></div>
                <div className="h-8 bg-neutral-200 dark:bg-neutral-600 w-1/2"></div>
              </div>
            </div>
          </div>
        }
      >
        <div className="p-10 h-[80vh] overflow-y-auto dark:bg-neutral-700">
          <EmailList />
        </div>
      </Suspense>
    </main>
  );
};

export default Page;
