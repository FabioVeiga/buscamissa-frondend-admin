/* eslint-disable react/prop-types */
import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import Sparkline from './Sparkline';
import TrendBadge from './TrendBadge';

/**
 * Card de indicador (KPI): ícone, rótulo, valor, tendência e sparkline opcionais.
 * Com onClick vira clicável (ex.: atalho para a tela de origem).
 */
export default function KpiCard({ label, value, icon: Icon, color = '#2563eb', trend, sparkline, hint, loading = false, onClick }) {
  return (
    <Card
      variant="outlined"
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      sx={{
        p: 2,
        height: '100%',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...(onClick && { cursor: 'pointer', '&:hover': { borderColor: color, boxShadow: '0 4px 12px rgba(15,23,42,0.08)' } }),
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {Icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: `${color}1a`,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={72} sx={{ fontSize: '2rem' }} />
          ) : (
            <Typography variant="h4" fontWeight={700} sx={{ color, mt: 0.25 }}>
              {value ?? '—'}
            </Typography>
          )}
          {!loading && <TrendBadge tendencia={trend} />}
          {!loading && hint && (
            <Typography variant="caption" color="text.secondary">{hint}</Typography>
          )}
          {!loading && <Sparkline pontos={sparkline} color={color} />}
        </Box>
      </Stack>
    </Card>
  );
}
