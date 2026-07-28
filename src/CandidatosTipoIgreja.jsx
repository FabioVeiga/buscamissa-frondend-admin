import { useEffect, useState } from "react";
import Menu from "./Components/Menu";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import api from "./services/apiService";
import { useNavigate } from "react-router-dom";

const CandidatosTipoIgrejaPage = () => {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aplicandoId, setAplicandoId] = useState(null);
  const [aplicados, setAplicados] = useState(new Set());

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

  return (
    <Menu>
      <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2, overflow: "auto" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            Candidatas a reclassificação de tipo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Igrejas hoje classificadas como Paróquia (valor padrão do backfill original) cujo nome sugere
            capela/comunidade/santuário. Identificação por heurística — revise antes de aplicar (ex.: &quot;Paróquia
            Santuário de Fátima&quot; pode legitimamente ser uma paróquia). Aplicar só corrige o TIPO; a paróquia-sede
            continua sendo definida à parte, na tela de edição da igreja.
          </Typography>
        </Box>

        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={60} />
            <Typography variant="h6" mt={2}>
              Carregando...
            </Typography>
          </Box>
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
                        <Chip size="small" label="Aplicado" color="success" />
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
                            onClick={() => navigate("/igrejaEditar", { state: { row: { id: r.id } } })}
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
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">Nenhuma candidata encontrada.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Menu>
  );
};

export default CandidatosTipoIgrejaPage;
