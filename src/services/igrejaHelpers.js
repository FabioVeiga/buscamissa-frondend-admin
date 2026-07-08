import api from "./apiService";

// Busca os dados completos de uma igreja por Id (usado tanto para preview
// em modal quanto para navegar para a tela de edição já preenchida).
export const buscarIgrejaCompletaPorId = async (id) => {
  const response = await api.get(`/api/v2/Igreja/admin/${id}`);
  return response.data?.data || response.data;
};

// Normaliza a resposta da API para o formato esperado pelo state.row da
// tela de edição (IgrejaAtualizar.jsx).
export const normalizarIgrejaParaEdicao = (response) => {
  const igreja = response?.igreja || response?.item || response?.data || response;
  const endereco =
    igreja?.endereco || igreja?.dadosEndereco || igreja?.dados?.endereco || response?.endereco || {};

  return {
    id: igreja?.id,
    nome: igreja?.nome || "",
    nomeUnico: igreja?.nomeUnico || "",
    slug: igreja?.slug || "",
    paroco: igreja?.paroco || "",
    missas: igreja?.missas || [],
    contato: igreja?.contato || {},
    redesSociais: igreja?.redesSociais || [],
    endereco,
    ativo: igreja?.ativo ?? true,
    imagemUrl: igreja?.imagemUrl || igreja?.imagem || "",
  };
};
