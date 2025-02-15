"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRound } from "lucide-react";

const AggMails = () => {
  return (
    <div className="h-full flex flex-row gap-3 items-center justify-start bg-white px-4">
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="relative w-fit">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src="https://originui.com/avatar-80-07.jpg"
              alt="Kelly King"
            />
            <AvatarFallback>KK</AvatarFallback>
          </Avatar>
          <Badge className="absolute -top-1 left-full w-fit px-1.5 h-fit -translate-x-4 border-background rounded-full text-xs font-normal bg-blue-800">
            6
          </Badge>
        </div>
        <p className="text-xs">Kelly</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="relative w-fit">
          <Avatar className="bg-gray-200">
            <AvatarFallback>
              <UserRound className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <Badge className="absolute -top-1 left-full w-fit px-1.5 h-fit -translate-x-4 border-background rounded-full text-xs font-normal bg-blue-800">
            17
          </Badge>
        </div>
        <p className="text-xs">Array</p>
      </div>
    </div>
  );
};

export default AggMails;
