"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MailFilter = () => {
  const tabs = [
    { value: "all", label: "All Emails" },
    { value: "inbox", label: "Inbox" },
    { value: "sent", label: "Sent" },
    { value: "drafts", label: "Drafts" },
    { value: "spam", label: "Spam" },
    { value: "trash", label: "Trash" },
  ];

  return (
    <Tabs defaultValue="all">
      <TabsList className="rounded-xl border shadow-sm">
        {tabs.map((tab) => (
          <TabsTrigger
            className="rounded-lg text-xs"
            key={tab.value}
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
