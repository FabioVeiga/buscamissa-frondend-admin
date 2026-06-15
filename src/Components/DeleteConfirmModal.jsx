/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";

const DeleteConfirmModal = ({ open, onClose, onConfirm, targetId }) => {
  const [input, setInput] = useState("");
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    if (!open) {
      setInput("");
    }
  }, [open]);

  useEffect(() => {
    setCanConfirm(String(targetId) === String(input).trim());
  }, [input, targetId]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Esta ação excluirá permanentemente o registro. Para confirmar, digite o ID da igreja abaixo e clique em "Confirmar".
        </DialogContentText>
        <Box mt={2}>
          <TextField
            label="Informe o ID da igreja"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            helperText={targetId ? `ID esperado: ${targetId}` : ""}
          />
        </Box>
        {!canConfirm && input.length > 0 && (
          <Box mt={1}>
            <Typography color="error" variant="body2">
              O ID informado não confere.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Não
        </Button>
        <Button onClick={onConfirm} color="primary" disabled={!canConfirm}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmModal;
