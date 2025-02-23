"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIntegrations } from "@/context/mailbox";
import { CircleAlertIcon, Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DeleteIntegration = () => {
  const router = useRouter();

  const {
    currentIntegration,
    setIntegrations,
    setCurrentIntegration,
    integrations,
  } = useIntegrations();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data } = useSession();

  const [inputValue, setInputValue] = useState("");

  if (currentIntegration === null) return <></>;

  const deleteHandler = async () => {
    if (currentIntegration === undefined) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(
        `/api/integrations?integrationId=${currentIntegration.id}`,
        {
          method: "DELETE",
          headers: {
            auth: `${data?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete integration");
      } else {
        const filteredIntegrations = integrations.filter(
          (integration) => integration.id !== currentIntegration.id
        );

        console.log("filteredIntegrations : ", filteredIntegrations);

        setIntegrations(filteredIntegrations);

        if (filteredIntegrations.length > 0) {
          setCurrentIntegration(filteredIntegrations[0]);
          router.push(`/mailbox/${filteredIntegrations[0].id}`);
        } else {
          setCurrentIntegration(undefined);
          router.push("/mailbox?m=add-new");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Delete Integration
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Final confirmation
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              This action cannot be undone. To confirm, please enter the project
              name{" "}
              <span className="text-foreground">{`${`${currentIntegration?.name.toLocaleLowerCase()}`}/${`${currentIntegration?.id}`}`}</span>
              .
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="*:not-first:mt-2">
            <Label htmlFor={`${currentIntegration?.id}`}>Project name</Label>
            <Input
              id={`${currentIntegration?.id}`}
              type="text"
              placeholder="Type Origin UI to confirm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={
                inputValue !==
                  `${`${currentIntegration?.name.toLocaleLowerCase()}`}/${`${currentIntegration?.id}`}` ||
                deleteLoading
              }
              onClick={deleteHandler}
              type="button"
              className="flex-1"
            >
              {deleteLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteIntegration;
