import type { PropsWithChildren, ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type PageActionsContextValue = {
  actions: ReactNode | null;
  setActions: (next: ReactNode | null) => void;
};

const PageActionsContext = createContext<PageActionsContextValue | null>(null);

export function PageActionsProvider({ children }: PropsWithChildren) {
  const [actions, setActions] = useState<ReactNode | null>(null);

  const value = useMemo(
    () => ({
      actions,
      setActions,
    }),
    [actions]
  );

  return (
    <PageActionsContext.Provider value={value}>
      {children}
    </PageActionsContext.Provider>
  );
}

export function usePageActionsContext() {
  const ctx = useContext(PageActionsContext);
  if (!ctx) {
    throw new Error("usePageActionsContext must be used within PageActionsProvider");
  }
  return ctx;
}
