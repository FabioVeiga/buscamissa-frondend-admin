/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import HomeIcon from "@mui/icons-material/Home";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import Grid from "@mui/material/Grid2";
import { LineChart } from "@mui/x-charts/LineChart";
import Menu from "../Components/Menu";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";
import IgrejaDetalheModal from "../Igreja/IgrejaDetalhesModal";

// Filtros de período são mantidos entre navegações (ex: ida e volta da edição de igreja).
const FILTROS_STORAGE_KEY = "indicadores_filtro_periodo";

// Etapa 2: número fixo de linhas em todos os rankings.
const TOP_N = 10;

// Etapa 5: altura fixa para o scroll interno quando houver mais linhas do que cabe.
const ALTURA_TABELA = 360;

// Usa os componentes de data LOCAIS do navegador — toISOString() converte para UTC
// e "vira o dia" antes da hora, ex: 22h no Brasil (UTC-3) já é o dia seguinte em UTC.
const paraDataInput = (data) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

// Atalhos de período — usados tanto no botão de atalho quanto no default inicial (competência atual).
const periodoHoje = () => {
  const hoje = paraDataInput(new Date());
  return { dataInicial: hoje, dataFinal: hoje };
};

const periodoOntem = () => {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  const valor = paraDataInput(ontem);
  return { dataInicial: valor, dataFinal: valor };
};

const periodoMesCorrente = () => {
  const agora = new Date();
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
  return { dataInicial: paraDataInput(inicio), dataFinal: paraDataInput(fim) };
};

const periodoAnoCorrente = () => {
  const agora = new Date();
  const inicio = new Date(agora.getFullYear(), 0, 1);
  const fim = new Date(agora.getFullYear(), 11, 31);
  return { dataInicial: paraDataInput(inicio), dataFinal: paraDataInput(fim) };
};

// Sem filtro salvo (primeira visita), a tela abre já na competência do mês atual.
const carregarFiltrosSalvos = () => {
  try {
    const salvos = JSON.parse(sessionStorage.getItem(FILTROS_STORAGE_KEY));
    return salvos || periodoMesCorrente();
  } catch {
    return periodoMesCorrente();
  }
};

const formatarDataHora = (data) =>
  data
    ? data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Datas da série vêm como "yyyy-MM-dd" (DateOnly do backend) — evita o parse
// nativo do JS "cair um dia" por causa de fuso (new Date("yyyy-MM-dd") é UTC).
const formatarDataCurta = (dataIso) => {
  if (!dataIso) return "";
  const [, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}`;
};

// Variação percentual vs. período anterior de mesma duração. `null` quando o
// backend não calculou (visão "todo o histórico" não tem "anterior").
const calcularTendencia = (atual, anterior) => {
  if (anterior === null || anterior === undefined) return null;
  if (anterior === 0) return atual > 0 ? { percentual: 100, novo: true } : null;
  const percentual = ((atual - anterior) / anterior) * 100;
  return { percentual: Math.round(percentual * 10) / 10, novo: false };
};

const TendenciaBadge = ({ tendencia }) => {
  if (!tendencia) return null;
  const subindo = tendencia.percentual > 0;
  const estavel = tendencia.percentual === 0;
  const Icon = estavel ? TrendingFlatIcon : subindo ? TrendingUpIcon : TrendingDownIcon;
  const cor = estavel ? "text.secondary" : subindo ? "success.main" : "error.main";
  const texto = tendencia.novo
    ? "novo"
    : `${tendencia.percentual > 0 ? "+" : ""}${tendencia.percentual}%`;

  return (
    <Stack direction="row" alignItems="center" spacing={0.3} sx={{ color: cor, mt: 0.5 }}>
      <Icon sx={{ fontSize: 16 }} />
      <Typography variant="caption" fontWeight={600} sx={{ color: "inherit" }}>
        {texto} vs. período anterior
      </Typography>
    </Stack>
  );
};

// Card de estatística com ícone, cor e badge de tendência (quando disponível).
const StatCard = ({ titulo, valor, icon: Icon, color, tendencia }) => (
  <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: `${color}1a`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {titulo}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color, mt: 0.25 }}>
          {valor ?? 0}
        </Typography>
        <TendenciaBadge tendencia={tendencia} />
      </Box>
    </Stack>
  </Card>
);

// Etapa 5: cabeçalho, espaçamento e altura padronizados em todos os rankings.
// Etapa 6: cidade/UF exibidos como subtítulo junto ao nome da igreja.
const RankingTable = ({ titulo, descricao, itens, onIgrejaClick }) => {
  const linhas = (itens || []).slice(0, TOP_N);

  return (
    <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={0.5} mb={2}>
        <Typography variant="h6">{titulo}</Typography>
        <Tooltip title={descricao} arrow>
          <InfoOutlinedIcon fontSize="small" color="action" sx={{ cursor: "help" }} />
        </Tooltip>
      </Stack>
      <TableContainer sx={{ maxHeight: ALTURA_TABELA }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Igreja</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Quantidade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linhas.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Sem dados no período selecionado.
                </TableCell>
              </TableRow>
            )}
            {linhas.map((item, index) => (
              <TableRow key={item.igrejaId} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Link
                    component="button"
                    underline="hover"
                    onClick={() => onIgrejaClick(item.igrejaId)}
                  >
                    {item.nome}
                  </Link>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {item.cidade} • {item.uf}
                  </Typography>
                </TableCell>
                <TableCell align="right">{item.quantidade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const Indicadores = () => {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState(null);
  const [filtros, setFiltros] = useState(carregarFiltrosSalvos);

  // Etapa 8: endpoint único — traz cards, rankings, período e data da consulta numa só chamada.
  const carregar = (filtrosAtivos) => {
    setLoading(true);
    setErro("");

    const params = {};
    if (filtrosAtivos?.dataInicial) params.dataInicial = filtrosAtivos.dataInicial;
    if (filtrosAtivos?.dataFinal) params.dataFinal = filtrosAtivos.dataFinal;

    api
      .get(`/api/v1/admin/indicadores`, { params })
      .then((response) => {
        setDados(response.data?.data || null);
      })
      .catch(() => {
        setErro("Não foi possível carregar os indicadores.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => { carregar(filtros); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePesquisar = () => {
    sessionStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify(filtros));
    carregar(filtros);
  };

  const handleLimpar = () => {
    const vazio = { dataInicial: "", dataFinal: "" };
    setFiltros(vazio);
    sessionStorage.removeItem(FILTROS_STORAGE_KEY);
    carregar(vazio);
  };

  // Atalhos de período: aplicam o intervalo e já disparam a pesquisa.
  const handleAtalhoPeriodo = (gerarPeriodo) => () => {
    const periodo = gerarPeriodo();
    setFiltros(periodo);
    sessionStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify(periodo));
    carregar(periodo);
  };

  const [detalheIgrejaId, setDetalheIgrejaId] = useState(null);
  const handleIgrejaClick = (igrejaId) => setDetalheIgrejaId(igrejaId);

  if (loading) {
    return (
      <Menu>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={6}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Carregando indicadores...
          </Typography>
        </Box>
      </Menu>
    );
  }

  if (erro || !dados) {
    return (
      <Menu>
        <ErrorSpan errorMessage={erro || "Sem dados."} severity="error" />
      </Menu>
    );
  }

  const totais = dados.cards || {};
  const totaisAnteriores = dados.totaisAnteriores || null;
  const rankings = dados.rankings || {};
  const serieTemporal = dados.serieTemporal || [];
  const periodoAtivo = filtros.dataInicial || filtros.dataFinal;

  // Etapa 10: empty state quando não há nenhum registro no período informado.
  const semDados =
    !totais.visualizacoes &&
    !totais.favoritos &&
    !totais.compartilhamentos &&
    !totais.visualizacoesHome &&
    !(rankings.maisVisualizadas || []).length &&
    !(rankings.maisFavoritadas || []).length &&
    !(rankings.maisCompartilhadas || []).length &&
    !(rankings.maisRotasAbertas || []).length;

  return (
    <Menu>
      <Stack spacing={2}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle2">Período</Typography>
            <TextField
              label="Data Inicial"
              type="date"
              size="small"
              value={filtros.dataInicial}
              onChange={(e) => setFiltros((f) => ({ ...f, dataInicial: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Data Final"
              type="date"
              size="small"
              value={filtros.dataFinal}
              onChange={(e) => setFiltros((f) => ({ ...f, dataFinal: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button variant="contained" size="small" startIcon={<SearchIcon />} onClick={handlePesquisar}>
              Pesquisar
            </Button>
            <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={handleLimpar}>
              Limpar
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1.5}>
            <Button size="small" onClick={handleAtalhoPeriodo(periodoHoje)}>Hoje</Button>
            <Button size="small" onClick={handleAtalhoPeriodo(periodoOntem)}>Ontem</Button>
            <Button size="small" onClick={handleAtalhoPeriodo(periodoMesCorrente)}>Mês corrente</Button>
            <Button size="small" onClick={handleAtalhoPeriodo(periodoAnoCorrente)}>Ano corrente</Button>
          </Stack>
        </Paper>

        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {periodoAtivo
                ? `Indicadores gerais do sistema no período selecionado.`
                : `Indicadores gerais do sistema (todos os registros).`}
            </Typography>
            {/* Etapa 7: data/hora da consulta (do servidor), exibida abaixo do título */}
            <Typography variant="caption" color="text.secondary">
              Atualizado em {formatarDataHora(dados.dataConsulta ? new Date(dados.dataConsulta) : null)}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
            onClick={() => carregar(filtros)}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>

        {semDados ? (
          <Paper sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Nenhum dado encontrado para o período informado.
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  titulo="Visualizações"
                  valor={totais.visualizacoes}
                  icon={VisibilityIcon}
                  color="#3b82f6"
                  tendencia={calcularTendencia(totais.visualizacoes, totaisAnteriores?.visualizacoes)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  titulo="Favoritos"
                  valor={totais.favoritos}
                  icon={FavoriteIcon}
                  color="#ec4899"
                  tendencia={calcularTendencia(totais.favoritos, totaisAnteriores?.favoritos)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  titulo="Compartilhamentos"
                  valor={totais.compartilhamentos}
                  icon={ShareIcon}
                  color="#8b5cf6"
                  tendencia={calcularTendencia(totais.compartilhamentos, totaisAnteriores?.compartilhamentos)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  titulo="Visualizações da Home"
                  valor={totais.visualizacoesHome}
                  icon={HomeIcon}
                  color="#10b981"
                  tendencia={calcularTendencia(totais.visualizacoesHome, totaisAnteriores?.visualizacoesHome)}
                />
              </Grid>
            </Grid>

            {serieTemporal.length > 0 && (
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" mb={1}>Evolução diária</Typography>
                <LineChart
                  dataset={serieTemporal}
                  xAxis={[{ dataKey: "data", scaleType: "point", valueFormatter: formatarDataCurta }]}
                  series={[
                    { dataKey: "visualizacoes", label: "Visualizações", color: "#3b82f6", showMark: false },
                    { dataKey: "favoritos", label: "Favoritos", color: "#ec4899", showMark: false },
                    { dataKey: "compartilhamentos", label: "Compartilhamentos", color: "#8b5cf6", showMark: false },
                    { dataKey: "visualizacoesHome", label: "Visualizações da Home", color: "#10b981", showMark: false },
                  ]}
                  height={320}
                  margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
                  grid={{ horizontal: true }}
                />
              </Paper>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <RankingTable
                  titulo="Igrejas mais visualizadas"
                  descricao="Quantas vezes a página da igreja foi acessada no site público. Cada visitante conta só uma vez a cada 30 minutos, para evitar contagem duplicada em atualizações de página (F5)."
                  itens={rankings.maisVisualizadas}
                  onIgrejaClick={handleIgrejaClick}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <RankingTable
                  titulo="Igrejas mais favoritadas"
                  descricao="Quantas vezes usuários marcaram a igreja como favorita no site público (botão de coração)."
                  itens={rankings.maisFavoritadas}
                  onIgrejaClick={handleIgrejaClick}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <RankingTable
                  titulo="Igrejas mais compartilhadas"
                  descricao="Quantas vezes o link da igreja foi compartilhado pelo botão de compartilhar no site público."
                  itens={rankings.maisCompartilhadas}
                  onIgrejaClick={handleIgrejaClick}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <RankingTable
                  titulo="Igrejas com mais rotas abertas"
                  descricao="Quantas vezes usuários clicaram em 'Como chegar' para abrir a rota da igreja no mapa."
                  itens={rankings.maisRotasAbertas}
                  onIgrejaClick={handleIgrejaClick}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Stack>

      <IgrejaDetalheModal
        open={!!detalheIgrejaId}
        handleClose={() => setDetalheIgrejaId(null)}
        igrejaId={detalheIgrejaId}
      />
    </Menu>
  );
};

export default Indicadores;
