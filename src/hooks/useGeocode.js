import { useState } from "react";

// Caixa aproximada do Brasil (inclui ilhas oceânicas).
const BRASIL = { latMin: -34.0, latMax: 5.5, lngMin: -74.1, lngMax: -28.6 };

/**
 * Busca coordenadas de um endereço no Nominatim, com validação.
 *
 * Só aceita resultado no nível do imóvel (com número de porta). Ponto de rua ou de bairro é
 * recusado: era a principal causa de coordenadas erradas na base
 * (AUDITORIA_GEOLOCALIZACAO.md). Nesses casos a pessoa deve posicionar o ponto manualmente.
 */
export function useGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function geocode({ logradouro, numero, localidade, uf } = {}) {
    setLoading(true);
    setError(null);

    try {
      if (!logradouro || !localidade || !uf) {
        throw new Error("Preencha Logradouro, Localidade e UF.");
      }
      const num = String(numero ?? "").trim();
      if (!num || num === "0") {
        throw new Error("Sem número não é possível localizar a igreja com precisão. Informe as coordenadas manualmente.");
      }

      const params = new URLSearchParams({
        street: `${num} ${logradouro}`,
        city: localidade,
        state: uf,
        country: "Brasil",
        countrycodes: "br",
        addressdetails: "1",
        format: "json",
        limit: "1",
      });

      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { "Accept-Language": "pt-BR" },
      });
      const data = await res.json();

      if (!data.length) throw new Error("Endereço não encontrado.");

      const r = data[0];
      if (!r.address?.house_number) {
        throw new Error("Só foi encontrado o ponto da rua, não o do imóvel. Informe as coordenadas manualmente.");
      }

      const lat = parseFloat(r.lat);
      const lon = parseFloat(r.lon);
      if (
        !Number.isFinite(lat) || !Number.isFinite(lon) ||
        lat < BRASIL.latMin || lat > BRASIL.latMax || lon < BRASIL.lngMin || lon > BRASIL.lngMax
      ) {
        throw new Error("Resultado fora do Brasil.");
      }

      return { lat, lon, displayName: r.display_name };
    } catch (err) {
      setError(err.message);
      return { erro: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { geocode, loading, error };
}
