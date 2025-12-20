import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "wouter";
import { nanoid } from "nanoid";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import api from "../api";
import {
  DndContext,
  PointerSensor,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Deal = {
  id: string;
  name: string;
  value: string;
  owner: string;
  link?: string;
  comments?: string;
};

type Column = {
  id: string;
  title: string;
  deals: Deal[];
  description?: string;
};

const defaultColumns: Column[] = [
  {
    id: "leads",
    title: "Leads",
    deals: [
      { id: "orbit", name: "Orbit Media", value: "R$ 18k", owner: "Ana C." },
      { id: "silo", name: "Silo Retail", value: "R$ 22k", owner: "Lucas M." },
    ],
  },
  {
    id: "qualified",
    title: "Qualificados",
    deals: [
      { id: "argo", name: "Argo Health", value: "R$ 92k", owner: "Lucas M." },
      { id: "nova", name: "Nova Terra", value: "R$ 36k", owner: "Sofia L." },
    ],
  },
  {
    id: "proposal",
    title: "Proposta",
    deals: [
      { id: "prisma", name: "Prisma Bank", value: "R$ 68k", owner: "Rafael P." },
      { id: "bluebay", name: "Bluebay", value: "R$ 41k", owner: "Joana S." },
    ],
  },
  {
    id: "closing",
    title: "Fechamento",
    deals: [
      { id: "caravel", name: "Studio Caravel", value: "R$ 48k", owner: "Ana C." },
      { id: "gema", name: "Gema Labs", value: "R$ 31k", owner: "Diego M." },
    ],
  },
];

const columnDragId = (id: string) => `column:${id}`;
const cardDragId = (id: string) => `card:${id}`;
const isColumnId = (id: string) => id.startsWith("column:");
const isCardId = (id: string) => id.startsWith("card:");
const stripPrefix = (id: string) => id.split(":")[1] || id;

export default function Pipeline() {
  const [columns, setColumns] = useState<Column[]>(() => defaultColumns);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editComments, setEditComments] = useState("");
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");
  const [editColumnDescription, setEditColumnDescription] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 3 } }));

  useEffect(() => {
    const loadPipeline = async () => {
      try {
        const response = await api.get("/api/pipeline/board");
        const pipeline = response?.data?.pipeline;
        const incoming = Array.isArray(pipeline) ? pipeline : pipeline?.columns;
        if (Array.isArray(incoming) && incoming.length) {
          setColumns(incoming);
        } else {
          await api.put("/api/pipeline/board", { columns: defaultColumns });
        }
      } catch {
        // Keep defaults if the request fails.
      } finally {
        isLoadedRef.current = true;
      }
    };
    void loadPipeline();
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) {
      return;
    }
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      void api.put("/api/pipeline/board", { columns });
    }, 600);
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [columns]);

  const columnItems = useMemo(
    () => columns.map((column) => columnDragId(column.id)),
    [columns]
  );

  const findColumnByCard = (cardId: string) =>
    columns.find((column) => column.deals.some((deal) => deal.id === cardId));

  const findDeal = (cardId: string) => {
    for (const column of columns) {
      const deal = column.deals.find((item) => item.id === cardId);
      if (deal) {
        return deal;
      }
    }
    return null;
  };

  const findColumn = (columnId: string) =>
    columns.find((column) => column.id === columnId) || null;

  const handleEditOpen = (deal: Deal) => {
    setEditingDeal(deal);
    setEditName(deal.name);
    setEditValue(deal.value);
    setEditOwner(deal.owner);
    setEditLink(deal.link || "");
    setEditComments(deal.comments || "");
  };

  const handleEditClose = () => {
    setEditingDeal(null);
  };

  const handleEditSave = () => {
    if (!editingDeal) {
      return;
    }
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        deals: column.deals.map((deal) =>
          deal.id === editingDeal.id
            ? {
                ...deal,
                name: editName.trim() || deal.name,
                value: editValue.trim() || deal.value,
                owner: editOwner.trim() || deal.owner,
                link: editLink.trim(),
                comments: editComments.trim(),
              }
            : deal
        ),
      }))
    );
    setEditingDeal(null);
  };

  const handleDealRemove = () => {
    if (!editingDeal) {
      return;
    }
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        deals: column.deals.filter((deal) => deal.id !== editingDeal.id),
      }))
    );
    setEditingDeal(null);
  };

  const handleColumnEditOpen = (column: Column) => {
    setEditingColumn(column);
    setEditColumnTitle(column.title);
    setEditColumnDescription(column.description || "");
  };

  const handleColumnEditClose = () => {
    setEditingColumn(null);
  };

  const handleColumnEditSave = () => {
    if (!editingColumn) {
      return;
    }
    const nextTitle = editColumnTitle.trim() || editingColumn.title;
    const nextDescription = editColumnDescription.trim();
    setColumns((prev) =>
      prev.map((column) =>
        column.id === editingColumn.id
          ? { ...column, title: nextTitle, description: nextDescription }
          : column
      )
    );
    setEditingColumn(null);
  };

  const handleColumnRemove = () => {
    if (!editingColumn) {
      return;
    }
    setColumns((prev) => prev.filter((column) => column.id !== editingColumn.id));
    setEditingColumn(null);
  };

  const handleDragStart = (event: { active: { id: string } }) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragOver = (event: { active: { id: string }; over?: { id: string } }) => {
    const activeId = String(event.active.id);
    let overId = event.over ? String(event.over.id) : null;
    if (!overId || activeId === overId) {
      return;
    }

    if (isColumnId(activeId)) {
      if (isCardId(overId)) {
        const overCardId = stripPrefix(overId);
        const targetColumn = findColumnByCard(overCardId);
        if (targetColumn) {
          overId = columnDragId(targetColumn.id);
        }
      }
      if (!overId || !isColumnId(overId) || activeId === overId) {
        return;
      }
      const activeIndex = columns.findIndex(
        (column) => column.id === stripPrefix(activeId)
      );
      const overIndex = columns.findIndex(
        (column) => column.id === stripPrefix(overId)
      );
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        setColumns((prev) => arrayMove(prev, activeIndex, overIndex));
      }
      return;
    }

    if (isCardId(activeId)) {
      const activeCardId = stripPrefix(activeId);
      const sourceColumn = findColumnByCard(activeCardId);
      if (!sourceColumn) {
        return;
      }

      let destinationColumn: Column | undefined;
      let destinationIndex = 0;

      if (isCardId(overId)) {
        const overCardId = stripPrefix(overId);
        destinationColumn = findColumnByCard(overCardId);
        if (!destinationColumn) {
          return;
        }
        destinationIndex = destinationColumn.deals.findIndex(
          (deal) => deal.id === overCardId
        );
      } else if (isColumnId(overId)) {
        destinationColumn = columns.find(
          (column) => column.id === stripPrefix(overId)
        );
        destinationIndex = destinationColumn ? destinationColumn.deals.length : 0;
      } else {
        return;
      }

      if (!destinationColumn) {
        return;
      }

      if (sourceColumn.id === destinationColumn.id) {
        const oldIndex = sourceColumn.deals.findIndex(
          (deal) => deal.id === activeCardId
        );
        if (oldIndex === -1 || oldIndex === destinationIndex) {
          return;
        }
        setColumns((prev) =>
          prev.map((column) =>
            column.id === sourceColumn.id
              ? { ...column, deals: arrayMove(column.deals, oldIndex, destinationIndex) }
              : column
          )
        );
        return;
      }

      const movingDeal = sourceColumn.deals.find((deal) => deal.id === activeCardId);
      if (!movingDeal) {
        return;
      }

      setColumns((prev) =>
        prev.map((column) => {
          if (column.id === sourceColumn.id) {
            return {
              ...column,
              deals: column.deals.filter((deal) => deal.id !== activeCardId),
            };
          }
          if (column.id === destinationColumn?.id) {
            const nextDeals = [...column.deals];
            nextDeals.splice(destinationIndex, 0, movingDeal);
            return { ...column, deals: nextDeals };
          }
          return column;
        })
      );
    }
  };

  const handleDragEnd = (event: { active: { id: string }; over?: { id: string } }) => {
    setActiveDragId(null);
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId || activeId === overId) {
      return;
    }

    if (isColumnId(activeId)) {
      return;
    }

    if (isCardId(activeId)) {
      const activeCardId = stripPrefix(activeId);
      const sourceColumn = findColumnByCard(activeCardId);
      if (!sourceColumn) {
        return;
      }

      let destinationColumn: Column | undefined;
      let destinationIndex = 0;

      if (isCardId(overId)) {
        const overCardId = stripPrefix(overId);
        destinationColumn = findColumnByCard(overCardId);
        if (!destinationColumn) {
          return;
        }
        destinationIndex = destinationColumn.deals.findIndex(
          (deal) => deal.id === overCardId
        );
      } else if (isColumnId(overId)) {
        destinationColumn = columns.find(
          (column) => column.id === stripPrefix(overId)
        );
        destinationIndex = destinationColumn ? destinationColumn.deals.length : 0;
      } else {
        return;
      }

      if (!destinationColumn) {
        return;
      }

      if (sourceColumn.id === destinationColumn.id) {
        const oldIndex = sourceColumn.deals.findIndex(
          (deal) => deal.id === activeCardId
        );
        if (oldIndex === -1 || oldIndex === destinationIndex) {
          return;
        }
        setColumns((prev) =>
          prev.map((column) =>
            column.id === sourceColumn.id
              ? { ...column, deals: arrayMove(column.deals, oldIndex, destinationIndex) }
              : column
          )
        );
        return;
      }

      const movingDeal = sourceColumn.deals.find((deal) => deal.id === activeCardId);
      if (!movingDeal) {
        return;
      }

      setColumns((prev) =>
        prev.map((column) => {
          if (column.id === sourceColumn.id) {
            return {
              ...column,
              deals: column.deals.filter((deal) => deal.id !== activeCardId),
            };
          }
          if (column.id === destinationColumn?.id) {
            const nextDeals = [...column.deals];
            nextDeals.splice(destinationIndex, 0, movingDeal);
            return { ...column, deals: nextDeals };
          }
          return column;
        })
      );
    }
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const handleAddColumn = () => {
    const nextId = nanoid(6);
    const index = columns.length + 1;
    setColumns((prev) => [
      ...prev,
      {
        id: `stage-${nextId}`,
        title: `Etapa ${index}`,
        deals: [],
      },
    ]);
  };

  const handleAddDeal = (columnId: string) => {
    const nextId = nanoid(6);
    setColumns((prev) =>
      prev.map((column) =>
        column.id === columnId
          ? {
              ...column,
              deals: [
                ...column.deals,
                {
                  id: `deal-${nextId}`,
                  name: "Nova oportunidade",
                  value: "R$ 0",
                  owner: "Responsavel",
                },
              ],
            }
          : column
      )
    );
  };

  const handleScrollPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container || event.button !== 0) {
      return;
    }
    if (
      (event.target as HTMLElement | null)?.closest(
        "button,a,input,textarea,select,label,[data-draggable]"
      )
    ) {
      return;
    }
    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    scrollLeftRef.current = container.scrollLeft;
    container.setPointerCapture(event.pointerId);
  };

  const handleScrollPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container || !isDraggingRef.current) {
      return;
    }
    const delta = event.clientX - dragStartXRef.current;
    container.scrollLeft = scrollLeftRef.current - delta;
  };

  const handleScrollPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    isDraggingRef.current = false;
    container.releasePointerCapture(event.pointerId);
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Pipeline
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Visualize oportunidades por estagio e acompanhe o responsavel.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            href="/pipeline/dados"
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Ver dados
          </Button>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={handleAddColumn}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Adicionar coluna
          </Button>
        </Box>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
        onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          autoScroll
        >
          <SortableContext items={columnItems} strategy={horizontalListSortingStrategy}>
            <Box
              ref={scrollRef}
              onPointerDown={handleScrollPointerDown}
              onPointerMove={handleScrollPointerMove}
              onPointerUp={handleScrollPointerUp}
              onPointerLeave={handleScrollPointerUp}
              sx={{
                overflowX: "auto",
                pb: 1,
                cursor: "grab",
                "&:active": { cursor: "grabbing" },
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ width: "max-content", minWidth: "100%" }}
              >
                {columns.map((column) => (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    onEdit={handleEditOpen}
                    onEditColumn={handleColumnEditOpen}
                    onAddDeal={handleAddDeal}
                  />
                ))}
              </Stack>
            </Box>
          </SortableContext>
          <DragOverlay>
            {activeDragId ? (
              isColumnId(activeDragId) ? (
                (() => {
                  const column = findColumn(stripPrefix(activeDragId));
                  if (!column) {
                    return null;
                  }
                  return (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        width: 260,
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(15, 23, 32, 0.95)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {column.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {column.deals.length} tasks
                        </Typography>
                      </Stack>
                    </Paper>
                  );
                })()
              ) : isCardId(activeDragId) ? (
                (() => {
                  const deal = findDeal(stripPrefix(activeDragId));
                  if (!deal) {
                    return null;
                  }
                  return (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(10, 16, 23, 0.95)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {deal.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {deal.owner}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                        {deal.value}
                      </Typography>
                    </Box>
                  );
                })()
              ) : null
            ) : null}
          </DragOverlay>
        </DndContext>
      </Stack>

      <Dialog open={Boolean(editingDeal)} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6">Editar oportunidade</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Ajuste o titulo, valor, responsavel, link e comentarios.
              </Typography>
            </Box>
            <TextField
              label="Titulo"
              fullWidth
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
            />
            <TextField
              label="Valor"
              fullWidth
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
            />
            <TextField
              label="Responsavel"
              fullWidth
              value={editOwner}
              onChange={(event) => setEditOwner(event.target.value)}
            />
            <TextField
              label="Link"
              fullWidth
              value={editLink}
              onChange={(event) => setEditLink(event.target.value)}
            />
            <TextField
              label="Comentarios"
              fullWidth
              multiline
              minRows={3}
              value={editComments}
              onChange={(event) => setEditComments(event.target.value)}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button color="error" variant="outlined" onClick={handleDealRemove}>
                Remover
              </Button>
              <Button variant="outlined" onClick={handleEditClose}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleEditSave}>
                Salvar
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingColumn)}
        onClose={handleColumnEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6">Editar etapa</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Atualize o titulo e a descricao da etapa.
              </Typography>
            </Box>
            <TextField
              label="Titulo"
              fullWidth
              value={editColumnTitle}
              onChange={(event) => setEditColumnTitle(event.target.value)}
            />
            <TextField
              label="Descricao"
              fullWidth
              multiline
              minRows={3}
              value={editColumnDescription}
              onChange={(event) => setEditColumnDescription(event.target.value)}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button color="error" variant="outlined" onClick={handleColumnRemove}>
                Remover
              </Button>
              <Button variant="outlined" onClick={handleColumnEditClose}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleColumnEditSave}>
                Salvar
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function SortableColumn({
  column,
  onEdit,
  onEditColumn,
  onAddDeal,
}: {
  column: Column;
  onEdit: (deal: Deal) => void;
  onEditColumn: (column: Column) => void;
  onAddDeal: (columnId: string) => void;
}) {
  const dragId = columnDragId(column.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: dragId,
      data: { type: "column" },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition || "transform 200ms ease",
    opacity: isDragging ? 0.6 : 1,
    willChange: "transform",
  };

  return (
    <Paper
      ref={setNodeRef}
      elevation={0}
      sx={{
        p: 2.5,
        flex: 1,
        border: "1px solid rgba(255,255,255,0.08)",
        backgroundColor: "rgba(15, 23, 32, 0.9)",
        cursor: "grab",
        touchAction: "none",
      }}
      style={style}
      {...attributes}
      {...listeners}
      data-draggable
    >
      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
            onClick={() => onEditColumn(column)}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {column.title}
            </Typography>
            <Chip
              size="small"
              label={`${column.deals.length} tasks`}
              sx={{
                color: "text.secondary",
                backgroundColor: "rgba(148, 163, 184, 0.16)",
              }}
            />
          </Box>
          <IconButton
            size="small"
            onClick={() => onAddDeal(column.id)}
            sx={{
              ml: "auto",
              color: "text.secondary",
              border: "none",
            }}
          >
            <AddRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <SortableContext
          items={column.deals.map((deal) => cardDragId(deal.id))}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={1.5}>
            {column.deals.map((deal) => (
              <SortableDeal key={deal.id} deal={deal} onEdit={onEdit} />
            ))}
          </Stack>
        </SortableContext>
      </Stack>
    </Paper>
  );
}

function SortableDeal({ deal, onEdit }: { deal: Deal; onEdit: (deal: Deal) => void }) {
  const dragId = cardDragId(deal.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: dragId,
      data: { type: "card" },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition || "transform 180ms ease",
    opacity: isDragging ? 0.6 : 1,
    willChange: "transform",
  };

  return (
    <Box
      ref={setNodeRef}
      sx={{
        p: 2,
        borderRadius: "var(--radius-card)",
        border: "1px solid rgba(255,255,255,0.08)",
        backgroundColor: "rgba(10, 16, 23, 0.85)",
        cursor: "grab",
        touchAction: "none",
      }}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(deal)}
      data-draggable
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {deal.name}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {deal.owner}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
        {deal.value}
      </Typography>
    </Box>
  );
}
