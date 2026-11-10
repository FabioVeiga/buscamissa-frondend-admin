// Extrai missas de um texto colado (WhatsApp, site da paróquia, cartaz, tabela...).
// Cobre a recorrência semanal e linhas com data ("24/12: 22h - Missa do Galo"); missas mensais
// (dia fixo, 1ª sexta) ficam de fora e são avisadas.
//
// Como funciona: cada linha vira uma sequência de "eventos" (dias e horários) em ordem de
// aparição. Um dia que surge depois de um horário abre um novo grupo, então tanto
// "Terça a sexta: 19h30; Sábado: 16h" quanto "Terça a sexta às 19h30, sábado às 16h" funcionam.

import { TIPO_RECORRENCIA, chaveMissa, diaSemanaDaData, ehSemanal, hojeIso } from "../recorrenciaMissa";

// Semana começando na segunda: facilita intervalos que "viram" o domingo ("sábado a segunda").
const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0];
const OBSERVACAO_MAX = 20;

const PREFIXO_DIA = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
const ORDINAL_DIA = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6 }; // "2ª feira" = segunda

// minúsculo, sem acento e sem mudar o tamanho do texto (os índices valem para o original).
const normalizar = (texto) =>
    Array.from(String(texto ?? ""), (ch) => {
        if (/[–—−]/.test(ch)) return "-";
        const d = ch.normalize("NFKD").replace(/[̀-ͯ]/g, "");
        const base = d.length === ch.length ? d : ch;
        const min = base.toLowerCase();
        return min.length === base.length ? min : base;
    }).join("");

const mascarar = (texto, ini, fim) => texto.slice(0, ini) + " ".repeat(fim - ini) + texto.slice(fim);

const intervaloDeDias = (de, ate) => {
    const dias = [];
    for (let p = ORDEM_SEMANA.indexOf(de); ; p = (p + 1) % 7) {
        dias.push(ORDEM_SEMANA[p]);
        if (p === ORDEM_SEMANA.indexOf(ate)) break;
    }
    return dias;
};

// ───────────── Linhas que não são missa semanal ─────────────

const REGEX_NAO_MISSA = /\b(terco|rosario|confiss\w*|adoracao|novena|catequese|secretaria|atendimento|expediente|bencao|ladainha|reuniao|batizado|batismo|casamento|crisma)\b/;
const DIA_RE = "dom|seg|ter|qua|qui|sex|sab";
// "1º domingo", "primeira sexta", "último sábado", "dia 13", "todo mês", "quinzenal"...
const REGEX_MENSAL = new RegExp(
    `\\b(primeir[oa]s?|terceir[oa]s?|ultim[oa]s?|[1345]\\s?[ao]s?)\\b[^0-9]{0,12}\\b(${DIA_RE})|\\bdia\\s+\\d{1,2}\\b|\\b(do|no|todo)\\s+mes\\b|\\bmensal\\w*|\\bquinzena\\w*`
);

// ───────────── Horários ─────────────

const REGEX_HORA = new RegExp(
    [
        "(?<![\\d:.])(?<h1>\\d{1,2})\\s*(?:horas?|hrs|hs|h)(?![a-z])(?<m1>\\d{2}(?!\\d))?",
        "(?<![\\d:.])(?<h2>\\d{1,2})[:.](?<m2>\\d{2})(?!\\d)(?:\\s*(?:horas?|hrs|hs|h)(?![a-z]))?",
        "(?<![\\d:.])(?<h3>\\d{1,2})(?=\\s+da\\s+(?:manha|tarde|noite|madrugada))",
        "(?<![\\d:.])(?<h4>\\d{1,2})(?=\\s?[ap]\\.?\\s?m\\b)",
    ].join("|"),
    "g"
);
const REGEX_PERIODO = /^\s*(?:da\s+(manha|tarde|noite|madrugada)|([ap])\.?\s?m\b\.?)/;
// "às 8, 10 e 18 horas": números soltos depois de "às".
const REGEX_LISTA_APOS_AS = /\bas\s+(\d{1,2}(?:\s*(?:,|e|ou|\/|-)\s*\d{1,2})*)(?![\d:.])(?:\s*(?:horas?|hrs|hs|h)(?![a-z]))?/g;

const formatarHHMM = (h, m) => `${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}`;

/** Horários do texto normalizado: [{ start, end, horario }] + os que não existem (ex.: 25h). */
const encontrarHorarios = (n) => {
    const achados = [];
    const invalidos = [];
    let trabalho = n;

    const registrar = (start, end, h, m, periodo) => {
        if (/^(tarde|noite)$/.test(periodo ?? "") || periodo === "p") {
            if (h < 12) h += 12;
        }
        if (h > 23 || m > 59) {
            invalidos.push(n.slice(start, end).trim());
        } else {
            achados.push({ start, end, horario: formatarHHMM(h, m) });
        }
        trabalho = mascarar(trabalho, start, end);
    };

    for (const m of n.matchAll(/meio[\s-]?dia|meia[\s-]?noite/g)) {
        registrar(m.index, m.index + m[0].length, m[0].startsWith("meio") ? 12 : 0, 0);
    }

    for (const m of trabalho.matchAll(REGEX_HORA)) {
        const g = m.groups;
        const h = Number(g.h1 ?? g.h2 ?? g.h3 ?? g.h4);
        const min = Number(g.m1 ?? g.m2 ?? 0);
        let fim = m.index + m[0].length;
        let periodo = null;
        const p = REGEX_PERIODO.exec(n.slice(fim));
        if (p) {
            periodo = p[1] ?? p[2];
            fim += p[0].length;
        }
        registrar(m.index, fim, h, min, periodo);
    }

    for (const m of trabalho.matchAll(REGEX_LISTA_APOS_AS)) {
        const base = m.index + m[0].indexOf(m[1]);
        for (const num of m[1].matchAll(/\d{1,2}/g)) {
            registrar(base + num.index, base + num.index + num[0].length, Number(num[0]), 0);
        }
    }

    return { achados: achados.sort((a, b) => a.start - b.start), invalidos };
};

// ───────────── Dias ─────────────

const REGEX_FRASES_DIAS = [
    { re: /\b(?:todos\s+os\s+dias|todo\s+dia(?!\s*\d)|todos\s+dias|diariamente)\b/g, dias: [0, 1, 2, 3, 4, 5, 6] },
    { re: /\b(?:dias\s+uteis|dias\s+de\s+semana|durante\s+a\s+semana)\b/g, dias: [1, 2, 3, 4, 5] },
    { re: /\b(?:fim|fins|finais)\s+de\s+semana\b/g, dias: [6, 0] },
];
const REGEX_DIA_NOME =
    /\b(domingos?|dom|segundas?|seg|tercas?|ter|quartas?|qua|quintas?|qui|sextas?|sex|sabados?|sab)\b(?:\s*-?\s*feiras?\b)?/g;
const REGEX_DIA_ORDINAL = /\b([2-7])\s*[ao]?\s*-?\s*feiras?\b|\b([2-7])[ao]\b/g;

const sobrepoe = (lista, ini, fim) => lista.some((e) => ini < e.end && fim > e.start);

/** Dias citados no texto (já sem os horários): [{ start, end, dias, unico }]. */
const encontrarDias = (nd, original) => {
    const eventos = [];
    for (const { re, dias } of REGEX_FRASES_DIAS) {
        for (const m of nd.matchAll(re)) eventos.push({ start: m.index, end: m.index + m[0].length, dias, unico: false });
    }
    for (const m of nd.matchAll(REGEX_DIA_NOME)) {
        const fim = m.index + m[0].length;
        if (sobrepoe(eventos, m.index, fim)) continue;
        // "Dom Bosco", "Dom Pedro": nome de igreja, não domingo.
        if (m[1] === "dom" && /^Dom\s+[A-ZÀ-Ú]/.test(original.slice(m.index))) continue;
        eventos.push({ start: m.index, end: fim, dias: [PREFIXO_DIA[m[1].slice(0, 3)]], unico: true });
    }
    for (const m of nd.matchAll(REGEX_DIA_ORDINAL)) {
        const fim = m.index + m[0].length;
        if (sobrepoe(eventos, m.index, fim)) continue;
        eventos.push({ start: m.index, end: fim, dias: [ORDINAL_DIA[m[1] ?? m[2]]], unico: true });
    }
    return eventos.sort((a, b) => a.start - b.start);
};

const REGEX_CONECTOR_INTERVALO = /^[\s.]*(?:a|ate|ao|as|-)[\s.]*$/;
const REGEX_EXCECAO = /\b(?:exceto|menos|salvo|excecao)\b/;

// Observação logo depois do horário: "8h (infantil)". Parênteses com dia/horário não valem.
const lerObservacao = (original, normalizado, fim) => {
    const m = /^\s*\(([^)]{1,40})\)/.exec(original.slice(fim));
    if (!m) return null;
    const norm = normalizado.slice(fim + m[0].indexOf("(") + 1, fim + m[0].indexOf(")"));
    const temDiaOuHora =
        REGEX_DIA_NOME.test(norm) ||
        REGEX_DIA_ORDINAL.test(norm) ||
        /\d/.test(norm) ||
        REGEX_FRASES_DIAS.some(({ re }) => re.test(norm));
    REGEX_DIA_NOME.lastIndex = 0;
    REGEX_DIA_ORDINAL.lastIndex = 0;
    REGEX_FRASES_DIAS.forEach(({ re }) => (re.lastIndex = 0));
    return temDiaOuHora ? null : { texto: m[1].trim(), tamanho: m[0].length };
};

/** Quebra a linha em grupos { dias, exclui, horarios: [{ horario, observacao }] }. */
const analisarLinha = (linha, avisos) => {
    const n = normalizar(linha);
    const { achados, invalidos } = encontrarHorarios(n);
    invalidos.forEach((i) => avisos.push(`Horário inválido ignorado: “${i}”.`));

    let nd = n;
    achados.forEach((t) => (nd = mascarar(nd, t.start, t.end)));
    const diasEv = encontrarDias(nd, linha);

    const eventos = [
        ...diasEv.map((e) => ({ ...e, tipo: "d" })),
        ...achados.map((t) => ({ ...t, tipo: "h" })),
    ].sort((a, b) => a.start - b.start);

    const novoGrupo = () => ({ dias: [], exclui: [], horarios: [] });
    const grupos = [];
    let atual = null;
    let anterior = null;
    let excluindo = false;

    for (const ev of eventos) {
        const entre = anterior ? nd.slice(anterior.end, ev.start) : "";
        if (ev.tipo === "h") {
            if (!atual) grupos.push((atual = novoGrupo()));
            const obs = lerObservacao(linha, n, ev.end);
            let observacao = "";
            if (obs) {
                if (obs.texto.length > OBSERVACAO_MAX) {
                    avisos.push(`Observação “${obs.texto}” passa de ${OBSERVACAO_MAX} caracteres e foi ignorada.`);
                } else {
                    observacao = obs.texto;
                }
            }
            atual.horarios.push({ horario: ev.horario, observacao });
            excluindo = false;
        } else {
            const ehIntervalo =
                anterior?.tipo === "d" && anterior.unico && ev.unico && REGEX_CONECTOR_INTERVALO.test(entre);
            const dias = ehIntervalo ? intervaloDeDias(anterior.dias[0], ev.dias[0]) : ev.dias;

            if (REGEX_EXCECAO.test(entre) || (excluindo && anterior?.tipo === "d")) {
                if (!atual) grupos.push((atual = novoGrupo()));
                atual.exclui.push(...dias);
                excluindo = true;
            } else {
                // Dia depois de horário = novo grupo ("seg a sex 19h, sáb 16h").
                if (!atual || atual.horarios.length > 0) grupos.push((atual = novoGrupo()));
                atual.dias.push(...dias);
            }
        }
        anterior = ev;
    }

    // "19h30 de terça a sexta": horários vieram antes dos dias.
    for (let i = 0; i < grupos.length - 1; i++) {
        const g = grupos[i];
        const prox = grupos[i + 1];
        if (g.dias.length === 0 && g.horarios.length > 0 && prox.horarios.length === 0 && prox.dias.length > 0) {
            g.dias = prox.dias;
            g.exclui.push(...prox.exclui);
            grupos.splice(i + 1, 1);
        }
    }
    return grupos;
};

// ───────────── Linhas com data ─────────────

const NOME_MAX = 80;
// "24/12: 22h - Missa do Galo" · "25/12/2026 18h" · "25/12/26 — Natal, 10h e 18h"
const REGEX_LINHA_DATA = /^\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?(?!\d)\s*[:\-–—]?\s*(.*)$/;

const dataIso = (ano, mes, dia) => {
    const d = new Date(Date.UTC(ano, mes - 1, dia));
    if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
    return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
};

/** Sem o ano: a próxima ocorrência da data (hoje ou depois). */
const resolverData = (dia, mes, anoTexto) => {
    if (anoTexto) return dataIso(anoTexto.length === 2 ? 2000 + Number(anoTexto) : Number(anoTexto), mes, dia);
    const hoje = hojeIso();
    const esteAno = Number(hoje.slice(0, 4));
    const candidata = dataIso(esteAno, mes, dia);
    return candidata && candidata >= hoje ? candidata : dataIso(esteAno + 1, mes, dia);
};

/** Linha que começa com data → missas de data específica; null se a linha não começa com data. */
const analisarLinhaData = (linha, avisos) => {
    const m = REGEX_LINHA_DATA.exec(linha);
    if (!m) return null;
    const data = resolverData(Number(m[1]), Number(m[2]), m[3]);
    if (!data) return { erro: "data inválida" };

    const resto = m[4];
    const n = normalizar(resto);
    const { achados, invalidos } = encontrarHorarios(n);
    invalidos.forEach((i) => avisos.push(`Horário inválido ignorado: “${i}”.`));
    if (achados.length === 0) return { erro: "data sem horário" };

    // Nome = o que sobra do texto sem os horários e sem conectores soltos ("e", "-", ":").
    let nome = resto;
    [...achados].reverse().forEach((t) => (nome = nome.slice(0, t.start) + " " + nome.slice(t.end)));
    for (let i = 0; i < 3; i++) {
        nome = nome
            .replace(/\s+/g, " ")
            .replace(/^[\s\-–—:,;|()]+|[\s\-–—:,;|()]+$/g, "")
            .replace(/^(?:e|ou|as|às)\s+|\s+(?:e|ou|as|às)$/gi, "")
            .trim();
    }
    if (nome.length > NOME_MAX) {
        avisos.push(`Nome “${nome.slice(0, 20)}…” passa de ${NOME_MAX} caracteres e foi ignorado.`);
        nome = "";
    }

    return {
        missas: achados.map((t) => ({
            horario: t.horario,
            diaSemana: diaSemanaDaData(data),
            observacao: "",
            tipoRecorrencia: TIPO_RECORRENCIA.DataEspecifica,
            data,
            nome: nome || null,
            substituiMissasDoDia: false,
        })),
    };
};

// ───────────── API ─────────────

const ordenarMissas = (missas) =>
    [...missas].sort(
        (a, b) => ORDEM_SEMANA.indexOf(a.diaSemana) - ORDEM_SEMANA.indexOf(b.diaSemana) || a.horario.localeCompare(b.horario)
    );

/**
 * @param {string} texto
 * @returns {{
 *   missas: {horario: string, diaSemana: number, observacao: string}[] (semanais, depois as de data
 *     específica, que trazem também tipoRecorrencia, data "yyyy-MM-dd", nome e substituiMissasDoDia),
 *   ignoradas: {linha: string, motivo: string}[],
 *   avisos: string[]
 * }} `horario` no formato HHMM (como o resto do admin grava).
 */
export const parseHorariosMissa = (texto) => {
    const vistas = new Set();
    const missas = [];
    const especiais = [];
    const ignoradas = [];
    const avisos = [];
    let pendente = null; // dias numa linha, horários na seguinte ("Domingo:\n8h e 10h")

    const emitir = (dias, exclui, horarios) => {
        for (const dia of dias) {
            if (exclui.includes(dia)) continue;
            for (const { horario, observacao } of horarios) {
                const chave = `${dia}|${horario}`;
                if (vistas.has(chave)) continue;
                vistas.add(chave);
                missas.push({ horario, diaSemana: dia, observacao });
            }
        }
    };
    const fecharPendente = () => {
        if (pendente) ignoradas.push({ linha: pendente.linha, motivo: "dia sem horário" });
        pendente = null;
    };

    const linhas = String(texto ?? "")
        .split(/[\n\r;•]+/)
        .map((l) => l.trim())
        .filter(Boolean);

    for (const linha of linhas) {
        const porData = analisarLinhaData(linha, avisos);
        if (porData) {
            fecharPendente();
            if (porData.erro) {
                ignoradas.push({ linha, motivo: porData.erro });
                continue;
            }
            for (const missa of porData.missas) {
                const chave = `d|${missa.data}|${missa.horario}`;
                if (vistas.has(chave)) continue;
                vistas.add(chave);
                especiais.push(missa);
            }
            continue;
        }

        const n = normalizar(linha);
        if (REGEX_NAO_MISSA.test(n)) {
            ignoradas.push({ linha, motivo: "não parece horário de missa (terço, confissão, secretaria...)" });
            continue;
        }
        if (REGEX_MENSAL.test(n)) {
            ignoradas.push({ linha, motivo: "missa mensal: cadastre em “Dia fixo do mês” ou “Dia da semana no mês”" });
            continue;
        }

        const grupos = analisarLinha(linha, avisos);
        if (grupos.length === 0) {
            // Cabeçalhos sem número ("Horários de missa:") passam em silêncio.
            if (/\d/.test(linha)) ignoradas.push({ linha, motivo: "não consegui entender" });
            continue;
        }

        for (const g of grupos) {
            if (g.dias.length > 0 && g.horarios.length > 0) {
                fecharPendente();
                emitir(g.dias, g.exclui, g.horarios);
            } else if (g.dias.length > 0) {
                fecharPendente();
                pendente = { dias: g.dias, exclui: g.exclui, linha };
            } else if (pendente) {
                emitir(pendente.dias, pendente.exclui, g.horarios);
                pendente = null;
            } else {
                ignoradas.push({ linha, motivo: "horário sem dia da semana" });
            }
        }
    }
    fecharPendente();

    especiais.sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario));
    return { missas: [...ordenarMissas(missas), ...especiais], ignoradas, avisos: [...new Set(avisos)] };
};

/**
 * Junta as missas lidas do texto à lista atual.
 * - `substituir`: troca só as missas semanais (as mensais e as de data específica ficam); mantém a observação de
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
    const chavesPreservadas = new Set(preservadas.map(chaveMissa));
    const mantidas = novas
        // Data específica já cadastrada fica como está (não duplica nem perde o nome/substituição).
        .filter((n) => ehSemanal(n) || !chavesPreservadas.has(chaveMissa(n)))
        .map((n) => {
            const antiga = antigasSemanais.find((a) => chaveMissa(a) === chaveMissa(n));
            return antiga ?? n;
        });
    return [...preservadas, ...mantidas];
};
