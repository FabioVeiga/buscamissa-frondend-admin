/* eslint-disable react/prop-types */
import { useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, List, ListItem, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../../services/apiService"; // Certifique-se de importar o serviço da API

const RedeSocialForm = ({ redesSociaisExistentes, onAddRedeSocial, onDeleteRedeSocial, igrejaId }) => {
  const [redeSocial, setRedeSocial] = useState({
    tipoRedeSocial: 0,
    nomeDoPerfil: "",
  });
  const [openModal, setOpenModal] = useState(false); // Estado para controlar o modal
  const [selectedRede, setSelectedRede] = useState(null); // Armazena a rede social selecionada para exclusão
  

  const handleChange = (field, value) => {
    setRedeSocial((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRedeSocial = () => {
    const { tipoRedeSocial, nomeDoPerfil } = redeSocial;

    if (!tipoRedeSocial || !nomeDoPerfil) {
      alert("Os campos Tipo de Rede Social e Nome do Perfil são obrigatórios!");
      return;
    }

    if (redesSociaisExistentes.some((rede) => rede.tipoRedeSocial === tipoRedeSocial)) {
      alert("Já existe uma rede social com o tipo selecionado!");
      return;
    }
    onAddRedeSocial(redeSocial);
    setRedeSocial({ tipoRedeSocial: "", nomeDoPerfil: "" });
  };

  const handleOpenModal = (rede) => {
    setSelectedRede(rede);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRede(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRede) return;

    try {
      const response = await api.delete(`/api/Admin/igreja/deletar/redesocial/${igrejaId}/${selectedRede.tipoRedeSocial}`);
      if (response.status === 200) {
        alert("Rede social deletada com sucesso!");
        onDeleteRedeSocial(selectedRede.tipoRedeSocial); // Atualiza a lista local após a exclusão
      }
    } catch (error) {
      console.error("Erro ao deletar rede social:", error);
      alert("Erro ao deletar a rede social. Tente novamente.");
    } finally {
      handleCloseModal();
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FormControl fullWidth>
        <InputLabel id="tipoRedeSocial-label">Tipo de Rede Social</InputLabel>
        <Select
          labelId="tipoRedeSocial-label"
          value={redeSocial.tipoRedeSocial}
          onChange={(e) => handleChange("tipoRedeSocial", e.target.value)}
        >
          <MenuItem value={1}>Facebook</MenuItem>
          <MenuItem value={2}>Instagram</MenuItem>
          <MenuItem value={3}>Youtube</MenuItem>
          <MenuItem value={4}>Tiktok</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Nome do Perfil"
        value={redeSocial.nomeDoPerfil}
        onChange={(e) => handleChange("nomeDoPerfil", e.target.value)}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleAddRedeSocial}>
        Adicionar Rede Social
      </Button>
      {redesSociaisExistentes.length > 0 && (
        <List>
          {redesSociaisExistentes.map((rede, index) => (
            <ListItem
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>
                {rede.tipoRedeSocial}: {rede.nomeDoPerfil}
              </Typography>
              <IconButton
                color="error"
                onClick={() => handleOpenModal(rede)}
              >
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Modal de confirmação */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza de que deseja excluir a rede social{" "}
            <strong>{selectedRede?.nomeDoPerfil}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RedeSocialForm;