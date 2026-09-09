// Única fonte de verdade para montar a query string de busca de igrejas —
// usada tanto pelo botão "Buscar" (IgrejaSearchForm) quanto pela paginação
// (Igreja.jsx). Existiam duas implementações divergentes: a paginação usava
// uma versão defasada que não incluía metade dos filtros (slug, redes
// sociais, cep, id etc.), fazendo o filtro "sumir" ao trocar de página.
export const construirEndpointBuscaIgrejas = (filtros, pageIndex = 1, pageSize = 10) => {
  const f = filtros || {};
  const params = new URLSearchParams();

  if (f.id !== undefined && f.id !== "") params.append("id", f.id);
  if (f.ativo !== undefined && f.ativo !== "") params.append("ativo", f.ativo);
  if (f.uf) params.append("uf", f.uf);
  if (f.localidade) params.append("localidade", f.localidade);
  if (f.bairro) params.append("bairro", f.bairro);
  if (f.cep) params.append("cep", f.cep);
  if (f.nome) params.append("nome", f.nome);
  if (f.paroco) params.append("paroco", f.paroco);
  if (f.slug) params.append("slug", f.slug);
  if (f.instagramPerfil) params.append("instagramPerfil", f.instagramPerfil);
  if (f.facebookPerfil) params.append("facebookPerfil", f.facebookPerfil);
  if (f.diaSemana !== undefined && f.diaSemana !== "") params.append("diadasemana", f.diaSemana);
  if (f.horario) params.append("horario", f.horario);
  if (f.reportarProblema !== undefined && f.reportarProblema !== "") {
    params.append("reportarProblema", f.reportarProblema);
  }
  if (f.semCoordenadas) params.append("semCoordenadas", true);
  if (f.semInstagram) params.append("semInstagram", true);
  if (f.semFacebook) params.append("semFacebook", true);
  if (f.mostrarDeletadas) params.append("mostrarDeletadas", true);

  params.append("Paginacao.PageIndex", pageIndex);
  params.append("Paginacao.PageSize", pageSize);

  return `/api/v1/admin/igreja/buscar-por-filtro?${params.toString()}`;
};
