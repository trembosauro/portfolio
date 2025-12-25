import { style } from '@vanilla-extract/css';

export const breadcrumbFrame = style({
  maxWidth: 'var(--sc-page-max-width, 1200px)',
  margin: '0 auto',
  width: '100%',
  paddingLeft: 'var(--sc-page-px-mobile, 16px)',
  paddingRight: 'var(--sc-page-px-mobile, 16px)',
  
  '@media': {
    '(min-width: 960px)': {
      paddingLeft: 'var(--sc-page-px-desktop, 24px)',
      paddingRight: 'var(--sc-page-px-desktop, 24px)',
    },
  },
});
