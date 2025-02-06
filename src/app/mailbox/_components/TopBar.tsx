"use client";

import { Archive, History, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TopBar = () => {
  return (
    <div className="flex items-center flex-row h-full p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Search"
            className="h-9 bg-zinc-50 placeholder:text-zinc-400"
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
  );
};

export default TopBar;
