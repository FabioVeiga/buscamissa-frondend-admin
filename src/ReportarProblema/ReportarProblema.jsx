import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import Menu from "../Components/Menu";
import Pagination from "../Components/Paginacao";
import api from "../services/apiService";
import IgrejaDetalheModal from "../Igreja/IgrejaDetalhesModal";
import ReportarProblemaModal from "../Igreja/Components/ReportarProblemaModal";
import { buscarIgrejaCompletaPorId, normalizarIgrejaParaEdicao } from "../services/igrejaHelpers";

const formatarData = (valor) => (valor ? new Date(valor).toLocaleString("pt-BR") : "-");

const FILTROS_RESOLVIDO = [
  { valor: "false", label: "Pendentes" },
  { valor: "true", label: "Resolvidos" },
  { valor: "", label: "Todos" },
];

const ReportarProblemaPage = () => {
  const navigate = useNavigate();
  const [filtroResolvido, setFiltroResolvido] = useState("false");
  const [itens, setItens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paginacao, setPaginacao] = useState({
    pageIndex: 1, pageSize: 20, totalPages: 1, hasPreviousPage: false, hasNextPage: false, totalItems: 0,
  });

  const [detalheIgrejaId, setDetalheIgrejaId] = useState(null);
  const [problemaAberto, setProblemaAberto] = useState(null);

  const buscar = (pageIndex = 1) => {
    setIsLoading(true);
    const params = { "Paginacao.PageIndex": pageIndex, "Paginacao.PageSize": paginacao.pageSize };
    if (filtroResolvido !== "") params.Resolvido = filtroResolvido;

    api.get("/api/v1/Admin/igreja/reportar-problema", { params })
      .then((response) => {
        const data = response.data?.data || response.data;
        setItens(data?.items || []);
        setPaginacao((prev) => ({
          ...prev,
          pageIndex,
          totalPages: data?.totalPages ?? 1,
          hasPreviousPage: data?.hasPrevieusPage ?? false,
          hasNextPage: data?.hasNextPage ?? false,
          totalItems: data?.totalItems ?? 0,
        }));
      })
      .catch(() => setItens([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { buscar(1); }, [filtroResolvido]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolvido = (item) => !!item.acaoRealizada;

  const editarIgreja = async (item) => {
    try {
      const igrejaCompleta = await buscarIgrejaCompletaPorId(item.igrejaId);
      const row = normalizarIgrejaParaEdicao(igrejaCompleta);
      // O endpoint de detalhe não traz o problema reportado (outra tabela);
      // reaproveita os dados já carregados nesta listagem para o Alert em IgrejaAtualizar.jsx.
      row.reportarProblema = { id: item.id, nome: item.nome, email: item.email, descricao: item.descricao };
      navigate("/igrejaEditar", { state: { row } });
    } catch {
      // silencioso — usuário pode tentar de novo ou usar "Ver detalhes" -> Editar
    }
  };

  return (
    <Menu>
      <Stack spacing={2}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <TextField
            select
            size="small"
            label="Status"
            value={filtroResolvido}
            onChange={(e) => setFiltroResolvido(e.target.value)}
            sx={{ minWidth: 200 }}
            SelectProps={{ native: true }}
          >
            {FILTROS_RESOLVIDO.map((f) => (
              <option key={f.label} value={f.valor}>{f.label}</option>
            ))}
          </TextField>
        </Paper>

        <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Problemas Reportados</Typography>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Igreja</TableCell>
                    <TableCell>Cidade/UF</TableCell>
                    <TableCell>Solicitante</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itens.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center">Nenhum problema reportado encontrado.</TableCell></TableRow>
                  ) : (
                    itens.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Link component="button" underline="hover" onClick={() => setDetalheIgrejaId(item.igrejaId)}>
                            {item.nomeIgreja}
                          </Link>
                        </TableCell>
                        <TableCell>{[item.cidade, item.uf].filter(Boolean).join(" / ") || "-"}</TableCell>
                        <TableCell>
                          {item.nome}
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.email}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 260 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            title={item.descricao}
                          >
                            {item.descricao}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={resolvido(item) ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                            label={resolvido(item) ? "Resolvido" : "Pendente"}
                            color={resolvido(item) ? "success" : "warning"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatarData(item.dataCriacao)}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Ver detalhes da igreja">
                              <IconButton size="small" onClick={() => setDetalheIgrejaId(item.igrejaId)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar igreja">
                              <IconButton size="small" onClick={() => editarIgreja(item)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {!resolvido(item) && (
                              <Button size="small" variant="contained" onClick={() => setProblemaAberto(item)}>
                                Resolver
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={7} align="right">Total: {paginacao.totalItems}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>

              <Pagination
                pageIndex={paginacao.pageIndex}
                totalPages={paginacao.totalPages}
                hasPreviousPage={paginacao.hasPreviousPage}
                hasNextPage={paginacao.hasNextPage}
                onPageChange={buscar}
              />
            </>
          )}
        </TableContainer>
      </Stack>

      <IgrejaDetalheModal
        open={!!detalheIgrejaId}
        handleClose={() => setDetalheIgrejaId(null)}
        igrejaId={detalheIgrejaId}
      />

      {problemaAberto && (
        <ReportarProblemaModal
          open={!!problemaAberto}
          onClose={() => setProblemaAberto(null)}
          problemaId={problemaAberto.id}
          nome={problemaAberto.nome}
          email={problemaAberto.email}
          descricao={problemaAberto.descricao}
          onSuccess={() => { setProblemaAberto(null); buscar(paginacao.pageIndex); }}
        />
      )}
    </Menu>
  );
};

export default ReportarProblemaPage;
