import { style } from "@vanilla-extract/css";

export const filtersRow = style({
  display: "flex",
  gap: "16px",
  alignItems: "center",
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
  minWidth: 0,
  "@media": {
    "(max-width: 959px)": {
      minWidth: "240px",
    },
    "(min-width: 960px)": {
      minWidth: "240px",
      maxWidth: "520px",
    },
  },
  selectors: {
    "& > *": {
      width: "100%",
      minWidth: 0,
    },
  },
});

export const categoryWrap = style({
  flex: "1 1 320px",
  minWidth: 0,
  "@media": {
    "(max-width: 959px)": {
      minWidth: "240px",
    },
    "(min-width: 960px)": {
      minWidth: "240px",
      maxWidth: "420px",
    },
  },
  selectors: {
    "& > *": {
      width: "100%",
      minWidth: 0,
    },
  },
});
