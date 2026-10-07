/* eslint-disable react/prop-types */
import { IconButton, Stack, Tooltip } from '@mui/material';

/** Ações por linha: ícones pequenos com Tooltip e aria-label. actions: [{ label, icon, onClick, color, disabled, hidden }] */
export default function RowActions({ actions, justify = 'center' }) {
  return (
    <Stack direction="row" spacing={0.5} justifyContent={justify} sx={{ whiteSpace: 'nowrap' }}>
      {actions
        .filter((a) => !a.hidden)
        .map((a) => (
          <Tooltip key={a.label} title={a.label}>
            <span>
              <IconButton
                size="small"
                color={a.color}
                aria-label={a.label}
                disabled={a.disabled}
                onClick={a.onClick}
              >
                {a.icon}
              </IconButton>
            </span>
          </Tooltip>
        ))}
    </Stack>
  );
}
