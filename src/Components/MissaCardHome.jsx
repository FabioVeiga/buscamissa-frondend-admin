
export default function MissaCardHome({ churchesCount, massesCount }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 max-w-md mx-auto text-center">
      <p>
        <strong>Descubra Horários de Missas com Facilidade no BuscaMissa!</strong> 🕯️📿
        <br /><br />
        Já imaginou poder encontrar horários de missas em diversas igrejas do Brasil de forma rápida e prática?<br />
        O site <strong>BuscaMissa</strong> já reúne mais de <strong>{churchesCount}</strong> igrejas cadastradas, com mais de <strong>{massesCount}</strong> missas disponíveis para consulta!
        <br /><br />
        <strong>Como o BuscaMissa ajuda você?</strong><br />
        ✅ Encontre missas perto de você<br />
        ✅ Horários atualizados<br />
        ✅ Filtros por dia, local e horário
        <br /><br />
        <strong>Você também pode colaborar!</strong><br />
        Se você conhece os horários de missas da sua paróquia ou comunidade, ajude atualizando ou cadastrando novas informações.<br />
        Assim, mais pessoas podem participar das celebrações!
        <br /><br />
        👉 https://www.buscamissa.com.br/
        <br /><br />
        #BuscaMissa #IgrejaCatolica #Missas #EncontreSuaMissa <br />
        <em>Vamos juntos fortalecer a comunidade católica!</em> 🙏✨
      </p>

    </div>
  );
}
