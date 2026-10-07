/* eslint-disable react/prop-types */
import { Stack, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

/** Variação vs. período anterior: { percentual, novo }. Sempre ícone + texto. */
export default function TrendBadge({ tendencia, compacto }) {
  if (!tendencia) return null;
  const subindo = tendencia.percentual > 0;
  const estavel = tendencia.percentual === 0;
  const Icon = estavel ? TrendingFlatIcon : subindo ? TrendingUpIcon : TrendingDownIcon;
  const cor = estavel ? 'text.secondary' : subindo ? 'success.main' : 'error.main';
  const texto = tendencia.novo ? 'novo' : `${tendencia.percentual > 0 ? '+' : ''}${tendencia.percentual}%`;

  return (
    <Stack direction="row" alignItems="center" spacing={0.3} sx={{ color: cor, mt: compacto ? 0 : 0.5 }}>
      <Icon sx={{ fontSize: 16 }} />
      <Typography variant="caption" fontWeight={600} sx={{ color: 'inherit' }} noWrap>
        {texto}{!compacto && ' vs. período anterior'}
      </Typography>
    </Stack>
  );
}
