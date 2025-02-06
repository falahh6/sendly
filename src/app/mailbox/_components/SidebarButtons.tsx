import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NavButton({
  icon,
  label,
  badge,
  isCollapsed,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  isCollapsed: boolean;
  isActive?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2",
        isActive && "bg-zinc-100 text-zinc-900"
      )}
    >
      {icon}
      {!isCollapsed && (
        <>
          {label}
          {badge && (
            <Badge className="ml-auto" variant="secondary">
              {badge}
            </Badge>
          )}
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
