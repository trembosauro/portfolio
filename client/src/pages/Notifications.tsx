import { useEffect, useMemo, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PageContainer from "../components/layout/PageContainer";
import AppCard from "../components/layout/AppCard";
import { loadUserStorage } from "../userStorage";

type Contact = {
  id: string;
  name: string;
  birthday?: string;
};

const STORAGE_KEY = "contacts_v1";
const SEEN_KEY = "notifications_seen_at";

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
  }, []);

  const upcoming = useMemo(() => getUpcomingBirthdays(contacts), [contacts]);

  const markAsSeen = () => {
    window.localStorage.setItem(SEEN_KEY, new Date().toISOString());
    window.dispatchEvent(new Event("contacts-change"));
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Notificações
        </Typography>

        <AppCard sx={{ p: { xs: 2, md: 3 } }}>
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
                  <Paper
                    key={item.contact.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: "var(--radius-card)",
                      borderColor: "divider",
                      backgroundColor: "background.paper",
                    }}
                  >
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
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        </AppCard>
      </Stack>
    </PageContainer>
  );
}
