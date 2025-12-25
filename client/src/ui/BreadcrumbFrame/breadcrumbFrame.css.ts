import { style } from '@vanilla-extract/css';

export const breadcrumbFrame = style({
  width: '100%',
  // NO padding here - PageContainer handles horizontal padding
  // This component is used inside topRow/breadcrumbArea which already has PageContainer padding
});
