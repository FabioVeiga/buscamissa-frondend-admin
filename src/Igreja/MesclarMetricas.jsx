/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Menu from "../Components/Menu";
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
import IgrejaMetricasTab from "./Components/IgrejaMetricasTab";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";
import { buscarIgrejaCompletaPorId } from "../services/igrejaHelpers";

// Busca os dados básicos de uma igreja (nome, endereço, status) para exibir como
// confirmação visual antes de mesclar — evita mesclar/perder métricas do id errado
// por digitação equivocada.
const useIgrejaPreview = (id) => {
  const [igreja, setIgreja] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setIgreja(null);
    setErro("");

    const idNumero = Number(id);
    if (!id || !Number.isInteger(idNumero) || idNumero <= 0) return;

    setLoading(true);
    const timeout = setTimeout(() => {
      buscarIgrejaCompletaPorId(idNumero)
        .then((response) => {
          const dados = response?.igreja || response?.item || response?.data || response;
          if (!dados?.id) {
            setErro("Igreja não encontrada.");
            return;
          }
          setIgreja(dados);
        })
        .catch(() => setErro("Igreja não encontrada."))
        .finally(() => setLoading(false));
    }, 400); // pequeno debounce para não buscar a cada dígito

    return () => clearTimeout(timeout);
  }, [id]);

  return { igreja, loading, erro };
};

const IgrejaPreviewCard = ({ titulo, id, igreja, loading, erro }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minHeight: 88 }}>
    <Typography variant="overline" color="text.secondary">
      {titulo}
    </Typography>

    {loading && (
      <Box display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Buscando igreja #{id}...
        </Typography>
      </Box>
    )}

    {!loading && erro && (
      <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
        {erro}
      </Typography>
    )}

    {!loading && !erro && igreja && (
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {igreja.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {[igreja.endereco?.localidade, igreja.endereco?.uf].filter(Boolean).join(" - ") || "Endereço não informado"}
          {" • "}
          {igreja.ativo ? "Ativa" : "Inativa"}
        </Typography>
      </Box>
    )}

    {!loading && !erro && !igreja && (
      <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
        Informe o ID para visualizar.
      </Typography>
    )}
  </Paper>
);

const MesclarMetricas = () => {
  const [igrejaVencedoraId, setIgrejaVencedoraId] = useState("");
  const [igrejaPerdedoraId, setIgrejaPerdedoraId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ mensagem: "", severity: "", show: false });

  // Guarda os dados da perdedora usados na última mesclagem bem-sucedida —
  // independe do que o usuário digitar depois nos campos, para o passo de
  // exclusão continuar funcionando mesmo se o formulário for limpo/alterado.
  const [mesclagemConcluida, setMesclagemConcluida] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const vencedora = useIgrejaPreview(igrejaVencedoraId);
  const perdedora = useIgrejaPreview(igrejaPerdedoraId);

  const idsIguais =
    igrejaVencedoraId !== "" && igrejaPerdedoraId !== "" && Number(igrejaVencedoraId) === Number(igrejaPerdedoraId);

  const podeMesclar =
    !idsIguais &&
    !!vencedora.igreja &&
    !!perdedora.igreja &&
    !vencedora.loading &&
    !perdedora.loading;

  const handleMesclar = () => {
    setLoading(true);
    setMessage({ mensagem: "", severity: "", show: false });

    const vencedoraId = Number(igrejaVencedoraId);
    const perdedoraId = Number(igrejaPerdedoraId);

    api
      .put("/api/v1/Admin/igreja/mesclar-metricas", {
        igrejaVencedoraId: vencedoraId,
        igrejaPerdedoraId: perdedoraId,
      })
      .then(() => {
        setMessage({ mensagem: "Métricas mescladas com sucesso!", severity: "success", show: true });
        setMesclagemConcluida({
          id: perdedoraId,
          nome: perdedora.igreja?.nome || `Igreja #${perdedoraId}`,
        });
      })
      .catch((error) => {
        const mensagemAplicacao = error.response?.data?.data?.messagemAplicacao;
        setMessage({
          mensagem: mensagemAplicacao || "Erro ao mesclar métricas.",
          severity: "error",
          show: true,
        });
      })
      .finally(() => setLoading(false));
  };

  const handleNovaMesclagem = () => {
    setIgrejaVencedoraId("");
    setIgrejaPerdedoraId("");
    setMesclagemConcluida(null);
    setMessage({ mensagem: "", severity: "", show: false });
  };

  const handleConfirmarExclusao = () => {
    if (!mesclagemConcluida) return;

    setDeleteLoading(true);
    api
      .delete(`/api/v1/Admin/igreja/deletar/${mesclagemConcluida.id}`)
      .then(() => {
        setMessage({
          mensagem: `Igreja perdedora (#${mesclagemConcluida.id}) excluída com sucesso!`,
          severity: "success",
          show: true,
        });
        handleNovaMesclagem();
      })
      .catch(() => {
        setMessage({
          mensagem: "Erro ao excluir a igreja perdedora.",
          severity: "error",
          show: true,
        });
      })
      .finally(() => {
        setDeleteLoading(false);
        setDeleteModalOpen(false);
      });
  };

  return (
    <Menu>
      <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 720 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Mesclar Métricas de Igrejas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Move as métricas (visualizações, cliques, favoritos etc.) da igreja perdedora
          para a vencedora. Não altera nome, endereço, status ativo ou qualquer outro
          dado das igrejas — só as métricas.
        </Typography>

        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box flex={1}>
              <TextField
                label="ID da igreja vencedora (fica ativa)"
                type="number"
                value={igrejaVencedoraId}
                onChange={(e) => setIgrejaVencedoraId(e.target.value)}
                disabled={!!mesclagemConcluida}
                fullWidth
              />
            </Box>
            <Box flex={1}>
              <TextField
                label="ID da igreja perdedora (duplicata)"
                type="number"
                value={igrejaPerdedoraId}
                onChange={(e) => setIgrejaPerdedoraId(e.target.value)}
                disabled={!!mesclagemConcluida}
                fullWidth
              />
            </Box>
          </Stack>

          {idsIguais && (
            <Alert severity="warning">A igreja vencedora e a perdedora não podem ser a mesma.</Alert>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box flex={1}>
              <IgrejaPreviewCard titulo="Vencedora" id={igrejaVencedoraId} {...vencedora} />
            </Box>
            <Box flex={1}>
              <IgrejaPreviewCard titulo="Perdedora" id={igrejaPerdedoraId} {...perdedora} />
            </Box>
          </Stack>

          {vencedora.igreja && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Métricas da vencedora (últimos 30 dias)
              </Typography>
              <IgrejaMetricasTab igrejaId={vencedora.igreja.id} />
            </Box>
          )}

          {perdedora.igreja && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Métricas da perdedora (últimos 30 dias) — serão somadas à vencedora
              </Typography>
              <IgrejaMetricasTab igrejaId={perdedora.igreja.id} />
            </Box>
          )}

          {!mesclagemConcluida && (
            <Button variant="contained" onClick={handleMesclar} disabled={loading || !podeMesclar}>
              {loading ? <CircularProgress size={20} /> : "Mesclar métricas"}
            </Button>
          )}

          {message.show && (
            <Box>
              <ErrorSpan errorMessage={message.mensagem} severity={message.severity} />
            </Box>
          )}

          {mesclagemConcluida && (
            <>
              <Divider />
              <Card variant="outlined" sx={{ borderColor: "warning.main" }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                    Excluir a igreja perdedora?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    As métricas de <strong>{mesclagemConcluida.nome}</strong> (#{mesclagemConcluida.id}) já foram
                    movidas para a vencedora. Você pode excluí-la agora (soft delete — fica oculta do site
                    público, mas os dados são mantidos e a exclusão pode ser desfeita depois pela tela de
                    Igrejas).
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDeleteModalOpen(true)}
                      disabled={deleteLoading}
                    >
                      Excluir igreja perdedora
                    </Button>
                    <Button variant="outlined" onClick={handleNovaMesclagem} disabled={deleteLoading}>
                      Não, fazer nova mesclagem
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </>
          )}
        </Stack>
      </Paper>

      <DeleteConfirmModal
        open={deleteModalOpen}
        targetId={mesclagemConcluida?.id}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmarExclusao}
      />
    </Menu>
  );
};

export default MesclarMetricas;
