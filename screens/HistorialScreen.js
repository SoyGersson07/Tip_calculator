import { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { obtenerHistorial } from "../historialStorage";
import { obtenerMoneda, obtenerSimboloMoneda } from "../settingsStorage";
import { Colors } from "../constants";

import commerce from "../assets/commerce.png";

const TABS = ["Recientes", "Este Mes"];

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

function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistorialScreen() {
  const [tabActiva, setTabActiva] = useState("Recientes");
  const [historial, setHistorial] = useState([]);
  const [cuentaExpandida, setCuentaExpandida] = useState(null);
  const [simboloMoneda, setSimboloMoneda] = useState("$");

  useFocusEffect(
    useCallback(() => {
      obtenerHistorial().then(setHistorial);
      obtenerMoneda().then((cod) => {
        setSimboloMoneda(obtenerSimboloMoneda(cod));
      });
    }, [])
  );

  const fmt = useCallback(
    (val) => `${simboloMoneda}${(parseFloat(val) || 0).toFixed(2)}`,
    [simboloMoneda]
  );

  const ahora = useMemo(() => new Date(), []);
  const treintaDiasAtras = useMemo(
    () => new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000),
    [ahora]
  );
  const inicioDelMes = useMemo(
    () => new Date(ahora.getFullYear(), ahora.getMonth(), 1),
    [ahora]
  );

  const historialFiltrado = useMemo(() => {
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
  }, [tabActiva, historial, inicioDelMes, treintaDiasAtras]);

  const grupos = useMemo(
    () => agruparPorDia(historialFiltrado),
    [historialFiltrado]
  );

  const toggleExpandir = useCallback((id) => {
    setCuentaExpandida((prev) => (prev === id ? null : id));
  }, []);

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
            <Text style={s.emptyIcon}>🧾</Text>
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgMain },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.darkText,
  },

  tabsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },

  tabBtn: {
    marginRight: 24,
    paddingVertical: 12,
    alignItems: "center",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray500,
  },

  tabTextActivo: {
    color: Colors.primary,
  },

  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
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
    color: Colors.gray500,
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 8,
  },

  card: {
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardInfo: { flex: 1 },

  cardNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.darkText,
    marginBottom: 2,
  },

  cardMeta: {
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: 2,
  },

  cardPropina: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },

  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },

  cardTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.darkText,
  },

  cardChevron: {
    fontSize: 18,
    color: Colors.gray200,
  },

  cardChevronRotated: {
    transform: [{ rotate: "90deg" }],
  },

  cardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  cardExpandedContent: {
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.gray100,
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
    color: Colors.gray500,
    fontWeight: "500",
  },

  detailValue: {
    fontSize: 13,
    color: Colors.darkText,
    fontWeight: "600",
  },

  detailValueHighlight: {
    color: Colors.primary,
    fontWeight: "700",
  },

  detailTotal: {
    fontSize: 14,
    color: Colors.darkText,
    fontWeight: "800",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: Colors.white,
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
    color: Colors.darkText,
    marginBottom: 6,
  },

  emptySub: {
    fontSize: 13,
    color: Colors.gray500,
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 24,
  },
});