import { useState, useCallback, useMemo, useRef } from "react";
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
  Keyboard,
  Pressable,
  Platform,
  Image,
} from "react-native";

import {
  KeyboardDoneAccessory,
  KEYBOARD_DONE_ACCESSORY_ID,
} from "../components/KeyboardDoneAccessory";
import { useFocusEffect } from "@react-navigation/native";

import web from "../assets/web.png";
import profile from "../assets/profile.png";
import people from "../assets/people.png";
import calculator from "../assets/calculator.png";
import { guardarCuenta } from "../storage/historialStorage";
import {
  obtenerRedondeo,
  obtenerMoneda,
  obtenerSimboloMoneda,
} from "../storage/settingsStorage";
import { getColors, TIP_PCT } from "../config/constants";
import { useAppContext } from "../context/AppContext";
import { confirmAction } from "../utils/confirmAction";

/*
 * =============================================================================
 * CALCULATOR_SCREEN.js — GUÍA DEL ARCHIVO (orden de aparición en el código)
 * =============================================================================
 * Imports (1–29): React, RN, navegación, assets, guardar historial, ajustes, constantes, contexto.
 * Estados (36–45): lista participantes, modal nuevo, campos modal, propina fija opcional, nombre cuenta, redondeo, símbolo $.
 * useFocusEffect (47–77): sincroniza params al volver de Tip; limpia params; recarga redondeo y moneda.
 * useMemo (79–126): activos/excluidos, sumas consumo, propina total, total a pagar, propina/persona, %, formateo moneda.
 * Callbacks (133–200): excluir, consumo, añadir persona, navegar a Tip, guardar cuenta + ir a Desglose.
 * return JSX (201–448): layout scroll + barra inferior + modal añadir participante.
 * getStyles (451–788): StyleSheet dinámico según `colors` (tema).
 * =============================================================================
 */
export default function Calculator({ navigation, route }) {
  const { temaOscuro, usuario } = useAppContext();
  const colors = getColors(temaOscuro);
  const styles = getStyles(colors);
  
  const [participantes, setParticipantes] = useState([
    { id: 1, nombre: "Tú", consumo: "", excluido: false },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newConsumo, setNewConsumo] = useState("");
  const [propinaMonto, setPropinaMonto] = useState(null);
  const [nombreCuenta, setNombreCuenta] = useState("");
  const [redondeoActivo, setRedondeoActivo] = useState(true);
  const [simboloMoneda, setSimboloMoneda] = useState("$");

  const modalConsumoRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.propinaMonto !== undefined) {
        setPropinaMonto(route.params.propinaMonto);
      }

      if (
        route?.params?.participantes &&
        route.params.participantes.length > 1
      ) {
        setParticipantes(route.params.participantes);
      }

      if (route?.params?.nombreCuenta) {
        setNombreCuenta(route.params.nombreCuenta);
      }

      if (route?.params?.propinaMonto !== undefined) {
        navigation.setParams({
          propinaMonto: undefined,
          participantes: undefined,
          nombreCuenta: undefined,
        });
      }

      obtenerRedondeo().then(setRedondeoActivo);
      obtenerMoneda().then((cod) =>
        setSimboloMoneda(obtenerSimboloMoneda(cod))
      );
    }, [route?.params, navigation])
  );

  const activos = useMemo(
    () => participantes.filter((p) => !p.excluido),
    [participantes]
  );

  const excluidos = useMemo(
    () => participantes.filter((p) => p.excluido),
    [participantes]
  );

  const subtotal = useMemo(
    () =>
      activos.reduce((sum, p) => sum + (parseFloat(p.consumo) || 0), 0),
    [activos]
  );

  const totalExcluidos = useMemo(
    () =>
      excluidos.reduce((sum, p) => sum + (parseFloat(p.consumo) || 0), 0),
    [excluidos]
  );

  const totalConsumo = useMemo(
    () => subtotal + totalExcluidos,
    [subtotal, totalExcluidos]
  );

  const propina = useMemo(
    () =>
      propinaMonto !== null ? propinaMonto : totalConsumo * (TIP_PCT / 100),
    [propinaMonto, totalConsumo]
  );

  const totalAPagar = useMemo(
    () => totalConsumo + propina,
    [totalConsumo, propina]
  );

  const propinaPorPersona = useMemo(
    () => (activos.length > 0 ? propina / activos.length : 0),
    [propina, activos]
  );

  const pctDelConsumo = useMemo(
    () =>
      totalConsumo > 0 ? ((propina / totalConsumo) * 100).toFixed(1) : 0,
    [propina, totalConsumo]
  );

  const fmt = useCallback(
    (val) => `${simboloMoneda}${(parseFloat(val) || 0).toFixed(2)}`,
    [simboloMoneda]
  );

  const tieneDatosIngresados = useMemo(
    () =>
      nombreCuenta.trim().length > 0 ||
      propinaMonto !== null ||
      participantes.some(
        (p, index) =>
          index > 0 ||
          p.nombre !== "Tú" ||
          String(p.consumo || "").trim().length > 0 ||
          p.excluido
      ),
    [nombreCuenta, propinaMonto, participantes]
  );

  const toggleExcluido = useCallback((id) => {
    setParticipantes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, excluido: !p.excluido } : p))
    );
  }, []);

  const actualizarConsumo = useCallback((id, val) => {
    setParticipantes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, consumo: val } : p))
    );
  }, []);

  const agregarParticipante = useCallback(() => {
    if (!newNombre.trim()) return;
    Keyboard.dismiss();
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
  }, [newNombre, newConsumo]);

  const handleNavigateToTip = useCallback(() => {
    Keyboard.dismiss();
    navigation.navigate("Tip", {
      subtotal,
      totalConsumo,
      participantes,
      nombreCuenta,
    });
  }, [navigation, subtotal, totalConsumo, participantes, nombreCuenta]);

  const ejecutarCalculoDesglose = useCallback(async () => {
    Keyboard.dismiss();
    const cuenta = {
      id: Date.now(),
      nombre: nombreCuenta.trim() || "Cuenta Sin Nombre",
      fecha: new Date().toISOString(),
      personas: activos.length,
      total: totalAPagar,
      propina,
      pct: propinaMonto !== null ? parseFloat(pctDelConsumo) : TIP_PCT,
    };
    await guardarCuenta(cuenta, usuario.id);
    navigation.navigate("Desglos", {
      participantes,
      subtotal: totalConsumo,
      propina,
      totalAPagar,
      propinaPorPersona,
      pctDelConsumo,
    });
  }, [
    nombreCuenta,
    activos,
    totalAPagar,
    propina,
    propinaMonto,
    pctDelConsumo,
    navigation,
    participantes,
    totalConsumo,
    propinaPorPersona,
    usuario?.id,
  ]);

  const handleCalcularDesglose = useCallback(() => {
    Keyboard.dismiss();
    confirmAction({
      title: "Confirmar cálculo",
      message: "¿Deseas calcular la propina con los valores ingresados?",
      confirmText: "Calcular",
      onConfirm: ejecutarCalculoDesglose,
    });
  }, [ejecutarCalculoDesglose]);

  const handleVolver = useCallback(() => {
    Keyboard.dismiss();

    if (!tieneDatosIngresados) {
      navigation.goBack();
      return;
    }

    confirmAction({
      title: "Salir de la calculadora",
      message: "Si sales ahora, se perderán los valores ingresados que aún no calculaste.",
      confirmText: "Salir",
      destructive: true,
      onConfirm: () => navigation.goBack(),
    });
  }, [navigation, tieneDatosIngresados]);
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <KeyboardDoneAccessory />
        <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.gray200 }]}>
          <TouchableOpacity
            onPress={handleVolver}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calculadora de Propina</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.sectionNombre}>
            <Text style={styles.sectionLabel}>NOMBRE DE LA CUENTA</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.nombreInputWrapper}>
              <TextInput
                style={styles.nombreInput}
                value={nombreCuenta}
                onChangeText={setNombreCuenta}
                placeholder="Ej: Almuerzo con amigos"
                placeholderTextColor={colors.gray500}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>PARTICIPANTES</Text>
            <TouchableOpacity
              style={styles.btnAnadir}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAnadirText}>
                <Image source={web} style={{ width: 24, height: 24 }} /> Añadir
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {participantes.map((p, index) => (
              <View
                key={p.id}
                style={[
                  styles.participanteRow,
                  index < participantes.length - 1 &&
                    styles.participanteRowBorder,
                ]}
              >
                <View style={styles.participanteTop}>
                  <View style={styles.participanteLeft}>
                    <View style={styles.avatarCircle}>
                      <Image
                        source={profile}
                        style={{ width: 24, height: 24 }}
                      />
                    </View>
                    <Text style={styles.participanteNombre}>{p.nombre}</Text>
                  </View>
                  <View style={styles.participanteRight}>
                    <Text style={styles.consumoPrefix}>$</Text>
                    <TextInput
                      style={styles.consumoInput}
                      value={p.consumo}
                      onChangeText={(v) => actualizarConsumo(p.id, v)}
                      placeholder="0.00"
                      placeholderTextColor={colors.gray500}
                      keyboardType="numeric"
                      inputAccessoryViewID={
                        Platform.OS === "ios" ? KEYBOARD_DONE_ACCESSORY_ID : undefined
                      }
                      returnKeyType="done"
                      blurOnSubmit
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                  </View>
                </View>

                <View style={styles.excluirRow}>
                  <Text style={styles.excluirLabel}>Excluir del pago</Text>
                  <Switch
                    value={p.excluido}
                    onValueChange={() => toggleExcluido(p.id)}
                    trackColor={{ false: colors.gray200, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelText}>Subtotal Consumo</Text>
              <Text style={styles.summaryValueText}>{fmt(subtotal)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowBorder]}>
              <Text style={styles.summaryPropLabel}>Propina ({pctDelConsumo}%)</Text>
              <Text style={styles.summaryPropValue}>+{fmt(propina)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>TOTAL A PAGAR</Text>
              <Text style={styles.summaryTotalValue}>{fmt(totalAPagar)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.sectionHeader}
            activeOpacity={0.7}
            onPress={handleNavigateToTip}
          >
            <Text style={styles.sectionLabel}>CONFIGURAR PROPINA</Text>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>
              Editar ›
            </Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.propinaCenterBlock}>
              <Text style={styles.propinaCenterLabel}>
                TOTAL PROPINA A REPARTIR ($)
              </Text>
              <Text style={styles.propinaCenterValue}>{fmt(propina)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.propinaPorPersonaRow}>
              <Text style={styles.propinaPorPersonaLabel}>
                PROPINA POR PERSONA:
              </Text>
              <Text style={styles.propinaPorPersonaValue}>
                {fmt(propinaPorPersona)}
              </Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoPillIcon}>%</Text>
              <Text style={styles.infoPillText}>
                Equivale al{" "}
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  {pctDelConsumo}%
                </Text>{" "}
                del consumo de participantes activos
              </Text>
            </View>

            <View style={[styles.infoPill, { marginTop: 8 }]}>
              <Image
                source={people}
                style={{ width: 16, height: 16, marginTop: 2 }}
              />
              <Text style={styles.infoPillText}>
                Dividido entre{" "}
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  {activos.length}
                </Text>{" "}
                participante{activos.length !== 1 ? "s" : ""} activo
                {activos.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.btnCalcular}
            activeOpacity={0.88}
            onPress={handleCalcularDesglose}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={styles.btnCalcularText}>Calcular Desglose</Text>
              <Image source={calculator} style={{ width: 24, height: 24 }} />
            </View>
          </TouchableOpacity>
        </View>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {
            Keyboard.dismiss();
            setModalVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdropTouchable}
              onPress={Keyboard.dismiss}
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
              style={{ width: "100%" }}
            >
              <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Añadir Participante</Text>

              <Text style={styles.modalLabel}>Nombre del participante</Text>
              <View style={styles.modalInputWrapper}>
                <Image source={profile} style={{ width: 24, height: 24 }} />
                <TextInput
                  style={styles.modalInput}
                  value={newNombre}
                  onChangeText={setNewNombre}
                  placeholder="Ej: María García"
                  placeholderTextColor={colors.gray500}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => modalConsumoRef.current?.focus()}
                />
              </View>

              <Text style={[styles.modalLabel, { marginTop: 20 }]}>
                Consumo individual ($)
              </Text>
              <View style={styles.modalInputWrapper}>
                <Text style={styles.modalInputPrefix}>$</Text>
                <TextInput
                  ref={modalConsumoRef}
                  style={styles.modalInput}
                  value={newConsumo}
                  onChangeText={setNewConsumo}
                  placeholder="0.00"
                  placeholderTextColor={colors.gray500}
                  keyboardType="numeric"
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? KEYBOARD_DONE_ACCESSORY_ID : undefined
                  }
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
              <Text style={styles.modalHint}>
                Si dejas este campo vacío, el total se dividirá equitativamente.
              </Text>

              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={agregarParticipante}
                activeOpacity={0.88}
              >
                <Text style={styles.btnConfirmText}>+ Añadir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setModalVisible(false);
                }}
                style={styles.btnCancelar}
                activeOpacity={0.7}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Hoja de estilos de la calculadora según tema (`colors`). */
function getStyles(colors) {
  return StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, alignItems: "flex-start" },
  backIcon: { fontSize: 22 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionNombre: {
    marginBottom: 10,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1.2,
  },
  btnAnadir: { flexDirection: "row", alignItems: "center", gap: 4 },
  btnAnadirText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },

  nombreInputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  nombreInput: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkText,
    padding: 0,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  participanteRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  participanteRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
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
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  participanteNombre: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkText,
  },
  participanteRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  consumoPrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  consumoInput: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
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
    color: colors.gray500,
  },

  summaryBox: {
    backgroundColor: colors.primaryBg,
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
  summaryLabelText: { fontSize: 14, color: colors.darkText },
  summaryValueText: { fontSize: 14, fontWeight: "700", color: colors.darkText },
  summaryPropLabel: { fontSize: 14, color: colors.primary, fontWeight: "600" },
  summaryPropValue: { fontSize: 14, fontWeight: "700", color: colors.primary },
  summaryTotalLabel: { fontSize: 15, fontWeight: "800", color: colors.darkText },
  summaryTotalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primary,
  },

  propinaCenterBlock: {
    alignItems: "center",
    paddingVertical: 20,
  },
  propinaCenterLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  propinaCenterValue: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray100,
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
    color: colors.gray500,
    letterSpacing: 0.8,
  },
  propinaPorPersonaValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.gray100,
    borderRadius: 10,
    padding: 10,
  },
  infoPillIcon: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "800",
    marginTop: 1,
  },
  infoPillText: {
    fontSize: 12,
    color: colors.gray500,
    flex: 1,
    lineHeight: 18,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: colors.bgMain,
  },
  btnCalcular: {
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
  btnCalcularText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 0.3,
  },

  modalOverlay: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  modalBackdropTouchable: {
    flexGrow: 1,
    width: "100%",
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 44,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    backgroundColor: colors.gray200,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.darkText,
    textAlign: "center",
    marginBottom: 28,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.darkText,
    marginBottom: 8,
    textAlign: "center",
  },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  modalInputPrefix: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.gray500,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkText,
    padding: 0,
  },
  modalHint: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 17,
  },
  btnConfirm: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnConfirmText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
  },
  btnCancelar: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  btnCancelarText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  });
}
