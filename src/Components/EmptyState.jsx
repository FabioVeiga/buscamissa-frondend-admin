/* eslint-disable react/prop-types */
import { Box, Typography } from '@mui/material';
import InboxOutlined from '@mui/icons-material/InboxOutlined';

/** Estado vazio padrão (dentro de células de tabela, cards ou páginas). */
export default function EmptyState({ title, description, icon, action, sx }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 0.5,
        py: 5,
        px: 2,
        color: 'text.secondary',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'grid',
          placeItems: 'center',
          mb: 1,
          '& svg': { fontSize: 24 },
        }}
      >
        {icon ?? <InboxOutlined />}
      </Box>
      <Typography variant="subtitle2" color="text.primary">{title}</Typography>
      {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
      {action && <Box sx={{ mt: 1.5 }}>{action}</Box>}
    </Box>
  );
}
