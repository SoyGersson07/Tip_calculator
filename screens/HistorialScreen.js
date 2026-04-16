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
const TABS = ["Recientes", "Este Mes", "Favoritos"];


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

  // Estado para activar/desactivar modo de edición (para eliminar)
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado que guarda los IDs de cuentas seleccionadas para eliminar
  const [seleccionados, setSeleccionados] = useState(new Set());

  // ======== EFECTO CUANDO LA PANTALLA SE ABRE ========
  // Se ejecuta cada vez que el usuario entra a esta pantalla
  useFocusEffect(
    useCallback(() => {
      // Cargamos el historial desde almacenamiento
      obtenerHistorial().then(setHistorial);
      // Al entrar a la pantalla, salimos del modo edición
      setModoEdicion(false);
      setSeleccionados(new Set());
    }, [])
  );

  // ======== FUNCIONES DE ELIMINACIÓN ========

  // Alternar selección de una cuenta
  function toggleSeleccion(id) {
    const nuevo = new Set(seleccionados);
    if (nuevo.has(id)) {
      nuevo.delete(id);
    } else {
      nuevo.add(id);
    }
    setSeleccionados(nuevo);
  }

  // Eliminar cuentas seleccionadas
  async function confirmarEliminar() {
    if (seleccionados.size === 0) return;

    const n = seleccionados.size;
    const idsArray = Array.from(seleccionados);

    Alert.alert(
      "Eliminar cuenta" + (n > 1 ? "s" : ""),
      `¿Está seguro de que desea eliminar ${n} cuenta${n > 1 ? "s" : ""}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              console.log("=== INICIANDO ELIMINACIÓN ===");
              console.log("IDs a eliminar:", idsArray);
              
              // Eliminar cada cuenta seleccionada
              for (const id of idsArray) {
                await eliminarCuenta(id);
              }
              
              // Pequeña espera para sincronizar AsyncStorage
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Recargar historial
              const nuevo = await obtenerHistorial();
              console.log("=== ELIMINACIÓN COMPLETADA ===");
              console.log("Historial actual:", nuevo.length, "cuentas");
              
              // Actualizar estado
              setHistorial(nuevo);
              setSeleccionados(new Set());
              setModoEdicion(false);
              
              // Mostrar mensaje de éxito
              if (nuevo.length === 0) {
                Alert.alert("✓ Éxito", `Se eliminar ${n} cuenta${n > 1 ? "s" : ""}. Historial vacío.`);
              } else {
                Alert.alert("✓ Éxito", `Se eliminar ${n} cuenta${n > 1 ? "s" : ""}. Quedan ${nuevo.length} cuentas.`);
              }
            } catch (error) {
              console.error("✗ Error:", error);
              Alert.alert("Error", "No se pudo eliminar las cuentas");
            }
          },
          style: "destructive",
        },
      ]
    );
  }

  // Limpiar todo el historial
  function confirmarLimpiarTodo() {
    Alert.alert(
      "Limpiar historial",
      "¿Está seguro de que desea eliminar TODAS las cuentas? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: "Eliminar Todo",
          onPress: async () => {
            try {
              console.log("=== LIMPIANDO TODO EL HISTORIAL ===");
              await limpiarHistorial();
              
              // Pequeña espera
              await new Promise(resolve => setTimeout(resolve, 500));
              
              console.log("=== HISTORIAL LIMPIADO ===");
              setHistorial([]);
              setSeleccionados(new Set());
              setModoEdicion(false);
            } catch (error) {
              console.error("✗ Error limpiando:", error);
              Alert.alert("Error", "No se pudo limpiar el historial");
            }
          },
          style: "destructive",
        },
      ]
    );
  }

  // Seleccionar todas las cuentas
  function seleccionarTodas() {
    if (seleccionados.size === historial.length) {
      // Si ya están todas seleccionadas, deseleccionar todas
      setSeleccionados(new Set());
    } else {
      // Seleccionar todas
      console.log("Seleccionando todas. Historial:", historial.length, "cuentas");
      console.log("IDs disponibles:", historial.map(h => h.id));
      
      const ids = new Set(historial.map((item) => item.id));
      setSeleccionados(ids);
    }
  }

  // Agrupamos el historial por día
  const grupos = agruparPorDia(historial);


  // ======== UI ========
  return (
    <SafeAreaView style={s.safe}>

      {/* ======== HEADER ======== */}
      <View style={s.header}>
        
        {/* Espacio vacío para centrar el título */}
        <View style={{ width: 36 }} />

        {/* Título */}
        <Text style={s.headerTitle}>Historial de Cuentas</Text>

        {/* Botón de edición/cancelar según modo */}
        {historial.length > 0 && (
          <TouchableOpacity
            style={s.filterBtn}
            onPress={() => {
              setModoEdicion(!modoEdicion);
              setSeleccionados(new Set());
            }}
          >
            <Text style={s.filterIcon}>{modoEdicion ? "✕" : "···"}</Text>
          </TouchableOpacity>
        )}
        {historial.length === 0 && <View style={{ width: 36 }} />}
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
                <TouchableOpacity
                  key={item.id}
                  style={[
                    s.card,
                    modoEdicion && seleccionados.has(item.id) && s.cardSeleccionada,
                  ]}
                  onPress={() => {
                    if (modoEdicion) {
                      toggleSeleccion(item.id);
                    }
                  }}
                  activeOpacity={modoEdicion ? 0.7 : 1}
                >
                  {/* Checkbox si estamos en modo edición */}
                  {modoEdicion && (
                    <View style={s.checkboxWrap}>
                      <View
                        style={[
                          s.checkbox,
                          seleccionados.has(item.id) && s.checkboxChecked,
                        ]}
                      >
                        {seleccionados.has(item.id) && (
                          <Text style={s.checkboxCheck}>✓</Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Ícono */}
                  {!modoEdicion && (
                    <View style={s.iconWrap}>
                      <Image source={commerce} style={{ width: 22, height: 22 }} />
                    </View>
                  )}

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
                  {!modoEdicion && (
                    <View style={s.cardRight}>
                      
                      {/* Total */}
                      <Text style={s.cardTotal}>
                        ${item.total.toFixed(2)}
                      </Text>

                      {/* Flecha */}
                      <Text style={s.cardChevron}>›</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}

        {/* Footer */}
        <Text style={s.footer}>
          Se muestran los últimos 30 días
        </Text>

      </ScrollView>

      {/* ======== BARRA DE ACCIONES (CUANDO ESTÁ EN MODO EDICIÓN) ======== */}
      {modoEdicion && historial.length > 0 && (
        <View style={s.actionBar}>
          {/* Título con contador */}
          <View style={s.actionBarLeft}>
            <Text style={s.actionBarTitle}>
              {seleccionados.size} de {historial.length}
            </Text>
          </View>

          {/* Botones de acción */}
          <View style={s.actionBarRight}>
            {/* Botón: Seleccionar Todo */}
            <TouchableOpacity
              style={s.actionBtn}
              onPress={seleccionarTodas}
              activeOpacity={0.7}
            >
              <Text style={s.actionBtnText}>
                {seleccionados.size === historial.length ? "Deseleccionar" : "Seleccionar Todo"}
              </Text>
            </TouchableOpacity>

            {/* Botón: Limpiar Todo */}
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnDanger]}
              onPress={confirmarLimpiarTodo}
              activeOpacity={0.7}
            >
              <Text style={s.actionBtnDangerText}>Limpiar Todo</Text>
            </TouchableOpacity>

            {/* Botón: Eliminar Seleccionados */}
            <TouchableOpacity
              style={[
                s.actionBtn,
                s.actionBtnDanger,
                seleccionados.size === 0 && s.actionBtnDisabled,
              ]}
              onPress={confirmarEliminar}
              activeOpacity={0.7}
              disabled={seleccionados.size === 0}
            >
              <Text
                style={[
                  s.actionBtnDangerText,
                  seleccionados.size === 0 && s.actionBtnDisabledText,
                ]}
              >
                Eliminar ({seleccionados.size})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  checkboxWrap: {
    marginRight: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.gray200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.white,
  },
  checkboxChecked: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  checkboxCheck: {
    color: C.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // Card seleccionada
  cardSeleccionada: {
    backgroundColor: "#FDF0ED",
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
  },

  // Action bar (barra inferior con botones)
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    gap: 8,
  },
  actionBarLeft: {
    flex: 1,
  },
  actionBarTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.darkText,
  },
  actionBarRight: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: C.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.primary,
  },
  actionBtnDanger: {
    backgroundColor: "#FFE5E0",
  },
  actionBtnDangerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF3B30",
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnDisabledText: {
    color: C.gray500,
  },
});