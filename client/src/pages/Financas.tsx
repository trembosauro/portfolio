import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import api from "../api";

type Category = {
  id: string;
  name: string;
  color: string;
};

type Expense = {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  comment: string;
  createdAt: string;
};

const STORAGE_KEY = "finance_data_v1";
const DEFAULT_COLORS = [
  "#22c9a6",
  "#f59e0b",
  "#38bdf8",
  "#a78bfa",
  "#f97316",
  "#ef4444",
  "#84cc16",
  "#e879f9",
];

const defaultCategories: Category[] = [
  { id: "cat-outros", name: "Outros", color: "#94a3b8" },
  { id: "cat-pessoal", name: "Pessoal", color: "#22c9a6" },
  { id: "cat-infra", name: "Infra", color: "#38bdf8" },
  { id: "cat-servicos", name: "Servicos", color: "#f59e0b" },
];

const defaultExpenses: Expense[] = [
  {
    id: "exp-1",
    title: "Assinatura Cloud",
    amount: 2800,
    categoryId: "cat-infra",
    comment: "Infra mensal",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-2",
    title: "Equipe de suporte",
    amount: 9200,
    categoryId: "cat-pessoal",
    comment: "Fixo",
    createdAt: new Date().toISOString(),
  },
];

const isValidColor = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return true;
  }
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(trimmed)) {
    return true;
  }
  return false;
};

const getContrastColor = (value: string) => {
  const trimmed = value.trim();
  let r = 0;
  let g = 0;
  let b = 0;

  if (/^#([0-9a-fA-F]{3})$/.test(trimmed)) {
    const hex = trimmed.slice(1);
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (/^#([0-9a-fA-F]{6})$/.test(trimmed)) {
    const hex = trimmed.slice(1);
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    const match = trimmed.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (match) {
      r = Math.min(255, Number(match[1]));
      g = Math.min(255, Number(match[2]));
      b = Math.min(255, Number(match[3]));
    }
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0b0f14" : "#e6edf3";
};

const darkenColor = (value: string, factor: number) => {
  const trimmed = value.trim();
  let r = 0;
  let g = 0;
  let b = 0;

  if (/^#([0-9a-fA-F]{3})$/.test(trimmed)) {
    const hex = trimmed.slice(1);
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (/^#([0-9a-fA-F]{6})$/.test(trimmed)) {
    const hex = trimmed.slice(1);
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    const match = trimmed.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (match) {
      r = Math.min(255, Number(match[1]));
      g = Math.min(255, Number(match[2]));
      b = Math.min(255, Number(match[3]));
    }
  }

  const next = (channel: number) => Math.max(0, Math.round(channel * factor));
  return `rgb(${next(r)}, ${next(g)}, ${next(b)})`;
};

export default function Financas() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategories[0]?.id || "");
  const [comment, setComment] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(DEFAULT_COLORS[0]);
  const [customColor, setCustomColor] = useState(DEFAULT_COLORS[0]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryColor, setEditingCategoryColor] = useState(DEFAULT_COLORS[0]);
  const [editingCustomColor, setEditingCustomColor] = useState(DEFAULT_COLORS[0]);
  const [expanded, setExpanded] = useState<"expense" | "categories" | false>("expense");
  const isLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/api/finance/data");
        const data = response?.data?.data;
        if (data?.categories) {
          setCategories(data.categories);
        }
        if (data?.expenses) {
          setExpenses(data.expenses);
        }
      } catch {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as {
              categories?: Category[];
              expenses?: Expense[];
            };
            if (parsed.categories) {
              setCategories(parsed.categories);
            }
            if (parsed.expenses) {
              setExpenses(parsed.expenses);
            }
          } catch {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        }
      } finally {
        isLoadedRef.current = true;
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) {
      return;
    }
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      const data = { categories, expenses };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      void api.put("/api/finance/data", data);
    }, 600);
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [categories, expenses]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  const totalsByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    expenses.forEach((expense) => {
      totals.set(
        expense.categoryId,
        (totals.get(expense.categoryId) || 0) + expense.amount
      );
    });
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      value: totals.get(cat.id) || 0,
      color: cat.color,
    }));
  }, [categories, expenses]);

  const totalsByMonth = useMemo(() => {
    const buckets = new Map<string, number>();
    expenses.forEach((expense) => {
      const date = new Date(expense.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, (buckets.get(key) || 0) + expense.amount);
    });
    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-6)
      .map(([month, value]) => ({ month, value }));
  }, [expenses]);

  const handleAddExpense = () => {
    const parsed = Number(amount.replace(",", "."));
    if (!title.trim() || Number.isNaN(parsed)) {
      return;
    }
    const id = `exp-${Date.now()}`;
    setExpenses((prev) => [
      {
        id,
        title: title.trim(),
        amount: parsed,
        categoryId,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setTitle("");
    setAmount("");
    setComment("");
    setOpen(false);
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    const color = isValidColor(customColor) ? customColor.trim() : newCategoryColor;
    if (!name) {
      return;
    }
    const id = `cat-${Date.now()}`;
    setCategories((prev) => [...prev, { id, name, color }]);
    setNewCategoryName("");
  };

  const handleRemoveCategory = (id: string) => {
    const fallback = categories[0]?.id || "cat-outros";
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.categoryId === id ? { ...expense, categoryId: fallback } : expense
      )
    );
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
    setEditingCategoryColor(cat.color);
    setEditingCustomColor(cat.color);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
  };

  const saveCategory = () => {
    if (!editingCategoryId) {
      return;
    }
    const name = editingCategoryName.trim();
    if (!name) {
      return;
    }
    const color = isValidColor(editingCustomColor)
      ? editingCustomColor.trim()
      : editingCategoryColor;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === editingCategoryId ? { ...cat, name, color } : cat
      )
    );
    setEditingCategoryId(null);
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Financas
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Entenda para onde estao indo os gastos e ajuste o orcamento.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Adicionar gasto
          </Button>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              flex: 1,
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(15, 23, 32, 0.85)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Gastos por categoria
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalsByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    label={({ name }) => `${name}`}
                    labelLine={false}
                    labelStyle={{ fill: "#e6edf3", fontSize: 12 }}
                  >
                    {totalsByCategory.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(12, 18, 26, 0.98)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#e6edf3",
                    }}
                    labelStyle={{ color: "#e6edf3" }}
                    itemStyle={{ color: "#e6edf3" }}
                    cursor={{ fill: "rgba(12, 18, 26, 0.45)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              flex: 1,
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(15, 23, 32, 0.85)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Evolucao mensal
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalsByMonth}>
                  <XAxis dataKey="month" tick={{ fill: "#9aa6b2", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#9aa6b2", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(12, 18, 26, 0.98)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#e6edf3",
                    }}
                    labelStyle={{ color: "#e6edf3" }}
                    itemStyle={{ color: "#e6edf3" }}
                    cursor={{ fill: "rgba(12, 18, 26, 0.45)" }}
                  />
                  <Bar dataKey="value" fill="#22c9a6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Stack>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Stack spacing={2.5}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6">Adicionar gasto</Typography>
              <IconButton onClick={() => setOpen(false)} sx={{ color: "text.secondary" }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <Accordion
              expanded={expanded === "expense"}
              onChange={(_, isExpanded) => setExpanded(isExpanded ? "expense" : false)}
              disableGutters
              elevation={0}
              sx={{
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 2,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Adicionar gasto
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    label="Titulo do gasto"
                    fullWidth
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                  <TextField
                    label="Valor"
                    fullWidth
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  <TextField
                    select
                    label="Categoria"
                    fullWidth
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Comentario"
                    fullWidth
                    multiline
                    minRows={3}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expanded === "categories"}
              onChange={(_, isExpanded) => {
                setExpanded(isExpanded ? "categories" : false);
                if (!isExpanded) {
                  cancelEditCategory();
                }
              }}
              disableGutters
              elevation={0}
              sx={{
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 2,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Categorias
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {editingCategoryId ? (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(10, 16, 23, 0.7)",
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Editar categoria
                        </Typography>
                        <TextField
                          label="Nome"
                          fullWidth
                          value={editingCategoryName}
                          onChange={(event) => setEditingCategoryName(event.target.value)}
                        />
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {DEFAULT_COLORS.map((color) => (
                            <Box
                              key={color}
                              onClick={() => {
                                setEditingCategoryColor(color);
                                setEditingCustomColor(color);
                              }}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1,
                                backgroundColor: color,
                                border:
                                  editingCategoryColor === color
                                    ? "2px solid rgba(255,255,255,0.8)"
                                    : "1px solid rgba(255,255,255,0.2)",
                                cursor: "pointer",
                              }}
                            />
                          ))}
                        </Stack>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                          <TextField
                            label="Cor (hex ou rgb)"
                            fullWidth
                            value={editingCustomColor}
                            onChange={(event) => setEditingCustomColor(event.target.value)}
                          />
                          <TextField
                            type="color"
                            label="Cor"
                            value={
                              isValidColor(editingCustomColor)
                                ? editingCustomColor
                                : editingCategoryColor
                            }
                            onChange={(event) => {
                              setEditingCustomColor(event.target.value);
                              setEditingCategoryColor(event.target.value);
                            }}
                            sx={{
                              width: { xs: "100%", sm: 140 },
                              "& input": {
                                padding: "10px 12px",
                                height: 44,
                                borderRadius: "var(--radius-card)",
                              },
                            }}
                          />
                        </Stack>
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                          <Button variant="outlined" onClick={cancelEditCategory}>
                            Cancelar
                          </Button>
                          <Button variant="contained" onClick={saveCategory}>
                            Salvar
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : null}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {categories.map((cat) => (
                      <Chip
                        key={cat.id}
                        label={cat.name}
                        onClick={() => startEditCategory(cat)}
                    onDelete={
                      cat.id === "cat-outros" ? undefined : () => handleRemoveCategory(cat.id)
                    }
                    sx={{
                      color: "#e6edf3",
                      backgroundColor: darkenColor(cat.color, 0.5),
                    }}
                  />
                ))}
              </Stack>

                  {editingCategoryId ? null : (
                    <Box>
                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                        Nova categoria
                      </Typography>
                    <Stack spacing={1.5}>
                      <TextField
                        label="Nome"
                        fullWidth
                        value={newCategoryName}
                        onChange={(event) => setNewCategoryName(event.target.value)}
                      />
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {DEFAULT_COLORS.map((color) => (
                          <Box
                            key={color}
                            onClick={() => {
                              setNewCategoryColor(color);
                              setCustomColor(color);
                            }}
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              backgroundColor: color,
                              border:
                                newCategoryColor === color
                                  ? "2px solid rgba(255,255,255,0.8)"
                                  : "1px solid rgba(255,255,255,0.2)",
                              cursor: "pointer",
                            }}
                          />
                        ))}
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          label="Cor (hex ou rgb)"
                          fullWidth
                          value={customColor}
                          onChange={(event) => setCustomColor(event.target.value)}
                        />
                        <TextField
                          type="color"
                          label="Cor"
                          value={isValidColor(customColor) ? customColor : newCategoryColor}
                          onChange={(event) => {
                            setCustomColor(event.target.value);
                            setNewCategoryColor(event.target.value);
                          }}
                          sx={{
                            width: { xs: "100%", sm: 140 },
                            "& input": {
                              padding: "10px 12px",
                              height: 44,
                              borderRadius: "var(--radius-card)",
                            },
                          }}
                        />
                      </Stack>
                      <Button
                        variant="outlined"
                        onClick={handleAddCategory}
                        startIcon={<AddRoundedIcon />}
                        sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
                      >
                        Criar categoria
                  </Button>
                </Stack>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleAddExpense}>
                Salvar gasto
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
