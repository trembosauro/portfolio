import { style } from "@vanilla-extract/css";

export const filtersRow = style({
  display: "flex",
  alignItems: "stretch",
  gap: "16px",
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
  flex: "0 1 520px",
  minWidth: 0,
  "@media": {
    "(max-width: 959px)": {
      flex: "1 1 100%",
      minWidth: "240px",
      maxWidth: "100%",
    },
    "(min-width: 960px)": {
      minWidth: "240px",
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

export const filterWrap = style({
  flex: "0 1 320px",
  minWidth: 0,
  overflow: "hidden",
  "@media": {
    "(max-width: 959px)": {
      flex: "1 1 100%",
      minWidth: "240px",
      maxWidth: "100%",
    },
    "(min-width: 960px)": {
      minWidth: "240px",
    },
  },
});
