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
