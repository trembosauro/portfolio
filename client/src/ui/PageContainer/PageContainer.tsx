import type { ReactNode } from 'react';
import {
  pageContainer,
  pageContent,
} from './pageContainer.css';
import { topRow, breadcrumbArea, actionsArea, titleRow } from '../PageHeader/pageHeader.css';
import { PageTitle } from '../PageHeader/PageTitle';
import { PageActions } from '../PageHeader/PageActions';
import { useBreadcrumb } from '../../contexts/BreadcrumbContext';

export interface PageContainerProps {
  children: ReactNode;
  breadcrumbSlot?: ReactNode;
  actionsSlot?: ReactNode;
  title?: string;
  subtitle?: string;
}

export function PageContainer({ children, breadcrumbSlot, actionsSlot, title, subtitle }: PageContainerProps) {
  const breadcrumbContext = useBreadcrumb();
  const effectiveBreadcrumb = breadcrumbSlot || breadcrumbContext?.breadcrumbComponent;
  
  return (
    <div className={pageContainer}>
      {(effectiveBreadcrumb || actionsSlot) && (
        <div className={topRow}>
          {effectiveBreadcrumb && <div className={breadcrumbArea}>{effectiveBreadcrumb}</div>}
          {actionsSlot && <div className={actionsArea}>{actionsSlot}</div>}
        </div>
      )}
      {(title || subtitle) && (
        <div className={titleRow}>
          <PageTitle subtitle={subtitle}>{title}</PageTitle>
        </div>
      )}
      <div className={pageContent}>{children}</div>
    </div>
  );
}
