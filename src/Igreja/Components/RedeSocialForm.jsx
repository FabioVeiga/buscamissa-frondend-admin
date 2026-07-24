/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { Delete, OpenInNew } from "@mui/icons-material";
import api from "../../services/apiService";
import { useRedesSociais } from "../../hooks/useRedesSociais";
import { construirUrlRedeSocial } from "../../utils/redeSocialUrl";

const RedeSocialForm = ({
                          redesSociaisExistentes,
                          onAddRedeSocial,
                          onDeleteRedeSocial,
                          igrejaId,
                        }) => {
  const { tipos: redesSociaisDisponiveis, obterNomePorId } = useRedesSociais();

  const [redeSocial, setRedeSocial] = useState({
    tipoRedeSocial: "",
    nomeDoPerfil: "",
  });

  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedRede, setSelectedRede] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showFeedback = (severity, message) => {
    setFeedback({
      open: true,
      severity,
      message,
    });
  };

  const handleCloseFeedback = () => {
    setFeedback((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleChange = (field, value) => {
    setRedeSocial((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!redeSocial.tipoRedeSocial) {
      newErrors.tipoRedeSocial = "Selecione o tipo da rede social.";
    }

    if (!redeSocial.nomeDoPerfil.trim()) {
      newErrors.nomeDoPerfil = "Informe o nome do perfil.";
    }

    const tipoRedeSocialSelecionado = Number(redeSocial.tipoRedeSocial);

    const redeSocialJaExiste = redesSociaisExistentes.some(
        (rede) => Number(rede.tipoRedeSocial) === tipoRedeSocialSelecionado
    );

    if (redeSocialJaExiste) {
      newErrors.tipoRedeSocial =
          "Essa igreja já possui uma rede social cadastrada com esse tipo.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleAddRedeSocial = () => {
    if (!validateForm()) {
      showFeedback("error", "Verifique os campos destacados antes de continuar.");
      return;
    }

    onAddRedeSocial({
      tipoRedeSocial: Number(redeSocial.tipoRedeSocial),
      nomeDoPerfil: redeSocial.nomeDoPerfil.trim(),
    });

    setRedeSocial({
      tipoRedeSocial: "",
      nomeDoPerfil: "",
    });

    showFeedback("success", "Rede social adicionada com sucesso.");
  };

  const handleOpenModal = (rede) => {
    setSelectedRede(rede);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    if (isDeleting) return;

    setOpenModal(false);
    setSelectedRede(null);
  };

  const getApiErrorMessage = (error) => {
    const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.mensagem ||
        error?.response?.data?.error;

    if (apiMessage) {
      return apiMessage;
    }

    if (error?.response?.status === 404) {
      return "Rede social não encontrada para esta igreja.";
    }

    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return "Você não tem permissão para excluir esta rede social.";
    }

    if (error?.response?.status >= 500) {
      return "Ocorreu um erro no servidor. Tente novamente em alguns instantes.";
    }

    return "Não foi possível excluir a rede social. Verifique sua conexão e tente novamente.";
  };

  const handleConfirmDelete = async () => {
    if (!selectedRede) return;

    try {
      setIsDeleting(true);

      const response = await api.delete(
          `/api/v1/Admin/igreja/deletar/redesocial/${igrejaId}/${selectedRede.tipoRedeSocial}`
      );

      if (response.status === 200) {
        onDeleteRedeSocial(selectedRede.tipoRedeSocial);
        showFeedback("success", "Rede social excluída com sucesso.");
        handleCloseModal();
      }
    } catch (error) {
      console.error("Erro ao deletar rede social:", error);
      showFeedback("error", getApiErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
      <Box display="flex" flexDirection="column" gap={2}>
        <FormControl fullWidth error={Boolean(errors.tipoRedeSocial)}>
          <InputLabel id="tipoRedeSocial-label">Tipo de Rede Social</InputLabel>
          <Select
              labelId="tipoRedeSocial-label"
              label="Tipo de Rede Social"
              value={redeSocial.tipoRedeSocial}
              onChange={(e) => handleChange("tipoRedeSocial", e.target.value)}
          >
            {redesSociaisDisponiveis.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.nome}
                </MenuItem>
            ))}
          </Select>

          {errors.tipoRedeSocial && (
              <FormHelperText>{errors.tipoRedeSocial}</FormHelperText>
          )}
        </FormControl>

        <TextField
            label="Nome do Perfil"
            value={redeSocial.nomeDoPerfil}
            onChange={(e) => handleChange("nomeDoPerfil", e.target.value)}
            error={Boolean(errors.nomeDoPerfil)}
            helperText={errors.nomeDoPerfil}
            fullWidth
        />

        <Button variant="contained" color="primary" onClick={handleAddRedeSocial}>
          Adicionar Rede Social
        </Button>

        {redesSociaisExistentes.length > 0 && (
            <List>
              {redesSociaisExistentes.map((rede) => (
                  <ListItem
                      key={rede.tipoRedeSocial}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        mb: 1,
                      }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography>
                        <strong>
                          {obterNomePorId(rede.tipoRedeSocial)}:
                        </strong>
                      </Typography>
                      <Link
                          href={construirUrlRedeSocial(rede.tipoRedeSocial, rede.nomeDoPerfil)}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {rede.nomeDoPerfil}
                        <OpenInNew fontSize="small" />
                      </Link>
                    </Box>

                    <IconButton color="error" onClick={() => handleOpenModal(rede)}>
                      <Delete />
                    </IconButton>
                  </ListItem>
              ))}
            </List>
        )}

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Confirmar exclusão</DialogTitle>

          <DialogContent>
            <Typography>
              Tem certeza de que deseja excluir a rede social{" "}
              <strong>{selectedRede?.nomeDoPerfil}</strong>?
            </Typography>

            <Typography color="text.secondary" mt={1}>
              Essa ação não poderá ser desfeita.
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary" disabled={isDeleting}>
              Cancelar
            </Button>

            <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
                disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
            open={feedback.open}
            autoHideDuration={5000}
            onClose={handleCloseFeedback}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
        >
          <Alert
              onClose={handleCloseFeedback}
              severity={feedback.severity}
              variant="filled"
              sx={{ width: "100%" }}
          >
            {feedback.message}
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default RedeSocialForm;