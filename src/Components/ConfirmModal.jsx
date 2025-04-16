/* eslint-disable react/prop-types */
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

const ConfirmModal = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Não
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Sim
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;