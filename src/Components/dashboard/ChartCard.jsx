/* eslint-disable react/prop-types */
import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import EmptyState from '../EmptyState';

/** Moldura padrão de gráfico/seção de dashboard: título, subtítulo, ações, carregando e vazio. */
export default function ChartCard({ title, subtitle, actions, loading = false, empty = false, emptyTitle = 'Sem dados no período', height = 320, children }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6">{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {actions}
      </Stack>
      {loading ? (
        <Skeleton variant="rounded" height={height} />
      ) : empty ? (
        <EmptyState title={emptyTitle} />
      ) : (
        children
      )}
    </Paper>
  );
}
