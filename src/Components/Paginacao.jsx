import { Button, Box, Typography } from '@mui/material';

const Pagination = ({
  pageIndex,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange
}) => {
  const current = Number(pageIndex) || 1;
  const total = Number(totalPages) || 1;
  const disablePrev = current <= 1 ? true : !(hasPreviousPage ?? true);
  const disableNext = current >= total ? true : !(hasNextPage ?? true);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: 2 }}>
      <Button
        onClick={() => onPageChange(Math.max(1, current - 1))}
        disabled={disablePrev}
        variant="contained"
        sx={{ marginRight: 2 }}
      >
        Anterior
      </Button>
      <Typography sx={{ marginRight: 2 }}>
        Página {current} de {total}
      </Typography>
      <Button
        onClick={() => onPageChange(Math.min(total, current + 1))}
        disabled={disableNext}
        variant="contained"
      >
        Próxima
      </Button>
    </Box>
  );
};

export default Pagination;