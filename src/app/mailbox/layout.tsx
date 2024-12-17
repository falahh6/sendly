import { MailboxProvider } from "@/context/mailbox";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";

const MailboxLayout = async ({ children }: { children: React.ReactNode }) => {
  const data = await getServerSession(authOptions);

  return (
    <MailboxProvider userSessionData={data}>
      <main className="w-full bg-white flex flex-row text-sm md:text-base">
        <div className="w-full p-4 max-w-[1440px] h-screen space-y-3 flex flex-col justify-center items-center">
          {children}
        </div>
      </main>
    </MailboxProvider>
  );
};

export default MailboxLayout;
