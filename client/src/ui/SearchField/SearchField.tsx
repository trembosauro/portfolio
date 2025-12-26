import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { TextField } from "../TextField";
import * as styles from "./searchField.css";

export type SearchFieldProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fullWidth?: boolean;
  onClear?: () => void;
  endIcon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
};

export function SearchField({
  value,
  onChange,
  placeholder,
  fullWidth = false,
  onClear,
  endIcon,
  ariaLabel,
  className,
}: SearchFieldProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && onClear) {
      event.preventDefault();
      onClear();
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const showClearButton = value.length > 0;

  const clearButton = showClearButton ? (
    <button
      type="button"
      onClick={handleClear}
      aria-label="Limpar busca"
      className={styles.clearButton}
    >
      <CloseRoundedIcon fontSize="small" />
    </button>
  ) : (
    <span className={styles.clearButtonGhost} aria-hidden="true" />
  );

  return (
    <TextField
      label={placeholder || "Buscar"}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      fullWidth={fullWidth}
      type="search"
      endIcon={clearButton}
      aria-label={ariaLabel || placeholder}
      className={className}
    />
  );
}