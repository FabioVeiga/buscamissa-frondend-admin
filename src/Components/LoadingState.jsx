import { Box, CircularProgress, Typography } from '@mui/material';

/** Estado de carregamento padrão, discreto e centralizado. */
export default function LoadingState({ label = 'Carregando...', sx }) {
  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        py: 6,
        ...sx,
      }}
    >
      <CircularProgress size={28} />
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  );
}
