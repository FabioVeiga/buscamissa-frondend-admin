import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItemButton, ListItemText, Box, Typography, CircularProgress } from "@mui/material";

const CepReversoModal = ({
  open,
  onClose,
  candidatos,
  onSelect,
  loading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Selecionar CEP</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : candidatos && candidatos.length > 0 ? (
          <List>
            {candidatos.map((item, index) => (
              <ListItemButton key={index} onClick={() => onSelect(item)}>
                <ListItemText
                  primary={`${item.logradouro || ""}${item.bairro ? ` - ${item.bairro}` : ""}`}
                  secondary={`CEP: ${item.cep} / ${item.localidade || ""}-${item.uf || ""}`}
                />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Typography>Nenhum candidato encontrado.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CepReversoModal;
