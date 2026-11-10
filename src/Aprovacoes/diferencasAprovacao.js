// Compara os dados atuais (publicados) com os propostos de uma solicitação de alteração,
// para destacar no modal o que realmente muda.

const norm = (v) => String(v ?? "").trim();

export const enderecoTexto = (e) =>
  e ? [e.logradouro, e.bairro, e.localidade, e.uf].filter(Boolean).join(", ") : "";

// Chave da missa SEM a observação: mesma regra, dia e horário = mesma missa; se só a
// observação mudou, aparece como "observação alterada" em vez de removida + nova.
export const chaveComparacao = (m) =>
  [
    Number(m.tipoRecorrencia ?? 0),
    Number(m.diaSemana ?? 0),
    norm(m.horario).slice(0, 5),
    m.diaDoMes ?? "",
    m.diasSemanaExcecao ?? "",
    m.semanasDoMes ?? "",
    norm(m.data).slice(0, 10),
  ].join("|");

/**
 * @returns {null | {
 *   nome: boolean, paroco: boolean, foto: boolean, endereco: boolean,
 *   adicionadas: Set<string>, removidas: Set<string>, obsAlteradas: Set<string>,
 *   resumo: string[]
 * }} null quando não há os dois lados (criação).
 */
export const compararDados = (atuais, propostos) => {
  if (!atuais || !propostos) return null;

  const nome = norm(propostos.nome) !== "" && norm(propostos.nome) !== norm(atuais.nome);
  const paroco = norm(propostos.paroco) !== norm(atuais.paroco);
  // Na alteração, a foto só vem quando foi trocada.
  const foto = !!propostos.imagemUrl && norm(propostos.imagemUrl) !== norm(atuais.imagemUrl);
  const endereco = !!propostos.endereco && enderecoTexto(propostos.endereco) !== enderecoTexto(atuais.endereco);

  const atuaisPorChave = new Map((atuais.missas ?? []).map((m) => [chaveComparacao(m), m]));
  const propostasPorChave = new Map((propostos.missas ?? []).map((m) => [chaveComparacao(m), m]));
  const adicionadas = new Set();
  const removidas = new Set();
  const obsAlteradas = new Set();
  for (const [chave, m] of propostasPorChave) {
    const antiga = atuaisPorChave.get(chave);
    if (!antiga) adicionadas.add(chave);
    else if (norm(antiga.observacao) !== norm(m.observacao)) obsAlteradas.add(chave);
  }
  for (const chave of atuaisPorChave.keys()) if (!propostasPorChave.has(chave)) removidas.add(chave);

  const resumo = [];
  if (nome) resumo.push("Nome");
  if (paroco) resumo.push("Pároco");
  if (foto) resumo.push("Foto");
  if (endereco) resumo.push("Endereço");
  const partesMissas = [];
  if (adicionadas.size) partesMissas.push(`${adicionadas.size} nova(s)`);
  if (removidas.size) partesMissas.push(`${removidas.size} removida(s)`);
  if (obsAlteradas.size) partesMissas.push(`${obsAlteradas.size} com observação alterada`);
  if (partesMissas.length) resumo.push(`Missas (${partesMissas.join(", ")})`);

  return { nome, paroco, foto, endereco, adicionadas, removidas, obsAlteradas, resumo };
};
