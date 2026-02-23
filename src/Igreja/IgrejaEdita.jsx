import Menu from "../Components/Menu";
import IgrejaAtualizar from "./IgrejaAtualizar";
import { Box } from "@mui/material";
import { EnderecoProvider } from "../Context/EnderecoContext";

const IgrejaEdita = () => {
  return (
    <EnderecoProvider>
      <Menu>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <IgrejaAtualizar />
        </Box>
      </Menu>
    </EnderecoProvider>
  );
};

export default IgrejaEdita;
