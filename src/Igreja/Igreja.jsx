import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  TableFooter,
  Tooltip,
  IconButton,
  CircularProgress,
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Menu from "../Components/Menu";
import Pagination from "../Components/Paginacao";
import IgrejaSearchForm from "./IgrejaSearchForm";
import IgrejaDetalheModal from "./IgrejaDetalhesModal";
import EditIcon from "@mui/icons-material/Edit";
import HideSourceIcon from "@mui/icons-material/HideSource";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Link from '@mui/material/Link';
import { useNavigate } from "react-router-dom";
import ReportarProblemaModal from "./Components/ReportarProblemaModal";
import ConfirmModal from "../Components/ConfirmModal";
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
import api from "../services/apiService";
import { useEffect } from "react";


const IgrejaPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [igrejas, setIgrejas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paginacao, setPaginacao] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    totalItems: 0,
  });
  const [searchFilters, setSearchFilters] = useState({
    ativo: false,
  });
  const [igrejaModal, setIgrejaModal] = useState({});
  const [problemaModalOpen, setProblemaModalOpen] = useState(null); // Armazena o ID do problema reportado aberto
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedIgrejaId, setSelectedIgrejaId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const navigate = useNavigate();

  const PAROQUIA_BASE = import.meta.env.VITE_PAROQUIA_BASE_URL || "";

  const buildParoquiaUrl = (row) => {
    const base = PAROQUIA_BASE.replace(/\/+$/g, "");
    const uf = row.endereco?.uf ? String(row.endereco.uf).toLowerCase() : "";
    const cidade = row.endereco?.cidadeSlug
      ? row.endereco.cidadeSlug
      : row.endereco?.localidade
      ? String(row.endereco.localidade).toLowerCase().replace(/\s+/g, "-")
      : "";
    const slug = row.slug || "";
    const parts = [base, uf, cidade, slug].filter(Boolean);
    return parts.join("/");
  };

  const shortParoquiaText = (row) => {
    const uf = row.endereco?.uf ? String(row.endereco.uf).toLowerCase() : "";
    const cidade = row.endereco?.cidadeSlug
      ? row.endereco.cidadeSlug
      : row.endereco?.localidade
      ? String(row.endereco.localidade).toLowerCase().replace(/\s+/g, "-")
      : "";
    const slug = row.slug || "";
    const parts = [uf, cidade, slug].filter(Boolean);
    return parts.length ? parts.join("/") : row.paroco || "—";
  };

  const handleCopyUrl = (url) => {
    if (!url) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        console.log("URL copiada:", url);
      }).catch((err) => console.error("Erro ao copiar:", err));
    } else {
      // fallback
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); console.log('URL copiada (fallback)'); } catch (e) { console.error(e); }
      document.body.removeChild(el);
    }
  };

  const useModal = () => {
    const [open, setOpen] = useState(false);
    const handleOpen = (row) => {
      setOpen(true);
      setIgrejaModal(row);
    };
    const handleClose = () => setOpen(false);
    return { open, handleOpen, handleClose, igrejaModal };
  };

  const { open, handleOpen, handleClose } = useModal();

  const handleDataChange = (data) => {
    setIgrejas(data);
  };

  const handleLoadingChange = (loading) => {
    setIsLoading(loading);
  };

  const handlePaginationChange = (pagination) => {
    setPaginacao(pagination);
  };

  const handleFiltersChange = (filters) => {
    setSearchFilters(filters);
    setPaginacao((prev) => ({
      ...prev,
      pageIndex: 1,
    }));
  };

  const handleOpenModal = (problemaId) => {
    setProblemaModalOpen(problemaId); // Define o ID do problema reportado
  };

  const handleCloseModal = () => {
    setProblemaModalOpen(null); // Reseta o estado para fechar a modal
  };

  const handleSuccess = (result) => {
    console.log("Modal saved successfully:", result);
    setProblemaModalOpen(false);
  };

  const handleOpenConfirmModal = (igrejaId) => {
    setSelectedIgrejaId(igrejaId);
    setConfirmModalOpen(true);
  };

  const handleOpenDeleteModal = (igrejaId) => {
    setDeleteTargetId(igrejaId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setSelectedIgrejaId(null);
  };

  const handleConfirmActivation = () => {
    if (selectedIgrejaId) {
      api
        .put(`/api/v1/Admin/igreja/ativar/${selectedIgrejaId}/usuario/${JSON.parse(localStorage.getItem("user")).id}`)
        .then(() => {
          console.log("Igreja ativada com sucesso!");
          fetchIgrejas(paginacao.pageIndex, paginacao.pageSize, searchFilters);
        })
        .catch((error) => {
          console.error("Erro ao ativar a igreja:", error);
        })
        .finally(() => {
          handleCloseConfirmModal();
        });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    api
      .delete(`/api/v1/Admin/igreja/deletar/${deleteTargetId}`)
      .then((response) => {
        console.log(response.data?.data?.mensagemAplicacao || "Igreja deletada");
        fetchIgrejas(paginacao.pageIndex, paginacao.pageSize, searchFilters);
      })
      .catch((error) => {
        console.error("Erro ao deletar igreja:", error);
      })
      .finally(() => {
        handleCloseDeleteModal();
      });
  };

  const buildIgrejasEndpoint = (pageIndex, pageSize, filters) => {
    const params = new URLSearchParams();
    if (filters?.ativo !== undefined && filters.ativo !== "") {
      params.append("ativo", filters.ativo);
    }
    if (filters?.uf) params.append("uf", filters.uf);
    if (filters?.localidade) params.append("localidade", filters.localidade);
    if (filters?.nome) params.append("nome", filters.nome);
    if (filters?.diaSemana !== undefined && filters?.diaSemana !== "") {
      params.append("diadasemana", filters.diaSemana);
    }
    if (filters?.horario) params.append("horario", filters.horario);
    if (filters?.reportarProblema !== undefined && filters.reportarProblema !== "") {
      params.append("reportarProblema", filters.reportarProblema);
    }
    params.append("Paginacao.PageIndex", pageIndex);
    params.append("Paginacao.PageSize", pageSize);
    return `/api/v1/admin/igreja/buscar-por-filtro?${params.toString()}`;
  };

  const fetchIgrejas = (pageIndex = 1, pageSize = 10, filters = searchFilters) => {
    setIsLoading(true);
    api
      .get(buildIgrejasEndpoint(pageIndex, pageSize, filters))
      .then((response) => {
        const resp = response.data.data;
        setIgrejas(resp);
        setPaginacao({
          pageIndex: resp.pageIndex,
          pageSize: resp.pageSize,
          totalPages: resp.totalPages,
          hasPreviousPage: resp.hasPreviousPage,
          hasNextPage: resp.hasNextPage,
          totalItems: resp.totalItems,
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar igrejas:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchIgrejas(paginacao.pageIndex, paginacao.pageSize, searchFilters);
  }, [paginacao.pageIndex, paginacao.pageSize]);

  const handlePageChange = (newPageIndex) => {
    setPaginacao((prev) => ({
      ...prev,
      pageIndex: newPageIndex,
    }));
  };

  // Compartilhado entre a linha da tabela (desktop) e o card (mobile).
  const renderAcoes = (row) => (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Tooltip title="Detalhes">
        <IconButton color="primary" onClick={() => handleOpen(row)}>
          <OpenInNewIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Editar">
        <IconButton color="primary" onClick={() => navigate("/IgrejaEditar", { state: { row } })}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      {row.reportarProblema && (
        <>
          <Tooltip title="Problema reportado">
            <IconButton color="warning" onClick={handleOpenModal}>
              <AnnouncementIcon />
            </IconButton>
          </Tooltip>
          <ReportarProblemaModal
            open={problemaModalOpen}
            onClose={handleCloseModal}
            problemaId={row.reportarProblema.id}
            nome={row.reportarProblema.nome}
            email={row.reportarProblema.email}
            descricao={row.reportarProblema.descricao}
            onSuccess={handleSuccess}
          />
        </>
      )}
      {!row.ativo && (
        <Tooltip title="Ativar">
          <IconButton color="primary" onClick={() => handleOpenConfirmModal(row.id)}>
            <HideSourceIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Deletar">
        <IconButton color="error" onClick={() => handleOpenDeleteModal(row.id)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <>
      <IgrejaDetalheModal
        open={open}
        handleClose={handleClose}
        igrejaId={igrejaModal?.id}
      />
      <ConfirmModal
        open={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmActivation}
        title="Confirmar Ativação"
        message="Você tem certeza que deseja ativar esta igreja?"
      />
      <Menu>
        <TableContainer
          component={Paper}
          sx={{
            p: 2,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            height: isMobile ? "auto" : "calc(100vh - 160px)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Igrejas
          </Typography>
          <IgrejaSearchForm
            onDataChange={handleDataChange}
            onLoadingChange={handleLoadingChange}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
          />
          {isLoading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={4}
            >
              <CircularProgress size={60} />
              <Typography variant="h6" mt={2}>
                Carregando...
              </Typography>
            </Box>
          ) : isMobile ? (
            <Box sx={{ flex: 1, overflow: "auto", mt: 2 }}>
              <Stack spacing={1.5}>
                {igrejas.items && igrejas.items.length > 0 ? (
                  igrejas.items.map((row) => (
                    <Card key={row.id} variant="outlined">
                      <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>{row.nome}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {row.endereco?.localidade} / {row.endereco?.uf}
                            </Typography>
                          </Box>
                          <Chip
                            label={row.ativo ? "Ativo" : "Inativo"}
                            size="small"
                            color={row.ativo ? "success" : "default"}
                          />
                        </Stack>
                        {row.endereco?.cep && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            CEP: {row.endereco.cep}
                          </Typography>
                        )}
                        {row.slug && (
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                            <Link
                              href={buildParoquiaUrl(row)}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                              sx={{
                                maxWidth: "80%",
                                display: "inline-block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "0.8125rem",
                              }}
                            >
                              {shortParoquiaText(row)}
                            </Link>
                            <IconButton size="small" onClick={() => handleCopyUrl(buildParoquiaUrl(row))}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                        <Box sx={{ mt: 1 }}>{renderAcoes(row)}</Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Não há dados disponíveis.
                  </Typography>
                )}
              </Stack>
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflow: "auto", mt: 2 }}>
              <Table stickyHeader sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>UF</TableCell>
                  <TableCell>Localidade</TableCell>
                  <TableCell>CEP</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Link</TableCell>
                  <TableCell>Ativo</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {igrejas.items && igrejas.items.length > 0 ? (
                  igrejas.items.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        '&:hover': { backgroundColor: 'action.selected' },
                      }}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.endereco?.uf}</TableCell>
                      <TableCell>{row.endereco?.localidade}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            row.endereco?.bairro || row.endereco?.logradouro || 'Sem detalhe'
                          }
                        >
                          {row.endereco?.cep ? (
                            <Chip
                              label={row.endereco.cep}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Chip
                              label="Sem CEP"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>{row.nome}</Typography>
                      </TableCell>
                      <TableCell>
                        {row.slug ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                              <Tooltip title={buildParoquiaUrl(row)}>
                                <Link
                                  href={buildParoquiaUrl(row)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  underline="hover"
                                  sx={{
                                    maxWidth: 200,
                                    display: 'inline-block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {shortParoquiaText(row)}
                                </Link>
                              </Tooltip>
                            <Tooltip title="Copiar URL">
                              <IconButton size="small" onClick={() => handleCopyUrl(buildParoquiaUrl(row))}>
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        ) : (
                          row.paroco
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.ativo ? 'Sim' : 'Não'}
                          size="small"
                          color={row.ativo ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {renderAcoes(row)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">Não há dados disponíveis.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={8} align="right">
                    Total de registros: {paginacao.totalItems ?? 0}
                  </TableCell>
                </TableRow>
              </TableFooter>
              </Table>
            </Box>
          )}
          <DeleteConfirmModal
            open={deleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            targetId={deleteTargetId}
          />
          <Pagination
            pageIndex={paginacao.pageIndex}
            totalPages={paginacao.totalPages}
            hasPreviousPage={paginacao.hasPreviousPage}
            hasNextPage={paginacao.hasNextPage}
            onPageChange={handlePageChange}
          />
        </TableContainer>
      </Menu>
    </>
  );
};

export default IgrejaPage;
