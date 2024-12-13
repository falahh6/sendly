"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export const AddNewIntegration = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    "1"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  const { data } = useSession();

  const integrations = [
    {
      id: "1",
      name: "Gmail",
      icons: <Icons.google height={"40px"} width={"40px"} />,
    },
    {
      id: "2",
      name: "Outlook",
      icons: <Icons.outlook height={"40px"} width={"40px"} />,
    },
    {
      id: "3",
      name: "Other",
      icons: <Icons.add className="h-8 w-8" />,
    },
  ];

  const integrateHandler = () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!data) {
      toast.error("Please login to continue");
      return;
    }
    setLoading(true);

    console.log("Integrating with ", selectedIntegration);

    const params = new URLSearchParams();
    params.set("userAccessToken", data?.accessToken);
    params.set("email", email);

    if (selectedIntegration === "1") {
      window.location.href = "/api/auth/google?" + params.toString();
    } else if (selectedIntegration === "2") {
      window.location.href = "/api/auth/outlook?" + params.toString();
    }
  };

  return (
    <div className="text-left flex flex-col gap-2 max-sm:mx-10">
      <div>
        <h3 className="text-lg font-semibold underline underline-offset-4">
          Add new mailbox
        </h3>
      </div>
      <div className="mt-2 flex flex-col gap-2 items-start w-full">
        <Label className="font-medium text-sm">Select your mailbox</Label>
        <div className="space-x-2">
          {integrations.map((integration) => (
            <Button
              key={integration.id}
              variant={"outline"}
              className={`rounded-xl ${
                selectedIntegration === integration.id &&
                "border border-gray-400 bg-gray-100"
              }`}
              disabled={integration.id == "3"}
              onClick={() => setSelectedIntegration(integration.id)}
            >
              {integration.icons} <span>{integration.name}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-2 items-start w-full">
        <Label className="font-medium text-sm">Enter your email</Label>
        <Input
          placeholder="Email"
          type="email"
          className="p-3 py-4 rounded-xl font-semibold"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="w-full flex flex-col items-center mt-2">
        <Button
          onClick={integrateHandler}
          className="w-full rounded-xl py-0 px-4 text-sm"
          size={"sm"}
          disabled={loading}
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />} Continue to
          Integrate
        </Button>
        <p className="mt-4 w-[80%] text-center text-sm text-neutral-500">
          Access requires email read/send permissions; Proceed if you agree.{" "}
          <Link href="#readmore-link">Read more</Link>
        </p>
      </div>
    </div>
  );
};
