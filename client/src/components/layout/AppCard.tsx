import { forwardRef } from "react";
import { Paper } from "@mui/material";
import type { PaperProps } from "@mui/material";

const AppCard = forwardRef<HTMLDivElement, PaperProps>(function AppCard(
  { sx, ...props },
  ref
) {
  return (
    <Paper
      ref={ref}
      elevation={0}
      {...props}
      sx={[
        {
          border: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ].filter(Boolean)}
    />
  );
});

export default AppCard;
