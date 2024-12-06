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
    <main className="bg-white dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300">
      <div className="bg-neutral-100 dark:bg-neutral-800 p-10 h-[50vh] flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="font-semibold">SENDLY</h1>
          <p>Sendly is the new way you work with emails.</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm md:text-lg font-bold">What I am aiming</h3>
          {[
            {
              title: " Intelligent Categorization",
              description:
                "Auto-sorts emails into actionable categories like Work, Personal, Promotions.",
            },
            {
              title: "Actionable Clustering",
              description: `Groups emails into "Action Required," "Can Wait," and "FYI" categories.`,
            },
            {
              title: "Sentiment Analysis",
              description:
                "Analyse email tone and get suggestions for improved communication.",
            },
          ].map((item, idx) => (
            <div className="text-xs md:text-sm" key={idx + item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[30vh] p-10 ">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="space-x-3">
            <Button
              disabled={!session?.accessToken}
              asChild={(session && session?.accessToken.length > 0) || false}
              className="w-full xl:w-auto"
            >
              <Link href={"/playground"}>Payground</Link>
            </Button>
            {/* <Button
              disabled={true}
              className="w-full xl:w-auto"
              variant={"link"}
            >
              <Link href={"/fetch"}>CSV</Link>
            </Button> */}
          </div>{" "}
          <div className="flex flex-row max-sm:w-full items-center gap-4">
            {" "}
            <ContinueWithGoogle /> <Logout />
          </div>
        </div>
      </div>
      <div className="p-10 h-[20vh] space-y-2 w-full flex flex-col md:flex-row justify-between items-end">
        <div className="flex flex-row items-center gap-2">
          <SocialLink
            href="https://x.com/ffalah_"
            icon={<Twitter strokeWidth={2.5} className="h-4 w-4" />}
          />
          <SocialLink
            href="https://github.com/falahh6"
            icon={
              <Github
                strokeWidth={2.5}
                className="h-4 w-4 text-gray-500 dark:text-gray-100"
              />
            }
          />
          <Dot strokeWidth={2.5} className="h-4 w-4 text-gray-500" />
          <p className="text-sm font-semibold">Mohammed Falah</p>
        </div>
        <div>
          <p className="text-sm font-semibold">
            Have an Idea? write{" "}
            <Link
              className="text-blue-500"
              href={"mailto:contact@falah.in?subject=New%20Idea%20-%20Sendly"}
            >
              contact@falah.in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
