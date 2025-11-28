export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "RX Nation";

export const APP_LOGO = "/logo-rx-nation-final.png";

// Generate login URL
export const getLoginUrl = () => {
  return "/login";
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
