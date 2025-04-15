/* eslint-disable react/prop-types */
import { useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, List, ListItem, Typography, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

const RedeSocialForm = ({ redesSociaisExistentes, onAddRedeSocial, onDeleteRedeSocial }) => {
  const [redeSocial, setRedeSocial] = useState({
    tipoRedeSocial: "",
    nomeDoPerfil: "",
  });

  const handleChange = (field, value) => {
    setRedeSocial((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRedeSocial = () => {
    const { tipoRedeSocial, nomeDoPerfil } = redeSocial;

    if (!tipoRedeSocial || !nomeDoPerfil) {
      alert("Os campos Tipo de Rede Social e Nome do Perfil são obrigatórios!");
      return;
    }

    if (redesSociaisExistentes.some((rede) => rede.tipoRedeSocial === tipoRedeSocial)) {
      alert("Já existe uma rede social com o tipo selecionado!");
      return;
    }

    onAddRedeSocial(redeSocial);
    setRedeSocial({ tipoRedeSocial: "", nomeDoPerfil: "" });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FormControl fullWidth>
        <InputLabel id="tipoRedeSocial-label">Tipo de Rede Social</InputLabel>
        <Select
          labelId="tipoRedeSocial-label"
          value={redeSocial.tipoRedeSocial}
          onChange={(e) => handleChange("tipoRedeSocial", e.target.value)}
        >
          <MenuItem value="1">Facebook</MenuItem>
          <MenuItem value="2">Instagram</MenuItem>
          <MenuItem value="3">Youtube</MenuItem>
          <MenuItem value="4">Tiktok</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Nome do Perfil"
        value={redeSocial.nomeDoPerfil}
        onChange={(e) => handleChange("nomeDoPerfil", e.target.value)}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleAddRedeSocial}>
        Adicionar Rede Social
      </Button>
      {redesSociaisExistentes.length > 0 && (
        <List>
          {redesSociaisExistentes.map((rede, index) => (
            <ListItem
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>
                {rede.tipoRedeSocial}: {rede.nomeDoPerfil}
              </Typography>
              <IconButton color="error" onClick={() => onDeleteRedeSocial(index)}>
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RedeSocialForm;