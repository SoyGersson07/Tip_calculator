// Importamos React y los componentes necesarios de React Native, además de las imágenes que se usarán en la interfaz.
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";

// se importan las imagenes
import web from "../assets/web.png";
import profile from "../assets/profile.png";
import people from "../assets/people.png";
import calculator from "../assets/calculator.png";

// se declaran constates de colores y porcentaje de propina para mantener consistencia y facilitar cambios futuros
const C = {
  primary: "#E2725B",
  primaryLight: "#FDF0ED",
  primaryBg: "#FAE8E3",
  bgMain: "#F6F4F0",
  white: "#FFFFFF",
  darkText: "#1C1C1E",
  gray500: "#8E8E93",
  gray200: "#E5E5EA",
  gray100: "#F2F2F7",
  green: "#34C759",
};

const TIP_PCT = 10; // fijo 10% por ahora

// Se exporta el componente principal de la pantalla de calculadora que recibe la navegación como prop
export default function Calculator({ navigation }) {
  // ======== STATES (Estados) ========
  // Lista de participantes que se va a mostrar en la pantalla
  // Cada participante tiene: id (único), nombre, consumo, y si está excluido o no
  const [participantes, setParticipantes] = useState([
    { id: 1, nombre: "Tú", consumo: "", excluido: false }, // El primer participante siempre eres tú
  ]);
  // Controla si el modal de "Añadir participante" está visible o no
  const [modalVisible, setModalVisible] = useState(false);
  // Nombre del nuevo participante que se está escribiendo en el modal
  const [newNombre, setNewNombre] = useState("");
  // Consumo del nuevo participante que se está escribiendo en el modal
  const [newConsumo, setNewConsumo] = useState("");

  // ── Cálculos ──────────────────────────────────────────────────────────────

  // Se declara variable para participantes activos en el pago, para calcular su consumo total y propina a repartir entre ellos
  const activos = participantes.filter((p) => !p.excluido); 

  // Se declara variable para participantes excluidos del pago, por si queremos mostrar su consumo total o propina aparte (opcional)
  const excluidos = participantes.filter((p) => p.excluido);


  // El subtotal se calcula solo sobre participantes activos, ya que los excluidos no aportan al total a pagar ni a la propina.
  const subtotal = activos.reduce(
    (sum, p) => sum + (parseFloat(p.consumo) || 0),
    0
  );
  // El total de consumo de excluidos se calcula aparte por si queremos mostrarlo o usarlo para cálculos adicionales, pero no se suma al subtotal ni a la base de propina, ya que su consumo no aporta al total a pagar ni a la propina.
  const totalExcluidos = excluidos.reduce(
    (sum, p) => sum + (parseFloat(p.consumo) || 0),
    0
  );

  // La propina se calcula sobre TODO (activos + excluidos)
  const totalConsumo = subtotal + totalExcluidos;
  const propina = totalConsumo * (TIP_PCT / 100);
  const totalAPagar = totalConsumo + propina;

  // Propina a repartir entre activos = propina sobre excluidos + propina propia
  // Simplificado: total a pagar / activos.length
  const propinaPorPersona =
    activos.length > 0 ? totalAPagar / activos.length : 0; 

  const pctDelConsumo =
    subtotal > 0 ? ((propinaPorPersona / subtotal) * 100).toFixed(1) : 0;

  // ── Acciones ──────────────────────────────────────────────────────────────

  // Función para alternar si un participante está excluido o no del pago, lo que afecta su inclusión en el cálculo de subtotal, propina y total a pagar.
  function toggleExcluido(id) {
    setParticipantes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, excluido: !p.excluido } : p))
    );
  }

  // Función para actualizar el consumo de un participante específico, lo que afecta el cálculo del subtotal, propina y total a pagar.
  function actualizarConsumo(id, val) {
    setParticipantes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, consumo: val } : p))
    );
  }
  
  // Función para agregar un nuevo participante a la lista, con su nombre y consumo inicial. El nuevo participante se agrega al final de la lista y se cierra el modal de entrada.
  function agregarParticipante() {
    if (!newNombre.trim()) return;
    setParticipantes((prev) => [
      ...prev,
      {
        id: Date.now(),
        nombre: newNombre.trim(),
        consumo: newConsumo,
        excluido: false,
      },
    ]);
    setNewNombre("");
    setNewConsumo("");
    setModalVisible(false);
  }

  // Función para formatear valores numéricos como moneda, asegurando que se muestren con dos decimales y el símbolo de dólar, lo que mejora la legibilidad de los totales y propinas en la interfaz.
  function fmt(val) {
    return `$${(parseFloat(val) || 0).toFixed(2)}`;
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  // Esta es la interfaz visual de la aplicación
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ======== HEADER ======== */}
        {/* Barra superior con botón de volver y título */}
        <View style={styles.header}>
          {/* Botón para volver a la pantalla anterior */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          {/* Título de la pantalla */}
          <Text style={styles.headerTitle}>Calculadora de Propina</Text>
          {/* Espacio vacío para centrar el título */}
          <View style={{ width: 36 }} />
        </View>

        {/* ======== CONTENIDO PRINCIPAL (SCROLLABLE) ======== */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── SECCIÓN 1: PARTICIPANTES ── */}
          {/* Muestra la lista de todas las personas en la cuenta y un botón para añadir más */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>PARTICIPANTES</Text>
            {/* Botón para abrir el modal de agregar nuevo participante */}
            <TouchableOpacity
              style={styles.btnAnadir}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAnadirText}> <Image source={web} style={{ width: 24, height: 24 }} /> Añadir</Text>
            </TouchableOpacity>
          </View>

          {/* CARD: Contenedor blanco que agrupa todos los participantes */}
          <View style={styles.card}>
            {/* Iteramos sobre cada participante para mostrar su información */}
            {participantes.map((p, index) => (
              <View
                key={p.id}
                style={[
                  styles.participanteRow,
                  // Agregar borde inferior a todos excepto al último
                  index < participantes.length - 1 && styles.participanteRowBorder,
                ]}
              >
                {/* FILA SUPERIOR: Avatar + Nombre + Input de consumo */}
                <View style={styles.participanteTop}>
                  {/* Lado izquierdo: Avatar y nombre */}
                  <View style={styles.participanteLeft}>
                    {/* Avatar circular con ícono */}
                    <View style={styles.avatarCircle}>
                      <Image source={profile} style={{ width: 24, height: 24 }} />
                    </View>
                    {/* Nombre del participante */}
                    <Text style={styles.participanteNombre}>{p.nombre}</Text>
                  </View>
                  {/* Lado derecho: Input del consumo ($) */}
                  <View style={styles.participanteRight}>
                    <Text style={styles.consumoPrefix}>$</Text>
                    {/* Input para que el usuario escriba cuánto gastó */}
                    <TextInput
                      style={styles.consumoInput}
                      value={p.consumo}
                      onChangeText={(v) => actualizarConsumo(p.id, v)} // Actualiza cuando cambia el valor
                      placeholder="0.00"
                      placeholderTextColor={C.gray500}
                      keyboardType="numeric" // Solo permite números
                    />
                  </View>
                </View>

                {/* FILA INFERIOR: Opción "Excluir del pago" con switch */}
                <View style={styles.excluirRow}>
                  {/* Etiqueta del switch */}
                  <Text style={styles.excluirLabel}>Excluir del pago</Text>
                  {/* Switch para activar/desactivar la exclusión del pago */}
                  <Switch
                    value={p.excluido}
                    onValueChange={() => toggleExcluido(p.id)} // Cambia el estado cuando se toca
                    trackColor={{ false: C.gray200, true: C.primary }} // Colores del switch
                    thumbColor={C.white}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* ── SECCIÓN 2: RESUMEN DE TOTALES ── */}
          {/* Muestra el subtotal, propina y total a pagar */}
          <View style={styles.summaryBox}>
            {/* Fila 1: Subtotal */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelText}>Subtotal Consumo</Text>
              <Text style={styles.summaryValueText}>{fmt(subtotal)}</Text>
            </View>
            {/* Fila 2: Propina (con borde superior e inferior) */}
            <View style={[styles.summaryRow, styles.summaryRowBorder]}>
              <Text style={styles.summaryPropLabel}>
                Propina ({TIP_PCT}%)
              </Text>
              <Text style={styles.summaryPropValue}>+{fmt(propina)}</Text>
            </View>
            {/* Fila 3: TOTAL A PAGAR (la más importante) */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>TOTAL A PAGAR</Text>
              <Text style={styles.summaryTotalValue}>{fmt(totalAPagar)}</Text>
            </View>
          </View>

          {/* ── SECCIÓN 3: CONFIGURAR PROPINA ── */}
          {/* Muestra información sobre cómo se distribuye la propina */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>CONFIGURAR PROPINA</Text>
          </View>

          <View style={styles.card}>
            {/* Bloque central: Total propina a repartir */}
            <View style={styles.propinaCenterBlock}>
              <Text style={styles.propinaCenterLabel}>
                TOTAL PROPINA A REPARTIR ($)
              </Text>
              {/* Monto total de la propina en grande */}
              <Text style={styles.propinaCenterValue}>{fmt(propina)}</Text>
            </View>

            {/* Línea divisoria */}
            <View style={styles.divider} />

            {/* Propina que le toca a cada persona */}
            <View style={styles.propinaPorPersonaRow}>
              <Text style={styles.propinaPorPersonaLabel}>
                PROPINA POR PERSONA:
              </Text>
              <Text style={styles.propinaPorPersonaValue}>
                {fmt(propinaPorPersona)}
              </Text>
            </View>

            {/* Info Pill 1: Porcentaje del consumo */}
            <View style={styles.infoPill}>
              <Text style={styles.infoPillIcon}>%</Text>
              <Text style={styles.infoPillText}>
                Equivale al{" "}
                <Text style={{ color: C.primary, fontWeight: "700" }}>
                  {pctDelConsumo}%
                </Text>{" "}
                del consumo de participantes activos
              </Text>
            </View>

            {/* Info Pill 2: Número de participantes */}
            <View style={[styles.infoPill, { marginTop: 8 }]}>
              <Image source={people} style={{ width: 16, height: 16, marginTop: 2 }} />
              <Text style={styles.infoPillText}>
                Dividido entre{" "}
                <Text style={{ color: C.primary, fontWeight: "700" }}>
                  {activos.length}
                </Text>{" "}
                participante{activos.length !== 1 ? "s" : ""} activo
                {activos.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* Espacio en blanco para que el contenido no quede debajo del botón flotante */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ======== BOTÓN FLOTANTE INFERIOR ======== */}
        {/* Botón para calcular y ver el desglose final de la cuenta */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.btnCalcular}
            activeOpacity={0.88}
            // Al tocar, navega a la pantalla de desglose con todos los datos
            onPress={() => {
              navigation.navigate("Desglos", {
                participantes,
                subtotal: totalConsumo,
                propina,
                totalAPagar,
                propinaPorPersona,
                pctDelConsumo,
                activos,
              });
            }}
          >
            <Text style={styles.btnCalcularText}>Calcular Desglose <Image source={calculator} style={{ width: 24, height: 24 }} /></Text>
          </TouchableOpacity>
        </View>

        {/* ======== MODAL: AÑADIR NUEVO PARTICIPANTE ======== */}
        {/* Diálogo que aparece cuando el usuario presiona el botón "Añadir" */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              {/* Título del modal */}
              <Text style={styles.modalTitle}>Añadir Participante</Text>

              {/* CAMPO 1: Nombre del participante */}
              <Text style={styles.modalLabel}>Nombre del participante</Text>
              <View style={styles.modalInputWrapper}>
                {/* Ícono del participante */}
                <Image source={profile} style={{ width: 24, height: 24 }} />
                {/* Input para escribir el nombre */}
                <TextInput
                  style={styles.modalInput}
                  value={newNombre}
                  onChangeText={setNewNombre}
                  placeholder="Ej: María García"
                  placeholderTextColor={C.gray500}
                />
              </View>

              {/* CAMPO 2: Consumo individual */}
              <Text style={[styles.modalLabel, { marginTop: 20 }]}>
                Consumo individual ($)
              </Text>
              <View style={styles.modalInputWrapper}>
                {/* Símbolo de dólar */}
                <Text style={styles.modalInputPrefix}>$</Text>
                {/* Input para escribir el consumo */}
                <TextInput
                  style={styles.modalInput}
                  value={newConsumo}
                  onChangeText={setNewConsumo}
                  placeholder="0.00"
                  placeholderTextColor={C.gray500}
                  keyboardType="numeric"
                />
              </View>
              {/* Pista sobre cómo funciona si dejas el consumo vacío */}
              <Text style={styles.modalHint}>
                Si dejas este campo vacío, el total se dividirá equitativamente.
              </Text>

              {/* BOTÓN 1: Confirmar y añadir */}
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={agregarParticipante} // Ejecuta la función de agregar
                activeOpacity={0.88}
              >
                <Text style={styles.btnConfirmText}>+ Añadir</Text>
              </TouchableOpacity>

              {/* BOTÓN 2: Cancelar */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)} // Cierra el modal
                style={styles.btnCancelar}
                activeOpacity={0.7}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
  backBtn: { width: 36, alignItems: "flex-start" },
  backIcon: { fontSize: 22, color: C.darkText },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.darkText,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.primary,
    letterSpacing: 1.2,
  },
  btnAnadir: { flexDirection: "row", alignItems: "center", gap: 4 },
  btnAnadirText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primary,
    textAlign: "center",
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  // Participante
  participanteRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  participanteRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.gray100,
  },
  participanteTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  participanteLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  participanteNombre: {
    fontSize: 15,
    fontWeight: "600",
    color: C.darkText,
  },
  participanteRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  consumoPrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: C.primary,
  },
  consumoInput: {
    fontSize: 15,
    fontWeight: "700",
    color: C.primary,
    minWidth: 60,
    textAlign: "right",
    padding: 0,
  },
  excluirRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  excluirLabel: {
    fontSize: 13,
    color: C.gray500,
  },

  // Summary box
  summaryBox: {
    backgroundColor: C.primaryBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryRowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E8C5BC",
  },
  summaryLabelText: { fontSize: 14, color: C.darkText },
  summaryValueText: { fontSize: 14, fontWeight: "700", color: C.darkText },
  summaryPropLabel: { fontSize: 14, color: C.primary, fontWeight: "600" },
  summaryPropValue: { fontSize: 14, fontWeight: "700", color: C.primary },
  summaryTotalLabel: { fontSize: 15, fontWeight: "800", color: C.darkText },
  summaryTotalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: C.primary,
  },

  // Propina config card
  propinaCenterBlock: {
    alignItems: "center",
    paddingVertical: 20,
  },
  propinaCenterLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  propinaCenterValue: {
    fontSize: 36,
    fontWeight: "900",
    color: C.primary,
  },
  divider: {
    height: 1,
    backgroundColor: C.gray100,
    marginHorizontal: 16,
  },
  propinaPorPersonaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  propinaPorPersonaLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.gray500,
    letterSpacing: 0.8,
  },
  propinaPorPersonaValue: {
    fontSize: 16,
    fontWeight: "800",
    color: C.primary,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: C.gray100,
    borderRadius: 10,
    padding: 10,
  },
  infoPillIcon: {
    fontSize: 13,
    color: C.primary,
    fontWeight: "800",
    marginTop: 1,
  },
  infoPillText: {
    fontSize: 12,
    color: C.gray500,
    flex: 1,
    lineHeight: 18,
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
  btnCalcular: {
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
  btnCalcularText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.white,
    letterSpacing: 0.3,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 44,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    backgroundColor: C.gray200,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.darkText,
    textAlign: "center",
    marginBottom: 28,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.darkText,
    marginBottom: 8,
    textAlign: "center",
  },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.gray100,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  modalInputIcon: { fontSize: 16, color: C.gray500 },
  modalInputPrefix: {
    fontSize: 16,
    fontWeight: "700",
    color: C.gray500,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: C.darkText,
    padding: 0,
  },
  modalHint: {
    fontSize: 12,
    color: C.gray500,
    marginTop: 8,
    lineHeight: 17,
  },
  btnConfirm: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 28,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnConfirmText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.white,
  },
  btnCancelar: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  btnCancelarText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.primary,
  },
});