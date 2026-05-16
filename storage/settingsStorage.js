/**
 * settingsStorage.js — Claves AsyncStorage para redondeo, moneda, idioma y tema;
 * lista de monedas y helpers de formato/redondeo.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

// Clave: redondeo automático activo/inactivo (boolean serializado).
const KEY_REDONDEO = "settings_redondeo";
// Clave: código ISO de moneda elegida (string).
const KEY_MONEDA = "settings_moneda";
// Clave: código de idioma ("es" | "en" | …).
const KEY_IDIOMA = "settings_idioma";
// Clave: tema oscuro activo (boolean serializado).
const KEY_TEMA_OSCURO = "settings_tema_oscuro";

// Catálogo fijo de monedas para el selector en Ajustes.
export const MONEDAS_DISPONIBLES = [
  { codigo: "USD", simbolo: "$", pais: "Estados Unidos" },
  { codigo: "EUR", simbolo: "€", pais: "Europa" },
  { codigo: "GBP", simbolo: "£", pais: "Reino Unido" },
  { codigo: "JPY", simbolo: "¥", pais: "Japón" },
  { codigo: "MXN", simbolo: "$", pais: "México" },
  { codigo: "ARS", simbolo: "$", pais: "Argentina" },
  { codigo: "CLP", simbolo: "$", pais: "Chile" },
  { codigo: "COP", simbolo: "$", pais: "Colombia" },
  { codigo: "BRL", simbolo: "R$", pais: "Brasil" },
  { codigo: "INR", simbolo: "₹", pais: "India" },
  { codigo: "AUD", simbolo: "A$", pais: "Australia" },
  { codigo: "CAD", simbolo: "C$", pais: "Canadá" },
];

/** Persiste preferencia de redondeo (true/false). */
export async function guardarRedondeo(activo) {
  try {
    await AsyncStorage.setItem(KEY_REDONDEO, JSON.stringify(activo));
    return true;
  } catch (e) {
    console.error("Error guardando redondeo:", e);
    return false;
  }
}

/** Lee redondeo; por defecto true si no hay valor guardado. */
export async function obtenerRedondeo() {
  try {
    const valor = await AsyncStorage.getItem(KEY_REDONDEO);
    return valor !== null ? JSON.parse(valor) : true;
  } catch (e) {
    console.error("Error leyendo redondeo:", e);
    return true;
  }
}

/** Si activo, redondea al entero más cercano; si no, devuelve el valor tal cual. */
export function aplicarRedondeo(valor, activo) {
  if (!activo) return valor;
  return Math.round(valor);
}

/** Guarda código de moneda (ej. "USD"). */
export async function guardarMoneda(codigo) {
  try {
    await AsyncStorage.setItem(KEY_MONEDA, codigo);
    return true;
  } catch (e) {
    console.error("Error guardando moneda:", e);
    return false;
  }
}

/** Obtiene código de moneda o "USD" por defecto. */
export async function obtenerMoneda() {
  try {
    const codigo = await AsyncStorage.getItem(KEY_MONEDA);
    return codigo || "USD";
  } catch (e) {
    console.error("Error leyendo moneda:", e);
    return "USD";
  }
}

/** Busca el símbolo en MONEDAS_DISPONIBLES o devuelve "$". */
export function obtenerSimboloMoneda(codigo) {
  const moneda = MONEDAS_DISPONIBLES.find((m) => m.codigo === codigo);
  return moneda ? moneda.simbolo : "$";
}

/** Formatea número con símbolo según código de moneda. */
export function formatearMoneda(valor, codigoMoneda = "USD") {
  const simbolo = obtenerSimboloMoneda(codigoMoneda);
  return `${simbolo}${(parseFloat(valor) || 0).toFixed(2)}`;
}

// ===== IDIOMA =====

export async function guardarIdioma(idioma) {
  try {
    await AsyncStorage.setItem(KEY_IDIOMA, idioma);
    return true;
  } catch (e) {
    console.error("Error guardando idioma:", e);
    return false;
  }
}

export async function obtenerIdioma() {
  try {
    const idioma = await AsyncStorage.getItem(KEY_IDIOMA);
    return idioma || "es";
  } catch (e) {
    console.error("Error leyendo idioma:", e);
    return "es";
  }
}

// ===== TEMA OSCURO =====

export async function guardarTemaOscuro(activo) {
  try {
    await AsyncStorage.setItem(KEY_TEMA_OSCURO, JSON.stringify(activo));
    return true;
  } catch (e) {
    console.error("Error guardando tema oscuro:", e);
    return false;
  }
}

export async function obtenerTemaOscuro() {
  try {
    const valor = await AsyncStorage.getItem(KEY_TEMA_OSCURO);
    return valor !== null ? JSON.parse(valor) : false;
  } catch (e) {
    console.error("Error leyendo tema oscuro:", e);
    return false;
  }
}
