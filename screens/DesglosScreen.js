import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Share,
} from "react-native";
import { useCallback, useState, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  obtenerRedondeo,
  aplicarRedondeo,
  obtenerMoneda,
  obtenerSimboloMoneda,
} from "../settingsStorage";
import { Colors } from "../constants";

export default function DesglosScreen({ route, navigation }) {
  const [redondeoActivo, setRedondeoActivo] = useState(true);
  const [simboloMoneda, setSimboloMoneda] = useState("$");

  useFocusEffect(
    useCallback(() => {
      obtenerRedondeo().then(setRedondeoActivo);
      obtenerMoneda().then((cod) => {
        setSimboloMoneda(obtenerSimboloMoneda(cod));
      });
    }, [])
  );

  const fmt = useCallback(
    (val) => `${simboloMoneda}${(parseFloat(val) || 0).toFixed(2)}`,
    [simboloMoneda]
  );

  const {
    participantes = [],
    subtotal = 0,
    propina = 0,
    totalAPagar = 0,
    propinaPorPersona = 0,
    pctDelConsumo = 10,
  } = route?.params || {};

  const activos = useMemo(
    () => participantes.filter((p) => !p.excluido),
    [participantes]
  );

  const totalExcluidos = useMemo(
    () =>
      participantes
        .filter((p) => p.excluido)
        .reduce((s, p) => s + (parseFloat(p.consumo) || 0), 0),
    [participantes]
  );

  const consumoExcluidosPorActivo = useMemo(
    () => (activos.length > 0 ? totalExcluidos / activos.length : 0),
    [totalExcluidos, activos]
  );

  const propinaRedondeada = useMemo(
    () => aplicarRedondeo(propina, redondeoActivo),
    [propina, redondeoActivo]
  );

  const propinaPorPersonaRedondeada = useMemo(
    () => aplicarRedondeo(propinaPorPersona, redondeoActivo),
    [propinaPorPersona, redondeoActivo]
  );

  const subtotalRedondeado = useMemo(
    () => aplicarRedondeo(subtotal, redondeoActivo),
    [subtotal, redondeoActivo]
  );

  const totalAPagarRedondeado = useMemo(
    () => aplicarRedondeo(totalAPagar, redondeoActivo),
    [totalAPagar, redondeoActivo]
  );

  const totalParticipante = useCallback(
    (p) => {
      if (p.excluido) return 0;
      const consumo = parseFloat(p.consumo) ||  0;
      return aplicarRedondeo(
        consumo +
          consumoExcluidosPorActivo +
          propinaPorPersonaRedondeada,
        redondeoActivo
      );
    },
    [consumoExcluidosPorActivo, propinaPorPersonaRedondeada, redondeoActivo]
  );

  const propinaParticipante = useCallback(
    (p) => (p.excluido ? 0 : propinaPorPersonaRedondeada),
    [propinaPorPersonaRedondeada]
  );

  const handleCompartir = useCallback(async () => {
    const lines = participantes.map((p) => {
      if (p.excluido) return `${p.nombre} (Invitado): $0.00`;
      return `${p.nombre}: ${fmt(totalParticipante(p))}`;
    });

    const texto =
      `🧾 Desglose de cuenta - PropinaPlus\n\n` +
      lines.join("\n") +
      `\n\nSubtotal: ${fmt(subtotalRedondeado)}\nPropina (${pctDelConsumo}%): ${fmt(
        propinaRedondeada
      )}\nTOTAL: ${fmt(totalAPagarRedondeado)}`;

    await Share.share({ message: texto });
  }, [participantes, fmt, totalParticipante, subtotalRedondeado, pctDelConsumo, propinaRedondeada, totalAPagarRedondeado]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Desglose</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>PARTICIPANTES</Text>
          <View style={styles.personasBadge}>
            <Text style={styles.personasBadgeText}>
              {participantes.length} Persona
              {participantes.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {participantes.map((p) => {
          const esInvitado = p.excluido;
          return (
            <View
              key={p.id}
              style={[
                styles.personaCard,
                esInvitado && styles.personaCardInvitado,
              ]}
            >
              <View style={styles.personaTop}>
                <View style={styles.personaNombreRow}>
                  <Text
                    style={[
                      styles.personaNombre,
                      esInvitado && styles.personaNombreInvitado,
                    ]}
                  >
                    {p.nombre}
                  </Text>
                  {esInvitado && (
                    <View style={styles.invitadoBadge}>
                      <Text style={styles.invitadoBadgeText}>INVITADO</Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.personaTotal,
                    esInvitado && styles.personaTotalInvitado,
                  ]}
                >
                  {fmt(totalParticipante(p))}
                </Text>
              </View>

              {esInvitado ? (
                <Text style={styles.invitadoSub}>
                  Consumo cubierto por el grupo
                </Text>
              ) : (
                <View style={styles.personaDetalle}>
                  <Text style={styles.personaConsumo}>
                    Consumo: {fmt(parseFloat(p.consumo) || 0)}
                  </Text>
                  <Text style={styles.personaPropina}>
                    + Propina: {fmt(propinaParticipante(p))}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.totalCard}>
          <Text style={styles.totalCardWatermark}>$</Text>

          <Text style={styles.totalCardLabel}>TOTAL FINAL DE LA CUENTA</Text>

          <View style={styles.totalCardAmountRow}>
            <Text style={styles.totalCardAmount}>
              {fmt(totalAPagarRedondeado)}
            </Text>
            <Text style={styles.totalCardSub}> (Incluye propina total)</Text>
          </View>

          <View style={styles.totalCardDivider} />

          <View style={styles.totalCardFooter}>
            <Text style={styles.totalCardFooterText}>
              Subtotal: {fmt(subtotalRedondeado)}
            </Text>
            <Text style={styles.totalCardFooterText}>
              Propina ({pctDelConsumo}%): {fmt(propinaRedondeada)}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.btnCompartir}
          onPress={handleCompartir}
          activeOpacity={0.88}
        >
          <Text style={styles.btnCompartirIcon}>⇪</Text>
          <Text style={styles.btnCompartirText}>Compartir Resultado</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  backBtn: { width: 36 },
  backIcon: { fontSize: 22, color: Colors.darkText },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.darkText,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.gray500,
    letterSpacing: 1.5,
  },
  personasBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  personasBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },

  personaCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  personaCardInvitado: {
    backgroundColor: Colors.gray100,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderStyle: "dashed",
    shadowOpacity: 0,
    elevation: 0,
  },
  personaTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  personaNombreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  personaNombre: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.darkText,
  },
  personaNombreInvitado: {
    color: Colors.gray500,
  },
  invitadoBadge: {
    backgroundColor: "#EFEFEF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  invitadoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.gray500,
    letterSpacing: 0.5,
  },
  personaTotal: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.primary,
  },
  personaTotalInvitado: {
    color: Colors.gray500,
  },
  personaDetalle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  personaConsumo: {
    fontSize: 13,
    color: Colors.gray500,
  },
  personaPropina: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  invitadoSub: {
    fontSize: 13,
    color: Colors.gray500,
    fontStyle: "italic",
  },

  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  totalCardWatermark: {
    position: "absolute",
    right: -10,
    bottom: -20,
    fontSize: 140,
    fontWeight: "900",
    color: "rgba(255,255,255,0.08)",
  },
  totalCardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  totalCardAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  totalCardAmount: {
    fontSize: 48,
    fontWeight: "900",
    color: Colors.white,
    lineHeight: 54,
  },
  totalCardSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    marginLeft: 4,
  },
  totalCardDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 14,
  },
  totalCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalCardFooterText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: "rgba(246,244,240,0.97)",
  },
  btnCompartir: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnCompartirIcon: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: "800",
  },
  btnCompartirText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.3,
  },
});