import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_REDONDEO = "settings_redondeo";
const KEY_MONEDA = "settings_moneda";

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

export async function guardarRedondeo(activo) {
  try {
    await AsyncStorage.setItem(KEY_REDONDEO, JSON.stringify(activo));
    return true;
  } catch (e) {
    console.error("Error guardando redondeo:", e);
    return false;
  }
}

export async function obtenerRedondeo() {
  try {
    const valor = await AsyncStorage.getItem(KEY_REDONDEO);
    return valor !== null ? JSON.parse(valor) : true;
  } catch (e) {
    console.error("Error leyendo redondeo:", e);
    return true;
  }
}

export function aplicarRedondeo(valor, activo) {
  if (!activo) return valor;
  return Math.round(valor);
}

export async function guardarMoneda(codigo) {
  try {
    await AsyncStorage.setItem(KEY_MONEDA, codigo);
    return true;
  } catch (e) {
    console.error("Error guardando moneda:", e);
    return false;
  }
}

export async function obtenerMoneda() {
  try {
    const codigo = await AsyncStorage.getItem(KEY_MONEDA);
    return codigo || "USD";
  } catch (e) {
    console.error("Error leyendo moneda:", e);
    return "USD";
  }
}

export function obtenerSimboloMoneda(codigo) {
  const moneda = MONEDAS_DISPONIBLES.find((m) => m.codigo === codigo);
  return moneda ? moneda.simbolo : "$";
}

export function formatearMoneda(valor, codigoMoneda = "USD") {
  const simbolo = obtenerSimboloMoneda(codigoMoneda);
  return `${simbolo}${(parseFloat(valor) || 0).toFixed(2)}`;
}

export function fmt(valor, simbolo = "$") {
  return `${simbolo}${(parseFloat(valor) || 0).toFixed(2)}`;
}
