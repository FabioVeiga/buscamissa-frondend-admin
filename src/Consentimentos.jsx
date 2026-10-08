import { useCallback, useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import Menu from "./Components/Menu";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import DataTable from "./Components/DataTable";
import StatusChip from "./Components/StatusChip";
import KpiCard from "./Components/dashboard/KpiCard";
import Pagination from "./Components/Paginacao";
import ErrorSpan from "./ErrorSpan";
import api from "./services/apiService";

const ACOES = {
  aceitou_todos: { label: "Aceitou todos", color: "success" },
  recusou: { label: "Recusou", color: "default" },
  personalizou: { label: "Personalizou", color: "info" },
  alterou: { label: "Alterou", color: "warning" },
};

const CATEGORIAS = { necessary: "Necessários", analytics: "Análise" };

const FILTROS_VAZIOS = { acao: "", dataInicial: "", dataFinal: "", consentId: "" };

// A API devolve UTC sem o "Z" e com microssegundos; normaliza para o JS interpretar como UTC.
const formatarDataHora = (iso) => {
  if (!iso) return "—";
  const normalizada = iso.replace(/(\.\d{3})\d+/, "$1");
  return new Date(/Z$|[+-]\d{2}:\d{2}$/.test(normalizada) ? normalizada : `${normalizada}Z`).toLocaleString("pt-BR");
};

const ConsentimentosPage = () => {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [aplicados, setAplicados] = useState(FILTROS_VAZIOS);
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const params = {
        "Paginacao.PageIndex": pagina,
        "Paginacao.PageSize": 20,
      };
      if (aplicados.acao) params.Acao = aplicados.acao;
      if (aplicados.dataInicial) params.DataInicial = aplicados.dataInicial;
      if (aplicados.dataFinal) params.DataFinal = aplicados.dataFinal;
      if (aplicados.consentId.trim()) params.ConsentId = aplicados.consentId.trim();

      const response = await api.get("/api/v1/admin/consentimentos", { params });
      setDados(response.data?.data ?? null);
    } catch (e) {
      console.error("Erro ao buscar consentimentos:", e);
      setErro("Não foi possível carregar os consentimentos.");
      setDados(null);
    } finally {
      setCarregando(false);
    }
  }, [aplicados, pagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const pesquisar = () => {
    setPagina(1);
    setAplicados(filtros);
  };

  const limpar = () => {
    setFiltros(FILTROS_VAZIOS);
    setPagina(1);
    setAplicados(FILTROS_VAZIOS);
  };

  const resumo = dados?.resumo;
  const itens = dados?.itens;
  const decididos = (resumo?.aceitaramAnalise ?? 0) + (resumo?.recusaramAnalise ?? 0);
  const percentual = (valor) => (decididos > 0 ? `${Math.round((valor / decididos) * 100)}% dos visitantes` : undefined);

  return (
    <Menu>
      <PageContainer>
        <PageHeader
          title="Consentimentos de cookies"
          subtitle="Prova de consentimento (LGPD): decisões registradas pelo banner do site. Os registros são anônimos, identificados só pelo ID do consentimento."
        />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Registros" value={resumo?.totalRegistros} icon={FactCheckIcon} color="#2563eb" loading={carregando} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Visitantes únicos" value={resumo?.consentimentosUnicos} icon={PeopleIcon} color="#8b5cf6" loading={carregando} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Aceitam a análise"
              value={resumo?.aceitaramAnalise}
              icon={CheckCircleIcon}
              color="#22c55e"
              hint={percentual(resumo?.aceitaramAnalise ?? 0)}
              loading={carregando}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Recusam a análise"
              value={resumo?.recusaramAnalise}
              icon={BlockIcon}
              color="#f59e0b"
              hint={percentual(resumo?.recusaramAnalise ?? 0)}
              loading={carregando}
            />
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <TextField select fullWidth label="Ação" value={filtros.acao} onChange={(e) => setFiltros((f) => ({ ...f, acao: e.target.value }))}>
                <MenuItem value="">Todas</MenuItem>
                {Object.entries(ACOES).map(([valor, { label }]) => (
                  <MenuItem key={valor} value={valor}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="De"
                value={filtros.dataInicial}
                onChange={(e) => setFiltros((f) => ({ ...f, dataInicial: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="Até"
                value={filtros.dataFinal}
                onChange={(e) => setFiltros((f) => ({ ...f, dataFinal: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3.5 }}>
              <TextField
                fullWidth
                label="ID do consentimento"
                placeholder="Cole o ConsentId (cookie bm_consent)"
                value={filtros.consentId}
                onChange={(e) => setFiltros((f) => ({ ...f, consentId: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && pesquisar()}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" startIcon={<SearchIcon />} onClick={pesquisar}>
                  Pesquisar
                </Button>
                <Button variant="outlined" color="inherit" onClick={limpar}>
                  Limpar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {erro && <ErrorSpan errorMessage={erro} severity="error" />}

        <DataTable
          loading={carregando}
          rows={itens?.items ?? []}
          getRowKey={(r) => r.id}
          emptyTitle="Nenhum consentimento encontrado"
          emptyDescription="Ajuste os filtros ou aguarde novas decisões no banner do site."
          columns={[
            { key: "criadoEm", header: "Data", render: (r) => formatarDataHora(r.criadoEm) },
            {
              key: "acao",
              header: "Ação",
              render: (r) => {
                const a = ACOES[r.acao] ?? { label: r.acao, color: "default" };
                return <StatusChip label={a.label} color={a.color} />;
              },
            },
            {
              key: "categorias",
              header: "Categorias aceitas",
              render: (r) =>
                r.categorias
                  .split(",")
                  .map((c) => CATEGORIAS[c] ?? c)
                  .join(", "),
            },
            { key: "revisao", header: "Revisão", align: "center" },
            {
              key: "consentId",
              header: "ID do consentimento",
              render: (r) => (
                <Typography
                  component="button"
                  type="button"
                  variant="caption"
                  title="Filtrar por este ID"
                  onClick={() => {
                    setFiltros((f) => ({ ...f, consentId: r.consentId }));
                    setAplicados((f) => ({ ...f, consentId: r.consentId }));
                    setPagina(1);
                  }}
                  sx={{ fontFamily: "monospace", background: "none", border: 0, p: 0, cursor: "pointer", color: "primary.main", textAlign: "left" }}
                >
                  {r.consentId}
                </Typography>
              ),
            },
          ]}
        />

        {itens && itens.totalPages > 1 && (
          <Pagination
            pageIndex={itens.pageIndex}
            totalPages={itens.totalPages}
            hasPreviousPage={itens.hasPrevieusPage}
            hasNextPage={itens.hasNextPage}
            onPageChange={setPagina}
          />
        )}
      </PageContainer>
    </Menu>
  );
};

export default ConsentimentosPage;
