export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Impacto Pro League";

export const APP_LOGO = "/logo-icon.png";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Movimentos padrão para PRs
export const MOVIMENTOS_PR = [
  "Back Squat",
  "Front Squat",
  "Deadlift",
  "Clean",
  "Snatch",
  "Clean & Jerk",
  "Bench Press",
  "Overhead Press",
  "Push Press",
  "Push Jerk",
  "Thruster",
  "Pull-up",
  "Muscle-up",
  "Handstand Push-up",
];

// Dias da semana
export const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

// Cores para categorias
export const CORES_CATEGORIAS = {
  iniciante: "bg-blue-500",
  intermediario: "bg-green-500",
  avancado: "bg-orange-500",
  elite: "bg-red-500",
};

// Ícones para tipos de WOD
export const ICONES_WOD = {
  for_time: "⏱️",
  amrap: "🔄",
  emom: "⏰",
  tabata: "⚡",
  strength: "💪",
  outro: "🏋️",
};

// Categorias de atletas
export const CATEGORIAS = [
  "iniciante",
  "intermediario",
  "avancado",
  "elite",
];

// Faixas etárias
export const FAIXAS_ETARIAS = [
  "18-24",
  "25-29",
  "30-34",
  "35-39",
  "40-44",
  "45-49",
  "50-54",
  "55+",
];
