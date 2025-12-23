import {
  Autocomplete,
  Checkbox,
  Chip,
  TextField,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { CategoryChip } from "./CategoryChip";

export type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

type CategoryFilterProps = {
  categories: CategoryOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  width?: ResponsiveValue<number | string>;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
};

export default function CategoryFilter({
  categories,
  selectedIds,
  onChange,
  label = "Filtrar categorias",
  width = 280,
  fullWidth = false,
  sx,
}: CategoryFilterProps) {
  return (
    <Autocomplete
      multiple
      options={categories}
      value={categories.filter(cat => selectedIds.includes(cat.id))}
      onChange={(_, value) => onChange(value.map(cat => cat.id))}
      getOptionLabel={option => option.name}
      disableCloseOnSelect
      ListboxProps={{ style: { maxHeight: 240 } }}
      sx={[
        {
          width: fullWidth ? "100%" : width,
          minWidth: 0,
          flex: fullWidth ? 1 : undefined,
          "& .MuiAutocomplete-inputRoot": {
            flexWrap: "nowrap",
            overflow: "hidden",
            minHeight: 44,
          },
          "& .MuiAutocomplete-tag": {
            flexShrink: 0,
            maxWidth: 120,
          },
          "& .MuiAutocomplete-input": {
            minWidth: 0,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ].filter(Boolean)}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox checked={selected} size="small" sx={{ mr: 1 }} />
          {option.name}
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth={fullWidth}
          sx={fullWidth ? undefined : { width, minWidth: 0 }}
        />
      )}
      renderTags={(value, getTagProps) => {
        const visible = value.slice(0, 2);
        const hiddenCount = value.length - visible.length;
        return (
          <>
            {visible.map((option, index) => (
              <CategoryChip
                {...getTagProps({ index })}
                key={option.id}
                label={option.name}
                categoryColor={option.color}
                maxWidth={120}
              />
            ))}
            {hiddenCount > 0 ? (
              <Chip
                label={`+${hiddenCount}`}
                size="small"
                sx={{
                  color: "text.secondary",
                  border: 1,
                  borderColor: "divider",
                }}
              />
            ) : null}
          </>
        );
      }}
    />
  );
}
