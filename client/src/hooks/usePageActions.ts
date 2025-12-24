import type { ReactNode } from "react";
import { useEffect, useLayoutEffect } from "react";
import { usePageActionsContext } from "../contexts/PageActionsContext";

export function usePageActions(actions: ReactNode | null) {
  const { setActions } = usePageActionsContext();

  useLayoutEffect(() => {
    setActions(actions);
  }, [actions, setActions]);

  useEffect(() => {
    return () => setActions(null);
  }, [setActions]);
}
