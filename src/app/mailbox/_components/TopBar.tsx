"use client";

import {
  Archive,
  Bell,
  Command,
  History,
  Plus,
  Search,
  Undo,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TopBar = () => {
  return (
    <div className="h-10">
      <div className="flex items-center flex-row p-4 pb-2">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex items-center gap-2 border px-3 rounded-lg bg-gray-100 w-[30%]">
            <div className="text-zinc-500 text-sm">
              <Search className="h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search or Quick Actions"
              className="h-9 bg-gray-100 placeholder:text-zinc-400 border-none ring-0 focus-visible:ring-0 shadow-none"
            />
            <div className="flex items-center gap-1 text-zinc-500 text-sm">
              <Command className="h-4 w-4" />
              <Plus className="h-4 w-4" />
              <span>S</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-zinc-600"
        >
          <Bell className="h-4 w-4" />
        </Button>
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
      <div className="text-xs px-4 mt-1"></div>
    </div>
  );
};

export default TopBar;
