import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "historial_cuentas";

// ===== GUARDAR CUENTA =====
export async function guardarCuenta(cuenta) {
  try {
    console.log("📝 GUARDANDO CUENTA:", cuenta);
    
    const raw = await AsyncStorage.getItem(KEY);
    const historial = raw ? JSON.parse(raw) : [];
    
    console.log("📊 Historial actual:", historial.length, "cuentas");
    console.log("   IDs:", historial.map(h => h.id));
    
    historial.unshift(cuenta); // más reciente primero
    
    const resultado = await AsyncStorage.setItem(KEY, JSON.stringify(historial));
    console.log("✓ Cuenta guardada exitosamente. Total ahora:", historial.length);
    console.log("   ID guardado:", cuenta.id, "Tipo:", typeof cuenta.id);
    
    return true;
  } catch (e) {
    console.error("❌ Error guardando cuenta:", e);
    throw e;
  }
}

// ===== OBTENER HISTORIAL =====
export async function obtenerHistorial() {
  try {
    console.log("📖 OBTENIENDO HISTORIAL...");
    
    const raw = await AsyncStorage.getItem(KEY);
    let historial = raw ? JSON.parse(raw) : [];
    
    console.log("📊 Historial obtenido:", historial.length, "cuentas");
    console.log("   IDs crudos:", historial.map(h => ({ id: h.id, tipo: typeof h.id })));
    
    // Normalizar IDs a números para consistencia
    historial = historial.map((cuenta) => ({
      ...cuenta,
      id: Number(cuenta.id),
    }));
    
    console.log("✓ Historial normalizado. IDs normalizados:", historial.map(h => ({ id: h.id, tipo: typeof h.id })));
    return historial;
  } catch (e) {
    console.error("❌ Error leyendo historial:", e);
    return [];
  }
}

// ===== LIMPIAR HISTORIAL =====
export async function limpiarHistorial() {
  try {
    console.log("🧹 LIMPIANDO HISTORIAL COMPLETO...");
    
    await AsyncStorage.removeItem(KEY);
    
    console.log("✓ Historial limpiado exitosamente");
    
    // Verificación: intenta obtener de nuevo
    const verificacion = await AsyncStorage.getItem(KEY);
    console.log("✓ Verificación: historial después de limpiar?", verificacion === null ? "VACÍO (correcto)" : "OPS, aún hay datos");
    
    return true;
  } catch (e) {
    console.error("❌ Error limpiando historial:", e);
    throw e;
  }
}

// ===== ELIMINAR CUENTA =====
export async function eliminarCuenta(id) {
  try {
    console.log("🗑️  ELIMINANDO CUENTA:", id, "Tipo:", typeof id);
    
    const raw = await AsyncStorage.getItem(KEY);
    const historial = raw ? JSON.parse(raw) : [];
    const cuentasBefore = historial.length;
    
    console.log("📊 Historial actual:", cuentasBefore, "cuentas");
    console.log("   IDs antes:", historial.map(h => ({ id: h.id, tipo: typeof h.id })));
    
    // Convertir ID a número para comparación consistente
    const idNum = Number(id);
    console.log("🔍 Buscando cuenta con ID:", idNum, "(convertido a número)");
    
    const filtrado = historial.filter((cuenta) => {
      const cuentaId = Number(cuenta.id);
      const coincide = cuentaId === idNum;
      console.log(`   Comparando: ${cuentaId} === ${idNum} ? ${coincide}`);
      return !coincide;
    });
    
    console.log(`📊 Después de filtrar: ${filtrado.length} cuentas (eliminadas ${cuentasBefore - filtrado.length})`);
    
    // Guardar el resultado
    if (filtrado.length === 0) {
      console.log("✓ Historial vacío, removiendo key de AsyncStorage");
      await AsyncStorage.removeItem(KEY);
    } else {
      console.log("✓ Guardando historial actualizado");
      await AsyncStorage.setItem(KEY, JSON.stringify(filtrado));
    }
    
    // Verificación: obtener de nuevo para confirmar
    const verificacion = await obtenerHistorial();
    console.log(`✓ Verificación: ahora hay ${verificacion.length} cuentas`);
    console.log("   IDs restantes:", verificacion.map(h => h.id));
    
    return true;
  } catch (e) {
    console.error("❌ Error eliminando cuenta:", e);
    throw e;
  }
}