import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "historial_cuentas";

export async function guardarCuenta(cuenta) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const historial = raw ? JSON.parse(raw) : [];
    historial.unshift(cuenta); // más reciente primero
    await AsyncStorage.setItem(KEY, JSON.stringify(historial));
  } catch (e) {
    console.error("Error guardando cuenta:", e);
  }
}

export async function obtenerHistorial() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error leyendo historial:", e);
    return [];
  }
}

export async function limpiarHistorial() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.error("Error limpiando historial:", e);
  }
}