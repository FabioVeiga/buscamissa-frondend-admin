import { TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import SectionCard from "./SectionCard";
import { apenasNumeros } from "../../utils";

const ContatoForm = ({ contato = {}, onChange }) => {
    const handleChange = (field, value) => {
        onChange({
            ...contato,
            [field]: value,
        });
    };

    const handleTelefoneChange = (dddField, telefoneField) => (e) => {
        const digitos = apenasNumeros(e.target.value);
        onChange({
            ...contato,
            [dddField]: digitos.slice(0, 2),
            [telefoneField]: digitos.slice(2),
        });
    };

    return (
        <SectionCard
            title="Contato"
            subtitle="Informe os dados de contato da igreja."
        >
            <Grid container spacing={2}>
                <Grid size={12}>
                    <TextField
                        label="Email de Contato"
                        value={contato.emailContato || ""}
                        onChange={(e) => handleChange("emailContato", e.target.value.replace(/\s/g, ""))}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Telefone"
                        value={`${contato.ddd || ""}${contato.telefone || ""}`}
                        onChange={handleTelefoneChange("ddd", "telefone")}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Telefone WhatsApp"
                        value={`${contato.dddWhatsApp || ""}${contato.telefoneWhatsApp || ""}`}
                        onChange={handleTelefoneChange("dddWhatsApp", "telefoneWhatsApp")}
                        fullWidth
                    />
                </Grid>
            </Grid>
        </SectionCard>
    );
};

export default ContatoForm;