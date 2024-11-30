import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Suspense } from "react";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import EmailList from "./_elements/emailList";

const getEmails = async (accessToken: string) => {
  const res = await fetch("http://localhost:3000/api/emails", {
    cache: "no-cache",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  return data.body;
};

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (session && session.accessToken) {
    const emails = await getEmails(session.accessToken);

    return (
      <main className="text-neutral-500">
        <div className="h-[20vh] flex items-center bg-neutral-100 p-10">
          <div className="flex flex-row gap-4 items-center">
            <Button asChild className="p-1 h-fit" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>{" "}
            <h4 className="text-lg font-semibold">Your emails (20)</h4>
          </div>
        </div>

        <Suspense fallback={<div>Loading emails...</div>}>
          <EmailList emails={emails} />
        </Suspense>
      </main>
    );
  }

  return (
    <main className="text-neutral-500">
      <div className="h-[20vh] flex items-center bg-neutral-100 p-10">
        <div className="flex flex-row gap-4 items-center">
          <Button asChild className="p-1 h-fit" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>{" "}
          <h4 className="text-lg font-semibold">Your emails (0)</h4>
        </div>
      </div>
    </main>
  );
};

export default Page;
