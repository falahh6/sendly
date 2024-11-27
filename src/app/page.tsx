import { Dot, Github, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";

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

export default function Home() {
  return (
    <main className="bg-white text-neutral-500">
      <div className="dark:bg-neutral-100 p-10 h-[50vh] flex flex-col justify-end">
        <h1 className="font-semibold">SENDLY</h1>
        <p>Sendly is a new way to send mails.</p>
      </div>
      <div className="p-10 h-[50vh] space-y-2">
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
