import { useState } from "react";

export function useGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function geocode(address) {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: address,
        format: "json",
        limit: 1,
      });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            // Nominatim exige um User-Agent identificando sua app
            "Accept-Language": "pt-BR",
          },
        }
      );

      const data = await res.json();

      if (!data.length) throw new Error("Endereço não encontrado");

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { geocode, loading, error };
}
