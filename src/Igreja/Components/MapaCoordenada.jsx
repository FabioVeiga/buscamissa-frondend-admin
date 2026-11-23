/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Button, Stack, Typography } from "@mui/material";
import api from "../../services/apiService";
import { adicionarCamadasBase, iconeMarcador } from "../../utils/mapaBase";

const BRASIL = [[-33.8, -73.9], [5.3, -34.8]];
const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/**
 * Mapa de confirmação da coordenada no cadastro (substitui a busca no Nominatim).
 * Clique no mapa ou arraste o marcador até a igreja; a coordenada só muda pela mão da pessoa.
 * Sem coordenada, o mapa abre na cidade (malha do IBGE).
 */
const MapaCoordenada = ({ latitude, longitude, localidade, uf, onChange }) => {
  const elRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [aviso, setAviso] = useState("");
  onChangeRef.current = onChange;

  const lat = num(latitude);
  const lng = num(longitude);
  const temPonto = lat !== null && lng !== null && !(lat === 0 && lng === 0);

  const mover = (la, lo) => onChangeRef.current(Number(la.toFixed(7)), Number(lo.toFixed(7)));

  useEffect(() => {
    const mapa = L.map(elRef.current);
    adicionarCamadasBase(mapa);
    mapa.fitBounds(BRASIL);
    mapa.on("click", (e) => mover(e.latlng.lat, e.latlng.lng));
    mapaRef.current = mapa;
    return () => mapa.remove();
  }, []);

  // Marcador acompanha a coordenada do formulário (inclusive quando digitada).
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    if (!temPonto) {
      marcadorRef.current?.remove();
      marcadorRef.current = null;
      return;
    }
    if (!marcadorRef.current) {
      marcadorRef.current = L.marker([lat, lng], { draggable: true, icon: iconeMarcador() }).addTo(mapa);
      marcadorRef.current.on("dragend", (e) => {
        const p = e.target.getLatLng();
        mover(p.lat, p.lng);
      });
      mapa.setView([lat, lng], Math.max(mapa.getZoom(), 17));
    } else {
      marcadorRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng, temPonto]);

  const irParaCidade = async () => {
    setAviso("");
    if (!localidade || !uf) { setAviso("Preencha cidade e UF."); return; }
    try {
      const r = await api.get("/api/v1/admin/geo/municipio", { params: { uf, nome: localidade } });
      const m = r.data?.data;
      mapaRef.current.fitBounds([[m.latMin, m.lngMin], [m.latMax, m.lngMax]]);
    } catch {
      setAviso("Cidade não encontrada na malha do IBGE; aproxime o mapa manualmente.");
    }
  };

  // Sem coordenada: abre já na cidade.
  useEffect(() => {
    if (!temPonto && localidade && uf) irParaCidade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localidade, uf]);

  return (
    <Stack spacing={1}>
      <Box ref={elRef} sx={{ height: 360, borderRadius: 1, border: 1, borderColor: "divider" }} />
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {temPonto
            ? "Arraste o marcador vermelho até o telhado da igreja (use Satélite para conferir)."
            : "Sem coordenada: clique no mapa sobre a igreja para marcar."}
        </Typography>
        <Button size="small" onClick={irParaCidade}>Ir para a cidade</Button>
        {temPonto && (
          <Button size="small" color="warning" onClick={() => onChangeRef.current("", "")}>Limpar coordenada</Button>
        )}
      </Stack>
      {aviso && <Typography variant="caption" color="warning.main">{aviso}</Typography>}
    </Stack>
  );
};

export default MapaCoordenada;
