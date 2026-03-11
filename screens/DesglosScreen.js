import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Share,
} from "react-native";

const C = {
  primary: "#E2725B",
  primaryLight: "#FDF0ED",
  primaryBg: "#E2725B",
  bgMain: "#F6F4F0",
  white: "#FFFFFF",
  darkText: "#1C1C1E",
  gray500: "#8E8E93",
  gray200: "#E5E5EA",
  gray100: "#F2F2F7",
  invitadoBg: "#EFEFEF",
  invitadoText: "#8E8E93",
};

function fmt(val) {
  return `$${(parseFloat(val) || 0).toFixed(2)}`;
}

export default function DesglosScreen({ route, navigation }) {
  // Los datos llegan desde calculator.js via navigation.navigate("Desglose", { ... })
  const {
    participantes = [],
    tipPct = 10,
    subtotal = 0,
    propina = 0,
    totalAPagar = 0,
  } = route?.params || {};

  const activos = participantes.filter((p) => !p.excluido);
  const totalExcluidos = participantes
    .filter((p) => p.excluido)
    .reduce((s, p) => s + (parseFloat(p.consumo) || 0), 0);

  // Propina que cubre el consumo de excluidos, repartida entre activos
  const propinaExcluidosPorActivo =
    activos.length > 0
      ? (totalExcluidos * (tipPct / 100)) / activos.length
      : 0;
  const consumoExcluidosPorActivo =
    activos.length > 0 ? totalExcluidos / activos.length : 0;

  function totalParticipante(p) {
    if (p.excluido) return 0;
    const consumo = parseFloat(p.consumo) || 0;
    const propinaPropia = consumo * (tipPct / 100);
    return consumo + propinaPropia + consumoExcluidosPorActivo + propinaExcluidosPorActivo;
  }

  function propinaParticipante(p) {
    const consumo = parseFloat(p.consumo) || 0;
    return consumo * (tipPct / 100) + propinaExcluidosPorActivo;
  }

  async function handleCompartir() {
    const lines = participantes.map((p) => {
      if (p.excluido) return `${p.nombre} (Invitado): $0.00`;
      return `${p.nombre}: ${fmt(totalParticipante(p))}`;
    });
    const texto =
      `🧾 Desglose de cuenta - PropinaPlus\n\n` +
      lines.join("\n") +
      `\n\nSubtotal: ${fmt(subtotal)}\nPropina (${tipPct}%): ${fmt(propina)}\nTOTAL: ${fmt(totalAPagar)}`;
    await Share.share({ message: texto });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
        {/* Sección participantes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>PARTICIPANTES</Text>
          <View style={styles.personasBadge}>
            <Text style={styles.personasBadgeText}>
              {participantes.length} Persona{participantes.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Cards de cada participante */}
        {participantes.map((p) => {
          const esInvitado = p.excluido;
          return (
            <View
              key={p.id}
              style={[styles.personaCard, esInvitado && styles.personaCardInvitado]}
            >
              <View style={styles.personaTop}>
                {/* Nombre */}
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

                {/* Total */}
                <Text
                  style={[
                    styles.personaTotal,
                    esInvitado && styles.personaTotalInvitado,
                  ]}
                >
                  {fmt(totalParticipante(p))}
                </Text>
              </View>

              {/* Detalle */}
              {esInvitado ? (
                <Text style={styles.invitadoSub}>Consumo cubierto por el grupo</Text>
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

        {/* Total final */}
        <View style={styles.totalCard}>
          {/* Marca de agua decorativa */}
          <Text style={styles.totalCardWatermark}>$</Text>

          <Text style={styles.totalCardLabel}>TOTAL FINAL DE LA CUENTA</Text>
          <View style={styles.totalCardAmountRow}>
            <Text style={styles.totalCardAmount}>{fmt(totalAPagar)}</Text>
            <Text style={styles.totalCardSub}> (Incluye propina total)</Text>
          </View>

          <View style={styles.totalCardDivider} />

          <View style={styles.totalCardFooter}>
            <Text style={styles.totalCardFooterText}>
              Subtotal: {fmt(subtotal)}
            </Text>
            <Text style={styles.totalCardFooterText}>
              Propina ({tipPct}%): {fmt(propina)}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón compartir */}
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
  backBtn: { width: 36 },
  backIcon: { fontSize: 22, color: C.darkText },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.darkText,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20 },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.gray500,
    letterSpacing: 1.5,
  },
  personasBadge: {
    backgroundColor: C.primaryLight,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  personasBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.primary,
  },

  // Persona card
  personaCard: {
    backgroundColor: C.white,
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
    backgroundColor: C.gray100,
    borderWidth: 1.5,
    borderColor: C.gray200,
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
    color: C.darkText,
  },
  personaNombreInvitado: {
    color: C.gray500,
  },
  invitadoBadge: {
    backgroundColor: C.invitadoBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  invitadoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: C.gray500,
    letterSpacing: 0.5,
  },
  personaTotal: {
    fontSize: 20,
    fontWeight: "900",
    color: C.primary,
  },
  personaTotalInvitado: {
    color: C.gray500,
  },
  personaDetalle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  personaConsumo: {
    fontSize: 13,
    color: C.gray500,
  },
  personaPropina: {
    fontSize: 13,
    fontWeight: "600",
    color: C.primary,
  },
  invitadoSub: {
    fontSize: 13,
    color: C.gray500,
    fontStyle: "italic",
  },

  // Total card
  totalCard: {
    backgroundColor: C.primary,
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: C.primary,
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
    color: C.white,
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

  // Bottom bar
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
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnCompartirIcon: {
    fontSize: 18,
    color: C.white,
    fontWeight: "800",
  },
  btnCompartirText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.white,
    letterSpacing: 0.3,
  },
});