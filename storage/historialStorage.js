/**
 * historialStorage.js — Historial por usuario (clave AsyncStorage por userId).
 * Migra datos de la clave antigua única una vez por usuario nuevo.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Clave usada antes de cuentas por usuario (una sola lista global). */
const LEGACY_HISTORIAL_KEY = "historial_cuentas";

export function historialStorageKey(userId) {
  if (!userId) {
    throw new Error("userId es obligatorio para el historial");
  }
  return `historial_cuentas_${userId}`;
}

/**
 * Si existe historial en la clave antigua y el usuario aún no tiene datos,
 * mueve el JSON a la clave del usuario y borra la legada.
 */
export async function migrarHistorialLegacySiCorresponde(userId) {
  try {
    const legacy = await AsyncStorage.getItem(LEGACY_HISTORIAL_KEY);
    if (!legacy || legacy === "[]") {
      await AsyncStorage.removeItem(LEGACY_HISTORIAL_KEY);
      return;
    }
    const nuevaClave = historialStorageKey(userId);
    const actual = await AsyncStorage.getItem(nuevaClave);
    if (!actual || actual === "[]") {
      await AsyncStorage.setItem(nuevaClave, legacy);
      await AsyncStorage.removeItem(LEGACY_HISTORIAL_KEY);
    }
  } catch (e) {
    console.error("Error migrando historial:", e);
  }
}

export async function guardarCuenta(cuenta, userId) {
  try {
    const KEY = historialStorageKey(userId);
    const raw = await AsyncStorage.getItem(KEY);
    const historial = raw ? JSON.parse(raw) : [];
    historial.unshift(cuenta);
    await AsyncStorage.setItem(KEY, JSON.stringify(historial));
    return true;
  } catch (e) {
    console.error("Error guardando cuenta:", e);
    throw e;
  }
}

export async function obtenerHistorial(userId) {
  try {
    const KEY = historialStorageKey(userId);
    const raw = await AsyncStorage.getItem(KEY);
    let historial = raw ? JSON.parse(raw) : [];
    historial = historial.map((cuenta) => ({
      ...cuenta,
      id: Number(cuenta.id),
    }));
    return historial;
  } catch (e) {
    console.error("Error leyendo historial:", e);
    return [];
  }
}

export async function limpiarHistorial(userId) {
  try {
    await AsyncStorage.removeItem(historialStorageKey(userId));
    return true;
  } catch (e) {
    console.error("Error limpiando historial:", e);
    throw e;
  }
}

export async function eliminarCuenta(userId, id) {
  try {
    const KEY = historialStorageKey(userId);
    const raw = await AsyncStorage.getItem(KEY);
    const historial = raw ? JSON.parse(raw) : [];

    const idNum = Number(id);
    const filtrado = historial.filter((cuenta) => Number(cuenta.id) !== idNum);

    if (filtrado.length === 0) {
      await AsyncStorage.removeItem(KEY);
    } else {
      await AsyncStorage.setItem(KEY, JSON.stringify(filtrado));
    }

    return true;
  } catch (e) {
    console.error("Error eliminando cuenta:", e);
    throw e;
  }
}
