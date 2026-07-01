/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

const CHIPS = [
  { key: "semContatoEmail",     label: "Nunca receberam e-mail",     color: "warning" },
  { key: "semContatoInstagram", label: "Nunca receberam Instagram",  color: "warning" },
  { key: "comEmail",            label: "Com e-mail",                 color: "info" },
  { key: "comInstagram",        label: "Com Instagram",              color: "secondary" },
  { key: "criadaRecentemente",  label: "Criadas recentemente",       color: "success" },
  { key: "alteradaRecentemente", label: "Alteradas recentemente",   color: "success" },
];

const filtrosVazios = {
  nome: "",
  cidade: "",
  uf: "",
  comEmail: false,
  comInstagram: false,
  semContatoEmail: false,
  semContatoInstagram: false,
  criadaRecentemente: false,
  alteradaRecentemente: false,
};

const FiltrosRapidos = ({ filtros, onChange, onBuscar, onLimpar }) => {
  const toggleChip = (key) => onChange({ ...filtros, [key]: !filtros[key] });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Chips de filtro rápido */}
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {CHIPS.map(({ key, label, color }) => (
          <Chip
            key={key}
            label={label}
            color={filtros[key] ? color : "default"}
            variant={filtros[key] ? "filled" : "outlined"}
            onClick={() => toggleChip(key)}
            clickable
            size="small"
          />
        ))}
      </Stack>

      <Divider />

      {/* Campos de texto */}
      <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
        <TextField
          label="Nome da igreja"
          size="small"
          value={filtros.nome}
          onChange={(e) => onChange({ ...filtros, nome: e.target.value })}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && onBuscar()}
        />
        <TextField
          label="Cidade"
          size="small"
          value={filtros.cidade}
          onChange={(e) => onChange({ ...filtros, cidade: e.target.value })}
          sx={{ minWidth: 160 }}
          onKeyDown={(e) => e.key === "Enter" && onBuscar()}
        />
        <TextField
          label="Estado (UF)"
          size="small"
          value={filtros.uf}
          onChange={(e) => onChange({ ...filtros, uf: e.target.value.toUpperCase().slice(0, 2) })}
          sx={{ width: 100 }}
          onKeyDown={(e) => e.key === "Enter" && onBuscar()}
        />
        <Button variant="contained" size="small" startIcon={<SearchIcon />} onClick={onBuscar}>
          Buscar
        </Button>
        <Button variant="outlined" size="small" startIcon={<FilterAltOffIcon />} onClick={() => { onChange(filtrosVazios); onLimpar(); }}>
          Limpar
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
          Combine múltiplos filtros
        </Typography>
      </Stack>
    </Box>
  );
};

export { filtrosVazios };
export default FiltrosRapidos;
