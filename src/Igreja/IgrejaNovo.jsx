import Menu from "../Components/Menu";
import CepSearch from "../Components/CepSearch";
import IgrejaCriar from "./IgrejaCriar";
import { Box } from "@mui/material";
import { EnderecoProvider } from "../Context/EnderecoContext";

const IgrejaNovo = () => {
  return (
    <EnderecoProvider>
      <Menu>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <CepSearch />
          <IgrejaCriar />
        </Box>
      </Menu>
    </EnderecoProvider>
  );
};

export default IgrejaNovo;
