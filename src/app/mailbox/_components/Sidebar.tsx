import { Mail, Star, Clock, Send, FileEdit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { FolderButton, NavButton } from "./SidebarButtons";
import { Selector } from "@/components/mailbox/selector";

export default function Sidebar({
  isCollapsed,
  integrationId,
}: {
  isCollapsed: boolean;
  integrationId: string;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="p-4 space-y-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Mail className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && <h1 className="text-xl font-semibold">Mailbox</h1>}
        </div>

        <Selector integrationId={Number(integrationId)} />

        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
          {isCollapsed ? <Plus className="h-4 w-4" /> : "Compose"}
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
            <>
              <div>
                <div className="flex items-center justify-between py-2">
                  <h2 className="text-xs font-semibold text-zinc-500">
                    FOLDERS
                  </h2>
                  <Button variant="ghost" size="icon" className="h-4 w-4">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <FolderButton label="Folder 1" badge="18" />
                  <FolderButton label="Folder 2" badge="4" />
                </div>
              </div>
              {/* <div>
                <div className="flex items-center justify-between py-2">
                  <h2 className="text-xs font-semibold text-zinc-500">
                    LABELS
                  </h2>
                  <Button variant="ghost" size="icon" className="h-4 w-4">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <LabelButton color="pink" label="Dribbble" badge="152" />
                  <LabelButton color="blue" label="Behance" badge="37" />
                  <LabelButton color="green" label="Craftwork" badge="26" />
                </div>
              </div> */}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
