import { Button, Box, Typography } from '@mui/material';

const Pagination = ({
  pageIndex,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange
}) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: 2 }}>
      <Button
        onClick={() => onPageChange(pageIndex - 1)}
        disabled={!hasPreviousPage}
        variant="contained"
        sx={{ marginRight: 2 }}
      >
        Anterior
      </Button>
      <Typography sx={{ marginRight: 2 }}>
        Página {pageIndex} de {totalPages}
      </Typography>
      <Button
        onClick={() => onPageChange(pageIndex + 1)}
        disabled={!hasNextPage}
        variant="contained"
      >
        Próxima
      </Button>
    </Box>
  );
};

export default Pagination;