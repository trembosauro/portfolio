import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogContent,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const roles = [
  { name: "Administrador", members: 4, color: "default" },
  { name: "Gestor", members: 12, color: "default" },
  { name: "Analista", members: 18, color: "default" },
  { name: "Leitor", members: 36, color: "default" },
];

const modules = [
  { name: "Dashboard executivo", description: "KPIs e indicadores de acesso." },
  { name: "Gestao de usuarios", description: "Perfis, roles e permissao." },
  { name: "Convites e onboarding", description: "Fluxos de entrada." },
  { name: "Relatorios", description: "Exportacao e auditoria." },
];

const invites = [
  { email: "carlos@empresa.com", role: "Gestor", status: "Pendente" },
  { email: "luana@empresa.com", role: "Analista", status: "Enviado" },
  { email: "time.ops@empresa.com", role: "Leitor", status: "Aceito" },
];

export default function AccessManagement() {
  const [moduleStates, setModuleStates] = useState(() => modules.map(() => true));
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [moduleConfirm, setModuleConfirm] = useState<{
    index: number;
    nextValue: boolean;
  } | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    roles.forEach((role) => {
      initial[role.name] = modules.map(() => true);
    });
    return initial;
  });
  const toggleModule = (index: number) => {
    setModuleStates((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const requestModuleToggle = (index: number) => {
    setModuleConfirm({ index, nextValue: !moduleStates[index] });
  };

  const confirmModuleToggle = () => {
    if (!moduleConfirm) {
      return;
    }
    toggleModule(moduleConfirm.index);
    setModuleConfirm(null);
  };

  const openRolePermissions = (roleName: string) => {
    setActiveRole(roleName);
    setPermissionDialogOpen(true);
  };

  const toggleRolePermission = (index: number) => {
    if (!activeRole) {
      return;
    }
    setRolePermissions((prev) => {
      const current = prev[activeRole] || modules.map(() => true);
      const next = [...current];
      next[index] = !next[index];
      return { ...prev, [activeRole]: next };
    });
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">Gestao de acessos e convites</Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Defina papeis, niveis, modulos e convites por time.
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(15, 23, 32, 0.9)",
          }}
        >
          <Stack spacing={2.5}>
            <Typography variant="h6">Papeis do workspace</Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              {roles.map((role) => (
                <Paper
                  key={role.name}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: "1px solid rgba(255,255,255,0.08)",
                    minWidth: 200,
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {role.name}
                    </Typography>
                    <Chip
                      label={`${role.members} membros`}
                      color={role.color as "primary" | "secondary" | "default"}
                      size="medium"
                      sx={{ fontSize: 20, height: 36 }}
                    />
                    <Button
                      variant="text"
                      onClick={() => openRolePermissions(role.name)}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      Editar permissoes
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(15, 23, 32, 0.9)",
          }}
        >
          <Stack spacing={2.5}>
            <Typography variant="h6">Permissoes por modulo</Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {modules.map((module, index) => (
                <Paper
                  key={module.name}
                  elevation={0}
                  onClick={() => requestModuleToggle(index)}
                  sx={{
                    p: 2.5,
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(15, 23, 32, 0.9)",
                    cursor: "pointer",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {module.name}
                      </Typography>
                      <Switch
                        checked={moduleStates[index]}
                        onChange={() => requestModuleToggle(index)}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {module.description}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Stack>
        </Paper>

        <Dialog
          open={permissionDialogOpen}
          onClose={() => {
            setPermissionDialogOpen(false);
            setActiveRole(null);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "rgba(15, 23, 32, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        >
          <DialogContent>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6">Editar permissoes</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {activeRole ? `Papel: ${activeRole}` : "Selecione um papel."}
                </Typography>
              </Box>
              <Stack spacing={1.5}>
                {modules.map((module, index) => (
                  <Paper
                    key={module.name}
                    elevation={0}
                    onClick={() => toggleRolePermission(index)}
                    sx={{
                      p: 2.5,
                      border: "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(15, 23, 32, 0.9)",
                      cursor: "pointer",
                    }}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {module.name}
                        </Typography>
                        <Switch
                          checked={
                            activeRole
                              ? rolePermissions[activeRole]?.[index] ?? true
                              : true
                          }
                          onChange={() => toggleRolePermission(index)}
                          onClick={(event) => event.stopPropagation()}
                          disabled={!activeRole}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {module.description}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setPermissionDialogOpen(false);
                    setActiveRole(null);
                  }}
                >
                  Fechar
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(15, 23, 32, 0.9)",
          }}
        >
          <Stack spacing={2.5}>
            <Typography variant="h6">Enviar convite</Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField label="Email" type="email" fullWidth />
              <TextField label="Papel" select fullWidth defaultValue="Gestor">
                {["Administrador", "Gestor", "Analista", "Leitor"].map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Mensagem personalizada"
                fullWidth
                multiline
                minRows={3}
                sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}
              />
            </Box>
            <Button variant="outlined" size="large" sx={{ alignSelf: "flex-start" }}>
              Enviar convite
            </Button>
          </Stack>
        </Paper>

        <Dialog open={Boolean(moduleConfirm)} onClose={() => setModuleConfirm(null)} maxWidth="xs" fullWidth>
          <DialogContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">
                  {moduleConfirm?.nextValue ? "Ativar modulo" : "Desativar modulo"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {moduleConfirm
                    ? `Voce confirma a ${
                        moduleConfirm.nextValue ? "ativacao" : "desativacao"
                      } do modulo ${modules[moduleConfirm.index].name}?`
                    : ""}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setModuleConfirm(null)}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={confirmModuleToggle}>
                  Confirmar
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(15, 23, 32, 0.9)",
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Convites recentes</Typography>
            {invites.map((invite, index) => (
              <Box key={invite.email}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {invite.email}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Papel: {invite.role}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={invite.status}
                      color={invite.status === "Aceito" ? "secondary" : "default"}
                      size="small"
                    />
                    <Button variant="text" size="small">
                      Reenviar
                    </Button>
                  </Stack>
                </Box>
                {index !== invites.length - 1 && (
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
