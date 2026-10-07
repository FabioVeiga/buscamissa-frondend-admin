import { Chip } from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

const ICONES = {
  success: <CheckCircleOutline />,
  error: <ErrorOutline />,
  warning: <ScheduleOutlined />,
  info: <InfoOutlined />,
};

/** Chip de status padrão: sempre rótulo + ícone (nunca só cor). */
export default function StatusChip({ label, color = 'default', icon, sx, ...rest }) {
  return (
    <Chip
      size="small"
      variant={color === 'default' ? 'outlined' : 'filled'}
      color={color}
      label={label}
      icon={icon ?? ICONES[color]}
      sx={{ '& .MuiChip-icon': { fontSize: 16 }, ...sx }}
      {...rest}
    />
  );
}
