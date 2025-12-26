import * as React from "react";
import Chip, { type ChipProps } from "@mui/material/Chip";
import { alpha, type SxProps, type Theme } from "@mui/material/styles";

import { darkenColor } from "@/lib/color";

type MuiPaletteToken = "primary" | "secondary" | "success" | "info" | "warning" | "error";

const isMuiPaletteToken = (value: string): value is MuiPaletteToken =>
  value === "primary" ||
  value === "secondary" ||
  value === "success" ||
  value === "info" ||
  value === "warning" ||
  value === "error";

export type CategoryChipProps = Omit<ChipProps, "sx"> & {
  categoryColor: string;
  maxWidth?: number;
  sx?: SxProps<Theme>;
};

export const CategoryChip = ({
  categoryColor,
  maxWidth,
  sx,
  ...props
}: CategoryChipProps) => {
  const baseSx: SxProps<Theme> = (theme: Theme) => ({
    ...(isMuiPaletteToken(categoryColor)
      ? {
          color: theme.palette[categoryColor].main,
          backgroundColor: alpha(
            theme.palette[categoryColor].main,
            theme.palette.mode === "dark" ? 0.22 : 0.14
          ),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: darkenColor(categoryColor, 0.5),
        }),
    ...(maxWidth ? { maxWidth } : null),
    "& .MuiChip-label": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      ...(maxWidth ? { maxWidth: Math.max(0, maxWidth - 20) } : null),
    },
  });

  const mergedSx: SxProps<Theme> = Array.isArray(sx)
    ? [baseSx, ...sx]
    : sx
      ? [baseSx, sx]
      : baseSx;

  return <Chip size="small" {...props} sx={mergedSx} />;
};

CategoryChip.displayName = "CategoryChip";
