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
  if (typeof horario === "number") {
    horario = horario.toString().padStart(4, "0");
  }
  if (typeof horario === "string") {
    // Remove caracteres não numéricos
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