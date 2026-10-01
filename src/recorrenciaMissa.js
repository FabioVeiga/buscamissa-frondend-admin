// Regra de recorrência de uma missa: semanal ou dia fixo do mês ("todo dia 13").
// Espelho de RecorrenciaMissa.cs (APIs) e recorrencia-missa.ts (site), só com o que o
// admin usa: descrever e validar. Mantenha os textos iguais.

export const TIPO_RECORRENCIA = { Semanal: 0, OcorrenciaNoMes: 1, DiaDoMes: 2 };

export const EXCECAO_DOMINGO = 1 << 0;
export const EXCECAO_SABADO = 1 << 6;

const DIAS_ROTULO = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const DIAS_PLURAL = ["domingos", "segundas-feiras", "terças-feiras", "quartas-feiras", "quintas-feiras", "sextas-feiras", "sábados"];

/** Ausência do campo (missa antiga) = semanal. */
export const ehSemanal = (m) => Number(m?.tipoRecorrencia ?? TIPO_RECORRENCIA.Semanal) === TIPO_RECORRENCIA.Semanal;

const formatarHora = (horario) => {
  const digitos = String(horario ?? "").replace(/\D/g, "");
  if (digitos.length < 3) return String(horario ?? "");
  const h = Number(digitos.length === 3 ? digitos.slice(0, 1) : digitos.slice(0, 2));
  const m = Number(digitos.length === 3 ? digitos.slice(1, 3) : digitos.slice(2, 4));
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
};

const descreverExcecao = (mask) => {
  if (!mask) return "";
  // Exceção em 4+ dias: mais claro dizer quando OCORRE ("somente sábados e domingos").
  const excluidos = [0, 1, 2, 3, 4, 5, 6].filter((d) => (mask & (1 << d)) !== 0).length;
  const somente = excluidos >= 4;
  // Semana a partir de segunda, para ler "sábados e domingos".
  const dias = [1, 2, 3, 4, 5, 6, 0]
    .filter((d) => ((mask & (1 << d)) !== 0) !== somente)
    .map((d) => DIAS_PLURAL[d]);
  const lista = dias.length === 1 ? dias[0] : `${dias.slice(0, -1).join(", ")} e ${dias[dias.length - 1]}`;
  return somente ? ` (somente ${lista})` : ` (exceto ${lista})`;
};

/** "Domingo, 19h" · "Todo dia 13, 19h30" · "Todo dia 13, 19h (exceto sábados e domingos)". */
export const descrever = (m) => {
  const hora = formatarHora(m?.horario);
  if (ehSemanal(m)) return `${DIAS_ROTULO[Number(m?.diaSemana)] ?? ""}, ${hora}`;
  if (Number(m.tipoRecorrencia) === TIPO_RECORRENCIA.DiaDoMes)
    return `Todo dia ${m.diaDoMes}, ${hora}${descreverExcecao(Number(m.diasSemanaExcecao) || 0)}`;
  return hora;
};

/** Mensagem de erro da regra (para o formulário) ou null se válida. */
export const validarDiaFixo = (diaDoMes, diasSemanaExcecao) => {
  const dia = Number(diaDoMes);
  if (!Number.isInteger(dia) || dia < 1 || dia > 31) return "Dia do mês deve estar entre 1 e 31.";
  if ((Number(diasSemanaExcecao) || 0) === 0b1111111) return "A missa não pode ter exceção em todos os dias da semana.";
  return null;
};

/** Chave de duplicidade: semanal pelo dia da semana, dia fixo pelo dia do mês (igual à API). */
export const chaveMissa = (m) =>
  ehSemanal(m)
    ? `0|${Number(m.diaSemana)}|${m.horario}`
    : `${Number(m.tipoRecorrencia)}|${Number(m.diaDoMes)}|${m.horario}`;
