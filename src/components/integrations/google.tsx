"use client";

import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

export interface Integration {
  id: number;
  name: string;
  profile: {
    email: string;
    [key: string]: unknown;
  };
  accessToken: string;
  refreshToken?: string; // Optional
  provider: string;
  userId: string;
  email: string;
}

export default function Integrations() {
  const { data, status } = useSession();
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  const fetchIntegrations = async (authToken: string) => {
    console.log(integrations);
    try {
      const response = await fetch("/api/integrations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          auth: authToken, // Include the auth token in the headers
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error fetching integrations:", error);
        return null;
      }

      const data = await response.json();
      console.log("Integrations:", data.integrations);
      setIntegrations(data.integrations);
    } catch (error) {
      console.error("API call failed:", error);
      return null;
    }
  };

  const handleGoogleAuth = () => {
    window.location.href =
      "/api/auth/google" + `?userAccessToken=${data?.accessToken}`;
  };

  const handleOutlookAuth = () => {
    window.location.href =
      "/api/auth/outlook" + `?userAccessToken=${data?.accessToken}`;
  };

  useEffect(() => {
    if (status === "authenticated") {
      console.log("userId", data);

      fetchIntegrations(data?.accessToken);
    }
  }, [status]);

  return (
    <div className="flex flex-row gap-2 justify-between lg:justify-normal mt-2 w-full">
      <div>
        <Button
          disabled={status === "loading"}
          variant={"link"}
          onClick={handleGoogleAuth}
        >
          Authenticate with Google
        </Button>
        <Button
          disabled={status === "loading"}
          variant={"link"}
          onClick={handleOutlookAuth}
        >
          Authenticate with Outlook
        </Button>
      </div>
    </div>
  );
}
