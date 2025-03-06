import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
//import Grid from "@mui/material/Grid2";
import { useLocation, useNavigate } from "react-router-dom";

const IgrejaDetalhe = () => {
  
  const location = useLocation();
  const data = location.state?.row;
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {data.nome}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          <strong>Paroco:</strong> {data.paroco}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          <strong>Ativo:</strong> {data.ativo ? "Sim" : "Não"}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          <strong>Data de Criação:</strong> {new Date(data.criacao).toLocaleString()}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          <strong>Última Alteração:</strong> {new Date(data.alteracao).toLocaleString()}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Informações do Usuário
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Nome:</strong> {data.usuario.nome}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Endereço
        </Typography>
        <Typography variant="body1" gutterBottom>
          {`${data.endereco.logradouro}, ${data.endereco.bairro}, ${data.endereco.localidade} - ${data.endereco.uf}`}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>CEP:</strong> {data.endereco.cep}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Região:</strong> {data.endereco.regiao}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Missas
        </Typography>
        <List>
          {data.missas.map((missa) => (
            <ListItem key={missa.id}>
              <ListItemText
                primary={`Dia da Semana: ${missa.diaSemana}`}
                secondary={`Horário: ${missa.horario}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
          Voltar
        </Button>
    </Card>
    
  );
};

export default IgrejaDetalhe;