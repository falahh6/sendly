"use client";

import { Integration } from "@/lib/types/integrations";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useMemo,
  useEffect,
} from "react";

interface IntegrationContextType {
  integrations: Integration[];
  setIntegrations: Dispatch<SetStateAction<Integration[]>>;
  currentIntegration: Integration | undefined;
  setCurrentIntegration: Dispatch<SetStateAction<Integration | undefined>>;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(
  undefined
);

export function MailboxProvider({
  children,
  integrationsData,
}: Readonly<{
  children: ReactNode;
  integrationsData: Integration[];
}>) {
  const pathname = usePathname();
  const [currentIntegration, setCurrentIntegration] = useState<
    Integration | undefined
  >();
  const [integrations, setIntegrations] =
    useState<Integration[]>(integrationsData);

  const value = useMemo(
    () => ({
      integrations,
      currentIntegration,
      setCurrentIntegration,
      setIntegrations,
    }),
    [integrations, currentIntegration, setCurrentIntegration, setIntegrations]
  );

  useEffect(() => {
    console.log("ALl integrations: ", integrations);
    setCurrentIntegration(
      integrations.find(
        (i: Integration) => i.id === Number(pathname.split("/")[2])
      )
    );
  }, [integrations]);

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegrations() {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error("useIntegration must be used within a IntegrationProvider");
  }
  return context;
}
