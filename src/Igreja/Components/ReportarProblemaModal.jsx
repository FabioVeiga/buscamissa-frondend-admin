/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Modal,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import api from "../../services/apiService"

const ReportarProblemaModal = ({ open, onClose, problemaId, nome, email, descricao, onSuccess }) => {
  const [solucao, setSolucao] = useState("");
  const [enviarEmail, setEnviarEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    let endpoint = `api/Admin/igreja/reportar-problema/${problemaId}`;
    var json = JSON.stringify({
      solucao,
      enviarEmail,
    });
    api
      .put(endpoint, json)
      .then((response) => {
        onSuccess(response);
        onClose();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(480px, 92vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h6" component="h2">
          Problema reportado
        </Typography>

        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Reportado por <strong>{nome || "—"}</strong>
            {email && (
              <>
                {" "}
                (
                <a href={`mailto:${email}`}>{email}</a>
                )
              </>
            )}
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: "grey.100",
            borderRadius: 1,
            padding: "12px",
            marginBottom: "16px",
            whiteSpace: "pre-wrap",
            fontSize: "0.875rem",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {descricao}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <TextField
          label="Solução"
          fullWidth
          multiline
          rows={4}
          value={solucao}
          onChange={(e) => setSolucao(e.target.value)}
          style={{ marginBottom: "16px" }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={enviarEmail}
              onChange={(e) => setEnviarEmail(e.target.checked)}
            />
          }
          label="Enviar e-mail a quem reportou"
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        >
          <Button
            onClick={onClose}
            disabled={loading}
            style={{ marginRight: "8px" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ReportarProblemaModal;
