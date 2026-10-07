const CLAIM_PAPEL = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

/** Lê o payload de um JWT (sem validar assinatura: só para decisões de interface). */
export const decodificarJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Papel (perfil) do usuário no token: "Admin", "App", "Regular", "Dono"... ou null. */
export const perfilDoToken = (token) => {
  const dados = decodificarJwt(token);
  const papel = dados?.[CLAIM_PAPEL] ?? dados?.role;
  return Array.isArray(papel) ? papel[0] : papel ?? null;
};

export const tokenExpirado = (token) => {
  const exp = decodificarJwt(token)?.exp;
  return typeof exp === "number" && exp * 1000 <= Date.now();
};

export const PERFIL_ADMIN = "Admin";
