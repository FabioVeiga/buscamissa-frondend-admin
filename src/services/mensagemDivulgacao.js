const BASE_URL = import.meta.env.VITE_PAROQUIA_BASE_URL?.replace(/\/+$/, "") ?? "https://buscamissa.com.br/paroquia";

export const construirLinkIgreja = (igreja) => {
  const uf = igreja?.endereco?.uf?.toLowerCase() || "";
  const cidade = igreja?.endereco?.cidadeSlug || "";
  const slug = igreja?.slug || "";
  const partes = [BASE_URL, uf, cidade, slug].filter(Boolean);
  return partes.join("/");
};

const MENSAGEM = (nomeIgreja, link) =>
`Olá! Paz e bem! 🙏

Criamos uma página para a ${nomeIgreja} no BuscaMissa com os horários de missa e outras informações da paróquia.

Gostaríamos de convidá-los a conferir se os dados estão corretos. Caso encontrem alguma informação desatualizada ou que possa ser complementada, teremos a maior alegria em realizar as alterações para manter tudo sempre atualizado.

📍 Acesse a página da paróquia:

${link}

O BuscaMissa é uma plataforma gratuita, criada para ajudar os fiéis a encontrarem horários de missas e informações das igrejas em todo o Brasil.

Se gostarem da iniciativa, ficaremos muito felizes se puderem acompanhar nosso trabalho e compartilhar o projeto com a comunidade.

📸 Instagram: https://instagram.com/buscamissa

📘 Facebook: https://facebook.com/buscamissa

Que Deus abençoe toda a comunidade! 🙏`;

export const gerarMensagemInstagram = (nomeIgreja, link) => MENSAGEM(nomeIgreja, link);

export const gerarMensagemFacebook = (nomeIgreja, link) => MENSAGEM(nomeIgreja, link);
