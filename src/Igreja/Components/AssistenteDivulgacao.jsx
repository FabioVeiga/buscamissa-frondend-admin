/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../../services/apiService";
import {
  gerarMensagemInstagram,
  gerarMensagemFacebook,
  construirLinkIgreja,
} from "../../services/mensagemDivulgacao";

// TipoEmailEventoIgrejaEnum: Outro = 99
// CanalContatoEnum: Email=1, Instagram=2, Facebook=3
const copiar = (texto) => navigator.clipboard.writeText(texto).catch(() => {});

const SecaoEmail = ({ email, emailCriacaoEnviado, opcao, onChange }) => (
  <Stack spacing={1}>
    <Typography variant="subtitle2" fontWeight={600}>
      E-mail
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {email}
    </Typography>
    <RadioGroup value={opcao} onChange={(e) => onChange(e.target.value)}>
      <FormControlLabel value="" control={<Radio size="small" />} label="Não enviar" />
      {!emailCriacaoEnviado && (
        <FormControlLabel value="criacao" control={<Radio size="small" />} label="Enviar e-mail de criação" />
      )}
      <FormControlLabel value="alteracao" control={<Radio size="small" />} label="Enviar e-mail de alteração" />
    </RadioGroup>
  </Stack>
);

const SecaoSocial = ({ label, url, mensagem, link, igrejaId, canal }) => {
  const [registrando, setRegistrando] = useState(false);
  const [registrado, setRegistrado] = useState(false);
  const [erro, setErro] = useState("");

  const handleAbrir = () => {
    const href = url.startsWith("http") ? url : `https://${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleRegistrar = async () => {
    setRegistrando(true);
    setErro("");
    try {
      await api.post("/api/v1/Admin/email-evento/registrar-contato", {
        igrejaId,
        tipo: 99,
        canal,
        destinoContato: url,
        dataEnvio: new Date().toISOString(),
      });
      setRegistrado(true);
    } catch {
      setErro("Não foi possível registrar o contato.");
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {url}
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Tooltip title="Copia a mensagem sugerida para a área de transferência">
          <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => copiar(mensagem)}>
            Copiar mensagem
          </Button>
        </Tooltip>
        <Tooltip title="Copia o link da página da igreja">
          <Button size="small" variant="outlined" startIcon={<LinkIcon />} onClick={() => copiar(link)}>
            Copiar link
          </Button>
        </Tooltip>
        <Button size="small" variant="outlined" startIcon={<OpenInNewIcon />} onClick={handleAbrir}>
          Abrir {label}
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
        {registrado ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Contato registrado"
            color="success"
            size="small"
            variant="outlined"
          />
        ) : (
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={handleRegistrar}
            disabled={registrando}
            startIcon={registrando ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Registrar contato realizado
          </Button>
        )}
        {erro && (
          <Typography variant="caption" color="error">
            {erro}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

const AssistenteDivulgacao = ({
  open,
  onClose,
  igreja,
  emailCriacaoEnviado,
  urlInstagram,
  urlFacebook,
  loading,
  opcaoEmail,
  onOpcaoEmailChange,
  onConfirmar,
  modoAvulso = false,
}) => {
  const email = igreja?.contato?.emailContato?.trim() || "";
  const nomeIgreja = igreja?.nome || "sua paróquia";
  const igrejaId = igreja?.id;
  const link = construirLinkIgreja(igreja);

  const mensagemInstagram = gerarMensagemInstagram(nomeIgreja, link);
  const mensagemFacebook = gerarMensagemFacebook(nomeIgreja, link);

  const temSecao = email || urlInstagram || urlFacebook;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Divulgação da Igreja</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A igreja possui os seguintes canais cadastrados. Escolha quais contatos deseja realizar.
        </Typography>

        {!temSecao && (
          <Typography variant="body2" color="text.secondary">
            Nenhum canal de contato cadastrado.
          </Typography>
        )}

        <Stack spacing={3} divider={<Divider />}>
          {email && (
            <SecaoEmail
              email={email}
              emailCriacaoEnviado={emailCriacaoEnviado}
              opcao={opcaoEmail}
              onChange={onOpcaoEmailChange}
            />
          )}

          {urlInstagram && (
            <SecaoSocial
              label="Instagram"
              url={urlInstagram}
              mensagem={mensagemInstagram}
              link={link}
              igrejaId={igrejaId}
              canal={2}
            />
          )}

          {urlFacebook && (
            <SecaoSocial
              label="Facebook"
              url={urlFacebook}
              mensagem={mensagemFacebook}
              link={link}
              igrejaId={igrejaId}
              canal={3}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={loading}>
          {modoAvulso ? "Fechar" : "Cancelar"}
        </Button>
        {!modoAvulso && (
          <Button variant="contained" onClick={onConfirmar} disabled={loading}>
            Confirmar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssistenteDivulgacao;
