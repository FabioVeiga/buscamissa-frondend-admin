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
