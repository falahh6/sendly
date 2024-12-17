"use client";

import { fetcher } from "@/lib/utils";
import { Session } from "next-auth";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import useSWR from "swr";

interface IntegrationContextType {
  integrations: Integration[];
  currentIntegration: Integration | undefined;
  setCurrentIntegration: Dispatch<SetStateAction<Integration | undefined>>;

  isLoading: boolean;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(
  undefined
);

export function MailboxProvider({
  children,
  userSessionData,
}: Readonly<{
  children: ReactNode;
  userSessionData: Session | null;
}>) {
  const [currentIntegration, setCurrentIntegration] = useState<
    Integration | undefined
  >();

  const { data, isLoading } = useSWR(
    userSessionData?.accessToken
      ? ["/api/integrations", userSessionData.accessToken]
      : null,
    ([url, token]) => fetcher(url, token),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const integrations = data?.integrations || [];

  const value = useMemo(
    () => ({
      integrations,
      currentIntegration,
      setCurrentIntegration,
      isLoading,
    }),
    [integrations, currentIntegration, setCurrentIntegration, isLoading]
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
