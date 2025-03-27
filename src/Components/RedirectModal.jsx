/* eslint-disable react/prop-types */
import { useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const RedirectModal = ({ targetPage, state }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const handleRedirect = () => {
    navigate(targetPage, { state }); // Redireciona com o estado
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="redirect-modal-title"
      aria-describedby="redirect-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="redirect-modal-title" variant="h6" component="h2">
          Aviso de Redirecionamento
        </Typography>
        <Typography id="redirect-modal-description" sx={{ mt: 2 }}>
          Você será redirecionado para outra página. Deseja continuar?
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleRedirect}>
            Ir para outra página
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RedirectModal;
