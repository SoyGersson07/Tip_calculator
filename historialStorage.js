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
    let historial = raw ? JSON.parse(raw) : [];
    
    // Normalizar IDs a números para consistencia
    historial = historial.map((cuenta) => ({
      ...cuenta,
      id: Number(cuenta.id),
    }));
    
    console.log("Historial obtenido:", historial.length, "cuentas");
    return historial;
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

export async function eliminarCuenta(id) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const historial = raw ? JSON.parse(raw) : [];
    const cuentasBefore = historial.length;
    
    // Convertir ID a número para comparación consistente
    const idNum = Number(id);
    
    const filtrado = historial.filter((cuenta) => {
      return Number(cuenta.id) !== idNum;
    });
    
    // Guardar el resultado
    if (filtrado.length === 0) {
      await AsyncStorage.removeItem(KEY);
    } else {
      await AsyncStorage.setItem(KEY, JSON.stringify(filtrado));
    }
    
    console.log(`✓ Eliminada cuenta ${id}. Antes: ${cuentasBefore}, Después: ${filtrado.length}`);
    return true;
  } catch (e) {
    console.error("✗ Error eliminando cuenta:", e);
    return false;
  }
}