import { style } from "@vanilla-extract/css";

export const filtersRow = style({
  display: "flex",
  gap: "16px",
  alignItems: "stretch",
  minWidth: 0,
  "@media": {
    "(max-width: 959px)": {
      flexWrap: "wrap",
    },
    "(min-width: 960px)": {
      flexWrap: "nowrap",
    },
  },
});

export const searchWrap = style({
  flex: "1 1 420px",
  minWidth: "240px",
  "@media": {
    "(max-width: 959px)": {
      maxWidth: "100%",
    },
    "(min-width: 960px)": {
      maxWidth: "520px",
    },
  },
});

export const searchFieldStable = style({
  selectors: {
    "& input": {
      paddingRight: "48px",
    },
  },
});

export const categoryWrap = style({
  flex: "0 1 320px",
  minWidth: "240px",
  overflow: "hidden",
  "@media": {
    "(max-width: 959px)": {
      maxWidth: "100%",
    },
    "(min-width: 960px)": {
      maxWidth: "420px",
    },
  },
});
