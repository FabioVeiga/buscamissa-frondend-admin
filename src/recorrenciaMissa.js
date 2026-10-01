// Regra de recorrência de uma missa: semanal ou dia fixo do mês ("todo dia 13").
// Espelho de RecorrenciaMissa.cs (APIs) e recorrencia-missa.ts (site), só com o que o
// admin usa: descrever e validar. Mantenha os textos iguais.

export const TIPO_RECORRENCIA = { Semanal: 0, OcorrenciaNoMes: 1, DiaDoMes: 2 };

export const EXCECAO_DOMINGO = 1 << 0;
export const EXCECAO_SABADO = 1 << 6;

/** Bit de "última" em semanasDoMes (bit0..bit4 = 1ª..5ª). */
export const ULTIMA_SEMANA = 1 << 5;
/** Opções de semana do mês para os formulários (só 1ª a 4ª e "Última", decisão do produto). */
export const SEMANAS_DO_MES = [
  { bit: 1 << 0, label: "1ª" },
  { bit: 1 << 1, label: "2ª" },
  { bit: 1 << 2, label: "3ª" },
  { bit: 1 << 3, label: "4ª" },
  { bit: ULTIMA_SEMANA, label: "Última" },
];

const DIAS_NOME = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

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
  // Semana a partir de segunda, para ler "sábados e domingos".
  const dias = [1, 2, 3, 4, 5, 6, 0].filter((d) => (mask & (1 << d)) !== 0).map((d) => DIAS_PLURAL[d]);
  const lista = dias.length === 1 ? dias[0] : `${dias.slice(0, -1).join(", ")} e ${dias[dias.length - 1]}`;
  return ` (exceto ${lista})`;
};

/** "Domingo, 19h" · "Todo dia 13, 19h30" · "Todo dia 13, 19h (exceto sábados e domingos)". */
export const descrever = (m) => {
  const hora = formatarHora(m?.horario);
  if (ehSemanal(m)) return `${DIAS_ROTULO[Number(m?.diaSemana)] ?? ""}, ${hora}`;
  if (Number(m.tipoRecorrencia) === TIPO_RECORRENCIA.DiaDoMes)
    return `Todo dia ${m.diaDoMes}, ${hora}${descreverExcecao(Number(m.diasSemanaExcecao) || 0)}`;
  if (Number(m.tipoRecorrencia) === TIPO_RECORRENCIA.OcorrenciaNoMes)
    return `${descreverSemanas(Number(m.diaSemana), Number(m.semanasDoMes) || 0)} do mês, ${hora}`;
  return hora;
};

// "1ª e 3ª sexta-feira" · "1º e último sábado" (sábado e domingo são masculinos).
const descreverSemanas = (diaSemana, semanas) => {
  const masculino = diaSemana === 0 || diaSemana === 6;
  const ordinais = [0, 1, 2, 3, 4].filter((i) => (semanas & (1 << i)) !== 0).map((i) => `${i + 1}${masculino ? "º" : "ª"}`);
  if ((semanas & ULTIMA_SEMANA) !== 0) ordinais.push(masculino ? "último" : "última");
  const lista = ordinais.length <= 1 ? ordinais[0] ?? "" : `${ordinais.slice(0, -1).join(", ")} e ${ordinais[ordinais.length - 1]}`;
  const texto = `${lista} ${DIAS_NOME[diaSemana] ?? ""}`;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/** Mensagem de erro da ocorrência no mês, ou null se válida. */
export const validarOcorrencia = (diaSemana, semanasDoMes) => {
  if (diaSemana === "" || diaSemana == null || Number(diaSemana) < 0 || Number(diaSemana) > 6) return "Selecione o dia da semana.";
  const semanas = Number(semanasDoMes) || 0;
  if (semanas <= 0 || semanas > 0b111111) return "Selecione ao menos uma semana do mês (1ª a 4ª ou última).";
  return null;
};

/**
 * Aviso (não bloqueia) quando a ocorrência no mês tem o mesmo dia e horário de uma
 * semanal da lista, ou vice-versa: "toda sexta 19h" + "1ª sexta 19h" costuma ser a mesma
 * missa com intenção especial.
 */
export const alertaConflitoSemanal = (missas, nova) => {
  const tipoNovo = Number(nova?.tipoRecorrencia ?? TIPO_RECORRENCIA.Semanal);
  if (tipoNovo === TIPO_RECORRENCIA.DiaDoMes) return null;
  const mesmoHorario = (m) => String(m.horario).replace(/\D/g, "").slice(0, 4) === String(nova.horario).replace(/\D/g, "").slice(0, 4);
  const conflito = (missas || []).find(
    (m) =>
      Number(m.diaSemana) === Number(nova.diaSemana) &&
      mesmoHorario(m) &&
      (tipoNovo === TIPO_RECORRENCIA.OcorrenciaNoMes ? ehSemanal(m) : Number(m.tipoRecorrencia) === TIPO_RECORRENCIA.OcorrenciaNoMes)
  );
  if (!conflito) return null;
  const semanal = ehSemanal(conflito) ? conflito : nova;
  const dia = Number(semanal.diaSemana);
  const todo = dia === 0 || dia === 6 ? "todo" : "toda";
  return `Já existe missa ${todo} ${DIAS_NOME[dia]} às ${formatarHora(semanal.horario)}. Se for a mesma missa, use a observação.`;
};

/** Mensagem de erro da regra (para o formulário) ou null se válida. */
export const validarDiaFixo = (diaDoMes, diasSemanaExcecao) => {
  const dia = Number(diaDoMes);
  if (!Number.isInteger(dia) || dia < 1 || dia > 31) return "Dia do mês deve estar entre 1 e 31.";
  if ((Number(diasSemanaExcecao) || 0) === 0b1111111) return "A missa não pode ter exceção em todos os dias da semana.";
  return null;
};

/** Chave de duplicidade: semanal pelo dia da semana, dia fixo pelo dia do mês (igual à API). */
export const chaveMissa = (m) => {
  if (ehSemanal(m)) return `0|${Number(m.diaSemana)}|${m.horario}`;
  if (Number(m.tipoRecorrencia) === TIPO_RECORRENCIA.OcorrenciaNoMes)
    return `1|${Number(m.diaSemana)}|${Number(m.semanasDoMes)}|${m.horario}`;
  return `${Number(m.tipoRecorrencia)}|${Number(m.diaDoMes)}|${m.horario}`;
};
