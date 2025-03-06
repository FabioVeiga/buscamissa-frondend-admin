import { Button, Box, Typography } from '@mui/material';

const Pagination = ({
  pageIndex,
  pageSize,
  totalItems,
  hasPreviousPage,
  hasNextPage,
  nextPage,
  previousPage,
  totalPages
}) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginTop: 2 }}>
      {/* Página anterior */}
      <Button
        onClick={() => console.log('Ir para a página anterior')}
        disabled={!hasPreviousPage}
        variant="contained"
        sx={{ marginRight: 2 }}
      >
        Anterior
      </Button>

      {/* Informações de paginação */}
      <Typography sx={{ marginRight: 2 }}>
        Página {pageIndex} de {totalPages}
      </Typography>

      {/* Página seguinte */}
      <Button
        onClick={() => console.log('Ir para a próxima página')}
        disabled={!hasNextPage}
        variant="contained"
      >
        Próxima
      </Button>
    </Box>
  );
};

export default Pagination;
