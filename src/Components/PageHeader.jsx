import { Box, Typography } from '@mui/material';

/** Cabeçalho padrão de página: título, subtítulo opcional e ações à direita. */
export default function PageHeader({ title, subtitle, actions, sx }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        mb: 2.5,
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" fontWeight={700}>{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
    </Box>
  );
}
