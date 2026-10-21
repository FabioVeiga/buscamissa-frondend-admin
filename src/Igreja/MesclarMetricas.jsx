/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormGroup,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import HideSourceIcon from "@mui/icons-material/HideSource";
import Menu from "../Components/Menu";
import PageHeader from "../Components/PageHeader";
import StatusChip from "../Components/StatusChip";
import LoadingState from "../Components/LoadingState";
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
import Grid from "@mui/material/Grid2";
import KpiCard from "../Components/dashboard/KpiCard";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";

const PAROQUIA_BASE = import.meta.env.VITE_PAROQUIA_BASE_URL || "";

// TipoMetricaEnum (backend), todo o histórico da igreja.
const ROTULOS_METRICA = {
  1: "Visualizações",
  3: "Favoritos",
  2: "Rotas",
  5: "Telefone",
  6: "Instagram",
  4: "Compartilhamentos",
  7: "Sugestões de edição",
};
const ORDEM_METRICAS = [1, 3, 2, 5, 6, 4, 7];

const montarUrlPagina = (r) => {
  const base = PAROQUIA_BASE.replace(/\/+$/g, "");
  const uf = r.endereco?.uf ? String(r.endereco.uf).toLowerCase() : "";
  const cidade = r.endereco?.cidadeSlug
    ? r.endereco.cidadeSlug
    : r.endereco?.localidade
    ? String(r.endereco.localidade).toLowerCase().replace(/\s+/g, "-")
    : "";
  if (!r.slug) return "";
  return [base, uf, cidade, r.slug].filter(Boolean).join("/");
};

const formatarData = (iso) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "");

// Busca o resumo para decisão (dados cadastrais, responsável, contatos enviados e
// métricas de todo o histórico) — também serve de confirmação visual do id digitado.
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
      api
        .get(`/api/v1/admin/igreja/${idNumero}/resumo-mesclagem`)
        .then((response) => {
          const dados = response.data?.data;
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

const Linha = ({ rotulo, children }) => (
  <Typography variant="body2" sx={{ mt: 0.25 }}>
    <Typography component="span" variant="body2" color="text.secondary">
      {rotulo}:{" "}
    </Typography>
    {children || <Typography component="span" variant="body2" color="text.disabled">—</Typography>}
  </Typography>
);

const IgrejaPreviewCard = ({ titulo, id, igreja, loading, erro }) => {
  const url = igreja ? montarUrlPagina(igreja) : "";
  const e = igreja?.endereco;
  const c = igreja?.contato;
  const instagram = igreja?.contatosEnviados?.find((x) => x.canal === "Instagram");
  const email = igreja?.contatosEnviados?.find((x) => x.canal === "Email");

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minHeight: 88, height: "100%" }}>
      <Typography variant="overline" color="text.secondary">
        {titulo}
      </Typography>

      {loading && (
        <LoadingState label={`Buscando igreja #${id}...`} sx={{ py: 1, flexDirection: "row", justifyContent: "flex-start" }} />
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
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ my: 0.5 }}>
            <StatusChip
              label={igreja.ativo ? "Ativa" : "Inativa"}
              color={igreja.ativo ? "success" : "default"}
              icon={igreja.ativo ? undefined : <HideSourceIcon />}
            />
            {igreja.deletada && <StatusChip label="Excluída" color="error" />}
            <StatusChip
              label={igreja.temResponsavelAprovado ? "Com responsável" : "Sem responsável"}
              color={igreja.temResponsavelAprovado ? "success" : "warning"}
            />
          </Stack>

          <Linha rotulo="Página">
            {url ? (
              <Link href={url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all" }}>
                {url}
              </Link>
            ) : null}
          </Linha>
          <Linha rotulo="Pároco">{igreja.paroco}</Linha>
          <Linha rotulo="Endereço">
            {e
              ? [
                  [e.logradouro, e.numero || null].filter(Boolean).join(", "),
                  e.bairro,
                  [e.localidade, e.uf].filter(Boolean).join(" - "),
                ]
                  .filter(Boolean)
                  .join(" · ")
              : null}
          </Linha>
          <Linha rotulo="Missas cadastradas">{String(igreja.quantidadeMissas)}</Linha>
          {igreja.quantidadeIgrejasFilhas > 0 && (
            <Linha rotulo="Capelas/comunidades ativas">{String(igreja.quantidadeIgrejasFilhas)}</Linha>
          )}

          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Contatos
          </Typography>
          <Linha rotulo="E-mail">{c?.email}</Linha>
          <Linha rotulo="Telefone">{c?.telefone}</Linha>
          <Linha rotulo="WhatsApp">{c?.whatsapp}</Linha>
          <Linha rotulo="Site">{c?.website}</Linha>
          <Linha rotulo="Redes sociais">
            {igreja.redesSociais?.length
              ? igreja.redesSociais.map((r) => `${r.tipo}: ${r.perfil}`).join(", ")
              : null}
          </Linha>

          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Responsáveis
          </Typography>
          {igreja.responsaveis?.length ? (
            igreja.responsaveis.map((r, i) => (
              <Typography key={i} variant="body2">
                {r.nome} ({r.email}) — {r.status === "Aprovado" ? "aprovado" : "pendente"}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.disabled">Nenhum</Typography>
          )}

          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Contato de divulgação feito
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              color={instagram ? "info" : "default"}
              variant={instagram ? "filled" : "outlined"}
              label={instagram ? `Instagram: ${instagram.quantidade}x (${formatarData(instagram.ultimoEnvio)})` : "Sem contato via Instagram"}
            />
            <Chip
              size="small"
              color={email ? "info" : "default"}
              variant={email ? "filled" : "outlined"}
              label={email ? `E-mail: ${email.quantidade}x (${formatarData(email.ultimoEnvio)})` : "Sem contato via e-mail"}
            />
          </Stack>
        </Box>
      )}

      {!loading && !erro && !igreja && (
        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
          Informe o ID para visualizar.
        </Typography>
      )}
    </Paper>
  );
};

const MetricasTotais = ({ igreja }) => {
  const mapa = {};
  (igreja.metricasTotais || []).forEach((m) => {
    mapa[m.tipoMetrica] = m.quantidade;
  });
  return (
    <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2, width: "100%", boxSizing: "border-box" }}>
      <Grid container spacing={2}>
        {ORDEM_METRICAS.map((tipo) => (
          <Grid size={{ xs: 6, sm: 3 }} key={tipo}>
            <KpiCard label={ROTULOS_METRICA[tipo]} value={mapa[tipo] ?? 0} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const MesclarMetricas = () => {
  const [igrejaVencedoraId, setIgrejaVencedoraId] = useState("");
  const [igrejaPerdedoraId, setIgrejaPerdedoraId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ mensagem: "", severity: "", show: false });
  const [opcoes, setOpcoes] = useState({ mesclarParoco: true, mesclarContatos: true, substituirEndereco: false });

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
        ...opcoes,
      })
      .then((response) => {
        const r = response.data?.data || {};
        const partes = ["métricas"];
        if (r.parocoCopiado) partes.push("pároco");
        if (r.enderecoSubstituido) partes.push("endereço");
        if (r.camposContatoCopiados > 0) partes.push(`${r.camposContatoCopiados} campo(s) de contato`);
        if (r.redesSociaisCopiadas > 0) partes.push(`${r.redesSociaisCopiadas} rede(s) social(is)`);
        setMessage({ mensagem: `Mesclagem concluída: ${partes.join(", ")}.`, severity: "success", show: true });
        setMesclagemConcluida({
          id: perdedoraId,
          nome: perdedora.igreja?.nome || `Igreja #${perdedoraId}`,
        });
      })
      .catch((error) => {
        const mensagemAplicacao = error.response?.data?.data?.messagemAplicacao;
        setMessage({
          mensagem: mensagemAplicacao || "Erro ao mesclar as igrejas.",
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
      // desativar=true: a perdedora também fica inativa (não volta ativa se for restaurada).
      .delete(`/api/v1/Admin/igreja/deletar/${mesclagemConcluida.id}`, { params: { desativar: true } })
      .then(() => {
        setMessage({
          mensagem: `Igreja perdedora (#${mesclagemConcluida.id}) excluída e desativada com sucesso!`,
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
      <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 1100 }}>
        <PageHeader
          title="Mesclar Igrejas"
          subtitle="Move todas as métricas (visualizações, cliques, favoritos etc.) da igreja perdedora para a vencedora e, se você marcar, também mescla pároco, endereço e contatos. Nome, status ativo e horários de missa da vencedora não são alterados."
          sx={{ mb: 3 }}
        />

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
                Métricas da vencedora (todo o histórico)
              </Typography>
              <MetricasTotais igreja={vencedora.igreja} />
            </Box>
          )}

          {perdedora.igreja && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Métricas da perdedora (todo o histórico) — serão somadas à vencedora
              </Typography>
              <MetricasTotais igreja={perdedora.igreja} />
            </Box>
          )}

          {!mesclagemConcluida && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Além das métricas, mesclar também
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={opcoes.mesclarParoco}
                      onChange={(e) => setOpcoes((o) => ({ ...o, mesclarParoco: e.target.checked }))}
                    />
                  }
                  label="Pároco — copia o da perdedora só se a vencedora não tiver"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={opcoes.mesclarContatos}
                      onChange={(e) => setOpcoes((o) => ({ ...o, mesclarContatos: e.target.checked }))}
                    />
                  }
                  label="Contatos — preenche e-mail, telefone, WhatsApp e site vazios e acrescenta redes sociais que faltam"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={opcoes.substituirEndereco}
                      onChange={(e) => setOpcoes((o) => ({ ...o, substituirEndereco: e.target.checked }))}
                    />
                  }
                  label="Endereço — substitui o da vencedora pelo da perdedora (inclui coordenadas)"
                />
              </FormGroup>
              {opcoes.substituirEndereco && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  O endereço da vencedora será sobrescrito. Se a cidade mudar, a URL da página pode mudar.
                </Alert>
              )}
            </Paper>
          )}

          {!mesclagemConcluida && (
            <Button variant="contained" onClick={handleMesclar} disabled={loading || !podeMesclar}>
              {loading ? <CircularProgress size={20} /> : "Mesclar igrejas"}
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
                    Os dados de <strong>{mesclagemConcluida.nome}</strong> (#{mesclagemConcluida.id}) já foram
                    mesclados na vencedora. Você pode excluí-la agora: ela também é <strong>desativada</strong>
                    (soft delete — fica oculta do site público, mas os dados são mantidos; a exclusão pode ser
                    desfeita pela tela de Igrejas, e aí ela volta inativa).
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDeleteModalOpen(true)}
                      disabled={deleteLoading}
                    >
                      Excluir e desativar igreja perdedora
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
