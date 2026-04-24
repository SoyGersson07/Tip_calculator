import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "historial_cuentas";

export async function guardarCuenta(cuenta) {
  try {
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

export async function obtenerHistorial() {
  try {
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

export async function limpiarHistorial() {
  try {
    await AsyncStorage.removeItem(KEY);
    return true;
  } catch (e) {
    console.error("Error limpiando historial:", e);
    throw e;
  }
}

export async function eliminarCuenta(id) {
  try {
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