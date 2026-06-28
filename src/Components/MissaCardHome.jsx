import { useState } from "react";
import { Box, Typography, Button, Tooltip } from "@mui/material";
import { ContentCopy, Check } from "@mui/icons-material";

export default function MissaCardHome({ churchesCount, massesCount }) {
  const [copiado, setCopiado] = useState(false);

  const textoParaCopiar = `Descubra Horários de Missas com Facilidade no BuscaMissa! 🕯️📿

Já imaginou poder encontrar horários de missas em diversas igrejas do Brasil de forma rápida e prática? O site BuscaMissa já reúne mais de ${churchesCount ?? "—"} igrejas cadastradas, com mais de ${massesCount ?? "—"} missas disponíveis para consulta!

Como o BuscaMissa ajuda você?
✓ Encontre missas perto de você
✓ Horários atualizados
✓ Filtros por dia, local e horário

Você também pode colaborar!
Se você conhece os horários de missas da sua paróquia ou comunidade, ajude atualizando ou cadastrando novas informações. Assim, mais pessoas podem participar das celebrações!

👉 https://www.buscamissa.com.br/

#BuscaMissa #IgrejaCatolica #Missas #EncontreSuaMissa
Vamos juntos fortalecer a comunidade católica! 🙏✨`;

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoParaCopiar).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", textAlign: "center" }}>
      <Typography variant="body1" paragraph sx={{ fontWeight: 600 }}>
        Descubra Horários de Missas com Facilidade no BuscaMissa! 🕯️📿
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Já imaginou poder encontrar horários de missas em diversas igrejas do Brasil de forma rápida e prática? O
        site <strong>BuscaMissa</strong> já reúne mais de <strong>{churchesCount ?? "—"}</strong> igrejas cadastradas,
        com mais de <strong>{massesCount ?? "—"}</strong> missas disponíveis para consulta!
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        <strong>Como o BuscaMissa ajuda você?</strong>
        <br />✓ Encontre missas perto de você
        <br />✓ Horários atualizados
        <br />✓ Filtros por dia, local e horário
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        <strong>Você também pode colaborar!</strong>
        <br />
        Se você conhece os horários de missas da sua paróquia ou comunidade, ajude atualizando ou cadastrando novas
        informações. Assim, mais pessoas podem participar das celebrações!
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        👉 https://www.buscamissa.com.br/
      </Typography>
      <Typography variant="body2" color="text.secondary">
        #BuscaMissa #IgrejaCatolica #Missas #EncontreSuaMissa
        <br />
        <em>Vamos juntos fortalecer a comunidade católica!</em> 🙏✨
      </Typography>

      <Tooltip title={copiado ? "Copiado!" : "Copiar texto"}>
        <Button
          variant="outlined"
          size="small"
          startIcon={copiado ? <Check /> : <ContentCopy />}
          onClick={handleCopiar}
          color={copiado ? "success" : "primary"}
          sx={{ mt: 2 }}
        >
          {copiado ? "Copiado!" : "Copiar"}
        </Button>
      </Tooltip>
    </Box>
  );
}
