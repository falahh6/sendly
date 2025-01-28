"use client";

import { useHash } from "@/app/hooks/useHash";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mails, Pencil, Send, Star, Trash } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CustomSelectableButton = ({
  isSelected,
  children,
  name,
}: {
  isSelected: boolean;
  children: React.ReactNode;
  name: string;
}) => {
  const pathname = usePathname();
  const hash = useHash();

  useEffect(() => {
    if (window.location.href.length == 0) {
      window.location.href = pathname + "#inbox";
    }
  }, []);

  return (
    <Button
      className={cn(
        "rounded-xl border-none shadow-none hover:border border-gray-00 hover:bg-gray-200",
        isSelected && "bg-gray-00",
        hash.replace("#", "") == name &&
          "bg-gray-500 text-white border-gray-400"
      )}
      variant={"outline"}
      onClick={() => {
        window.location.href = pathname + "#" + name;
      }}
    >
      {children}
    </Button>
  );
};

const SideBar = () => {
  const pathname = usePathname();
  const [isMailSelected, setIsMailSelected] = useState(false);

  useEffect(() => {
    if (pathname.split("/").length > 3) {
      setIsMailSelected(true);
    } else {
      setIsMailSelected(false);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col items-center w-full gap-4 h-full">
      <h4 className="text-sm">MAIN</h4>
      <div className="flex flex-col gap-2 items-start">
        <CustomSelectableButton name="inbox" isSelected={true}>
          <Mails className="h-6 w-6" /> {!isMailSelected && "Inbox"}
        </CustomSelectableButton>
        <CustomSelectableButton name="starred" isSelected={isMailSelected}>
          <Star className="h-6 w-6" />
          {!isMailSelected && "Starred"}
        </CustomSelectableButton>
        <CustomSelectableButton name="sent" isSelected={isMailSelected}>
          <Send className="h-6 w-6" />
          {!isMailSelected && "Sent"}
        </CustomSelectableButton>
      </div>
      <h4 className="text-sm">Other</h4>
      <div className="flex flex-col gap-2 items-start">
        <CustomSelectableButton name="drafts" isSelected={isMailSelected}>
          <Pencil className="h-6 w-6" /> {!isMailSelected && "Drafts"}
        </CustomSelectableButton>

        <CustomSelectableButton name="trash" isSelected={isMailSelected}>
          <Trash className="h-6 w-6" />
          {!isMailSelected && "Trash"}
        </CustomSelectableButton>
      </div>
    </div>
  );
};

export default SideBar;
