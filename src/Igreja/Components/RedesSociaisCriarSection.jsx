import {
    Button,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import SectionCard from "./SectionCard";
import RedeSociaisModel from "../../Models/RedeSociaisModel";

const RedesSociaisCriarSection = ({
                                      redesSociais,
                                      formDataRedeSociais,
                                      onChange,
                                      onAdd,
                                      onDelete,
                                  }) => {
    const redesSociaisDisponiveis = RedeSociaisModel.obterLista();

    return (
        <SectionCard
            title="Redes Sociais"
            subtitle="Adicione os perfis sociais vinculados à igreja."
        >
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="tipoRedeSocial-label">
                    Tipo de Rede Social
                </InputLabel>

                <Select
                    labelId="tipoRedeSocial-label"
                    label="Tipo de Rede Social"
                    value={formDataRedeSociais.tipoRedeSocial}
                    onChange={(e) => onChange("tipoRedeSocial", e.target.value)}
                >
                    {redesSociaisDisponiveis.map((redeSocial) => (
                        <MenuItem key={redeSocial.id} value={redeSocial.id}>
                            {redeSocial.tipo}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Nome do Perfil"
                value={formDataRedeSociais.nomeDoPerfil}
                onChange={(e) => onChange("nomeDoPerfil", e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />

            <Button variant="contained" color="primary" onClick={onAdd}>
                Adicionar Rede Social
            </Button>

            {redesSociais.length > 0 && (
                <List sx={{ mt: 2 }}>
                    {redesSociais.map((rede, index) => (
                        <ListItem
                            key={`${rede.tipoRedeSocial}-${index}`}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                mb: 1,
                                px: 2,
                                backgroundColor: "background.default",
                            }}
                        >
                            <Typography>
                                <strong>
                                    {RedeSociaisModel.obterNomePorId(rede.tipoRedeSocial)}:
                                </strong>{" "}
                                {rede.nomeDoPerfil}
                            </Typography>

                            <IconButton color="error" onClick={() => onDelete(index)}>
                                <Delete />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </SectionCard>
    );
};

export default RedesSociaisCriarSection;