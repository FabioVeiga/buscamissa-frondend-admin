/* eslint-disable react/prop-types */
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

/**
 * Tabela padrão (sem paginação/ordenação): cabeçalho, linhas, carregando e vazio.
 * columns: [{ key, header, align, render?(row, index), sx? }]
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
}) {
  return (
    <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
      {loading ? (
        <LoadingState />
      ) : (
        <Table sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.key} align={c.align} sx={c.sx}>
                  {c.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
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
      )}
    </TableContainer>
  );
}
