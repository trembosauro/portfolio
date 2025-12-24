import { useEffect, useMemo, useState, useCallback } from "react";
import { Box, Button, Stack, Typography, useMediaQuery } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PageContainer from "../components/layout/PageContainer";
import CardSection from "../components/layout/CardSection";
import { loadUserStorage } from "../userStorage";
import { interactiveCardSx } from "../styles/interactiveCard";
import { useLocation } from "wouter";

type Contact = {
  id: string;
  name: string;
  birthday?: string;
};

type CompletedTaskNotification = {
  id: string;
  taskId: string;
  taskName: string;
  completedAt: string;
};

const STORAGE_KEY = "contacts_v1";
const SEEN_KEY = "notifications_seen_at";
const COMPLETED_TASKS_KEY = "sc_completed_tasks_notifications";
const TASK_SEEN_KEY = "notifications_tasks_seen_at";

const getUpcomingBirthdays = (contacts: Contact[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return contacts
    .filter(contact => typeof contact.birthday === "string" && contact.birthday)
    .map(contact => {
      const parts = String(contact.birthday).split("-").map(Number);
      if (parts.length < 3) {
        return null;
      }
      const [, month, day] = parts;
      if (!month || !day) {
        return null;
      }
      const next = new Date(today.getFullYear(), month - 1, day);
      next.setHours(0, 0, 0, 0);
      if (next < today) {
        next.setFullYear(today.getFullYear() + 1);
      }
      const diffDays = Math.round(
        (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { contact, next, diffDays };
    })
    .filter(
      (item): item is { contact: Contact; next: Date; diffDays: number } =>
        Boolean(item)
    )
    .filter(item => item.diffDays >= 0 && item.diffDays <= 7)
    .sort((a, b) => a.diffDays - b.diffDays);
};

export default function Notifications() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTaskNotification[]>([]);

  const loadCompletedTasks = useCallback(() => {
    const stored = window.localStorage.getItem(COMPLETED_TASKS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CompletedTaskNotification[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCompletedTasks(parsed);
          return;
        }
      } catch {
        // fall through to create demo data
      }
    }
    // Criar dados demo para visualização
    const now = new Date();
    const demoTasks: CompletedTaskNotification[] = [
      {
        id: "demo-1",
        taskId: "task-1",
        taskName: "Revisar proposta comercial",
        completedAt: new Date(now.getTime() - 5 * 60000).toISOString(), // 5 min atrás
      },
      {
        id: "demo-2",
        taskId: "task-2",
        taskName: "Reunião com cliente ABC",
        completedAt: new Date(now.getTime() - 2 * 3600000).toISOString(), // 2h atrás
      },
      {
        id: "demo-3",
        taskId: "task-3",
        taskName: "Enviar relatório mensal",
        completedAt: new Date(now.getTime() - 5 * 3600000).toISOString(), // 5h atrás
      },
      {
        id: "demo-4",
        taskId: "task-4",
        taskName: "Atualizar documentação do projeto",
        completedAt: new Date(now.getTime() - 24 * 3600000).toISOString(), // 1 dia atrás
      },
      {
        id: "demo-5",
        taskId: "task-5",
        taskName: "Planejar sprint semanal",
        completedAt: new Date(now.getTime() - 48 * 3600000).toISOString(), // 2 dias atrás
      },
      {
        id: "demo-6",
        taskId: "task-6",
        taskName: "Fazer backup dos arquivos",
        completedAt: new Date(now.getTime() - 72 * 3600000).toISOString(), // 3 dias atrás
      },
      {
        id: "demo-7",
        taskId: "task-7",
        taskName: "Organizar tarefas da semana",
        completedAt: new Date(now.getTime() - 96 * 3600000).toISOString(), // 4 dias atrás
      },
      {
        id: "demo-8",
        taskId: "task-8",
        taskName: "Responder emails pendentes",
        completedAt: new Date(now.getTime() - 120 * 3600000).toISOString(), // 5 dias atrás
      },
      {
        id: "demo-9",
        taskId: "task-9",
        taskName: "Finalizar apresentação",
        completedAt: new Date(now.getTime() - 144 * 3600000).toISOString(), // 6 dias atrás
      },
    ];
    window.localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(demoTasks));
    setCompletedTasks(demoTasks);
  }, []);

  useEffect(() => {
    const load = async () => {
      const dbContacts = await loadUserStorage<Contact[]>(STORAGE_KEY);
      if (Array.isArray(dbContacts)) {
        setContacts(dbContacts);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dbContacts));
        return;
      }
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }
      try {
        const parsed = JSON.parse(stored) as Contact[];
        if (Array.isArray(parsed)) {
          setContacts(parsed);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    };
    void load();
    loadCompletedTasks();

    // Escutar evento de tarefa completada
    const handleTaskCompleted = () => loadCompletedTasks();
    window.addEventListener("task-completed", handleTaskCompleted);
    return () => window.removeEventListener("task-completed", handleTaskCompleted);
  }, [loadCompletedTasks]);

  const upcoming = useMemo(() => getUpcomingBirthdays(contacts), [contacts]);

  const markAsSeen = () => {
    window.localStorage.setItem(SEEN_KEY, new Date().toISOString());
    window.dispatchEvent(new Event("contacts-change"));
  };

  const markTasksAsSeen = () => {
    window.localStorage.setItem(TASK_SEEN_KEY, new Date().toISOString());
  };

  const clearCompletedTasks = () => {
    window.localStorage.removeItem(COMPLETED_TASKS_KEY);
    setCompletedTasks([]);
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return "Ontem";
    return `Há ${diffDays} dias`;
  };


  const [, setLocation] = useLocation();
  const isMd = useMediaQuery('(min-width:900px)');
  const is1080 = useMediaQuery('(max-width:1080px)');

  const handleTaskClick = (taskId: string) => {
    // Vai para a tela do calendário e abre o modal da tarefa
    setLocation(`/calendario?task=${taskId}`);
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CardSection>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleRoundedIcon sx={{ color: 'text.secondary' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tarefas concluídas
              </Typography>
              <Box sx={{ flex: 1 }} />
              {completedTasks.length > 0 ? (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={markTasksAsSeen}
                    startIcon={<CheckRoundedIcon fontSize="small" />}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Marcar como visto
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    onClick={clearCompletedTasks}
                    startIcon={<DeleteRoundedIcon fontSize="small" />}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Limpar
                  </Button>
                </Stack>
              ) : null}
            </Stack>

            {completedTasks.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Nenhuma tarefa concluída recentemente.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    md: is1080 ? '1fr 1fr 1fr' : (isMd ? '1fr 1fr 1fr' : '1fr 1fr'),
                  },
                  gap: 2,
                  '@media (max-width:1080px)': {
                    gridTemplateColumns: '1fr 1fr 1fr',
                  },
                }}
              >
                {completedTasks.map(task => (
                  <CardSection
                    size="xs"
                    key={task.id}
                    onClick={() => handleTaskClick(task.taskId)}
                    sx={theme => ({
                      cursor: "pointer",
                      minHeight: 64,
                      ...interactiveCardSx(theme),
                    })}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {task.taskName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Concluída · {formatTimeAgo(task.completedAt)}
                    </Typography>
                  </CardSection>
                ))}
              </Box>
            )}
          </Stack>
        </CardSection>

        <CardSection>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Aniversários
              </Typography>
              <Box sx={{ flex: 1 }} />
              {upcoming.length > 0 ? (
                <Button
                  size="small"
                  onClick={markAsSeen}
                  startIcon={<CheckRoundedIcon fontSize="small" />}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Marcar como visto
                </Button>
              ) : null}
            </Stack>

            {upcoming.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Nenhum aniversario nos proximos dias.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {upcoming.map(item => (
                  <CardSection size="xs" key={item.contact.id}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {item.contact.name || "Contato sem nome"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {item.next.toLocaleDateString("pt-BR")} · em{" "}
                      {item.diffDays} dia(s)
                    </Typography>
                  </CardSection>
                ))}
              </Stack>
            )}
          </Stack>
        </CardSection>
      </Stack>
    </PageContainer>
  );
}
