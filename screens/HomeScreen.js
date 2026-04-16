// Importamos useState y useCallback para manejar el estado y optimizar el efecto de foco
import { useState, useCallback } from "react";
// Importamos los componentes necesarios de React Native para construir la interfaz
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image
} from "react-native";
// Importamos useFocusEffect para recargar el historial cada vez que el usuario vuelve a esta pantalla
import { useFocusEffect } from "@react-navigation/native";
// Importamos la función para leer el historial guardado en AsyncStorage
import { obtenerHistorial } from "../historialStorage";
// Importamos los íconos de la pantalla de inicio
import commerce from "../assets/commerce.png";
import charity from "../assets/charity.png";

// Paleta de colores constantes para mantener consistencia en la app
const C = {
  primary: "#d25238",
  bgMain: "#F6F4F0",
  white: "#FFFFFF",
  darkText: "#1C1C1E",
  gray500: "#8E8E93",
  gray200: "#E5E5EA",
  primaryLight: "#FDF0ED",
  green: "#34C759",
};

// Componente principal de la pantalla HOME
// Recibe "navigation" para navegar entre pantallas
export default function HomeScreen({ navigation }) {
  // Estado que almacena el historial de cuentas leído desde AsyncStorage
  const [historial, setHistorial] = useState([]);

  // Cada vez que el usuario enfoca esta pantalla, recargamos el historial
  useFocusEffect(
    useCallback(() => {
      obtenerHistorial().then(setHistorial);
    }, [])
  );

  // Calculamos el total gastado en el mes sumando todos los totales del historial
  const totalMes = historial.reduce((s, i) => s + (i.total || 0), 0);
  // Calculamos el total en propinas sumando todas las propinas del historial
  const totalPropinas = historial.reduce((s, i) => s + (i.propina || 0), 0);
  // Mostramos solo las 3 cuentas más recientes en el home
  const recientes = historial.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER: Título de la app */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PropinaPlus</Text>
      </View>

      {/* CONTENIDO PRINCIPAL: ScrollView permite desplazar verticalmente */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECCIÓN 1: Saludo de bienvenida */}
        <View style={styles.greetSection}>
          <Text style={styles.greetTitle}>¡Hola, Usuario! 👋</Text>
          <Text style={styles.greetSub}>
            Calcula tus propinas de forma rápida y equitativa.
          </Text>
        </View>

        {/* SECCIÓN 2: Botón para iniciar nueva calculadora de propinas */}
        <TouchableOpacity
          style={styles.btnNuevaCuenta}
          onPress={() => navigation && navigation.navigate("Calculator")}
          activeOpacity={0.88}
        >
          <Text style={styles.btnNuevaCuentaIcon}>⊕</Text>
          <Text style={styles.btnNuevaCuentaText}>Nueva Cuenta</Text>
        </TouchableOpacity>

        {/* SECCIÓN 3: Estadísticas (Total del mes + Propinas totales) */}
        <View style={styles.statsRow}>
          {/* Card: Total gastado en el mes */}
          <View style={styles.statCard}>
            <Image source={commerce} style={{ width: 24, height: 24, marginBottom: 6 }} />
            <Text style={styles.statLabel}>Total Mes</Text>
            <Text style={styles.statValue}>${totalMes.toFixed(2)}</Text>
          </View>
          {/* Card: Total en propinas */}
          <View style={styles.statCard}>
            <Image source={charity} style={{ width: 24, height: 24, marginBottom: 6 }} />
            <Text style={styles.statLabel}>Propinas</Text>
            <Text style={styles.statValue}>${totalPropinas.toFixed(2)}</Text>
          </View>
        </View>

        {/* SECCIÓN 4: Historial de cuentas recientes */}
        <Text style={styles.sectionTitle}>Historial Reciente</Text>

        {/* Si no hay cuentas guardadas, mostrar un estado vacío */}
        {recientes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyTitle}>Sin cuentas aún</Text>
            <Text style={styles.emptySub}>
              Toca "Nueva Cuenta" para empezar a calcular
            </Text>
          </View>
        ) : (
          // Si hay cuentas, mostrar las 3 más recientes
          recientes.map((item) => (
            <View key={item.id} style={styles.historialCard}>
              {/* Ícono de la cuenta */}
              <View style={styles.historialIconWrap}>
                <Image source={commerce} style={{ width: 22, height: 22 }} />
              </View>
              {/* Información: nombre, fecha y personas */}
              <View style={styles.historialInfo}>
                <Text style={styles.historialNombre}>{item.nombre}</Text>
                <Text style={styles.historialFecha}>
                  {item.personas} persona{item.personas !== 1 ? "s" : ""} · {new Date(item.fecha).toLocaleDateString("es-ES")}
                </Text>
              </View>
              {/* Totales: monto pagado y propina */}
              <View style={styles.historialAmounts}>
                <Text style={styles.historialTotal}>${item.total.toFixed(2)}</Text>
                <Text style={styles.historialPropina}>Propina: ${item.propina.toFixed(2)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bgMain },
  header: {
    backgroundColor: C.white, paddingVertical: 16, alignItems: "center",
    borderBottomWidth: 1, borderBottomColor: C.gray200,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.darkText, letterSpacing: 0.3 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  greetSection: { marginTop: 28, marginBottom: 24, alignItems: "center" },
  greetTitle: { fontSize: 30, fontWeight: "900", color: C.darkText, marginBottom: 8 },
  greetSub: { fontSize: 15, color: C.gray500, lineHeight: 22 },
  btnNuevaCuenta: {
    backgroundColor: C.primary, borderRadius: 18, paddingVertical: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, marginBottom: 24, shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35,
    shadowRadius: 16, elevation: 8,
  },
  btnNuevaCuentaIcon: { fontSize: 22, color: C.white },
  btnNuevaCuentaText: { fontSize: 17, fontWeight: "800", color: C.white, letterSpacing: 0.3 },
  statsRow: { flexDirection: "row", gap: 14, marginBottom: 32 },
  statCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 18, padding: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statLabel: { fontSize: 13, color: C.gray500, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "900", color: C.darkText },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: C.darkText, marginBottom: 16 },
  emptyState: {
    alignItems: "center", paddingVertical: 48, backgroundColor: C.white,
    borderRadius: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: C.darkText, marginBottom: 6 },
  emptySub: { fontSize: 13, color: C.gray500, textAlign: "center", paddingHorizontal: 32, lineHeight: 20 },
  historialCard: {
    backgroundColor: C.white, borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  historialIconWrap: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center", marginRight: 14,
  },
  historialInfo: { flex: 1 },
  historialNombre: { fontSize: 15, fontWeight: "700", color: C.darkText, marginBottom: 4 },
  historialFecha: { fontSize: 13, color: C.gray500 },
  historialAmounts: { alignItems: "flex-end" },
  historialTotal: { fontSize: 16, fontWeight: "800", color: C.darkText, marginBottom: 3 },
  historialPropina: { fontSize: 12, fontWeight: "600", color: C.green },
});