/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Dialog,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChurchIcon from "@mui/icons-material/Church";
import AddIcon from "@mui/icons-material/Add";
import { useNavegacaoProtegida } from "../Context/UnsavedChangesContext";
import api from "../services/apiService";
import { buscarIgrejaCompletaPorId, normalizarIgrejaParaEdicao } from "../services/igrejaHelpers";
import { navSections } from "./navItems";
import LoadingState from "./LoadingState";

const MAX_IGREJAS = 6;

const semAcento = (t) => (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Busca global (Ctrl/Cmd+K): atalhos de páginas e igrejas por nome ou ID. */
const GlobalSearch = ({ open, onClose }) => {
  const navigate = useNavegacaoProtegida();
  const [termo, setTermo] = useState("");
  const [igrejas, setIgrejas] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [indice, setIndice] = useState(0);
  const [abrindoId, setAbrindoId] = useState(null);
  const requisicao = useRef(0);

  const paginas = useMemo(() => {
    const todas = [
      ...navSections.flatMap((s) => s.items.map((i) => ({ ...i, secao: s.title }))),
      { path: "/igrejaNovo", label: "Nova igreja", icon: AddIcon, secao: "Operação" },
    ];
    const q = semAcento(termo.trim());
    if (!q) return todas.slice(0, 5);
    return todas.filter((p) => semAcento(p.label).includes(q)).slice(0, 5);
  }, [termo]);

  useEffect(() => {
    if (!open) {
      setTermo("");
      setIgrejas([]);
      setIndice(0);
      setAbrindoId(null);
    }
  }, [open]);

  useEffect(() => {
    const q = termo.trim();
    if (q.length < 2) {
      setIgrejas([]);
      setBuscando(false);
      return undefined;
    }
    const id = ++requisicao.current;
    setBuscando(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (/^\d+$/.test(q)) params.append("id", q);
      else params.append("nome", q);
      params.append("ativo", "");
      params.append("Paginacao.PageIndex", 1);
      params.append("Paginacao.PageSize", MAX_IGREJAS);
      api
        .get(`/api/v1/admin/igreja/buscar-por-filtro?${params.toString()}`)
        .then((response) => {
          if (id === requisicao.current) setIgrejas(response.data?.data?.items || []);
        })
        .catch(() => {
          if (id === requisicao.current) setIgrejas([]);
        })
        .finally(() => {
          if (id === requisicao.current) setBuscando(false);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [termo]);

  useEffect(() => setIndice(0), [termo, igrejas.length]);

  const resultados = useMemo(
    () => [
      ...paginas.map((p) => ({ tipo: "pagina", chave: `p-${p.path}`, item: p })),
      ...igrejas.map((i) => ({ tipo: "igreja", chave: `i-${i.id}`, item: i })),
    ],
    [paginas, igrejas]
  );

  const abrir = async (r) => {
    if (!r) return;
    if (r.tipo === "pagina") {
      navigate(r.item.path);
      onClose();
      return;
    }
    try {
      setAbrindoId(r.item.id);
      const completa = await buscarIgrejaCompletaPorId(r.item.id);
      navigate("/igrejaEditar", { state: { row: normalizarIgrejaParaEdicao(completa) } });
      onClose();
    } catch {
      setAbrindoId(null);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndice((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      abrir(resultados[indice]);
    }
  };

  const itemSelecionado = (chave) => resultados[indice]?.chave === chave;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { position: "absolute", top: { xs: 16, sm: 80 }, m: 0, width: "calc(100% - 32px)", maxWidth: 600 } } }}
    >
      <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="Buscar igreja por nome ou ID, ou ir para uma página"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={onKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <List dense sx={{ maxHeight: 420, overflow: "auto", py: 0.5 }}>
        {paginas.length > 0 && <ListSubheader sx={{ lineHeight: 2.2 }}>Páginas</ListSubheader>}
        {paginas.map((p) => {
          const Icon = p.icon;
          const chave = `p-${p.path}`;
          return (
            <ListItemButton key={chave} selected={itemSelecionado(chave)} onClick={() => abrir({ tipo: "pagina", item: p })}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={p.label} secondary={p.secao} />
            </ListItemButton>
          );
        })}

        {termo.trim().length >= 2 && <ListSubheader sx={{ lineHeight: 2.2 }}>Igrejas</ListSubheader>}
        {buscando && igrejas.length === 0 && <LoadingState sx={{ py: 2 }} label="Buscando igrejas..." />}
        {!buscando && termo.trim().length >= 2 && igrejas.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
            Nenhuma igreja encontrada.
          </Typography>
        )}
        {igrejas.map((i) => {
          const chave = `i-${i.id}`;
          const local = [i.endereco?.localidade, i.endereco?.uf].filter(Boolean).join("/");
          return (
            <ListItemButton
              key={chave}
              selected={itemSelecionado(chave)}
              disabled={abrindoId === i.id}
              onClick={() => abrir({ tipo: "igreja", item: i })}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ChurchIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={i.nome} secondary={`#${i.id}${local ? ` · ${local}` : ""}`} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ px: 2, py: 1, borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 2 }}>
        <Typography variant="caption" color="text.secondary">↑↓ navegar</Typography>
        <Typography variant="caption" color="text.secondary">Enter abrir</Typography>
        <Typography variant="caption" color="text.secondary">Esc fechar</Typography>
      </Box>
    </Dialog>
  );
};

export default GlobalSearch;
