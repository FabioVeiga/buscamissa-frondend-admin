// Extrai missas semanais de um texto colado ("Terça a sexta-feira: 19h30 / Sábado: 16h / ...").
// Só cobre recorrência semanal; missas mensais (dia fixo / 1ª sexta) continuam no formulário.

import { chaveMissa, ehSemanal } from "../recorrenciaMissa";

// Semana começando na segunda: facilita intervalos que "viram" o domingo ("sábado a segunda").
const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0];

const PREFIXO_DIA = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };

const normalizar = (texto) =>
    String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[–—]/g, "-")
        // "terça-feira", "terças-feiras", "feira" soltas viram nada: só o nome do dia importa.
        .replace(/-?\s*feiras?\b/g, "");

const intervaloDeDias = (de, ate) => {
    const i = ORDEM_SEMANA.indexOf(de);
    const f = ORDEM_SEMANA.indexOf(ate);
    const dias = [];
    for (let p = i; ; p = (p + 1) % 7) {
        dias.push(ORDEM_SEMANA[p]);
        if (p === f) break;
    }
    return dias;
};

// hh + (h|:|.) + mm opcional. "19h30", "19h", "19:30", "7h", "19 horas", "meio-dia".
const REGEX_HORARIO = /(?<![\d:.])(\d{1,2})\s*(?:h(?:oras?|rs?|s)?|:|\.)\s*(\d{2})?(?:\s*min)?(?!\d)|meio[\s-]?dia/g;

const horarioDe = (m) => {
    if (m[0].startsWith("meio")) return "1200";
    const h = Number(m[1]);
    const min = m[2] ? Number(m[2]) : 0;
    if (h > 23 || min > 59) return null;
    return `${String(h).padStart(2, "0")}${String(min).padStart(2, "0")}`;
};

/** Dias citados na parte "antes dos horários" de uma linha. */
const extrairDias = (textoDias) => {
    if (/\b(todos os dias|todo dia|todos dias|diariamente|diario)\b/.test(textoDias)) return [0, 1, 2, 3, 4, 5, 6];
    if (/\bdias uteis\b/.test(textoDias)) return [1, 2, 3, 4, 5];
    if (/\bfins? de semana\b|\bfinais de semana\b/.test(textoDias)) return [6, 0];

    const tokens = [...textoDias.matchAll(/\b(dom|seg|ter|qua|qui|sex|sab)[a-z]*|\b(?:a|ate|as)\b|-/g)];
    const dias = [];
    let ultimo = null;
    let intervaloPendente = false;

    for (const t of tokens) {
        if (t[1]) {
            const dia = PREFIXO_DIA[t[1]];
            if (intervaloPendente && ultimo !== null) dias.push(...intervaloDeDias(ultimo, dia));
            else dias.push(dia);
            ultimo = dia;
            intervaloPendente = false;
        } else {
            // "a", "ate", "as", "-" só valem como intervalo entre dois dias.
            intervaloPendente = ultimo !== null;
        }
    }
    return [...new Set(dias)];
};

const ordenarMissas = (missas) =>
    [...missas].sort(
        (a, b) => ORDEM_SEMANA.indexOf(a.diaSemana) - ORDEM_SEMANA.indexOf(b.diaSemana) || a.horario.localeCompare(b.horario)
    );

/**
 * @param {string} texto
 * @returns {{ missas: {horario: string, diaSemana: number, observacao: string}[], ignoradas: string[] }}
 *  `horario` no formato HHMM (como o resto do admin grava) e `ignoradas` com as linhas que não deu para entender.
 */
export const parseHorariosMissa = (texto) => {
    const vistas = new Set();
    const missas = [];
    const ignoradas = [];

    const linhas = String(texto ?? "")
        .split(/[\n;]+/)
        .map((l) => l.trim())
        .filter(Boolean);

    for (const linha of linhas) {
        const norm = normalizar(linha);
        const horarios = [...norm.matchAll(REGEX_HORARIO)].map(horarioDe);
        const primeiro = norm.search(REGEX_HORARIO);

        // Dias vêm antes dos horários ("Domingo: 8h"); se o horário abre a linha, olha o texto todo.
        const parteDias = primeiro > 0 ? norm.slice(0, primeiro) : norm.replace(REGEX_HORARIO, " ");
        const dias = extrairDias(parteDias);
        const horariosValidos = horarios.filter(Boolean);

        if (dias.length === 0 || horariosValidos.length === 0 || horariosValidos.length !== horarios.length) {
            ignoradas.push(linha);
            continue;
        }

        for (const dia of dias) {
            for (const horario of horariosValidos) {
                const chave = `${dia}|${horario}`;
                if (vistas.has(chave)) continue;
                vistas.add(chave);
                missas.push({ horario, diaSemana: dia, observacao: "" });
            }
        }
    }

    return { missas: ordenarMissas(missas), ignoradas };
};

/**
 * Junta as missas lidas do texto à lista atual.
 * - `substituir`: troca só as missas semanais (as mensais ficam); mantém a observação de
 *   quem continua no mesmo dia e horário.
 * - senão: acrescenta, ignorando o que já existe.
 */
export const aplicarMissasParseadas = (atuais, novas, substituir) => {
    if (!substituir) {
        const existentes = new Set(atuais.map(chaveMissa));
        return [...atuais, ...novas.filter((n) => !existentes.has(chaveMissa(n)))];
    }
    const antigasSemanais = atuais.filter(ehSemanal);
    const preservadas = atuais.filter((m) => !ehSemanal(m));
    const mantidas = novas.map((n) => {
        const antiga = antigasSemanais.find((a) => chaveMissa(a) === chaveMissa(n));
        return antiga ?? n;
    });
    return [...preservadas, ...mantidas];
};
