import Menu from "../Components/Menu";
import CepSearch from "../Components/CepSearch";
import IgrejaAtualizar from "./IgrejaAtualizar";
import { Box } from "@mui/material";
import { EnderecoProvider } from "../Context/EnderecoContext";

const IgrejaEdita = () => {
  return (
    <EnderecoProvider>
      <div style={{ display: "flex" }}>
        <Menu />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column", // Alinha os componentes verticalmente
            gap: 2, // Adiciona um espaçamento entre os componentes
            width: "100%", // Define a largura dos componentes filhos
            padding: 2, // Adiciona um pouco de padding
          }}
        >
          <CepSearch />
          <IgrejaAtualizar />
        </Box>
      </div>
    </EnderecoProvider>
  );
};

export default IgrejaEdita;
