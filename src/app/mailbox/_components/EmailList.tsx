import { Search, Archive, History, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function EmailList() {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Search"
              className="h-9 border-none bg-zinc-50 placeholder:text-zinc-400"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-zinc-600"
        >
          <Archive className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-zinc-600"
        >
          <History className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-zinc-600"
        >
          <Undo className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {emails.map((email) => (
            <EmailItem key={email.id} email={email} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function EmailItem({ email }: { email: (typeof emails)[0] }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-transparent p-3 transition-colors hover:bg-zinc-50 hover:border-zinc-200",
        email.unread && "bg-zinc-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-sm">{email.from}</div>
          {email.unread && (
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
          )}
        </div>
        <div className="text-xs text-zinc-500">{email.time}</div>
      </div>
      <div className="text-sm font-medium">{email.subject}</div>
      <div className="text-xs text-zinc-500 line-clamp-2">{email.preview}</div>
      {email.threadCount > 1 && (
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <div className="h-4 w-4 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
            {email.threadCount}
          </div>
          <span>messages</span>
        </div>
      )}
    </div>
  );
}

const emails = [
  {
    id: 1,
    from: "Uxcel",
    subject: "Get a chance to win $2,500 in Uxcel Design Contest",
    preview:
      "Hi Musmuliady, over 20 users already sent their submission for our very first Design Contest. You c...",
    time: "1:15 PM",
    unread: true,
    threadCount: 3,
  },
  {
    id: 2,
    from: "Gil Huybrecht",
    subject: "The basics of art direction",
    preview:
      "Let's talk about art direction and how I go about it in webdesign. Through these emails I want to help...",
    time: "Dec 26",
    unread: false,
    threadCount: 1,
  },
  // Add more email items as needed
];
