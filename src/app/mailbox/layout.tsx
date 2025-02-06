import { MailboxProvider } from "@/context/mailbox";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";

const getIntegrations = async (authToken: string) => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_SITE_URL + "/api/integrations",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        auth: authToken,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error fetching integrations:", error);
    return null;
  }

  const data = await response.json();
  console.log("Integrations Data: ", data);
  return data.integrations || [];
};

const MailboxLayout = async ({ children }: { children: React.ReactNode }) => {
  const data = await getServerSession(authOptions);

  const integrations = await getIntegrations(data?.accessToken ?? "");

  return (
    <MailboxProvider integrationsData={integrations}>
      <main className="w-full bg-white flex flex-row text-sm md:text-base">
        <div className="w-full h-screen flex flex-col justify-center items-center">
          {children}
        </div>
      </main>
    </MailboxProvider>
  );
};

export default MailboxLayout;
