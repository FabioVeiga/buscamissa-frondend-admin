/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Box, Button, Chip, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import Menu from "./Components/Menu";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import Paginacao from "./Components/Paginacao";
import { useNotificar } from "./Context/NotificationContext";
import api from "./services/apiService";
import { adicionarCamadasBase } from "./utils/mapaBase";
import { construirLinkIgreja } from "./services/mensagemDivulgacao";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MonitoramentoCoordenadas from "./Components/MonitoramentoCoordenadas";

// Página pública da igreja (para conferir o mapa e os links "Como chegar" depois de aprovar).
const linkPublico = (i) =>
  i?.slug && i?.cidadeSlug ? construirLinkIgreja({ slug: i.slug, endereco: { uf: i.uf, cidadeSlug: i.cidadeSlug } }) : null;

/**
 * Revisão das coordenadas coletadas (staging). O admin vê o ponto atual, os candidatos das
 * fontes abertas (CNEFE/OSM) e um marcador arrastável; aprovar grava em Enderecos com histórico.
 */
const BASE = "/api/v1/admin/geo";
const CORES = { legado: "#757575", cnefe: "#1565c0", osm: "#2e7d32", google: "#ef6c00" };
const COR_CLASSE = { alta: "success", media: "info", baixa: "warning", sem_resultado: "default" };
const ROTULO_CLASSE = { alta: "Alta", media: "Média", baixa: "Baixa", sem_resultado: "Sem resultado" };

const formatarDistancia = (d) =>
  d === null || d === undefined ? "—" : d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;

const MapaRevisao = ({ detalhe, ponto, onMover }) => {
  const elRef = useRef(null);
  const mapaRef = useRef(null);
  const camadaRef = useRef(null);
  const arrastavelRef = useRef(null);

  useEffect(() => {
    const mapa = L.map(elRef.current, { zoomControl: true });
    adicionarCamadasBase(mapa);
    camadaRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;
    return () => mapa.remove();
  }, []);

  // Candidatos e ponto atual (fixos) — redesenha quando muda a igreja.
  useEffect(() => {
    const mapa = mapaRef.current;
    const camada = camadaRef.current;
    if (!mapa || !detalhe) return;
    camada.clearLayers();
    const limites = [];
    const { igreja, candidatos } = detalhe;
    if (igreja.latitudeAtual != null) {
      const p = [igreja.latitudeAtual, igreja.longitudeAtual];
      L.circleMarker(p, { radius: 9, color: CORES.legado, fillOpacity: 0.3 })
        .bindTooltip("Coordenada atual").addTo(camada);
      limites.push(p);
    }
    candidatos.filter((c) => c.fonte !== "legado").forEach((c) => {
      const p = [c.latitude, c.longitude];
      L.circleMarker(p, {
        radius: c.escolhido ? 9 : 6,
        color: CORES[c.fonte] || "#6a1b9a",
        fillOpacity: c.motivoRejeicao ? 0.15 : 0.7,
        dashArray: c.motivoRejeicao ? "3" : null,
      }).bindTooltip(`${c.fonte}: ${c.nome || c.tipoResultado}${c.motivoRejeicao ? ` (${c.motivoRejeicao})` : ""}`)
        .addTo(camada);
      limites.push(p);
    });
    if (limites.length) mapa.fitBounds(limites, { padding: [40, 40], maxZoom: 18 });
    else mapa.setView([-15.8, -47.9], 4);
    setTimeout(() => mapa.invalidateSize(), 0);
  }, [detalhe]);

  // Marcador arrastável: o ponto que será aprovado.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    if (!ponto) {
      arrastavelRef.current?.remove();
      arrastavelRef.current = null;
      return;
    }
    if (!arrastavelRef.current) {
      const icone = L.divIcon({
        className: "",
        html: '<div style="width:18px;height:18px;border-radius:50%;background:#c62828;border:3px solid #fff;box-shadow:0 0 4px #000"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      arrastavelRef.current = L.marker([ponto.lat, ponto.lng], { draggable: true, icon: icone, zIndexOffset: 1000 })
        .bindTooltip("Ponto a aprovar (arraste)")
        .addTo(mapa);
      arrastavelRef.current.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        onMover({ lat, lng, candidatoId: null });
      });
    } else {
      arrastavelRef.current.setLatLng([ponto.lat, ponto.lng]);
    }
  }, [ponto, onMover]);

  return <Box ref={elRef} sx={{ height: 420, borderRadius: 1, border: 1, borderColor: "divider" }} />;
};

const RevisaoCoordenadasPage = () => {
  const notificar = useNotificar();
  const [execucoes, setExecucoes] = useState([]);
  const [execucao, setExecucao] = useState("");
  const [filtros, setFiltros] = useState({ classe: "", revisao: "pendente", municipio: "" });
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [selecionada, setSelecionada] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [ponto, setPonto] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.get(`${BASE}/execucoes`)
      .then((r) => {
        const lista = r.data?.data || [];
        setExecucoes(lista);
        if (lista.length) setExecucao(lista[0].codigo);
      })
      .catch(() => notificar.erro("Não foi possível carregar as execuções."));
  }, [notificar]);

  const carregar = () => {
    if (!execucao) return;
    setCarregando(true);
    api.get(`${BASE}/revisao/${execucao}`, { params: { ...filtros, pagina, tamanhoPagina: 25 } })
      .then((r) => setDados(r.data?.data || null))
      .catch(() => notificar.erro("Não foi possível carregar a fila."))
      .finally(() => setCarregando(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(carregar, [execucao, filtros, pagina]);

  const abrir = (item) => {
    setSelecionada(item.igrejaId);
    setDetalhe(null);
    setPonto(null);
    api.get(`${BASE}/revisao/${execucao}/${item.igrejaId}`)
      .then((r) => {
        const d = r.data?.data;
        setDetalhe(d);
        const escolhido = d.candidatos.find((c) => c.escolhido);
        if (escolhido) setPonto({ lat: escolhido.latitude, lng: escolhido.longitude, candidatoId: escolhido.id });
        else if (d.igreja.latitudeAtual != null)
          setPonto({ lat: d.igreja.latitudeAtual, lng: d.igreja.longitudeAtual, candidatoId: null });
      })
      .catch(() => notificar.erro("Não foi possível carregar a igreja."));
  };

  const concluir = (acao, corpo) => {
    setSalvando(true);
    api.post(`${BASE}/revisao/${execucao}/${selecionada}/${acao}`, corpo)
      .then(() => {
        notificar.sucesso(acao === "aprovar" ? "Coordenada gravada." : "Proposta rejeitada.");
        setSelecionada(null);
        setDetalhe(null);
        setPonto(null);
        carregar();
      })
      .catch((e) => notificar.erro(e.response?.data?.data || "Não foi possível salvar."))
      .finally(() => setSalvando(false));
  };

  const aprovar = () =>
    concluir("aprovar", ponto.candidatoId
      ? { candidatoId: ponto.candidatoId }
      : { latitude: Number(ponto.lat.toFixed(7)), longitude: Number(ponto.lng.toFixed(7)) });

  const resumoClasses = useMemo(
    () => Object.entries(dados?.porClasse || {}).map(([k, v]) => `${ROTULO_CLASSE[k] || k}: ${v}`).join(" · "),
    [dados],
  );
  const filtro = (campo) => (e) => { setPagina(1); setFiltros((f) => ({ ...f, [campo]: e.target.value })); };

  return (
    <Menu>
      <PageContainer>
        <PageHeader
          title="Revisão de coordenadas"
          subtitle="Pontos propostos pela coleta (CNEFE/IBGE e OpenStreetMap). Confira no mapa, arraste o marcador vermelho se precisar e aprove. Nada é gravado sem aprovação."
        />
        <MonitoramentoCoordenadas />

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Execução</InputLabel>
            <Select label="Execução" value={execucao} onChange={(e) => { setPagina(1); setExecucao(e.target.value); }}>
              {execucoes.map((x) => (
                <MenuItem key={x.codigo} value={x.codigo}>{x.codigo} ({x.igrejasProcessadas} igrejas)</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Classe</InputLabel>
            <Select label="Classe" value={filtros.classe} onChange={filtro("classe")}>
              <MenuItem value="">Todas</MenuItem>
              {Object.entries(ROTULO_CLASSE).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Revisão</InputLabel>
            <Select label="Revisão" value={filtros.revisao} onChange={filtro("revisao")}>
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="pendente">Pendentes</MenuItem>
              <MenuItem value="aprovado">Aprovadas</MenuItem>
              <MenuItem value="rejeitado">Rejeitadas</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Município" value={filtros.municipio} onChange={filtro("municipio")} />
        </Stack>
        {resumoClasses && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{resumoClasses}</Typography>}

        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="flex-start">
          <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, width: "100%", overflowX: "auto" }}>
            {carregando ? (
              <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={28} /></Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Igreja</TableCell>
                    <TableCell>Cidade</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell align="right">Distância</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(dados?.itens || []).map((i) => (
                    <TableRow key={i.igrejaId} hover selected={selecionada === i.igrejaId} onClick={() => abrir(i)} sx={{ cursor: "pointer" }}>
                      <TableCell>
                        <Typography variant="body2">
                          {i.nome}
                          {linkPublico(i) && (
                            <a href={linkPublico(i)} target="_blank" rel="noopener noreferrer" title="Abrir página pública"
                              onClick={(e) => e.stopPropagation()} style={{ marginLeft: 6, verticalAlign: "middle", color: "inherit" }}>
                              <OpenInNewIcon sx={{ fontSize: 14 }} />
                            </a>
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{i.igrejaId} · {i.logradouro}{i.numero ? `, ${i.numero}` : ""}
                        </Typography>
                      </TableCell>
                      <TableCell>{i.localidade}/{i.uf}</TableCell>
                      <TableCell>
                        <Chip size="small" color={COR_CLASSE[i.classe] || "default"} label={ROTULO_CLASSE[i.classe] || i.classe} />
                        {i.revisao !== "pendente" && <Chip size="small" variant="outlined" sx={{ ml: 0.5 }} label={i.revisao} />}
                      </TableCell>
                      <TableCell align="right">
                        {i.latitudeAtual == null && i.latitudeProposta != null ? "sem atual" : formatarDistancia(i.distanciaMetros)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!dados?.itens?.length && (
                    <TableRow><TableCell colSpan={4} align="center">Nada para revisar com estes filtros.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
            {dados && dados.total > dados.tamanhoPagina && (
              <Box sx={{ p: 1 }}>
                <Paginacao
                  pageIndex={pagina}
                  totalPages={Math.ceil(dados.total / dados.tamanhoPagina)}
                  hasPreviousPage={pagina > 1}
                  hasNextPage={pagina < Math.ceil(dados.total / dados.tamanhoPagina)}
                  onPageChange={setPagina}
                />
              </Box>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, width: "100%", p: 2 }}>
            {!selecionada && <Typography color="text.secondary">Selecione uma igreja na lista.</Typography>}
            {selecionada && !detalhe && <CircularProgress size={24} />}
            {detalhe && (
              <Stack spacing={1.5}>
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography variant="subtitle1">{detalhe.igreja.nome}</Typography>
                    {linkPublico(detalhe.igreja) && (
                      <Button size="small" endIcon={<OpenInNewIcon />} href={linkPublico(detalhe.igreja)}
                        target="_blank" rel="noopener noreferrer">
                        Página pública
                      </Button>
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {detalhe.igreja.logradouro}{detalhe.igreja.numero ? `, ${detalhe.igreja.numero}` : ""}
                    {detalhe.igreja.bairro ? ` — ${detalhe.igreja.bairro}` : ""} · {detalhe.igreja.localidade}/{detalhe.igreja.uf}
                  </Typography>
                </Box>
                <MapaRevisao detalhe={detalhe} ponto={ponto} onMover={setPonto} />
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {Object.entries({ "Atual": CORES.legado, "CNEFE": CORES.cnefe, "OSM": CORES.osm, "A aprovar": "#c62828" }).map(([k, c]) => (
                    <Stack key={k} direction="row" spacing={0.5} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c }} />
                      <Typography variant="caption">{k}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Table size="small">
                  <TableBody>
                    {detalhe.candidatos.map((c) => (
                      <TableRow key={c.id} selected={ponto?.candidatoId === c.id}>
                        <TableCell sx={{ color: CORES[c.fonte] }}>{c.fonte}</TableCell>
                        <TableCell>
                          {c.nome || c.tipoResultado}{c.numero ? `, nº ${c.numero}` : ""}
                          {c.motivoRejeicao && <Typography variant="caption" color="error" display="block">{c.motivoRejeicao}</Typography>}
                        </TableCell>
                        <TableCell align="right">{c.fonte === "legado" ? "—" : formatarDistancia(c.distanciaAtualMetros)}</TableCell>
                        <TableCell align="right">
                          {(c.armazenavel || c.fonte === "legado") && (
                            <Button size="small" onClick={() => setPonto({ lat: c.latitude, lng: c.longitude, candidatoId: c.id })}>
                              Usar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!ponto && (
                  <Button variant="outlined" size="small" onClick={() => {
                    const c = detalhe.candidatos[0];
                    setPonto(c ? { lat: c.latitude, lng: c.longitude, candidatoId: null } : { lat: -15.8, lng: -47.9, candidatoId: null });
                  }}>
                    Colocar marcador no mapa
                  </Button>
                )}
                {ponto && (
                  <Typography variant="caption" color="text.secondary">
                    Ponto a aprovar: {ponto.lat.toFixed(6)}, {ponto.lng.toFixed(6)} {ponto.candidatoId ? "(candidato)" : "(marcado no mapa)"}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button color="warning" disabled={salvando} onClick={() => concluir("rejeitar", {})}>Rejeitar</Button>
                  <Button variant="contained" disabled={salvando || !ponto} onClick={aprovar}>Aprovar ponto</Button>
                </Stack>
              </Stack>
            )}
          </Paper>
        </Stack>
      </PageContainer>
    </Menu>
  );
};

export default RevisaoCoordenadasPage;
