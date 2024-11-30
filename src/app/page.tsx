import { Dot, Github, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";
import ContinueWithGoogle from "@/components/auth/google";
import Logout from "@/components/auth/Logout";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";

const SocialLink = ({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) => (
  <Link className="text-sm font-semibold text-blue-500" href={href}>
    {icon}
  </Link>
);

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <main className="bg-white text-neutral-500">
      <div className="bg-neutral-100 p-10 h-[50vh] flex flex-col justify-end">
        <h1 className="font-semibold">SENDLY</h1>
        <p>Sendly is a new way to send mails.</p>
      </div>
      <div className="h-[30vh] p-10 ">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div>
            <Button
              disabled={!session?.accessToken}
              asChild={(session && session?.accessToken.length > 0) || false}
            >
              <Link href={"/playground"}>Payground</Link>
            </Button>
          </div>{" "}
          <div className="flex flex-row max-sm:w-full items-center gap-4">
            {" "}
            <ContinueWithGoogle /> <Logout />
          </div>
        </div>
      </div>
      <div className="p-10 h-[20vh] space-y-2">
        <div className="flex flex-row items-center gap-2">
          <SocialLink
            href="https://x.com/ffalah_"
            icon={<Twitter strokeWidth={2.5} className="h-4 w-4" />}
          />
          <SocialLink
            href="https://github.com/falahh6"
            icon={
              <Github strokeWidth={2.5} className="h-4 w-4 text-gray-500" />
            }
          />
          <Dot strokeWidth={2.5} className="h-4 w-4 text-gray-500" />
          <p className="text-sm font-semibold">Mohammed Falah</p>
        </div>
      </div>
    </main>
  );
}
