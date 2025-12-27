import { createTheme } from "@mui/material/styles";
import {
  amber,
  blue,
  green,
  indigo,
  orange,
  pink,
  purple,
  red,
} from "@mui/material/colors";

import { APP_RADIUS, APP_RADIUS_PX } from "./designTokens";

export const PRIMARY_COLOR_STORAGE_KEY = "sc_primary_color";
export const PRIMARY_COLOR_CHANGED_EVENT = "sc-primary-color-changed";

export const APP_PRIMARY_COLOR_OPTIONS = [
  "mui.green.600",
  "mui.blue.600",
  "mui.indigo.500",
  "mui.purple.500",
  "mui.pink.500",
  "mui.red.600",
  "mui.orange.700",
  "mui.amber.700",
] as const;

const MUI_COLOR_MAP: Record<string, Record<string, string>> = {
  amber,
  blue,
  green,
  indigo,
  orange,
  pink,
  purple,
  red,
};

const DEFAULT_PRIMARY_MAIN = "#22c9a6";
const DEFAULT_PRIMARY_CONTRAST = "#00382f";

const resolveMuiTokenToHex = (value?: string | null): string => {
  if (!value) {
    return DEFAULT_PRIMARY_MAIN;
  }

  if (!value.startsWith("mui.")) {
    return DEFAULT_PRIMARY_MAIN;
  }

  const [, colorName, shade] = value.split(".");
  if (!colorName || !shade) {
    return DEFAULT_PRIMARY_MAIN;
  }

  const bucket = MUI_COLOR_MAP[colorName];
  const resolved = bucket?.[shade];
  return resolved ?? DEFAULT_PRIMARY_MAIN;
};

export const createAppTheme = (primaryColorToken?: string | null) =>
  createTheme({
  shape: {
    borderRadius: APP_RADIUS_PX,
  },
  palette: {
    mode: "dark",
    primary: {
      main: resolveMuiTokenToHex(primaryColorToken),
      contrastText: DEFAULT_PRIMARY_CONTRAST,
    },
    brand: {
      main: resolveMuiTokenToHex(primaryColorToken),
      contrastText: DEFAULT_PRIMARY_CONTRAST,
    },
    secondary: {
      main: "#CCC2DC",
      contrastText: "#332D41",
    },
    background: {
      default: "#0f0f10",
      paper: "#17171a",
    },
    text: {
      primary: "#f5f5f5",
      secondary: "rgba(245, 245, 245, 0.7)",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--radius": APP_RADIUS,
          "--radius-card": APP_RADIUS,
          "--radius-button": APP_RADIUS,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: APP_RADIUS,
          [theme.breakpoints.down("sm")]: {
            margin: theme.spacing(2),
            width: `calc(100% - ${theme.spacing(4)})`,
            maxWidth: `calc(100% - ${theme.spacing(4)})`,
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: "contained",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 600,
          borderRadius: APP_RADIUS,
          paddingInline: theme.spacing(2.5),
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: () => ({
          borderRadius: APP_RADIUS,
        }),
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
        elevation: 0,
      },
      styleOverrides: {
        root: () => ({
          backgroundImage: "none",
          borderRadius: APP_RADIUS,
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: APP_RADIUS,
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: APP_RADIUS,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: "none",
          "&:before": {
            display: "none",
          },
        }),
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: () => ({
          minHeight: 56,
          backgroundColor: "transparent",
          "&.Mui-expanded": {
            minHeight: 56,
            backgroundColor: "transparent",
          },
        }),
        content: {
          margin: 0,
          "&.Mui-expanded": {
            margin: 0,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: APP_RADIUS,
          backgroundColor: theme.palette.background.paper,
        }),
        notchedOutline: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: () => ({
          borderRadius: APP_RADIUS,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: () => ({
          borderRadius: APP_RADIUS,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: () => ({
          borderRadius: APP_RADIUS,
        }),
      },
    },
  },
});

const theme = createAppTheme(null);

export default theme;
