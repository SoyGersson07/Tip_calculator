// Importamos los componentes necesarios de React Native para construir la interfaz
import {
  StyleSheet, // Para crear estilos
  Text, // Para mostrar texto
  View, // Contenedor principal
  TouchableOpacity, // Para botones interactivos
  SafeAreaView, // Contenedor que evita que el contenido quede oculto por notches
  ScrollView, // Para contenido que se puede desplazar
  Image // Para mostrar imágenes
} from "react-native";

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

// TODO: Datos pendientes de implementar - se conectarán con la base de datos
const HISTORIAL = []; // Aquí irán las cuentas guardadas del usuario
const totalMes = 0; // Total gastado en el mes
const totalPropinas = 0; // Total en propinas del mes

// Componente principal de la pantalla HOME
// Recibe "navigation" para navegar entre pantallas
export default function HomeScreen({ navigation }) {
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
        showsVerticalScrollIndicator={false} // Oculta la barra de scroll
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
          onPress={() => navigation && navigation.navigate("Calculator")} // Navega a la pantalla de calculadora
          activeOpacity={0.88} // Efecto visual al presionar
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
        {HISTORIAL.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyTitle}>Sin cuentas aún</Text>
            <Text style={styles.emptySub}>
              Toca "Nueva Cuenta" para empezar a calcular
            </Text>
          </View>
        ) : (
          // Si hay cuentas, mostrarlas en una lista
          HISTORIAL.map((item) => (
            <View key={item.id} style={styles.historialCard}>
              {/* Ícono de la cuenta (emoji) */}
              <View style={styles.historialIconWrap}>
                <Text style={styles.historialIcon}>{item.icon}</Text>
              </View>
              {/* Información: nombre del restaurante, fecha y personas */}
              <View style={styles.historialInfo}>
                <Text style={styles.historialNombre}>{item.nombre}</Text>
                <Text style={styles.historialFecha}>
                  {item.fecha}
                  {item.personas ? ` • ${item.personas} personas` : " • Solo"}
                </Text>
              </View>
              {/* Totales: monto pagado y propina */}
              <View style={styles.historialAmounts}>
                <Text style={styles.historialTotal}>
                  ${item.total.toFixed(2)}
                </Text>
                <Text style={styles.historialPropina}>
                  Propina: ${item.propina.toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bgMain,
  },
  header: {
    backgroundColor: C.white,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.darkText,
    letterSpacing: 0.3,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  greetSection: {
    marginTop: 28,
    marginBottom: 24,
    alignItems: "center",

  },
  greetTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: C.darkText,
    marginBottom: 8,
  },
  greetSub: {
    fontSize: 15,
    color: C.gray500,
    lineHeight: 22,
  },
  btnNuevaCuenta: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  btnNuevaCuentaIcon: {
    fontSize: 22,
    color: C.white,
  },
  btnNuevaCuentaText: {
    fontSize: 17,
    fontWeight: "800",
    color: C.white,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: C.gray500,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: C.darkText,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.darkText,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: C.white,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.darkText,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: C.gray500,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  historialCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  historialIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  historialIcon: {
    fontSize: 22,
  },
  historialInfo: {
    flex: 1,
  },
  historialNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: C.darkText,
    marginBottom: 4,
  },
  historialFecha: {
    fontSize: 13,
    color: C.gray500,
  },
  historialAmounts: {
    alignItems: "flex-end",
  },
  historialTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: C.darkText,
    marginBottom: 3,
  },
  historialPropina: {
    fontSize: 12,
    fontWeight: "600",
    color: "#34C759",
  },
});