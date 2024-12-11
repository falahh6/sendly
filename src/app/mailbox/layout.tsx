import { MailboxProvider } from "@/context/mailbox";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";

const MailboxLayout = async ({ children }: { children: React.ReactNode }) => {
  const data = await getServerSession(authOptions);

  return (
    <MailboxProvider userSessionData={data}>
      <main className="w-full bg-white flex flex-row text-sm md:text-base">
        <div className="w-full p-4 max-w-[1440px] h-screen space-y-3 flex flex-col ">
          <div className="flex flex-row items-center justify-between p-2 h-[8vh] w-full">
            <div>logo</div>
            <div className="bg-gray-100 w-[40%] border text-center rounded-md p-2 flex flex-row items-center justify-center">
              Search or Quick actions
            </div>
            <div>profile </div>
          </div>
          {children}
        </div>
      </main>
    </MailboxProvider>
  );
};

export default MailboxLayout;
