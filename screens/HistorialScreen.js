// Importamos hooks de React:
// useState → para manejar estados
// useCallback → para optimizar funciones y evitar renders innecesarios
import { useState, useCallback } from "react";

// Importamos componentes de React Native para construir la interfaz
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, ScrollView, Image, Alert,
} from "react-native";

// Hook de navegación que permite ejecutar código cuando la pantalla entra en foco
import { useFocusEffect } from "@react-navigation/native";

// Función para obtener el historial guardado
import { obtenerHistorial, eliminarCuenta, limpiarHistorial } from "../historialStorage";

// Importamos imágenes que se usan en la UI
import commerce from "../assets/commerce.png";
import charity from "../assets/charity.png";

// Constante de colores para mantener consistencia visual
const C = {
  primary: "#E2725B",
  primaryLight: "#FDF0ED",
  bgMain: "#F6F4F0",
  white: "#FFFFFF",
  darkText: "#1C1C1E",
  gray500: "#8E8E93",
  gray200: "#E5E5EA",
  gray100: "#F2F2F7",
};

// Tabs disponibles en la parte superior
const TABS = ["Recientes", "Este Mes"];


// ======== FUNCIÓN: AGRUPAR HISTORIAL POR DÍA ========
// Organiza las cuentas en grupos como HOY, AYER o por fecha
function agruparPorDia(historial) {

  const hoy = new Date();     // Fecha actual
  const ayer = new Date();    // Fecha de ayer
  ayer.setDate(ayer.getDate() - 1);

  // Función para comparar fechas en formato simple
  const fmt = (d) => d.toDateString();

  const grupos = {}; // Objeto donde se almacenarán los grupos

  // Recorremos cada elemento del historial
  historial.forEach((item) => {
    const fecha = new Date(item.fecha);
    let grupo;

    // Clasificamos según el día
    if (fmt(fecha) === fmt(hoy)) grupo = "HOY";
    else if (fmt(fecha) === fmt(ayer)) grupo = "AYER";
    else {
      // Si no es hoy ni ayer, mostramos fecha normal (ej: 5 abril)
      grupo = fecha.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long"
      });
    }

    // Si el grupo no existe, lo creamos
    if (!grupos[grupo]) grupos[grupo] = [];

    // Agregamos el item al grupo correspondiente
    grupos[grupo].push(item);
  });

  return grupos;
}


// ======== FUNCIÓN: FORMATEAR HORA ========
// Convierte fecha ISO a formato de hora (ej: 14:30)
function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
}


// ======== COMPONENTE PRINCIPAL ========
export default function HistorialScreen() {

  // Estado para saber qué tab está activa
  const [tabActiva, setTabActiva] = useState("Recientes");

  // Estado que guarda el historial de cuentas
  const [historial, setHistorial] = useState([]);

  // Estado que guarda el ID de la cuenta expandida
  const [cuentaExpandida, setCuentaExpandida] = useState(null);

  // ======== EFECTO CUANDO LA PANTALLA SE ABRE ========
  // Se ejecuta cada vez que el usuario entra a esta pantalla
  useFocusEffect(
    useCallback(() => {
      // Cargamos el historial desde almacenamiento
      obtenerHistorial().then(setHistorial);
    }, [])
  );

  // ======== FUNCIONES ========
  
  const ahora = new Date();
  const treintaDiasAtras = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
  const inicioDelMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  let historialFiltrado;

  if (tabActiva === "Este Mes") {
    historialFiltrado = historial.filter((item) => {
      const fecha = new Date(item.fecha);
      return fecha >= inicioDelMes;
    });
  } else {
    // "Recientes" (últimos 30 días)
    historialFiltrado = historial.filter((item) => {
      const fecha = new Date(item.fecha);
      return fecha >= treintaDiasAtras;
    });
  }

  // Agrupar el historial filtrado por día
  const grupos = agruparPorDia(historialFiltrado);

  // Función para alternar expansión de una cuenta
  function toggleExpandir(id) {
    setCuentaExpandida(cuentaExpandida === id ? null : id);
  }


  // ======== UI ========
  return (
    <SafeAreaView style={s.safe}>

      {/* ======== HEADER ======== */}
      <View style={s.header}>
        
        {/* Espacio vacío para centrar el título */}
        <View style={{ width: 36 }} />

        {/* Título */}
        <Text style={s.headerTitle}>Historial de Cuentas</Text>

        {/* Espacio vacío derecho */}
        <View style={{ width: 36 }} />
      </View>


      {/* ======== TABS ======== */}
      <View style={s.tabsRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTabActiva(t)} // Cambia la tab activa
            style={s.tabBtn}
          >
            {/* Texto del tab */}
            <Text style={[
              s.tabText,
              tabActiva === t && s.tabTextActivo // Se resalta si está activa
            ]}>
              {t}
            </Text>

            {/* Línea inferior si está activa */}
            {tabActiva === t && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>


      {/* ======== CONTENIDO SCROLL ======== */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ======== ESTADO VACÍO ======== */}
        {/* Se muestra si no hay historial */}
        {historial.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🧾</Text>
            <Text style={s.emptyTitle}>Sin cuentas aún</Text>
            <Text style={s.emptySub}>Tus cálculos aparecerán aquí</Text>
          </View>

        ) : (

          // ======== LISTA AGRUPADA ========
          Object.entries(grupos).map(([grupo, items]) => (

            <View key={grupo}>

              {/* Nombre del grupo (HOY, AYER, etc) */}
              <Text style={s.grupoLabel}>{grupo}</Text>

              {/* Renderizamos cada item dentro del grupo */}
              {items.map((item) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={[
                      s.card,
                      cuentaExpandida === item.id && s.cardExpanded,
                    ]}
                    onPress={() => {
                      toggleExpandir(item.id);
                    }}
                    activeOpacity={0.7}
                  >
                    {/* Ícono */}
                    <View style={s.iconWrap}>
                      <Image source={commerce} style={{ width: 22, height: 22 }} />
                    </View>

                    {/* Información principal */}
                    <View style={s.cardInfo}>
                      
                      {/* Nombre de la cuenta */}
                      <Text style={s.cardNombre}>{item.nombre}</Text>

                      {/* Meta: personas + hora */}
                      <Text style={s.cardMeta}>
                        {item.personas} persona{item.personas !== 1 ? "s" : ""}  ·  {fmtHora(item.fecha)}
                      </Text>

                      {/* Propina */}
                      <Text style={s.cardPropina}>
                        Propina: ${item.propina.toFixed(2)} ({item.pct}%)
                      </Text>
                    </View>

                    {/* Parte derecha */}
                    <View style={s.cardRight}>
                      
                      {/* Total */}
                      <Text style={s.cardTotal}>
                        ${item.total.toFixed(2)}
                      </Text>

                      {/* Flecha */}
                      <Text style={[
                        s.cardChevron,
                        cuentaExpandida === item.id && s.cardChevronRotated
                      ]}>›</Text>
                    </View>
                  </TouchableOpacity>

                  {/* PANEL EXPANDIDO CON INFORMACIÓN COMPLETA */}
                  {cuentaExpandida === item.id && (
                    <View style={s.cardExpandedContent}>
                      {/* Divider */}
                      <View style={s.divider} />

                      {/* Fila: Monto Original */}
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Monto Original:</Text>
                        <Text style={s.detailValue}>${(item.total - item.propina).toFixed(2)}</Text>
                      </View>

                      {/* Fila: Porcentaje */}
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Porcentaje Propina:</Text>
                        <Text style={s.detailValue}>{item.pct}%</Text>
                      </View>

                      {/* Fila: Propina */}
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Propina:</Text>
                        <Text style={[s.detailValue, s.detailValueHighlight]}>
                          ${item.propina.toFixed(2)}
                        </Text>
                      </View>

                      {/* Divider */}
                      <View style={s.divider} />

                      {/* Fila: Total con personas */}
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Total ({item.personas} {item.personas === 1 ? "persona" : "personas"}):</Text>
                        <Text style={s.detailTotal}>
                          ${item.total.toFixed(2)}
                        </Text>
                      </View>

                      {/* Fila: Por persona */}
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Por persona:</Text>
                        <Text style={[s.detailValue, s.detailValueHighlight]}>
                          ${(item.total / item.personas).toFixed(2)}
                        </Text>
                      </View>

                      {/* Fila: Fecha */}
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Fecha:</Text>
                        <Text style={s.detailValue}>
                          {new Date(item.fecha).toLocaleDateString("es-ES", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))
        )}

        {/* Footer */}
        <Text style={s.footer}>
          Se muestran los últimos 30 días
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}


// ======== ESTILOS ========
const s = StyleSheet.create({

  // Contenedor principal
  safe: { flex: 1, backgroundColor: C.bgMain },

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

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.darkText,
  },

  filterBtn: {
    width: 36,
    alignItems: "flex-end",
  },

  filterIcon: {
    fontSize: 18,
    color: C.gray500,
  },

  // Tabs
  tabsRow: {
    flexDirection: "row",
    backgroundColor: C.white,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },

  tabBtn: {
    marginRight: 24,
    paddingVertical: 12,
    alignItems: "center",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.gray500,
  },

  tabTextActivo: {
    color: C.primary,
  },

  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: C.primary,
    borderRadius: 99,
  },

  // Scroll
  scroll: { flex: 1 },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Grupo
  grupoLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.gray500,
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 8,
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardInfo: { flex: 1 },

  cardNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: C.darkText,
    marginBottom: 2,
  },

  cardMeta: {
    fontSize: 12,
    color: C.gray500,
    marginBottom: 2,
  },

  cardPropina: {
    fontSize: 12,
    fontWeight: "600",
    color: C.primary,
  },

  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },

  cardTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: C.darkText,
  },

  cardChevron: {
    fontSize: 18,
    color: C.gray200,
  },

  cardChevronRotated: {
    transform: [{ rotate: "90deg" }],
  },

  cardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  // Panel expandido
  cardExpandedContent: {
    backgroundColor: C.white,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  divider: {
    height: 1,
    backgroundColor: C.gray100,
    marginVertical: 12,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },

  detailLabel: {
    fontSize: 13,
    color: C.gray500,
    fontWeight: "500",
  },

  detailValue: {
    fontSize: 13,
    color: C.darkText,
    fontWeight: "600",
  },

  detailValueHighlight: {
    color: C.primary,
    fontWeight: "700",
  },

  detailTotal: {
    fontSize: 14,
    color: C.darkText,
    fontWeight: "800",
  },

  // Botón de eliminar individual
  deleteBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#FFE5E0",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF3B30",
  },

  // Estado vacío
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: C.white,
    borderRadius: 18,
    marginTop: 20,
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
  },

  // Footer
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: C.gray500,
    marginTop: 24,
  },

  // Checkbox (modo edición)
});