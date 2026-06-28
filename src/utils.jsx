// utils.js

/**
 * Retorna o nome do dia da semana em formato textual.
 * @param {number} dia - Número do dia da semana (0 a 6).
 * @returns {string} - Nome do dia da semana.
 */
export const diaDaSemana = (dia) => {
  const dias = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  return dias[dia];
};

export const diasDaSemana = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

/**
 * Lista de UFs (Unidades Federativas) do Brasil.
 */
export const ufs = [
  "ac", "al", "ap", "am", "ba", "ce", "df", "es", "go", "ma", "mt", "ms", "mg",
  "pa", "pb", "pr", "pe", "pi", "rj", "rn", "rs", "ro", "rr", "sc", "sp", "se", "to"
];


export const redesSociais = (redeSocial) => {
  const redes = [
    "Vazio",
    "Facebook",
    "Instagram",
    "YouTube",
    "TikTok",
  ];
  return redes[redeSocial];
};

export const isCepValid = (cep) => {
  const regex = /^\d{5}-?\d{3}$/;
  return regex.test(cep);
};

/**
 * Formata uma string ou número de horário para o formato HH:mm.
 * @param {string|number} horario - Horário (ex: "930", "0930", "9:30", 930).
 * @returns {string} Horário formatado em HH:mm.
 */
export const formatarHorario = (horario) => {
  // Date object -> HH:mm
  if (horario instanceof Date) {
    const hh = String(horario.getHours()).padStart(2, "0");
    const mm = String(horario.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }


  // Number like 930 -> "09:30"
  if (typeof horario === "number") {
    horario = horario.toString().padStart(4, "0");
  }

  if (typeof horario === "string") {
    // If string already contains HH:MM (possibly with seconds/millis), extract
    const match = horario.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hh = match[1].padStart(2, "0");
      const mm = match[2];
      return `${hh}:${mm}`;
    }

    // Remove characters non-numeric and fallback to legacy rules
    const clean = horario.replace(/\D/g, "");
    if (clean.length === 4) {
      return `${clean.slice(0, 2)}:${clean.slice(2)}`;
    }
    if (clean.length === 3) {
      return `0${clean[0]}:${clean.slice(1)}`;
    }
    if (clean.length === 2) {
      return `00:${clean}`;
    }
    if (clean.length === 1) {
      return `00:0${clean}`;
    }
  }

  return horario;
};

/**
 * Remove tudo que não for dígito de uma string e retorna a string resultante.
 * Se receber null/undefined retorna string vazia.
 */
export const apenasNumeros = (valor) => {
  if (valor === null || valor === undefined) return "";
  return String(valor).replace(/\D/g, "");
};

const ENTIDADE_MAP = {
  RedeSociais: "Rede Social",
  Missas: "Missa",
  Contato: "Contato",
  Endereco: "Endereço",
};

const camelParaLabel = (str) =>
  str.replace(/([A-Z])/g, " $1").trim();

const formatarChaveErro = (chave) => {
  // Padrão: "Entidade[N].Campo"
  const match = chave.match(/^([A-Za-z]+)\[(\d+)\]\.(.+)$/);
  if (match) {
    const [, entidade, indice, campo] = match;
    const entidadeLabel = ENTIDADE_MAP[entidade] || camelParaLabel(entidade);
    const campoLabel = camelParaLabel(campo);
    return `${entidadeLabel} #${Number(indice) + 1} — ${campoLabel}`;
  }
  return camelParaLabel(chave);
};

/**
 * Recebe o objeto `errors` da resposta da API e retorna uma mensagem amigável
 * para o primeiro erro encontrado.
 */
export const formatarErroApi = (erros) => {
  const chaves = Object.keys(erros);
  if (chaves.length === 0) return null;

  const chave = chaves[0];
  const valorBruto = erros[chave][0] ?? "";

  // Se o valor já inclui o caminho do campo (ex: "RedeSociais[0].X: msg"), remove o prefixo
  const valorLimpo = valorBruto.replace(/^[A-Za-z\[\]\d.]+:\s*/, "");

  return `${formatarChaveErro(chave)}: ${valorLimpo}`;
};