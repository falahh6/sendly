import {
  Mail,
  Star,
  Clock,
  Send,
  FileEdit,
  Trash2,
  Plus,
  MailPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { FolderButton, NavButton } from "./SidebarButtons";
import { Selector } from "@/components/mailbox/selector";
import { UserProfile } from "@/components/auth/UserProfile";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar({
  isCollapsed,
  integrationId,
  user,
}: {
  isCollapsed: boolean;
  integrationId: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="p-4 space-y-4 border-b border-zinc-200">
        <Link href="/mailbox" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg  flex items-center justify-center">
            <Image src="/logo.svg" alt="Sendly" width={28} height={28} />
          </div>
          {!isCollapsed && <h1 className="text-lg font-normal">Sendly</h1>}
        </Link>

        <Selector integrationId={Number(integrationId)} />

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          size="lg"
        >
          {isCollapsed ? (
            <Plus className="h-4 w-4" />
          ) : (
            <>
              <MailPlus className="h-4 w-4" /> Compose
            </>
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 p-2">
          <nav className="space-y-1">
            <NavButton
              icon={<Mail className="h-4 w-4" />}
              label="Inbox"
              badge="12,923"
              isCollapsed={isCollapsed}
              isActive
            />
            <NavButton
              icon={<Star className="h-4 w-4" />}
              label="Starred"
              badge="8"
              isCollapsed={isCollapsed}
            />
            <NavButton
              icon={<Clock className="h-4 w-4" />}
              label="Snoozed"
              badge="132"
              isCollapsed={isCollapsed}
            />
            <NavButton
              icon={<Send className="h-4 w-4" />}
              label="Sent"
              badge="264"
              isCollapsed={isCollapsed}
            />
            <NavButton
              icon={<FileEdit className="h-4 w-4" />}
              label="Drafts"
              isCollapsed={isCollapsed}
            />
            <NavButton
              icon={<Trash2 className="h-4 w-4" />}
              label="Trash"
              badge="264"
              isCollapsed={isCollapsed}
            />
          </nav>

          {!isCollapsed && (
            <div>
              <div className="flex items-center justify-between py-2">
                <h2 className="text-xs font-semibold text-zinc-500">FOLDERS</h2>
                <Button variant="ghost" size="icon" className="h-4 w-4">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <FolderButton label="Folder 1" badge="18" />
                <FolderButton label="Folder 2" badge="4" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="m-2 space-y-4 bg-white">
        <UserProfile user={user} />
      </div>
    </div>
  );
}
