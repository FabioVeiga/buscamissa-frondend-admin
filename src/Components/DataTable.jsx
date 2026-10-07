/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

const comparar = (a, b) => {
  if (a === b) return 0;
  if (a === undefined || a === null || a === '') return 1;
  if (b === undefined || b === null || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a - b;
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' });
};

/**
 * Tabela padrão com ordenação e paginação no cliente (para listas completas já carregadas).
 * columns: [{ key, header, align, render?(row, index), sx?, sortable?, sortValue?(row) }]
 * pageSize: ativa a paginação (omitido = sem paginação); footer: texto/nó exibido abaixo (ex.: total).
 * Telas com paginação ou ordenação no servidor mantêm a própria tabela.
 */
export default function DataTable({
  columns,
  rows,
  getRowKey,
  loading = false,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription,
  rowSx,
  minWidth,
  pageSize,
  footer,
}) {
  const [orderBy, setOrderBy] = useState(null);
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize || 25);

  const ordenadas = useMemo(() => {
    if (!orderBy) return rows;
    const coluna = columns.find((c) => c.key === orderBy);
    if (!coluna) return rows;
    const valor = coluna.sortValue || ((r) => r[coluna.key]);
    const direcao = order === 'asc' ? 1 : -1;
    return [...rows].sort((x, y) => direcao * comparar(valor(x), valor(y)));
  }, [rows, columns, orderBy, order]);

  useEffect(() => setPage(0), [rows.length, orderBy, order]);

  const visiveis = pageSize ? ordenadas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : ordenadas;

  const handleSort = (key) => {
    if (orderBy === key) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setOrderBy(key);
      setOrder('asc');
    }
  };

  return (
    <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <Table sx={{ minWidth }}>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c.key} align={c.align} sx={c.sx} sortDirection={orderBy === c.key ? order : false}>
                    {c.sortable ? (
                      <TableSortLabel
                        active={orderBy === c.key}
                        direction={orderBy === c.key ? order : 'asc'}
                        onClick={() => handleSort(c.key)}
                      >
                        {c.header}
                      </TableSortLabel>
                    ) : (
                      c.header
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visiveis.length > 0 ? (
                visiveis.map((row, index) => (
                  <TableRow key={getRowKey(row, index)} hover sx={rowSx?.(row)}>
                    {columns.map((c) => (
                      <TableCell key={c.key} align={c.align} sx={c.sx}>
                        {c.render ? c.render(row, index) : row[c.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {pageSize && ordenadas.length > rowsPerPage && (
            <TablePagination
              component="div"
              count={ordenadas.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Linhas por página"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
          )}
          {footer && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5, textAlign: 'right' }}>
              {footer}
            </Typography>
          )}
        </>
      )}
    </TableContainer>
  );
}
