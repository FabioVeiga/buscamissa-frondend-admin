/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
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
import FunctionsIcon from "@mui/icons-material/Functions";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChecklistIcon from "@mui/icons-material/Checklist";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LoginIcon from "@mui/icons-material/Login";
import MapIcon from "@mui/icons-material/Map";
import EventNoteIcon from "@mui/icons-material/EventNote";
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

// Configuração das páginas exibidas na aba "Páginas do site" — chave bate com o
// campo (camelCase) devolvido por PaginasVisualizacoesResponse.
const PAGINAS_CONFIG = [
  { chave: "estado", titulo: "Estado", icon: MapIcon, color: "#0ea5e9", novo: true },
  { chave: "cidade", titulo: "Cidade", icon: LocationCityIcon, color: "#0ea5e9", novo: true },
  { chave: "comoFunciona", titulo: "Como Funciona", icon: HelpOutlineIcon, color: "#14b8a6" },
  { chave: "missaAgora", titulo: "Missa Agora", icon: AccessTimeIcon, color: "#f59e0b" },
  { chave: "intencaoDia", titulo: "Intenção por dia", icon: EventNoteIcon, color: "#f59e0b", novo: true },
  { chave: "cidades", titulo: "Cidades", icon: LocationCityIcon, color: "#0ea5e9" },
  { chave: "minhasIgrejas", titulo: "Minhas Igrejas", icon: ChecklistIcon, color: "#ec4899" },
  { chave: "guiaResponsavel", titulo: "Guia Responsável", icon: VerifiedUserIcon, color: "#8b5cf6" },
  { chave: "entrar", titulo: "Entrar", icon: LoginIcon, color: "#64748b" },
];

// Converte uma série diária num polyline SVG normalizado (100x28), para o
// sparkline dos StatCard. Sem dados suficientes, não desenha nada.
const construirSparkline = (serie, chave) => {
  const valores = (serie || []).map((p) => p[chave] ?? 0);
  if (valores.length < 2) return null;

  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const amplitude = max - min || 1;

  return valores
    .map((v, i) => {
      const x = (i / (valores.length - 1)) * 100;
      const y = 26 - ((v - min) / amplitude) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

const Sparkline = ({ pontos, color }) => {
  if (!pontos) return null;
  return (
    <Box component="svg" viewBox="0 0 100 28" preserveAspectRatio="none" sx={{ width: "100%", height: 28, mt: 1, display: "block" }}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={pontos} />
    </Box>
  );
};

const TendenciaBadge = ({ tendencia, compacto }) => {
  if (!tendencia) return null;
  const subindo = tendencia.percentual > 0;
  const estavel = tendencia.percentual === 0;
  const Icon = estavel ? TrendingFlatIcon : subindo ? TrendingUpIcon : TrendingDownIcon;
  const cor = estavel ? "text.secondary" : subindo ? "success.main" : "error.main";
  const texto = tendencia.novo
    ? "novo"
    : `${tendencia.percentual > 0 ? "+" : ""}${tendencia.percentual}%`;

  return (
    <Stack direction="row" alignItems="center" spacing={0.3} sx={{ color: cor, mt: compacto ? 0 : 0.5 }}>
      <Icon sx={{ fontSize: 16 }} />
      <Typography variant="caption" fontWeight={600} sx={{ color: "inherit" }} noWrap>
        {texto}{!compacto && " vs. período anterior"}
      </Typography>
    </Stack>
  );
};

// Card de estatística com ícone, cor, badge de tendência e sparkline (ambos opcionais).
const StatCard = ({ titulo, valor, icon: Icon, color, tendencia, sparkline }) => (
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
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {titulo}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color, mt: 0.25 }}>
          {valor ?? 0}
        </Typography>
        <TendenciaBadge tendencia={tendencia} />
        <Sparkline pontos={sparkline} color={color} />
      </Box>
    </Stack>
  </Card>
);

// Linha de barra horizontal (Pareto) para a aba "Páginas do site" — a largura da
// barra é relativa ao maior valor do conjunto (maiorValor), não a um total fixo.
const PaginaBarRow = ({ titulo, valor, color, maiorValor, tendencia, novo, icon: Icon }) => {
  const percentual = maiorValor > 0 ? Math.max(4, (valor / maiorValor) * 100) : 0;

  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Icon sx={{ fontSize: 18, color, flexShrink: 0 }} />
      <Box sx={{ width: 160, flexShrink: 0, display: "flex", alignItems: "center", gap: 0.75, overflow: "hidden" }}>
        <Typography variant="body2" noWrap>{titulo}</Typography>
        {novo && <Chip label="nova" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />}
      </Box>
      <Box sx={{ flex: 1, bgcolor: "action.hover", borderRadius: 1, height: 16, overflow: "hidden" }}>
        <Box sx={{ width: `${percentual}%`, bgcolor: color, height: "100%", borderRadius: 1 }} />
      </Box>
      <Typography variant="body2" fontWeight={600} sx={{ width: 56, textAlign: "right", flexShrink: 0 }}>
        {valor ?? 0}
      </Typography>
      <Box sx={{ width: 76, flexShrink: 0 }}>
        <TendenciaBadge tendencia={tendencia} compacto />
      </Box>
    </Stack>
  );
};

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

  const [abaAtiva, setAbaAtiva] = useState("geral");

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
  const paginas = totais.paginas || {};
  const paginasAnteriores = totaisAnteriores?.paginas || {};

  // "Destaques do período": maiores variações (positivas ou negativas) entre os
  // 4 indicadores principais e as páginas — só existe quando há período/anterior
  // para comparar. Ajuda a não precisar escanear manualmente 13 números.
  const destaques = [
    { label: "Visualizações", tendencia: calcularTendencia(totais.visualizacoes, totaisAnteriores?.visualizacoes) },
    { label: "Favoritos", tendencia: calcularTendencia(totais.favoritos, totaisAnteriores?.favoritos) },
    { label: "Compartilhamentos", tendencia: calcularTendencia(totais.compartilhamentos, totaisAnteriores?.compartilhamentos) },
    { label: "Visualizações da Home", tendencia: calcularTendencia(totais.visualizacoesHome, totaisAnteriores?.visualizacoesHome) },
    ...PAGINAS_CONFIG.map((p) => ({
      label: p.titulo,
      tendencia: calcularTendencia(paginas[p.chave], paginasAnteriores[p.chave]),
    })),
  ]
    .filter((d) => d.tendencia && !d.tendencia.novo)
    .sort((a, b) => Math.abs(b.tendencia.percentual) - Math.abs(a.tendencia.percentual))
    .slice(0, 3);

  const maiorValorPagina = Math.max(1, ...PAGINAS_CONFIG.map((p) => paginas[p.chave] ?? 0));

  // Etapa 10: empty state quando não há nenhum registro no período informado.
  const semDados =
    !totais.totalGeral &&
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
        <Paper sx={{ p: 2, borderRadius: 2, position: "sticky", top: 8, zIndex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
              <AccessTimeIcon fontSize="small" />
              <Typography variant="subtitle2">Período</Typography>
            </Stack>
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
            <Button
              variant="outlined"
              size="small"
              startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
              onClick={() => carregar(filtros)}
              disabled={loading}
              sx={{ ml: "auto" }}
            >
              Atualizar
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1.5}>
            <Chip label="Hoje" size="small" variant="outlined" onClick={handleAtalhoPeriodo(periodoHoje)} />
            <Chip label="Ontem" size="small" variant="outlined" onClick={handleAtalhoPeriodo(periodoOntem)} />
            <Chip label="Mês corrente" size="small" variant="outlined" onClick={handleAtalhoPeriodo(periodoMesCorrente)} />
            <Chip label="Ano corrente" size="small" variant="outlined" onClick={handleAtalhoPeriodo(periodoAnoCorrente)} />
          </Stack>
        </Paper>

        <Tabs value={abaAtiva} onChange={(e, valor) => setAbaAtiva(valor)}>
          <Tab value="geral" label="Visão geral" />
          <Tab value="paginas" label="Páginas do site" />
          <Tab value="igrejas" label="Igrejas" />
        </Tabs>

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

        {semDados ? (
          <Paper sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Nenhum dado encontrado para o período informado.
            </Typography>
          </Paper>
        ) : (
          <>
            {destaques.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                  Destaques do período:
                </Typography>
                {destaques.map((d) => {
                  const subindo = d.tendencia.percentual > 0;
                  return (
                    <Chip
                      key={d.label}
                      size="small"
                      color={subindo ? "success" : "error"}
                      variant="outlined"
                      icon={subindo ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={`${d.label} ${d.tendencia.percentual > 0 ? "+" : ""}${d.tendencia.percentual}%`}
                    />
                  );
                })}
              </Stack>
            )}

            {abaAtiva === "geral" && (
              <>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#6366f11a",
                    border: "1px solid",
                    borderColor: "#6366f14d",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: "#6366f11a",
                        color: "#6366f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FunctionsIcon sx={{ fontSize: 30 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Total geral de indicadores clicados no site
                      </Typography>
                      <Typography variant="h3" fontWeight={700} sx={{ color: "#6366f1" }}>
                        {totais.totalGeral ?? 0}
                      </Typography>
                      <TendenciaBadge tendencia={calcularTendencia(totais.totalGeral, totaisAnteriores?.totalGeral)} />
                    </Box>
                  </Stack>
                </Paper>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      titulo="Visualizações"
                      valor={totais.visualizacoes}
                      icon={VisibilityIcon}
                      color="#3b82f6"
                      tendencia={calcularTendencia(totais.visualizacoes, totaisAnteriores?.visualizacoes)}
                      sparkline={construirSparkline(serieTemporal, "visualizacoes")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      titulo="Favoritos"
                      valor={totais.favoritos}
                      icon={FavoriteIcon}
                      color="#ec4899"
                      tendencia={calcularTendencia(totais.favoritos, totaisAnteriores?.favoritos)}
                      sparkline={construirSparkline(serieTemporal, "favoritos")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      titulo="Compartilhamentos"
                      valor={totais.compartilhamentos}
                      icon={ShareIcon}
                      color="#8b5cf6"
                      tendencia={calcularTendencia(totais.compartilhamentos, totaisAnteriores?.compartilhamentos)}
                      sparkline={construirSparkline(serieTemporal, "compartilhamentos")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      titulo="Visualizações da Home"
                      valor={totais.visualizacoesHome}
                      icon={HomeIcon}
                      color="#10b981"
                      tendencia={calcularTendencia(totais.visualizacoesHome, totaisAnteriores?.visualizacoesHome)}
                      sparkline={construirSparkline(serieTemporal, "visualizacoesHome")}
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
              </>
            )}

            {abaAtiva === "paginas" && (
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" mb={0.5}>Visualizações por página</Typography>
                <Typography variant="body2" color="text.secondary" mb={2.5}>
                  Ordenado da mais para a menos acessada.{" "}
                  <Chip label="nova" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />{" "}
                  marca páginas que só passaram a ser contabilizadas recentemente.
                </Typography>
                <Stack spacing={1.75}>
                  {[...PAGINAS_CONFIG]
                    .sort((a, b) => (paginas[b.chave] ?? 0) - (paginas[a.chave] ?? 0))
                    .map((p) => (
                      <PaginaBarRow
                        key={p.chave}
                        titulo={p.titulo}
                        valor={paginas[p.chave]}
                        color={p.color}
                        icon={p.icon}
                        novo={p.novo}
                        maiorValor={maiorValorPagina}
                        tendencia={calcularTendencia(paginas[p.chave], paginasAnteriores[p.chave])}
                      />
                    ))}
                </Stack>
              </Paper>
            )}

            {abaAtiva === "igrejas" && (
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
            )}
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
