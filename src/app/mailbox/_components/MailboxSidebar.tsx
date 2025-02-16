import {
  Mail,
  Star,
  Clock,
  Send,
  FileEdit,
  Trash2,
  SquarePen,
  Dot,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Labels, NavButton } from "./SidebarButtons";
import { Integration } from "./Integration";

export default function MailBoxSidebar({
  isCollapsed,
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
    <div className="flex h-full flex-col bg-gray-50">
      <div className="space-y-4 border-zinc-200">
        <Integration />
      </div>
      <div className="p-4 border-zinc-200">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-lg">Inbox</h3>
          <Button size="sm" variant={"ghost"}>
            <SquarePen className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-row gap-1 items-center text-xs text-gray-500">
          <span>1267 Messages</span>{" "}
          <span>
            <Dot className="h-4 w-4" />
          </span>{" "}
          <span>12 Unread</span>
        </div>
      </div>
      <div className="p-4 space-y-1">
        <NavButton
          icon={<Mail className="h-4 w-4" />}
          label="Inbox"
          badge="12,923"
          isCollapsed={isCollapsed}
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
      </div>

      <div className="px-4">
        <h4 className="text-sm">Labels</h4>
        <div className="py-3 space-y-2">
          <Labels
            icon={<Square className="h-3 w-3 text-purple-400" />}
            label="Work"
            badge="24"
          />
        </div>
      </div>
    </div>
  );
}
