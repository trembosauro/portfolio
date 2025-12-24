import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { interactiveCardSx } from "../styles/interactiveCard";
import AppAccordion from "./layout/AppAccordion";

export interface SettingsSection {
  /** Identificador único da seção */
  key: string;
  /** Título da seção (exibido no header do accordion ou como título simples) */
  title: string;
  /** Conteúdo da seção */
  content: ReactNode;
  /** Toggle opcional para o header do accordion */
  headerToggle?: ReactNode;
}

export interface SettingsDialogProps {
  /** Estado de abertura do dialog */
  open: boolean;
  /** Callback ao fechar o dialog */
  onClose: () => void;
  /** Título do dialog */
  title: string;
  /** Lista de seções de configuração */
  sections: SettingsSection[];
  /** Callback ao clicar em "Restaurar padrão" (opcional) */
  onRestoreDefaults?: () => void;
  /** Texto do botão de restaurar padrão (default: "Restaurar padrão") */
  restoreDefaultsLabel?: string;
  /** Largura máxima do dialog (default: "sm") */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function SettingsDialog({
  open,
  onClose,
  title,
  sections: rawSections,
  onRestoreDefaults,
  restoreDefaultsLabel = "Restaurar padrão",
  maxWidth = "sm",
}: SettingsDialogProps) {
  // Ordena seções para que "categories" sempre venha primeiro (se existir)
  const sections = [...rawSections].sort((a, b) => {
    if (a.key === "categories") return -1;
    if (b.key === "categories") return 1;
    return 0;
  });

  // Estado do accordion: primeiro item aberto por default se houver múltiplas seções
  const [expandedSection, setExpandedSection] = useState<string | false>(
    sections.length >= 2 ? sections[0]?.key ?? false : false
  );

  const handleClose = () => {
    onClose();
    // Reset accordion ao primeiro item quando fechar
    setExpandedSection(sections.length >= 2 ? sections[0]?.key ?? false : false);
  };

  const renderSingleSection = () => {
    const section = sections[0];
    if (!section) return null;

    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          {section.title}
        </Typography>
        {section.content}
      </Box>
    );
  };

  const renderMultipleSections = () => {
    return (
      <Stack spacing={1.5}>
        {sections.map(section => (
          <AppAccordion
            key={section.key}
            expanded={expandedSection === section.key}
            onChange={(_, expanded) =>
              setExpandedSection(expanded ? section.key : false)
            }
            disableGutters
            elevation={0}
            summary={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 2,
                }}
              >
                <Typography variant="subtitle2">{section.title}</Typography>
                {section.headerToggle}
              </Box>
            }
            sx={theme => ({
              borderColor: "divider",
              overflow: "hidden",
              "&:before": { display: "none" },
              ...interactiveCardSx(theme),
              ...(expandedSection === section.key ? {} : { mb: 0 }),
              "& .MuiAccordionSummary-content": {
                my: 1,
                alignItems: "center",
              },
            })}
          >
            {section.content}
          </AppAccordion>
        ))}
      </Stack>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={maxWidth} fullWidth>
      <DialogContent>
        <Stack spacing={2.5}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">{title}</Typography>
            <IconButton
              onClick={handleClose}
              aria-label="Fechar"
              sx={{
                color: "text.secondary",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Content */}
          {sections.length === 1
            ? renderSingleSection()
            : renderMultipleSections()}

          {/* Actions */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="flex-end"
          >
            {onRestoreDefaults ? (
              <Button
                variant="outlined"
                onClick={onRestoreDefaults}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {restoreDefaultsLabel}
              </Button>
            ) : null}
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Fechar
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
