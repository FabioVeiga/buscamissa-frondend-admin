/* eslint-disable react/prop-types */
import { Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Filtro de período: intervalo De/Até, atalhos e ações (pesquisar, limpar, atualizar).
 * presets: [{ key, label, onSelect }]; activeKey destaca o atalho equivalente ao filtro atual.
 */
export default function PeriodFilter({
  dataInicial,
  dataFinal,
  onChangeInicial,
  onChangeFinal,
  presets = [],
  activeKey,
  onSearch,
  onClear,
  onRefresh,
  loading = false,
  sticky = false,
}) {
  return (
    <Paper
      sx={{
        p: 2,
        ...(sticky && { position: 'sticky', top: 8, zIndex: 1 }),
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'primary.main', flexShrink: 0 }}>
          <AccessTimeIcon fontSize="small" />
          <Typography variant="subtitle2" fontWeight={700}>Período</Typography>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ bgcolor: 'action.hover', borderRadius: 2, px: 1.25, py: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}
        >
          <TextField
            variant="standard"
            label="De"
            type="date"
            size="small"
            value={dataInicial}
            onChange={(e) => onChangeInicial(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          <Box sx={{ width: 14, height: 1.5, bgcolor: 'text.disabled', flexShrink: 0, mt: 1.5 }} />
          <TextField
            variant="standard"
            label="Até"
            type="date"
            size="small"
            value={dataFinal}
            onChange={(e) => onChangeFinal(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {presets.map((p) => (
            <Chip
              key={p.key}
              label={p.label}
              size="small"
              clickable
              color={activeKey === p.key ? 'primary' : 'default'}
              variant={activeKey === p.key ? 'filled' : 'outlined'}
              onClick={p.onSelect}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ ml: { md: 'auto' }, flexShrink: 0 }}>
          <Button variant="contained" size="small" startIcon={<SearchIcon />} onClick={onSearch}>
            Pesquisar
          </Button>
          <Tooltip title="Limpar período (ver todo o histórico)">
            <Button variant="outlined" size="small" aria-label="Limpar período" onClick={onClear} sx={{ minWidth: 0, px: 1.25 }}>
              <ClearIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Atualizar dados do período atual">
            <span>
              <Button variant="outlined" size="small" aria-label="Atualizar dados" onClick={onRefresh} disabled={loading} sx={{ minWidth: 0, px: 1.25 }}>
                {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
