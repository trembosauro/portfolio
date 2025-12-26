import { style } from "@vanilla-extract/css";

export const searchFieldRoot = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "56px",
  minHeight: "56px",
  borderRadius: "var(--sc-input-radius, 16px)",
  border: "1px solid var(--sc-input-border-color, rgba(230, 237, 243, 0.2))",
  backgroundColor: "var(--sc-input-bg, rgba(230, 237, 243, 0.05))",
  boxSizing: "border-box",
  overflow: "hidden",
  transition: "all 0.2s ease",
  ":hover": {
    borderColor: "var(--sc-input-border-color-hover, rgba(230, 237, 243, 0.35))",
  },
  ":focus-within": {
    borderColor: "var(--sc-input-border-color-focus, var(--md-sys-color-primary, #22c9a6))",
    backgroundColor: "var(--sc-input-bg-focus, rgba(230, 237, 243, 0.08))",
  },
});

export const searchFieldInput = style({
  flex: "1 1 auto",
  height: "100%",
  minWidth: 0,
  padding: "0 16px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "var(--sc-input-text-color, #e6edf3)",
  fontSize: "16px",
  lineHeight: "1.5",
  boxSizing: "border-box",
  "::placeholder": {
    color: "var(--sc-input-placeholder-color, rgba(230, 237, 243, 0.5))",
  },
});

export const searchFieldEndSlot = style({
  flex: "0 0 48px",
  width: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
});

export const searchFieldEndSlotGhost = style({
  width: "24px",
  height: "24px",
  opacity: 0,
  pointerEvents: "none",
});

export const searchFieldEndAdornment = style({
  display: "flex",
  alignItems: "center",
  paddingRight: "8px",
  flexShrink: 0,
});

