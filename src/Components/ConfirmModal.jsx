/* eslint-disable react/prop-types */
import ConfirmDialog from "./ConfirmDialog";

const ConfirmModal = ({ open, onClose, onConfirm, title, message }) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    title={title}
    message={message}
    confirmLabel="Sim"
    cancelLabel="Não"
  />
);

export default ConfirmModal;
