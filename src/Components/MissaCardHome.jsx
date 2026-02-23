import { Box, Typography } from "@mui/material";

export default function MissaCardHome({ churchesCount, massesCount }) {
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
    </Box>
  );
}
