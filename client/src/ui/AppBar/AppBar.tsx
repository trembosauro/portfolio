import { ReactNode } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { 
  appBar, 
  appBarInner, 
  brandSlot as brandSlotClass, 
  navSlot as navSlotClass, 
  actionsSlot as actionsSlotClass, 
  mobileActions,
  menuButton,
} from './appBar.css';

export interface AppBarProps {
  brandSlot: ReactNode;
  navSlot?: ReactNode;
  actionsSlot?: ReactNode;
  showMobileMenuButton?: boolean;
  onMenuClick?: (event: React.MouseEvent<HTMLElement>) => void;
  mobileActionsSlot?: ReactNode;
}

export function AppBar({
  brandSlot: brandSlotProp,
  navSlot: navSlotProp,
  actionsSlot: actionsSlotProp,
  showMobileMenuButton = true,
  onMenuClick,
  mobileActionsSlot,
}: AppBarProps) {
  return (
    <header className={appBar}>
      <div className={appBarInner}>
        <div className={brandSlotClass}>
          {brandSlotProp}
        </div>

        {navSlotProp && (
          <nav className={navSlotClass}>
            {navSlotProp}
          </nav>
        )}

        {actionsSlotProp && (
          <div className={actionsSlotClass}>
            {actionsSlotProp}
          </div>
        )}
        
        <div className={mobileActions}>
          {mobileActionsSlot}
          {showMobileMenuButton && (
            <button
              aria-label="Abrir menu"
              onClick={onMenuClick}
              className={menuButton}
            >
              <MenuIcon fontSize="small" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
