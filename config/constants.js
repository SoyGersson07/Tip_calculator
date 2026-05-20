/**
 * constants.js — Paletas de color (claro/oscuro), helper getColors y constantes de negocio.
 */

// ===== PALETA DE COLORES UNIFICADA (tema claro) =====
// Objeto exportado: referencia de colores para estilos estáticos o fallback.
export const Colors = {
  // Color de acento principal (botones, enlaces).
  primary: "#E2725B",
  // Fondo suave asociado al acento.
  primaryLight: "#FDF0ED",
  // Fondo un poco más cargado del acento.
  primaryBg: "#FAE8E3",

  // Color de fondo general de pantallas (claro).
  bgMain: "#F6F4F0",

  // Superficie blanca (tarjetas, barras).
  white: "#FFFFFF",

  // Texto principal oscuro sobre fondo claro.
  darkText: "#1C1C1E",
  // Alias de texto principal.
  text: "#1C1C1E",

  // Escala de grises para bordes, secundarios, deshabilitado.
  gray500: "#8E8E93",
  gray400: "#A9A9AF",
  gray300: "#D1D1D6",
  gray200: "#E5E5EA",
  gray100: "#F2F2F7",

  // Negro puro (iconos, contraste).
  black: "#000000",

  // Estados semánticos y estilos de "invitado" en listas.
  green: "#34C759",
  success: "#34C759",
  danger: "#FF3B30",
  invitadoBg: "#EFEFEF",
  invitadoText: "#8E8E93",
};

// ===== TEMA OSCURO (mismas claves semánticas, valores adaptados) =====
export const ColorsDark = {
  primary: "#FF8B6B",
  primaryLight: "#2C1810",
  primaryBg: "#3D2817",

  bgMain: "#0A0A0A",

  white: "#1C1C1E",

  darkText: "#F5F5F7",
  text: "#F5F5F7",

  gray500: "#8E8E93",
  gray400: "#636366",
  gray300: "#434345",
  gray200: "#3A3A3C",
  gray100: "#2C2C2E",

  black: "#FFFFFF",

  green: "#32D74B",
  success: "#32D74B",
  danger: "#FF453A",
  invitadoBg: "#2C2C2E",
  invitadoText: "#8E8E93",
};

/**
 * Devuelve el objeto de colores activo según el modo oscuro.
 * @param {boolean} darkMode — true = ColorsDark, false = Colors.
 */
export const getColors = (darkMode = false) => {
  return darkMode ? ColorsDark : Colors;
};

// ===== CONSTANTES DE NEGOCIO =====
// Porcentaje de propina por defecto cuando el usuario no fija un monto personalizado.
export const TIP_PCT = 10;
