import api from "./apiService";

class AnalyticsService {
  /**
   * Rastreia um acesso (page view, ação, etc)
   * @param {string} evento - Nome do evento (ex: 'home_view', 'indicadores_view')
   * @param {object} dados - Dados adicionais do evento
   */
  async rastrear(evento, dados = {}) {
    try {
      await api.post("/api/v1/admin/analytics/rastrear", {
        evento,
        dados,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao rastrear evento:", error);
    }
  }

  /**
   * Obtém estatísticas de visitantes
   * @param {string} periodo - 'dia' | 'semana' | 'mes'
   * @returns {Promise<object>} Dados de visitantes
   */
  async obterVisitantes(periodo = "dia") {
    try {
      const response = await api.get(
        `/api/v1/admin/analytics/visitantes?periodo=${periodo}`
      );
      return response.data?.data || { total: 0, paginas: [] };
    } catch (error) {
      console.error("Erro ao obter visitantes:", error);
      return { total: 0, paginas: [] };
    }
  }

  /**
   * Obtém estatísticas agregadas
   * @returns {Promise<object>} Dados agregados
   */
  async obterEstatisticas() {
    try {
      const response = await api.get("/api/v1/admin/analytics/estatisticas");
      return response.data?.data || {};
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      return {};
    }
  }
}

export default new AnalyticsService();
