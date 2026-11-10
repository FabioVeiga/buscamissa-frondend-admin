// Atalhos de datas de missas especiais para o formulário de "Data específica".
// As fixas (Natal etc.) caem sempre no mesmo dia; as móveis (Páscoa e derivadas) são
// calculadas pelo calendário gregoriano. A data escolhida é sempre a próxima ainda não passada.

/** Domingo de Páscoa do ano (algoritmo anônimo gregoriano). Mês 1-12. */
export const pascoa = (ano) => {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return { ano, mes, dia };
};

const iso = (ano, mes, dia) => `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

// Soma dias a uma data (em UTC, sem fuso) e devolve "yyyy-MM-dd".
const somarDias = ({ ano, mes, dia }, n) => {
  const d = new Date(Date.UTC(ano, mes - 1, dia + n));
  return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
};

const FIXAS = [
  { nome: "Missa do Galo", mes: 12, dia: 24 },
  { nome: "Missa de Natal", mes: 12, dia: 25 },
  { nome: "Santa Maria, Mãe de Deus", mes: 1, dia: 1 },
  { nome: "Assunção de Nossa Senhora", mes: 8, dia: 15 },
  { nome: "Nossa Senhora Aparecida", mes: 10, dia: 12 },
  { nome: "Todos os Santos", mes: 11, dia: 1 },
  { nome: "Finados", mes: 11, dia: 2 },
  { nome: "Imaculada Conceição", mes: 12, dia: 8 },
];

// Deslocamento em dias a partir da Páscoa.
const MOVEIS = [
  { nome: "Quarta-feira de Cinzas", offset: -46 },
  { nome: "Domingo de Ramos", offset: -7 },
  { nome: "Quinta-feira Santa", offset: -3 },
  { nome: "Sexta-feira da Paixão", offset: -2 },
  { nome: "Vigília Pascal", offset: -1 },
  { nome: "Domingo de Páscoa", offset: 0 },
  { nome: "Corpus Christi", offset: 60 },
];

/** Atalhos [{ nome, data: "yyyy-MM-dd" }] com a próxima data (de `hoje`, "yyyy-MM-dd") de cada festa. */
export const atalhosLiturgicos = (hoje) => {
  const ano = Number(String(hoje).slice(0, 4));
  const proxima = (calc) => {
    const esteAno = calc(ano);
    return esteAno >= hoje ? esteAno : calc(ano + 1);
  };
  const lista = [
    ...FIXAS.map((f) => ({ nome: f.nome, data: proxima((y) => iso(y, f.mes, f.dia)) })),
    ...MOVEIS.map((f) => ({ nome: f.nome, data: proxima((y) => somarDias(pascoa(y), f.offset)) })),
  ];
  return lista.sort((a, b) => a.data.localeCompare(b.data));
};
