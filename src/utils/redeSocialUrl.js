/**
 * O campo Nome do Perfil deve guardar só o handle (ex.: "paroquia_sao_jose"),
 * nunca a URL inteira — quem monta a URL final é construirUrlRedeSocial.
 * Usuários às vezes colam o link completo do perfil; esta função extrai o
 * handle desse link antes de exibir/enviar. Espelha
 * Helpers/RedeSocialHelper.NormalizarNomeDoPerfil do buscamissa-api-admin.
 */
export const normalizarNomeDoPerfil = (valor) => {
  const texto = (valor ?? "").trim();
  if (!texto) return texto;

  const candidato = texto.includes("://") ? texto : `https://${texto}`;

  try {
    const url = new URL(candidato);
    const segmentos = url.pathname.split("/").filter(Boolean);
    const ultimoSegmento = segmentos[segmentos.length - 1];
    if (ultimoSegmento) {
      return ultimoSegmento.replace(/^@/, "").trim();
    }
  } catch {
    // Não é uma URL válida, mantém o texto original abaixo.
  }

  return texto.replace(/^@/, "").trim();
};

export const construirUrlRedeSocial = (tipoRedeSocial, nomeDoPerfil) => {
  if (!nomeDoPerfil || !nomeDoPerfil.trim()) return null;

  const perfil = nomeDoPerfil.trim();

  switch (Number(tipoRedeSocial)) {
    case 1: // Facebook
      return `https://www.facebook.com/${perfil}`;
    case 2: // Instagram
      return `https://www.instagram.com/${perfil}`;
    case 3: // YouTube
      return `https://www.youtube.com/${perfil}`;
    case 4: // TikTok
      return `https://www.tiktok.com/@${perfil}`;
    case 5: // Twitter
      return `https://www.twitter.com/${perfil}`;
    default:
      return null;
  }
};
