"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useHash } from "@/app/hooks/useHash";

export function NavButton({
  icon,
  label,
  badge,
  isCollapsed,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const hash = useHash();

  const handleSidebarOptionsClick = () => {
    window.location.href = pathname + "#" + label.toLowerCase();
  };

  const isActive = () => {
    return hash.replace("#", "") === label.toLowerCase();
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 hover:bg-indigo-50 hover:text-indigo-400 p-2 rounded-lg",
        isActive() &&
          "border border-indigo-300 text-indigo-500 bg-indigo-100 hover:text-indigo-500"
      )}
      onClick={() => {
        handleSidebarOptionsClick();
      }}
    >
      {icon}
      {!isCollapsed && (
        <>
          {label}
          {badge && <span className="ml-auto text-xs">{badge}</span>}
        </>
      )}
    </Button>
  );
}

export function FolderButton({
  label,
  badge,
}: {
  label: string;
  badge?: string;
}) {
  return (
    <Button variant="ghost" className="w-full justify-start">
      {label}
      {badge && (
        <Badge className="ml-auto" variant="secondary">
          {badge}
        </Badge>
      )}
    </Button>
  );
}

export function LabelButton({
  color,
  label,
  badge,
}: {
  color: string;
  label: string;
  badge?: string;
}) {
  return (
    <Button variant="ghost" className="w-full justify-start gap-2">
      <span className={`h-2 w-2 rounded-full bg-${color}-500`} />
      {label}
      {badge && (
        <Badge className="ml-auto" variant="secondary">
          {badge}
        </Badge>
      )}
    </Button>
  );
}
