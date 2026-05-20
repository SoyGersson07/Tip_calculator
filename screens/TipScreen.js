/**
 * TipScreen.js — Teclado numérico para introducir un monto fijo de propina y volver a Calculator con propinaMonto.
 */
// Hooks de React para estado local, callbacks estables y valores derivados memoizados.
import { useState, useCallback, useMemo } from "react";
// Componentes de layout y toque de React Native.
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

// Paleta según tema claro/oscuro.
import { getColors } from "../config/constants";
// Tema global desde contexto.
import { useAppContext } from "../context/AppContext";

/**
 * Pantalla recibe route.params desde Calculator (subtotal, participantes, etc.) y navigation para volver.
 */
export default function TipScreen({ route, navigation }) {
  // Lee booleano de tema oscuro del contexto global.
  const { temaOscuro } = useAppContext();
  // Objeto de colores activo (claro u oscuro).
  const colors = getColors(temaOscuro);
  // Hoja de estilos generada en función del tema (evita colores fijos rotos en oscuro).
  const s = getStyles(colors);

  // Desestructura parámetros de navegación con valores por defecto si route.params es undefined.
  const {
    subtotal = 0,
    totalConsumo = 0,
    participantes = [],
    nombreCuenta = "",
  } = route?.params || {};

  // Cadena del teclado personalizado (dígitos y punto decimal).
  const [valor, setValor] = useState("");

  // Maneja pulsación de tecla: borrar, punto decimal único, o dígito con máximo 2 decimales.
  const presionar = useCallback((key) => {
    if (key === "⌫") {
      setValor((v) => v.slice(0, -1));
    } else if (key === ".") {
      if (!valor.includes(".")) setValor((v) => v + ".");
    } else {
      if (valor.includes(".") && valor.split(".")[1]?.length >= 2) return;
      setValor((v) => (v === "" ? key : v + key));
    }
  }, [valor]);

  // Convierte la cadena del input a número (0 si vacío o inválido).
  const numerico = useMemo(() => parseFloat(valor) || 0, [valor]);

  // Porcentaje que representa numerico respecto al consumo total (una decimal).
  const pct = useMemo(
    () =>
      totalConsumo > 0 ? ((numerico / totalConsumo) * 100).toFixed(1) : "0.0",
    [numerico, totalConsumo]
  );

  // Orden de teclas del teclado visual (12 posiciones).
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

  // Navega atrás al stack Calculator pasando el monto y el resto de datos del flujo.
  const handleAplicar = useCallback(() => {
    navigation.navigate("Calculator", {
      propinaMonto: numerico,
      participantes,
      nombreCuenta,
    });
  }, [navigation, numerico, participantes, nombreCuenta]);

  return (
    // SafeAreaView respeta notch / barra de estado en dispositivos con recorte.
    <SafeAreaView style={s.safe}>
      {/* Cabecera con botón atrás y título centrado. */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        >
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={s.headerTitle}>Configurar Propina</Text>

        {/* Espacio vacío para equilibrar el título respecto al botón atrás (mismo ancho que backBtn). */}
        <View style={{ width: 36 }} />
      </View>

      {/* Caja informativa: subtotal enviado desde Calculator (solo lectura). */}
      <View style={s.subtotalBox}>
        <Text style={s.subtotalLabel}>SUBTOTAL DE CONSUMO</Text>

        <Text style={s.subtotalVal}>
          ${(parseFloat(subtotal) || 0).toFixed(2)}
        </Text>
      </View>

      {/* Zona de monto de propina que el usuario va componiendo con el teclado. */}
      <View style={s.inputSection}>
        <Text style={s.inputLabel}>Valor de la Propina</Text>

        <View style={s.inputBox}>
          <Text style={s.inputValue}>
            $ {valor === "" ? "0.00" : valor}
          </Text>
        </View>

        <Text style={s.inputHint}>Equivale al {pct}% del total</Text>
      </View>

      {/* Teclado en cuadrícula 3×4 usando flexWrap. */}
      <View style={s.teclado}>
        {keys.map((k) => (
          <TouchableOpacity
            key={k}
            style={s.tecla}
            onPress={() => presionar(k)}
            activeOpacity={0.6}
          >
            <Text style={[s.teclaText, k === "⌫" && { fontSize: 20 }]}>
              {k}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Barra inferior fija visualmente al fondo del SafeArea con botón principal. */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.btnAplicar}
          activeOpacity={0.88}
          onPress={handleAplicar}
        >
          <Text style={s.btnAplicarText}>✓  Aplicar Propina</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * Estilos dependientes de `colors` para coherencia con tema claro/oscuro.
 */
function getStyles(colors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  backBtn: { width: 36 },

  backIcon: { fontSize: 22, color: colors.darkText },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.darkText,
  },

  subtotalBox: {
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 20,
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  subtotalLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.gray500,
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  subtotalVal: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.darkText,
  },

  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.darkText,
    marginBottom: 8,
  },

  inputBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 16,
    alignItems: "center",
  },

  inputValue: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.primary,
  },

  inputHint: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: "center",
    marginTop: 8,
  },

  teclado: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    alignContent: "center",
  },

  tecla: {
    width: "33.33%",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  teclaText: {
    fontSize: 24,
    fontWeight: "400",
    color: colors.darkText,
  },

  bottomBar: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: colors.white,
  },

  btnAplicar: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  btnAplicarText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
  },
  });
}
