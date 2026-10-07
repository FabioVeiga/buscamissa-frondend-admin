import { useState, useEffect } from "react";
import Menu from "./Components/Menu";
import { useNotificar } from "./Context/NotificationContext";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import DataTable from "./Components/DataTable";
import {  Typography,  Button,  Dialog,  DialogActions,  DialogContent,  DialogTitle,  TextField } from "@mui/material";
import api from "./services/apiService";

const ContribuidoresPage = () => {
  const notificar = useNotificar();
  const [contribuidores, setContribuidores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [nomes, setNomes] = useState(""); // Estado para armazenar os nomes



  // Fetch solicitações
  useEffect(() => {
    const fetchContribuidores = async () => {
      try {
        await getContribuidores()
      } catch {
        //console.error("Erro ao buscar solicitações:", error);
        setContribuidores([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContribuidores();
  }, []);

  const getContribuidores = async () => {
    try {
      const response = await api.get("/api/v1/Contribuidor/do-mes-vigente"); 
      setContribuidores(response.data); 
    } catch (error) {
      console.error("Erro ao buscar contribuidores:", error);
    }
  };

  // Abrir modal
  const handleOpenModal = () => {
    setOpenModal(true);
    setNomes("");
  };

  // Fechar modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Confirmar solução
  const handleEntradaContribuidores = async () => {
    try {
      const response = await api.post("/api/v1/Contribuidor/inserir-por-nomes", nomes, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        notificar.sucesso("Contribuidores inseridos com sucesso!");
        await getContribuidores();
      }
    } catch (error) {
      console.error("Erro ao inserir contribuidores:", error);
      notificar.erro("Erro ao inserir contribuidores. Tente novamente.");
    } finally {
      handleCloseModal();
    }
  };

  return (
    <Menu>
      <PageContainer>
      <PageHeader
        title="Contribuidores"
        actions={
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Inserir Contribuidores
          </Button>
        }
      />
      <DataTable
        loading={isLoading}
        rows={contribuidores || []}
        getRowKey={(row) => row.id}
        pageSize={25}
        emptyTitle="Não há dados disponíveis"
        footer={`Total de registros: ${contribuidores ? contribuidores.length : 0}`}
        columns={[
          { key: "id", header: "ID", sortable: true },
          { key: "nome", header: "Nome", sortable: true },
        ]}
      />

       {/* Modal */}
       <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Inserir Contribuidores</DialogTitle>
        <DialogContent>
          <Typography>
            Insira os nomes dos contribuidores separados por ponto e vírgula (;).
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Nomes"
            type="text"
            fullWidth
            value={nomes}
            onChange={(e) => setNomes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleEntradaContribuidores}
            color="primary"
            disabled={!nomes.trim()} // Desabilitar se o campo estiver vazio
          >
            Confirmar
          </Button>
        </DialogActions>
        </Dialog>
      </PageContainer>
    </Menu>
  );
};

export default ContribuidoresPage;
