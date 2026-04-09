// Importamos el hook useState para manejar estados dentro del componente
import { useState } from "react";

// Importamos los componentes necesarios de React Native para construir la interfaz
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
} from "react-native";

// Definimos una constante de colores para mantener consistencia en toda la app
const C = {
  primary: "#E2725B",     // Color principal
  bgMain: "#F6F4F0",     // Fondo general
  white: "#FFFFFF",      // Blanco
  darkText: "#1C1C1E",   // Texto oscuro
  gray500: "#8E8E93",    // Gris medio
  gray200: "#E5E5EA",    // Gris claro
  gray100: "#F2F2F7",    // Gris muy claro
};

// Exportamos el componente principal de la pantalla de configuración de propina
export default function TipScreen({ route, navigation }) {

  // Obtenemos el subtotal que viene desde la pantalla anterior (Calculator)
  // Si no viene nada, por defecto será 0
  const { subtotal = 0 } = route?.params || {};

  // Estado que guarda el valor de la propina que el usuario escribe
  const [valor, setValor] = useState("");

  // ======== FUNCIÓN PARA MANEJAR EL TECLADO ========
  // Se ejecuta cada vez que el usuario presiona una tecla
  function presionar(key) {

    // Si presiona borrar (⌫), elimina el último carácter
    if (key === "⌫") {
      setValor((v) => v.slice(0, -1));

    // Si presiona punto decimal
    } else if (key === ".") {
      // Solo permite un punto en el número
      if (!valor.includes(".")) setValor((v) => v + ".");

    } else {
      // Si ya hay decimales, limita a máximo 2
      if (valor.includes(".") && valor.split(".")[1]?.length >= 2) return;

      // Agrega el número al valor actual
      setValor((v) => (v === "" ? key : v + key));
    }
  }

  // Convertimos el valor ingresado a número
  const numerico = parseFloat(valor) || 0;

  // Calculamos qué porcentaje representa la propina respecto al subtotal
  const pct = subtotal > 0 ? ((numerico / subtotal) * 100).toFixed(1) : "0.0";

  // Definimos las teclas del teclado numérico personalizado
  const keys = ["1","2","3","4","5","6","7","8","9",".","0","⌫"];

  // ======== UI (INTERFAZ) ========
  return (
    <SafeAreaView style={s.safe}>

      {/* ======== HEADER ======== */}
      {/* Barra superior con botón de volver y título */}
      <View style={s.header}>
        
        {/* Botón para regresar a la pantalla anterior */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Título de la pantalla */}
        <Text style={s.headerTitle}>Configurar Propina</Text>

        {/* Espacio vacío para centrar el título */}
        <View style={{ width: 36 }} />
      </View>

      {/* ======== SUBTOTAL ======== */}
      {/* Muestra el subtotal recibido desde la pantalla anterior */}
      <View style={s.subtotalBox}>
        <Text style={s.subtotalLabel}>SUBTOTAL DE CONSUMO</Text>
        
        {/* Formateamos el subtotal a 2 decimales */}
        <Text style={s.subtotalVal}>
          ${(parseFloat(subtotal) || 0).toFixed(2)}
        </Text>
      </View>

      {/* ======== INPUT DE PROPINA ======== */}
      {/* Sección donde el usuario ve lo que está ingresando */}
      <View style={s.inputSection}>
        
        {/* Etiqueta */}
        <Text style={s.inputLabel}>Valor de la Propina</Text>

        {/* Caja visual del valor */}
        <View style={s.inputBox}>
          
          {/* Si no hay valor, muestra 0.00 */}
          <Text style={s.inputValue}>
            $ {valor === "" ? "0.00" : valor}
          </Text>
        </View>

        {/* Texto que muestra el porcentaje equivalente */}
        <Text style={s.inputHint}>
          Equivale al {pct}% del total
        </Text>
      </View>

      {/* ======== TECLADO NUMÉRICO ======== */}
      {/* Renderizamos las teclas dinámicamente */}
      <View style={s.teclado}>
        {keys.map((k) => (
          <TouchableOpacity
            key={k}
            style={s.tecla}
            onPress={() => presionar(k)} // Ejecuta la función al presionar
            activeOpacity={0.6}
          >
            {/* Si es borrar, se hace más grande */}
            <Text style={[s.teclaText, k === "⌫" && { fontSize: 20 }]}>
              {k}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ======== BOTÓN INFERIOR ======== */}
      {/* Botón para aplicar la propina y regresar a la calculadora */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.btnAplicar}
          activeOpacity={0.88}
          
          // Navega a Calculator enviando la propina calculada
          onPress={() =>
            navigation.navigate("Calculator", {
              propinaMonto: numerico,
            })
          }
        >
          <Text style={s.btnAplicarText}>
            ✓  Aplicar Propina
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ======== ESTILOS ========
const s = StyleSheet.create({

  // Contenedor principal
  safe: { flex: 1, backgroundColor: C.white },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },

  backBtn: { width: 36 },

  backIcon: { fontSize: 22, color: C.darkText },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.darkText,
  },

  // Caja del subtotal
  subtotalBox: {
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 20,
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: C.gray200,
  },

  subtotalLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.gray500,
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  subtotalVal: {
    fontSize: 32,
    fontWeight: "900",
    color: C.darkText,
  },

  // Sección de input
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: C.darkText,
    marginBottom: 8,
  },

  inputBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.primary,
    paddingVertical: 16,
    alignItems: "center",
  },

  inputValue: {
    fontSize: 26,
    fontWeight: "800",
    color: C.primary,
  },

  inputHint: {
    fontSize: 12,
    color: C.gray500,
    textAlign: "center",
    marginTop: 8,
  },

  // Teclado
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
    color: C.darkText,
  },

  // Barra inferior
  bottomBar: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: C.white,
  },

  btnAplicar: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  btnAplicarText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.white,
  },
});