/* eslint-disable react/prop-types */
import { Box } from '@mui/material';

/** Converte uma série [{[chave]: n}] em pontos para o <polyline> da Sparkline. */
export const construirSparkline = (serie, chave) => {
  const valores = (serie || []).map((p) => p[chave] ?? 0);
  if (valores.length < 2) return null;

  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const amplitude = max - min || 1;

  return valores
    .map((v, i) => {
      const x = (i / (valores.length - 1)) * 100;
      const y = 26 - ((v - min) / amplitude) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
};

export default function Sparkline({ pontos, color }) {
  if (!pontos) return null;
  return (
    <Box component="svg" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden sx={{ width: '100%', height: 28, mt: 1, display: 'block' }}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={pontos} />
    </Box>
  );
}
