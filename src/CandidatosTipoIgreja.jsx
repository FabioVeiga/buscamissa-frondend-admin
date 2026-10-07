import { useEffect, useState } from "react";
import Menu from "./Components/Menu";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import DataTable from "./Components/DataTable";
import RowActions from "./Components/RowActions";
import StatusChip from "./Components/StatusChip";
import {
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
      <DataTable
        loading={isLoading}
        rows={registros}
        getRowKey={(r) => r.id}
        emptyTitle="Nenhuma candidata encontrada"
        columns={[
          { key: "id", header: "Id" },
          { key: "nome", header: "Nome" },
          { key: "local", header: "Cidade/UF", render: (r) => [r.cidade, r.uf].filter(Boolean).join("/") },
          { key: "tipo", header: "Tipo sugerido", render: (r) => <Chip size="small" label={r.tipoIgrejaSugerido} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "center",
            render: (r) =>
              aplicados.has(r.id) ? (
                <StatusChip label="Aplicado" color="success" />
              ) : (
                <RowActions
                  actions={[
                    { label: "Aplicar", icon: <CheckCircleIcon fontSize="small" />, color: "success", disabled: aplicandoId === r.id, onClick: () => aplicar(r) },
                    { label: "Ver igreja", icon: <OpenInNewIcon fontSize="small" />, color: "primary", disabled: carregandoVerId === r.id, onClick: () => ver(r) },
                  ]}
                />
              ),
          },
        ]}
      />
      </PageContainer>
    </Menu>
  );
};

export default CandidatosTipoIgrejaPage;
