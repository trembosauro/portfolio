import type { ReactNode } from "react";
import { Breadcrumbs } from "@mui/material";
import { BreadcrumbFrame } from "../ui/BreadcrumbFrame";

export default function AppBreadcrumbRow({
  breadcrumbItems,
}: {
  breadcrumbItems: ReactNode;
}) {
  return (
    <BreadcrumbFrame>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator="›"
        sx={{
          width: "100%",
          color: "text.secondary",
          display: "flex",
          flexWrap: "nowrap",
          whiteSpace: "nowrap",
          mb: 1,
          "& .MuiBreadcrumbs-ol": {
            flexWrap: "nowrap",
            alignItems: "center",
            minWidth: 0,
          },
          "& .MuiBreadcrumbs-li": {
            display: "inline-flex",
            minWidth: 0,
          },
          "& .MuiBreadcrumbs-separator": {
            mx: 1,
            color: "text.secondary",
          },
        }}
      >
        {breadcrumbItems}
      </Breadcrumbs>
    </BreadcrumbFrame>
  );
}
