/* eslint-disable react/prop-types */
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { diaDaSemana } from "../utils";

const IgrejaDetalheModal = ({ open, handleClose, igreja }) => {

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {igreja?.nome || "Detalhes da Igreja"}
        </Typography>

        {igreja?.imagemUrl && (
          <img
            src={igreja.imagemUrl}
            alt={igreja.nome}
            style={{ width: 30, height: 30, marginBottom: 16 }}
          />
        )}

        <Typography variant="body1" gutterBottom>
          <strong>Paróco:</strong> {igreja?.paroco || "Não informado"}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Status:</strong> {igreja?.ativo ? "Ativo" : "Inativo"}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Missas:</strong>
        </Typography>
        <List>
          {igreja?.missas?.length > 0 ? (
            igreja.missas.map((missa) => (
              <ListItem key={missa.id}>
                <ListItemText
                  primary={`Horário: ${missa.horario}`}
                  secondary={`Dia da Semana: ${diaDaSemana(missa.diaSemana)}, Observação: ${missa.observacao || "N/A"}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2">Nenhuma missa cadastrada.</Typography>
          )}
        </List>

        <Button
          variant="contained"
          onClick={handleClose}
          sx={{ mt: 2, display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          Fechar
        </Button>
      </Box>
    </Modal>
  );
};

export default IgrejaDetalheModal;