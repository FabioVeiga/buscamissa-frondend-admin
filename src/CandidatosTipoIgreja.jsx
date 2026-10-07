import { useEffect, useState } from "react";
import Menu from "./Components/Menu";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import EmptyState from "./Components/EmptyState";
import LoadingState from "./Components/LoadingState";
import StatusChip from "./Components/StatusChip";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import api from "./services/apiService";
import { buscarIgrejaCompletaPorId, normalizarIgrejaParaEdicao } from "./services/igrejaHelpers";
import { useNavigate } from "react-router-dom";

const CandidatosTipoIgrejaPage = () => {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aplicandoId, setAplicandoId] = useState(null);
  const [aplicados, setAplicados] = useState(new Set());
  const [carregandoVerId, setCarregandoVerId] = useState(null);

  const carregar = () => {
    setIsLoading(true);
    api
      .get("/api/v1/admin/igreja/candidatos-tipo-igreja")
      .then((response) => setRegistros(response.data?.data || []))
      .catch(() => setRegistros([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const aplicar = (registro) => {
    setAplicandoId(registro.id);
    api
      .put(`/api/v1/admin/igreja/${registro.id}/hierarquia`, {
        tipoIgreja: registro.tipoIgrejaSugerido === "Capela" ? 2 : registro.tipoIgrejaSugerido === "Comunidade" ? 3 : 4,
        igrejaPaiId: null,
      })
      .then(() => setAplicados((prev) => new Set(prev).add(registro.id)))
      .catch(() => {})
      .finally(() => setAplicandoId(null));
  };

  const ver = async (registro) => {
    setCarregandoVerId(registro.id);
    try {
      const igrejaCompleta = await buscarIgrejaCompletaPorId(registro.id);
      navigate("/igrejaEditar", { state: { row: normalizarIgrejaParaEdicao(igrejaCompleta) } });
    } catch {
      alert("Não foi possível carregar os dados desta igreja.");
    } finally {
      setCarregandoVerId(null);
    }
  };

  return (
    <Menu>
      <PageContainer>
      <PageHeader
        title="Candidatas a reclassificação de tipo"
        subtitle={`Igrejas hoje classificadas como Paróquia (valor padrão do backfill original) cujo nome sugere capela/comunidade/santuário. Identificação por heurística — revise antes de aplicar (ex.: "Paróquia Santuário de Fátima" pode legitimamente ser uma paróquia). Aplicar só corrige o TIPO; a paróquia-sede continua sendo definida à parte, na tela de edição da igreja.`}
      />
      <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2, overflow: "auto" }}>

        {isLoading ? (
          <LoadingState />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Cidade/UF</TableCell>
                <TableCell>Tipo sugerido</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.length > 0 ? (
                registros.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.nome}</TableCell>
                    <TableCell>{[r.cidade, r.uf].filter(Boolean).join("/")}</TableCell>
                    <TableCell>
                      <Chip size="small" label={r.tipoIgrejaSugerido} />
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      {aplicados.has(r.id) ? (
                        <StatusChip label="Aplicado" color="success" />
                      ) : (
                        <>
                          <Button
                            size="small"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            disabled={aplicandoId === r.id}
                            onClick={() => aplicar(r)}
                          >
                            Aplicar
                          </Button>
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<OpenInNewIcon />}
                            disabled={carregandoVerId === r.id}
                            onClick={() => ver(r)}
                          >
                            Ver
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState title="Nenhuma candidata encontrada" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      </PageContainer>
    </Menu>
  );
};

export default CandidatosTipoIgrejaPage;
