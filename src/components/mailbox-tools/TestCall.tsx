"use client";

import { useSession } from "next-auth/react";
import { Button } from "../ui/button";

export const TestAPICall = () => {
  const { data: session } = useSession();

  const testCall = async () => {
    const response = await fetch(
      process.env.NEXT_PUBLIC_SITE_URL + "/api/test",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          auth: session?.accessToken ?? "",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Error fetching integrations:", error);
      return null;
    }

    const data = await response.json();
    return data.integrations || [];
  };

  return (
    <div className="mt-10">
      <Button
        onClick={() => testCall()}
        size={"sm"}
        variant={"outline"}
        className="rounded-xl"
      >
        Call
      </Button>
    </div>
  );
};
