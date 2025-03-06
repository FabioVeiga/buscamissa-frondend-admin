import Menu from "../Components/Menu";
import CepSearch from "../Components/CepSearch";
import IgrejaCriar from "./IgrejaCriar";
import { Box } from "@mui/material";
import { EnderecoProvider } from "../Context/EnderecoContext";

const IgrejaNovo = () => {
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
          <IgrejaCriar />
        </Box>
      </div>
    </EnderecoProvider>
  );
};

export default IgrejaNovo;
