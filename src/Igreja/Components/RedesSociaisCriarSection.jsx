import {
    Box,
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
import { useRedesSociais } from "../../hooks/useRedesSociais";

const RedesSociaisCriarSection = ({
                                      redesSociais,
                                      formDataRedeSociais,
                                      onChange,
                                      onAdd,
                                      onDelete,
                                  }) => {
    const { tipos: redesSociaisDisponiveis, obterNomePorId } = useRedesSociais();

    return (
        <SectionCard
            title="Redes Sociais"
            subtitle="Adicione os perfis sociais vinculados à igreja."
        >
            <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="flex-start">
                <FormControl size="small" sx={{ minWidth: 200 }}>
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
                                {redeSocial.nome}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Nome do Perfil"
                    size="small"
                    value={formDataRedeSociais.nomeDoPerfil}
                    onChange={(e) => onChange("nomeDoPerfil", e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onAdd();
                        }
                    }}
                    sx={{ flex: 1, minWidth: 220 }}
                />

                <Button variant="contained" color="primary" onClick={onAdd} sx={{ whiteSpace: "nowrap" }}>
                    Adicionar
                </Button>
            </Box>

            {redesSociais.length > 0 && (
                <List dense disablePadding sx={{ mt: 1.5 }}>
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
                                mb: 0.75,
                                py: 0,
                                px: 2,
                                backgroundColor: "background.default",
                            }}
                        >
                            <Typography>
                                <strong>
                                    {obterNomePorId(rede.tipoRedeSocial)}:
                                </strong>{" "}
                                {rede.nomeDoPerfil}
                            </Typography>

                            <IconButton aria-label="Excluir rede social" color="error" size="small" onClick={() => onDelete(index)}>
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