import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Link as RouterLink } from "wouter";
import api from "../api";

type PipelineSummary = {
  id: string;
  stage: string;
  count: number;
  value: string;
};

type Task = {
  id: string;
  title: string;
  owner: string;
  due: string;
  status: string;
};

type Deal = {
  id: string;
  name: string;
  stage: string;
  value: string;
  owner: string;
};

const defaultPipeline: PipelineSummary[] = [
  { id: "leads", stage: "Leads", count: 24, value: "R$ 310k" },
  { id: "qualified", stage: "Qualificados", count: 11, value: "R$ 210k" },
  { id: "proposal", stage: "Proposta", count: 6, value: "R$ 150k" },
  { id: "closing", stage: "Fechamento", count: 3, value: "R$ 92k" },
];

const defaultTasks: Task[] = [
  {
    id: "task-1",
    title: "Revisar proposta - Studio Caravel",
    owner: "Ana C.",
    due: "Hoje, 16:00",
    status: "Alta",
  },
  {
    id: "task-2",
    title: "Ligar para CFO - Argo Health",
    owner: "Lucas M.",
    due: "Amanha, 10:30",
    status: "Media",
  },
  {
    id: "task-3",
    title: "Enviar NDA - Prisma Bank",
    owner: "Rafael P.",
    due: "Sexta, 14:00",
    status: "Baixa",
  },
];

const defaultDeals: Deal[] = [
  {
    id: "deal-1",
    name: "Prisma Bank",
    stage: "Proposta",
    value: "R$ 68k",
    owner: "Rafael P.",
  },
  {
    id: "deal-2",
    name: "Argo Health",
    stage: "Qualificados",
    value: "R$ 92k",
    owner: "Lucas M.",
  },
  {
    id: "deal-3",
    name: "Studio Caravel",
    stage: "Fechamento",
    value: "R$ 48k",
    owner: "Ana C.",
  },
];

export default function PipelineData() {
  const [pipeline, setPipeline] = useState<PipelineSummary[]>(defaultPipeline);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [deals, setDeals] = useState<Deal[]>(defaultDeals);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [taskForm, setTaskForm] = useState<Task | null>(null);
  const [dealForm, setDealForm] = useState<Deal | null>(null);
  const isLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get("/api/pipeline/data");
        const data = response?.data?.data;
        if (data?.pipeline) {
          setPipeline(data.pipeline);
        }
        if (data?.tasks) {
          setTasks(data.tasks);
        }
        if (data?.deals) {
          setDeals(data.deals);
        }
      } catch {
        // Keep defaults if the request fails.
      } finally {
        isLoadedRef.current = true;
      }
    };
    void loadData();
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) {
      return;
    }
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      void api.put("/api/pipeline/data", { pipeline, tasks, deals });
    }, 600);
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [pipeline, tasks, deals]);

  const openTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({ ...task });
  };

  const openDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setDealForm({ ...deal });
  };

  const handleTaskSave = () => {
    if (!editingTask || !taskForm) {
      return;
    }
    setTasks((prev) =>
      prev.map((item) => (item.id === editingTask.id ? taskForm : item))
    );
    setEditingTask(null);
    setTaskForm(null);
  };

  const handleDealSave = () => {
    if (!editingDeal || !dealForm) {
      return;
    }
    setDeals((prev) =>
      prev.map((item) => (item.id === editingDeal.id ? dealForm : item))
    );
    setEditingDeal(null);
    setDealForm(null);
  };

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Dados
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Acompanhe pipeline, tarefas e oportunidades em um painel unico.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            href="/pipeline"
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Ver pipeline
          </Button>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {pipeline.map((item) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 2.5,
                flex: 1,
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(135deg, rgba(34, 201, 166, 0.12), rgba(15, 23, 32, 0.9))",
              }}
            >
              <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                {item.stage}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {item.count}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {item.value}
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              flex: 1.1,
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(15, 23, 32, 0.85)",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tarefas do dia
              </Typography>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
              <Stack spacing={2}>
                {tasks.map((task) => (
                  <Box
                    key={task.id}
                    onClick={() => openTask(task)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      p: 2,
                      borderRadius: "var(--radius-card)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(10, 16, 23, 0.7)",
                      cursor: "pointer",
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {task.title}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {task.owner}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {task.due}
                      </Typography>
                      <Chip
                        size="small"
                        label={task.status}
                        color={task.status === "Alta" ? "secondary" : "default"}
                        sx={{
                          color: "text.primary",
                          backgroundColor:
                            task.status === "Alta"
                              ? "rgba(245, 158, 11, 0.25)"
                              : "rgba(148, 163, 184, 0.18)",
                        }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              flex: 0.9,
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(15, 23, 32, 0.9)",
            }}
          >
            <Stack spacing={2.5}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Oportunidades chave
              </Typography>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
              <Stack spacing={2}>
                {deals.map((deal) => (
                  <Box
                    key={deal.id}
                    onClick={() => openDeal(deal)}
                    sx={{
                      p: 2,
                      borderRadius: "var(--radius-card)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(10, 16, 23, 0.85)",
                      cursor: "pointer",
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {deal.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {deal.stage} - {deal.owner}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                      {deal.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      <Dialog open={Boolean(editingTask)} onClose={() => setEditingTask(null)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Stack spacing={2.5}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6">Editar tarefa</Typography>
              <IconButton onClick={() => setEditingTask(null)} sx={{ color: "text.secondary" }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="Titulo"
              fullWidth
              value={taskForm?.title || ""}
              onChange={(event) =>
                setTaskForm((prev) => (prev ? { ...prev, title: event.target.value } : prev))
              }
            />
            <TextField
              label="Responsavel"
              fullWidth
              value={taskForm?.owner || ""}
              onChange={(event) =>
                setTaskForm((prev) => (prev ? { ...prev, owner: event.target.value } : prev))
              }
            />
            <TextField
              label="Prazo"
              fullWidth
              value={taskForm?.due || ""}
              onChange={(event) =>
                setTaskForm((prev) => (prev ? { ...prev, due: event.target.value } : prev))
              }
            />
            <TextField
              label="Status"
              fullWidth
              value={taskForm?.status || ""}
              onChange={(event) =>
                setTaskForm((prev) => (prev ? { ...prev, status: event.target.value } : prev))
              }
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setEditingTask(null)}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleTaskSave}>
                Salvar
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingDeal)} onClose={() => setEditingDeal(null)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Stack spacing={2.5}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6">Editar oportunidade</Typography>
              <IconButton onClick={() => setEditingDeal(null)} sx={{ color: "text.secondary" }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="Nome"
              fullWidth
              value={dealForm?.name || ""}
              onChange={(event) =>
                setDealForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))
              }
            />
            <TextField
              label="Etapa"
              fullWidth
              value={dealForm?.stage || ""}
              onChange={(event) =>
                setDealForm((prev) => (prev ? { ...prev, stage: event.target.value } : prev))
              }
            />
            <TextField
              label="Valor"
              fullWidth
              value={dealForm?.value || ""}
              onChange={(event) =>
                setDealForm((prev) => (prev ? { ...prev, value: event.target.value } : prev))
              }
            />
            <TextField
              label="Responsavel"
              fullWidth
              value={dealForm?.owner || ""}
              onChange={(event) =>
                setDealForm((prev) => (prev ? { ...prev, owner: event.target.value } : prev))
              }
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setEditingDeal(null)}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleDealSave}>
                Salvar
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
