import { style } from '@vanilla-extract/css';

export const appBar = style({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  borderBottom: 'solid 1px',
  borderBottomColor: 'color-mix(in srgb, var(--md-sys-color-outline) calc(var(--md-sys-alpha-hover) * 100%), transparent)',
  backdropFilter: 'blur(16px)',
  backgroundColor: 'color-mix(in srgb, var(--md-sys-color-surface) 75%, transparent)',
});

export const appBarInner = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  minHeight: 'var(--sc-header-height, 64px)',
  padding: '0 var(--sc-header-px-mobile, 16px)',
  
  '@media': {
    '(min-width: 960px)': {
      padding: '0 var(--sc-header-px-desktop, 24px)',
    },
  },
});

export const brandSlot = style({
  display: 'flex',
  alignItems: 'center',
});

export const navSlot = style({
  flex: 1,
  display: 'none',
  justifyContent: 'center',
  gap: 'var(--sc-header-nav-gap, 6px)',
  
  '@media': {
    '(min-width: 960px)': {
      display: 'flex',
    },
  },
});

export const actionsSlot = style({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--sc-header-actions-gap, 8px)',
});

export const mobileActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  
  '@media': {
    '(min-width: 960px)': {
      display: 'none',
    },
  },
});

export const menuButton = style({
  padding: '8px',
  color: 'var(--md-sys-color-on-surface)',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '9999px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  
  ':hover': {
    backgroundColor: 'color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent)',
  },
  
  ':active': {
    backgroundColor: 'color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent)',
  },
  
  ':focus-visible': {
    outline: '2px solid var(--md-sys-color-primary)',
    outlineOffset: '2px',
  },
});
