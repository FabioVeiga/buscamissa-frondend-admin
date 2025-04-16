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
  Typography,
} from "@mui/material";
import Menu from "../Components/Menu";
import Pagination from "../Components/Paginacao";
import IgrejaSearchForm from "./IgrejaSearchForm";
import IgrejaDetalheModal from "./IgrejaDetalhesModal";
import EditIcon from "@mui/icons-material/Edit";
import HideSourceIcon from "@mui/icons-material/HideSource";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
import DenunciaModal from "./Components/DenunciaModal";
import ConfirmModal from "../Components/ConfirmModal";
import api from "../services/apiService";


const IgrejaPage = () => {
  const [igrejas, setIgrejas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paginacao, setPaginacao] = useState({});
  const [igrejaModal, setIgrejaModal] = useState({});
  const [denunciaModalOpen, setDenunciaModalOpen] = useState(null); // Armazena o ID da denúncia aberta
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedIgrejaId, setSelectedIgrejaId] = useState(null);

  const navigate = useNavigate();

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

  const handleOpenModal = (denunciaId) => {
    setDenunciaModalOpen(denunciaId); // Define o ID da denúncia
  };

  const handleCloseModal = () => {
    setDenunciaModalOpen(null); // Reseta o estado para fechar a modal
  };

  const handleSuccess = (result) => {
    console.log("Modal saved successfully:", result);
    setDenunciaModalOpen(false);
  };

  const handleOpenConfirmModal = (igrejaId) => {
    setSelectedIgrejaId(igrejaId);
    setConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setSelectedIgrejaId(null);
  };

  const handleConfirmActivation = () => {
    if (selectedIgrejaId) {
      api
        .put(`/api/Admin/igreja/ativar/${selectedIgrejaId}/usuario/${JSON.parse(localStorage.getItem("user")).id}`)
        .then(() => {
          console.log("Igreja ativada com sucesso!");
          fetchIgrejas(); // Recarrega a lista de igrejas após a ativação
        })
        .catch((error) => {
          console.error("Erro ao ativar a igreja:", error);
        })
        .finally(() => {
          handleCloseConfirmModal();
        });
    }
  };

  const fetchIgrejas = () => {
    setIsLoading(true);
    api
      .get("/api/admin/igreja/buscar-por-filtro?ativo=false") // Substitua pela URL correta da sua API
      .then((response) => {
        handleDataChange(response.data.data); // Atualiza o estado com os dados da API
      })
      .catch((error) => {
        console.error("Erro ao buscar igrejas:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <IgrejaDetalheModal
        open={open}
        handleClose={handleClose}
        igreja={igrejaModal}
      />
      <ConfirmModal
        open={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmActivation}
        title="Confirmar Ativação"
        message="Você tem certeza que deseja ativar esta igreja?"
      />
      <div style={{ display: "flex" }}>
        <Menu />
        <TableContainer
          component={Paper}
          style={{ margin: "20px", padding: "20px" }}
        >
          <IgrejaSearchForm
            onDataChange={handleDataChange}
            onLoadingChange={handleLoadingChange}
            onPaginationChange={handlePaginationChange}
          />
          {isLoading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              bgcolor="#f5f5f5"
            >
              <CircularProgress size={60} />
              <Typography variant="h6" mt={2}>
                Carregando...
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>UF</TableCell>
                  <TableCell>Localidade</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Paroco</TableCell>
                  <TableCell>Ativo</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {igrejas.items && igrejas.items.length > 0 ? (
                  igrejas.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.endereco.uf}</TableCell>
                      <TableCell>{row.endereco.localidade}</TableCell>
                      <TableCell>{row.nome}</TableCell>
                      <TableCell>{row.paroco}</TableCell>
                      <TableCell>{row.ativo ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Detalhes">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                handleOpen(row);
                              }}
                            >
                              <OpenInNewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              color="primary"
                              onClick={() =>
                                navigate("/IgrejaEditar", { state: { row } })
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {row.denuncia && (
                            <>
                              <Tooltip title="Denúncia">
                                <IconButton
                                  color="warning"
                                  onClick={handleOpenModal}
                                >
                                  <AnnouncementIcon />
                                </IconButton>
                              </Tooltip>
                              <DenunciaModal
                                open={denunciaModalOpen}
                                onClose={handleCloseModal}
                                denunciaId={row.denuncia.id}
                                descricao={row.denuncia.descricao}
                                onSuccess={handleSuccess} // Passa uma função, não uma chamada direta
                              />
                            </>
                          )}
                          {!row.ativo ? (
                           <Tooltip title="Ativar">
                           <IconButton
                             color="primary"
                             onClick={() => {
                               handleOpenConfirmModal(row.id);
                             }}
                           >
                             <HideSourceIcon />
                           </IconButton>
                         </Tooltip>
                          ) : (
                            ""
                          )}
                          
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Não há dados disponíveis.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7} align="right">
                    Total de registros:{" "}
                    {igrejas.items ? igrejas.items.length : 0}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
          <Pagination {...paginacao} />
        </TableContainer>
      </div>
    </>
  );
};

export default IgrejaPage;
