import { FormControl } from "@mui/material";
import RedeSocialForm from "./RedeSocialForm";
import SectionCard from "./SectionCard";

const RedesSociaisSection = ({
                                 redesSociais,
                                 igrejaId,
                                 onAddRedeSocial,
                                 onDeleteRedeSocial,
                             }) => {
    return (
        <SectionCard
            title="Redes Sociais"
            subtitle="Gerencie os perfis sociais vinculados à igreja."
        >
            <FormControl fullWidth>
                <RedeSocialForm
                    redesSociaisExistentes={redesSociais}
                    igrejaId={igrejaId}
                    onAddRedeSocial={onAddRedeSocial}
                    onDeleteRedeSocial={onDeleteRedeSocial}
                />
            </FormControl>
        </SectionCard>
    );
};

export default RedesSociaisSection;