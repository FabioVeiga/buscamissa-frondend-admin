import { TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import SectionCard from "./SectionCard";

const ContatoForm = ({ contato = {}, onChange }) => {
    const handleChange = (field, value) => {
        onChange({
            ...contato,
            [field]: value,
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
                        onChange={(e) => handleChange("emailContato", e.target.value)}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        label="DDD"
                        value={contato.ddd || ""}
                        onChange={(e) => handleChange("ddd", e.target.value)}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                        label="Telefone"
                        value={contato.telefone || ""}
                        onChange={(e) => handleChange("telefone", e.target.value)}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        label="DDD WhatsApp"
                        value={contato.dddWhatsApp || ""}
                        onChange={(e) => handleChange("dddWhatsApp", e.target.value)}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                        label="Telefone WhatsApp"
                        value={contato.telefoneWhatsApp || ""}
                        onChange={(e) => handleChange("telefoneWhatsApp", e.target.value)}
                        fullWidth
                    />
                </Grid>
            </Grid>
        </SectionCard>
    );
};

export default ContatoForm;