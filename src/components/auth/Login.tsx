"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { Icons } from "../icons";

export const Login = () => {
  return (
    <Button
      className="rounded-xl"
      variant={"outline"}
      disabled={process.env.NODE_ENV !== "development"}
      onClick={() => signIn("google")}
    >
      <Icons.google /> Login with Google
    </Button>
  );
};
