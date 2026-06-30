import { useEffect, useState } from "react";
import api from "../services/apiService";

let cache = null;

export function useRedesSociais() {
  const [tipos, setTipos] = useState(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;

    api.get("/api/v1/RedeSocial/tipos")
      .then((res) => {
        cache = res.data;
        setTipos(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const obterNomePorId = (id) =>
    tipos.find((t) => t.id === Number(id))?.nome ?? "Rede Social";

  return { tipos, loading, obterNomePorId };
}
