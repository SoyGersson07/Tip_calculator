import { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { obtenerHistorial, eliminarCuenta } from "../storage/historialStorage";
import { obtenerMoneda, obtenerSimboloMoneda } from "../storage/settingsStorage";
import { getColors } from "../config/constants";
import { getAllTranslations } from "../config/languages";
import { useAppContext } from "../context/AppContext";
import { confirmAction } from "../utils/confirmAction";

import commerce from "../assets/commerce.png";
import file from "../assets/file.png";

// Pestañas del filtro temporal de la lista.
const TABS = ["Recientes", "Este Mes"];

/*
 * HISTORIAL_SCREEN.js — Lista completa de cuentas guardadas con filtros Recientes / Este mes y acordeón por día.
 * agruparPorDia: etiqueta HOY/AYER/fecha larga y agrupa items. fmtHora: hora corta en locale es.
 */
/** Agrupa items del historial por etiqueta de día (HOY, AYER o fecha). */
function agruparPorDia(historial) {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  const fmt = (d) => d.toDateString();
  const grupos = {};

  historial.forEach((item) => {
    const fecha = new Date(item.fecha);
    let grupo;

    if (fmt(fecha) === fmt(hoy)) grupo = "HOY";
    else if (fmt(fecha) === fmt(ayer)) grupo = "AYER";
    else {
      grupo = fecha.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      });
    }

    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(item);
  });

  return grupos;
}

/** Formatea solo hora:minutos de un ISO en locale español. */
function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Tab "Historial": lista filtrada por pestañas y tarjetas expandibles por día. */
export default function HistorialScreen() {
  const { temaOscuro, usuario, idioma } = useAppContext();
  const colors = getColors(temaOscuro);
  const tr = useMemo(() => getAllTranslations(idioma), [idioma]);
  const s = getStyles(colors);
  
  const [tabActiva, setTabActiva] = useState("Recientes");
  const [historial, setHistorial] = useState([]);
  const [cuentaExpandida, setCuentaExpandida] = useState(null);
  const [simboloMoneda, setSimboloMoneda] = useState("$");

  const cargarHistorial = useCallback(() => {
    if (!usuario?.id) return;
    obtenerHistorial(usuario.id).then(setHistorial);
  }, [usuario?.id]);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
      obtenerMoneda().then((cod) => {
        setSimboloMoneda(obtenerSimboloMoneda(cod));
      });
    }, [cargarHistorial])
  );

  const fmt = useCallback(
    (val) => `${simboloMoneda}${(parseFloat(val) || 0).toFixed(2)}`,
    [simboloMoneda]
  );

  const historialFiltrado = useMemo(() => {
    const ahora = new Date();
    const treintaDiasAtras = new Date(
      ahora.getTime() - 30 * 24 * 60 * 60 * 1000
    );
    const inicioDelMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    if (tabActiva === "Este Mes") {
      return historial.filter((item) => {
        const fecha = new Date(item.fecha);
        return fecha >= inicioDelMes;
      });
    }
    return historial.filter((item) => {
      const fecha = new Date(item.fecha);
      return fecha >= treintaDiasAtras;
    });
  }, [tabActiva, historial]);

  const grupos = useMemo(
    () => agruparPorDia(historialFiltrado),
    [historialFiltrado]
  );

  const toggleExpandir = useCallback((id) => {
    setCuentaExpandida((prev) => (prev === id ? null : id));
  }, []);

  const solicitarEliminar = useCallback(
    (item) => {
      if (!usuario?.id) return;
      confirmAction({
        title: tr["history_delete"],
        message: tr["history_delete_confirm"],
        cancelText: tr["generic_cancel"],
        confirmText: tr["history_delete"],
        destructive: true,
        onConfirm: async () => {
          try {
            await eliminarCuenta(usuario.id, item.id);
            setCuentaExpandida((prev) => (prev === item.id ? null : prev));
            cargarHistorial();
          } catch {
            Alert.alert(tr["error"], tr["history_delete_error"]);
          }
        },
      });
    },
    [usuario?.id, tr, cargarHistorial]
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={{ width: 36 }} />
        <Text style={s.headerTitle}>Historial de Cuentas</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.tabsRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTabActiva(t)}
            style={s.tabBtn}
          >
            <Text
              style={[
                s.tabText,
                tabActiva === t && s.tabTextActivo,
              ]}
            >
              {t}
            </Text>
            {tabActiva === t && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {historial.length === 0 ? (
          <View style={s.emptyState}>
            <Image source={file} style={{ width: 40, height: 40 }} />
            <Text style={s.emptyTitle}>Sin cuentas aún</Text>
            <Text style={s.emptySub}>Tus cálculos aparecerán aquí</Text>
          </View>
        ) : (
          Object.entries(grupos).map(([grupo, items]) => (
            <View key={grupo}>
              <Text style={s.grupoLabel}>{grupo}</Text>

              {items.map((item) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={[
                      s.card,
                      cuentaExpandida === item.id && s.cardExpanded,
                    ]}
                    onPress={() => toggleExpandir(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={s.iconWrap}>
                      <Image
                        source={commerce}
                        style={{ width: 22, height: 22 }}
                      />
                    </View>

                    <View style={s.cardInfo}>
                      <Text style={s.cardNombre}>{item.nombre}</Text>
                      <Text style={s.cardMeta}>
                        {item.personas} persona{item.personas !== 1 ? "s" : ""}  
                        ·  {fmtHora(item.fecha)}
                      </Text>
                      <Text style={s.cardPropina}>
                        Propina: {fmt(item.propina)} ({item.pct}%)
                      </Text>
                    </View>

                    <View style={s.cardRight}>
                      <Text style={s.cardTotal}>{fmt(item.total)}</Text>
                      <Text
                        style={[
                          s.cardChevron,
                          cuentaExpandida === item.id &&
                            s.cardChevronRotated,
                        ]}
                      >
                        ›
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {cuentaExpandida === item.id && (
                    <View style={s.cardExpandedContent}>
                      <View style={s.divider} />
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Monto Original:</Text>
                        <Text style={s.detailValue}>
                          {fmt(item.total - item.propina)}
                        </Text>
                      </View>
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>
                          Porcentaje Propina:
                        </Text>
                        <Text style={s.detailValue}>{item.pct}%</Text>
                      </View>
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Propina:</Text>
                        <Text
                          style={[
                            s.detailValue,
                            s.detailValueHighlight,
                          ]}
                        >
                          {fmt(item.propina)}
                        </Text>
                      </View>
                      <View style={s.divider} />
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>
                          Total ({item.personas}{" "}
                          {item.personas === 1 ? "persona" : "personas"}
                          ):
                        </Text>
                        <Text style={s.detailTotal}>
                          {fmt(item.total)}
                        </Text>
                      </View>
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Por persona:</Text>
                        <Text
                          style={[
                            s.detailValue,
                            s.detailValueHighlight,
                          ]}
                        >
                          {fmt(item.total / item.personas)}
                        </Text>
                      </View>
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Fecha:</Text>
                        <Text style={s.detailValue}>
                          {new Date(item.fecha).toLocaleDateString(
                            "es-ES",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={s.btnEliminar}
                        onPress={() => solicitarEliminar(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={s.btnEliminarText}>
                          {tr["history_delete"]}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))
        )}

        <Text style={s.footer}>Se muestran los últimos 30 días</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Estilos de la pantalla Historial según `colors`. */
function getStyles(colors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgMain },

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

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.darkText,
  },

  tabsRow: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  tabBtn: {
    marginRight: 24,
    paddingVertical: 12,
    alignItems: "center",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray500,
  },

  tabTextActivo: {
    color: colors.primary,
  },

  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 99,
  },

  scroll: { flex: 1 },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  grupoLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.gray500,
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 8,
  },

  card: {
    backgroundColor: colors.white,
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
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardInfo: { flex: 1 },

  cardNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkText,
    marginBottom: 2,
  },

  cardMeta: {
    fontSize: 12,
    color: colors.gray500,
    marginBottom: 2,
  },

  cardPropina: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },

  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },

  cardTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.darkText,
  },

  cardChevron: {
    fontSize: 18,
    color: colors.gray200,
  },

  cardChevronRotated: {
    transform: [{ rotate: "90deg" }],
  },

  cardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  cardExpandedContent: {
    backgroundColor: colors.white,
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
    backgroundColor: colors.gray100,
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
    color: colors.gray500,
    fontWeight: "500",
  },

  detailValue: {
    fontSize: 13,
    color: colors.darkText,
    fontWeight: "600",
  },

  detailValueHighlight: {
    color: colors.primary,
    fontWeight: "700",
  },

  detailTotal: {
    fontSize: 14,
    color: colors.darkText,
    fontWeight: "800",
  },

  btnEliminar: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.white,
  },

  btnEliminarText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.danger,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: colors.white,
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
    color: colors.darkText,
    marginBottom: 6,
  },

  emptySub: {
    fontSize: 13,
    color: colors.gray500,
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: colors.gray500,
    marginTop: 24,
  },
  });
}
