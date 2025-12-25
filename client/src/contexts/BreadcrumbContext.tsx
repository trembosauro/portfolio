import { createContext, useContext, type ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbContextValue {
  breadcrumbItems: BreadcrumbItem[];
  breadcrumbComponent: ReactNode;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ value, children }: { value: BreadcrumbContextValue; children: ReactNode }) {
  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  return context;
}
