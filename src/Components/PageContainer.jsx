/* eslint-disable react/prop-types */
import { Box } from '@mui/material';

/** Container padrão de página: largura máxima e espaçamento consistentes. */
export default function PageContainer({ children, maxWidth = 1440, sx }) {
  return (
    <Box sx={{ width: '100%', maxWidth, mx: 'auto', ...sx }}>
      {children}
    </Box>
  );
}
