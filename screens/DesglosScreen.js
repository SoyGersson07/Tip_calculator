// Importamos los módulos necesarios de React Native para construir la interfaz de usuario
import {
  StyleSheet, // Para crear estilos
  Text, // Para mostrar texto
  View, // Contenedor principal
  TouchableOpacity, // Para botones interactivos
  SafeAreaView, // Evita que el contenido se oculte por notches
  ScrollView, // Para contenido desplazable
  Share, // Para compartir el resultado de la cuenta
} from "react-native";

// Paleta de colores constantes para mantener consistencia visual en toda la pantalla
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

// Función auxiliar para formatear números como moneda
// Convierte un número a string con $ y dos decimales (ej: 45.5 -> "$45.50")
function fmt(val) {
  return `$${(parseFloat(val) || 0).toFixed(2)}`;
}

// ======== COMPONENTE PRINCIPAL DESGLOSSCREEN ========
// Pantalla que muestra el desglose detallado de una cuenta con todos los participantes
// Recibe la navegación y los parámetros con los datos de la cuenta desde CalculatorScreen
export default function DesglosScreen({ route, navigation }) {
  // Extraemos los datos que vienen desde la pantalla de calculadora
  // Si no vienen datos, usamos valores por defecto (vacíos/0)
  const {
    participantes = [], // Lista de personas que son parte de la cuenta
    tipPct = 10, // Porcentaje de propina (10% por defecto)
    subtotal = 0, // Total de consumo sin propina
    propina = 0, // Monto total de propina
    totalAPagar = 0, // Monto final a pagar (subtotal + propina)
  } = route?.params || {};

  // ======== LÓGICA DE CÁLCULOS ========
  // Filtramos solo los participantes NO excluidos (que sí pagan)
  const activos = participantes.filter((p) => !p.excluido);
  
  // Calculamos el Total de consumo de los participantes EXCLUIDOS (invitados)
  // Estos participantes no pagan pero sus consumos se reparten entre los activos
  const totalExcluidos = participantes
    .filter((p) => p.excluido) // Solo los excluidos
    .reduce((s, p) => s + (parseFloat(p.consumo) || 0), 0); // Suma de consumos

  // Propina que generan los excluidos, repartida entre los participantes activos
  // Si hay participantes activos, dividimos la propina de excluidos entre ellos
  const propinaExcluidosPorActivo =
    activos.length > 0
      ? (totalExcluidos * (tipPct / 100)) / activos.length
      : 0;
  
  // Consumo de excluidos repartido entre los participantes activos
  const consumoExcluidosPorActivo =
    activos.length > 0 ? totalExcluidos / activos.length : 0;

  // Función para calcular el TOTAL que debe pagar un participante
  // Si es un excluido (invitado), paga 0 (sus gastos se cubren)
  // Si es activo, paga: su consumo + su propina + su parte del consumo de excluidos + su parte de la propina de excluidientos
  function totalParticipante(p) {
    if (p.excluido) return 0; // Los invitados no pagan nada
    const consumo = parseFloat(p.consumo) || 0; // Su consumo individual
    const propinaPropia = consumo * (tipPct / 100); // Propina sobre su consumo
    // Total = consumo + propina propia + su parte del consumo de excluidos + su parte de la propina de excluidos
    return consumo + propinaPropia + consumoExcluidosPorActivo + propinaExcluidosPorActivo;
  }

  // Función para calcular sólo la PROPINA que paga un participante
  // Incluye: propina sobre su consumo + su parte de la propina de los excluidos
  function propinaParticipante(p) {
    const consumo = parseFloat(p.consumo) || 0;
    return consumo * (tipPct / 100) + propinaExcluidosPorActivo;
  }

  // Función para compartir el resultado de la cuenta
  // Usa la API Share de React Native para enviar por WhatsApp, email, etc.
  async function handleCompartir() {
    // Creamos un array de strings con cada participante y su total
    const lines = participantes.map((p) => {
      if (p.excluido) return `${p.nombre} (Invitado): $0.00`; // Invitados muestran $0
      return `${p.nombre}: ${fmt(totalParticipante(p))}`; // Activos muestran su total
    });
    
    // Armamos el mensaje con un formato legible y atractivo
    const texto =
      `🧾 Desglose de cuenta - PropinaPlus\n\n` + // Encabezado
      lines.join("\n") + // Lista de participantes
      `\n\nSubtotal: ${fmt(subtotal)}\nPropina (${tipPct}%): ${fmt(propina)}\nTOTAL: ${fmt(totalAPagar)}`; // Resumen final
    
    // Abrimos el diálogo de compartir del dispositivo
    await Share.share({ message: texto });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ======== HEADER ======== */}
      <View style={styles.header}>
        {/* Botón para volver atrás */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        {/* Título de la pantalla */}
        <Text style={styles.headerTitle}>Desglose</Text>
        {/* Espacio vacío para centrar el título */}
        <View style={{ width: 36 }} />
      </View>

      {/* ======== CONTENIDO PRINCIPAL (SCROLLABLE) ======== */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false} // Oculta barra de scroll
      >
        {/* TÍTULO: PARTICIPANTES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>PARTICIPANTES</Text>
          {/* Badge que muestra cuántas personas están en la cuenta */}
          <View style={styles.personasBadge}>
            <Text style={styles.personasBadgeText}>
              {participantes.length} Persona{participantes.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* LISTADO DE PARTICIPANTES - Mostramos cada persona con su desglose */}
        {participantes.map((p) => {
          // Determinamos si es un invitado (excluido)
          const esInvitado = p.excluido;
          return (
            <View
              key={p.id}
              style={[
                styles.personaCard,
                // Si es invitado, usamos estilos diferentes (fondo gris, borde punteado)
                esInvitado && styles.personaCardInvitado
              ]}
            >
              {/* PARTE SUPERIOR: Nombre + Total a pagar */}
              <View style={styles.personaTop}>
                {/* Nombre de la persona */}
                <View style={styles.personaNombreRow}>
                  <Text
                    style={[
                      styles.personaNombre,
                      // Si es invitado, su nombre se muestra en gris
                      esInvitado && styles.personaNombreInvitado,
                    ]}
                  >
                    {p.nombre}
                  </Text>
                  {/* Badge "INVITADO" solo para excluidos */}
                  {esInvitado && (
                    <View style={styles.invitadoBadge}>
                      <Text style={styles.invitadoBadgeText}>INVITADO</Text>
                    </View>
                  )}
                </View>

                {/* TOTAL QUE PAGA ESTA PERSONA */}
                <Text
                  style={[
                    styles.personaTotal,
                    // Si es invitado, el total se muestra en gris
                    esInvitado && styles.personaTotalInvitado,
                  ]}
                >
                  {fmt(totalParticipante(p))}
                </Text>
              </View>

              {/* PARTE INFERIOR: Detalle del desglose (consumo + propina) */}
              {esInvitado ? (
                // Para invitados: mostrar mensaje explicativo
                <Text style={styles.invitadoSub}>Consumo cubierto por el grupo</Text>
              ) : (
                // Para participantes activos: mostrar consumo y propina
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

        {/* TARJETA FINAL: Resumen de la cuenta completa */}
        <View style={styles.totalCard}>
          {/* Marca de agua decorativa de fondo */}
          <Text style={styles.totalCardWatermark}>$</Text>

          {/* Título */}
          <Text style={styles.totalCardLabel}>TOTAL FINAL DE LA CUENTA</Text>
          
          {/* Monto total con descripción */}
          <View style={styles.totalCardAmountRow}>
            <Text style={styles.totalCardAmount}>{fmt(totalAPagar)}</Text>
            <Text style={styles.totalCardSub}> (Incluye propina total)</Text>
          </View>

          {/* Línea divisoria */}
          <View style={styles.totalCardDivider} />

          {/* PIE: Desglose del cálculo (subtotal + propina individual) */}
          <View style={styles.totalCardFooter}>
            <Text style={styles.totalCardFooterText}>
              Subtotal: {fmt(subtotal)}
            </Text>
            <Text style={styles.totalCardFooterText}>
              Propina ({tipPct}%): {fmt(propina)}
            </Text>
          </View>
        </View>

        {/* Espacio en blanco para que el contenido no quede debajo del botón */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ======== BOTÓN FLOTANTE INFERIOR ======== */}
      <View style={styles.bottomBar}>
        {/* Botón para compartir el resultado de la cuenta */}
        <TouchableOpacity
          style={styles.btnCompartir}
          onPress={handleCompartir} // Activa la función de compartir
          activeOpacity={0.88} // Efecto visual al presionar
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