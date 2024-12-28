"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { useState } from "react";
import { Loader } from "lucide-react";
import Image from "next/image";

const ContinueWithGoogle = () => {
  const [loading, setLoading] = useState(false);
  const { status, data: user } = useSession();

  return (
    <>
      {user ? (
        <div className="p-2 flex flex-row gap-2 items-center bg-gray-200 rounded-lg dark:text-neutral-700 w-full xl:w-auto">
          <Image
            className="rounded-full"
            width={24}
            height={24}
            src={user.user?.image ?? ""}
            alt="Avatar"
          />{" "}
          <p className="text-sm font-semibold">{user.user?.email}</p>
        </div>
      ) : (
        <Button
          onClick={() => {
            setLoading(true);
            signIn("google")
          }}
          disabled={loading || status === "loading"}
          className="w-full xl:w-auto"
        >
          {(loading || status === "loading") && (
            <Loader className="animate-spin h-4 w-4 mr-1" />
          )}{" "}
          Continue with Google
        </Button>
      )}
    </>
  );
};

export default ContinueWithGoogle;
