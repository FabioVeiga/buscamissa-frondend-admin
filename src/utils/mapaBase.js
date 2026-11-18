import L from "leaflet";

/**
 * Camadas de fundo dos mapas do admin (Esri, sem chave): o tile.openstreetmap.org bloqueia
 * o admin e a CARTO exige chave. O satélite ajuda a achar o telhado da igreja.
 */
export function adicionarCamadasBase(mapa) {
  const esri = "https://server.arcgisonline.com/ArcGIS/rest/services";
  const ruas = L.tileLayer(`${esri}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`, {
    maxZoom: 19,
    attribution: "Tiles © Esri",
  }).addTo(mapa);
  const satelite = L.tileLayer(`${esri}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, {
    maxZoom: 19,
    attribution: "Tiles © Esri — Maxar, Earthstar Geographics",
  });
  L.control.layers({ Ruas: ruas, "Satélite": satelite }, null, { position: "topright" }).addTo(mapa);
}

/** Marcador vermelho arrastável usado para o ponto a gravar. */
export const iconeMarcador = () =>
  L.divIcon({
    className: "",
    html: '<div style="width:18px;height:18px;border-radius:50%;background:#c62828;border:3px solid #fff;box-shadow:0 0 4px #000"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
