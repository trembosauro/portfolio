import { IconButton, Tooltip } from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

type SettingsIconButtonProps = {
  title?: string;
  onClick: () => void;
  size?: "small" | "medium";
  disabled?: boolean;
};

export default function SettingsIconButton({
  title = "Configuracoes",
  onClick,
  size = "small",
  disabled = false,
}: SettingsIconButtonProps) {
  return (
    <Tooltip title={title} placement="bottom">
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled}
          sx={{ border: 1, borderColor: "divider" }}
        >
        <SettingsRoundedIcon fontSize={size} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
