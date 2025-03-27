/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Modal,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import api from "../../services/apiService"

const DenunciaModal = ({ open, onClose, denunciaId, descricao, onSuccess }) => {
  const [solucao, setSolucao] = useState("");
  const [enviarEmail, setEnviarEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    let endpoint = `api/Admin/igreja/denunciar/${denunciaId}`;
    var json = JSON.stringify({
      solucao,
      enviarEmailDenunciador: enviarEmail,
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
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Denúncia {denunciaId}</h2>
        <span>{descricao}</span>
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
          label="Enviar e-mail ao denunciador"
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
      </div>
    </Modal>
  );
};

export default DenunciaModal;
