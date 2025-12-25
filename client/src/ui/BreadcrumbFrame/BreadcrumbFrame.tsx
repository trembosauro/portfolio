import type { ReactNode } from 'react';
import { breadcrumbFrame } from './breadcrumbFrame.css';

export interface BreadcrumbFrameProps {
  children: ReactNode;
}

export function BreadcrumbFrame({ children }: BreadcrumbFrameProps) {
  return (
    <div className={breadcrumbFrame}>
      {children}
    </div>
  );
}
