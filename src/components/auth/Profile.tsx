"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader, LogOut, Menu, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Icons } from "../icons";
import { useTransition } from "react";

export const NavProfile = () => {
  const { data: session, status } = useSession();

  const [isPending] = useTransition();

  return (
    <div className="flex flex-row items-center gap-4 absolute right-6 top-6">
      {isPending || status === "loading" ? (
        <>
          <Loader className="h-4 w-4 animate-spin" />
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="border ml-[200px] max-sm:ml-0 border-gray-300 p-2 rounded-full h-fit bg-gray-100 flex flex-row items-center gap-1 ring-0 outline-none">
            {session?.user ? (
              <User className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[20vw] max-md:w-[50vw] max-lg:w-[50vw] max-sm:w-[70vw] rounded-2xl mr-10 max-sm:mr-8 bg-white shadow-2xl">
            {session?.user ? (
              <DropdownMenuLabel className="p-4">
                <div className="text-base">{session.user.name}</div>
                <Link
                  href={`mailto:${session.user.email}`}
                  className="text-sm font-normal text-gray-500"
                >
                  {session.user.email}
                </Link>
              </DropdownMenuLabel>
            ) : (
              <DropdownMenuItem
                className="p-3 hover:bg-gray-100 hover:cursor-pointer rounded-md rounded-tl-xl rounded-tr-xl"
                onClick={() => signIn("google")}
              >
                <Icons.google /> Sign in{" "}
              </DropdownMenuItem>
            )}

            {session?.user && (
              <>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem
                  className="p-3 hover:bg-gray-100 hover:cursor-pointer rounded-md rounded-bl-xl rounded-br-xl"
                  onClick={() =>
                    signOut({
                      redirect: true,
                      callbackUrl: "/",
                    })
                  }
                >
                  <LogOut className="h-4 w-4 mr-2 inline-block" />{" "}
                  <p className="text-sm">Logout</p>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
