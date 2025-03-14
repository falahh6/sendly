"use client";

import { Integration } from "@/lib/types/integrations";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";

interface IntegrationContextType {
  integrations: Integration[];
  setIntegrations: Dispatch<SetStateAction<Integration[]>>;
  currentIntegration: Integration | undefined;
  setCurrentIntegration: Dispatch<SetStateAction<Integration | undefined>>;

  selectedMail: string | undefined;
  setSelectedMail: Dispatch<SetStateAction<string | undefined>>;
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
  const [currentIntegration, setCurrentIntegration] = useState<
    Integration | undefined
  >();
  const [integrations, setIntegrations] = useState<Integration[]>(
    integrationsData || []
  );

  const [selectedMail, setSelectedMail] = useState<string | undefined>();

  const value = useMemo(
    () => ({
      integrations,
      currentIntegration,
      setCurrentIntegration,
      setIntegrations,
      selectedMail,
      setSelectedMail,
    }),
    [
      integrations,
      currentIntegration,
      setCurrentIntegration,
      setIntegrations,
      selectedMail,
      setSelectedMail,
    ]
  );

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
