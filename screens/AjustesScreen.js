import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Image,
  Modal,
  Linking,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  guardarRedondeo,
  obtenerRedondeo,
  guardarMoneda,
  obtenerMoneda,
  MONEDAS_DISPONIBLES,
} from "../storage/settingsStorage";
import { getColors } from "../config/constants";
import { getAllTranslations } from "../config/languages";
import { useAppContext } from "../context/AppContext";
import { confirmAction } from "../utils/confirmAction";

/*
 * AJUSTES_SCREEN.js — Moneda, redondeo, tema oscuro, idioma; modales de selección; enlaces mailto soporte.
 * SectionLabel / RowItem: piezas de UI reutilizadas dentro del ScrollView principal.
 */
/** Etiqueta de sección en mayúsculas con color de acento según tema. */
function SectionLabel({ label, darkMode }) {
  const colors = getColors(darkMode);
  return <Text style={[s.sectionLabel, { color: colors.primary }]}>{label}</Text>;
}

/** Fila tocable de ajuste: icono, título/subtítulo y control derecho (switch, texto o chevron). */
function RowItem({ icon, title, subtitle, right, onPress, isLast, darkMode }) {
  const colors = getColors(darkMode);
  return (
    <TouchableOpacity
      style={[
        s.row,
        { backgroundColor: colors.white, borderBottomColor: colors.gray100 },
        !isLast && s.rowBorder,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[s.rowIcon, { backgroundColor: colors.primaryLight }]}>
        {icon}
      </View>
      <View style={s.rowInfo}>
        <Text style={[s.rowTitle, { color: colors.darkText }]}>{title}</Text>
        {subtitle ? (
          <Text style={[s.rowSub, { color: colors.gray500 }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={s.rowRight}>{right}</View>
    </TouchableOpacity>
  );
}

/** Tab "Ajustes": preferencias persistidas y modales de moneda/idioma. */
export default function AjustesScreen({ navigation }) {
  const [redondeo, setRedondeo] = useState(true);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState("USD");
  const [modalMonedaVisible, setModalMonedaVisible] = useState(false);
  const [modalIdiomaVisible, setModalIdiomaVisible] = useState(false);

  const {
    temaOscuro,
    idioma,
    cambiarTema,
    cambiarIdioma,
    usuario,
    authCerrarSesion,
  } = useAppContext();
  const colors = getColors(temaOscuro);
  const translations = getAllTranslations(idioma);

  useFocusEffect(
    useCallback(() => {
      obtenerRedondeo().then(setRedondeo);
      obtenerMoneda().then(setMonedaSeleccionada);
    }, [])
  );

  const handleRedondeoChange = useCallback((valor) => {
    setRedondeo(valor);
    guardarRedondeo(valor);
  }, []);

  const handleTemaOscuroChange = useCallback((valor) => {
    cambiarTema(valor);
  }, [cambiarTema]);

  const handleSeleccionarMoneda = useCallback((codigo) => {
    setMonedaSeleccionada(codigo);
    guardarMoneda(codigo);
    setModalMonedaVisible(false);
  }, []);

  const handleSeleccionarIdioma = useCallback((lang) => {
    cambiarIdioma(lang);
    setModalIdiomaVisible(false);
  }, [cambiarIdioma]);

  const handleCerrarSesion = useCallback(() => {
    confirmAction({
      title: translations["auth_logout"],
      message: translations["auth_logout_confirm"],
      cancelText: translations["generic_cancel"],
      confirmText: translations["auth_logout"],
      destructive: true,
      onConfirm: authCerrarSesion,
    });
  }, [translations, authCerrarSesion]);

  const handleAyuda = useCallback(async () => {
    const email = "soporte@propina-plus.com";
    const subject = encodeURIComponent(translations["help_questions"] || "Ayuda");
    const body = encodeURIComponent(
      "Hola,\n\nTengo una pregunta sobre PropinaPlus...\n\nGracias."
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          "No disponible",
          "No hay cliente de email configurado en tu dispositivo"
        );
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir el email");
    }
  }, [translations]);

  const handleContacto = useCallback(async () => {
    const email = "sugerencias@propina-plus.com";
    const subject = encodeURIComponent("Sugerencia o Reporte - PropinaPlus");
    const body = encodeURIComponent(
      "Hola,\n\nQuiero reportar un problema o sugerir algo:\n\n[Tu mensaje aquí]\n\nGracias."
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          "No disponible",
          "No hay cliente de email configurado en tu dispositivo"
        );
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir el email");
    }
  }, []);

  const idiomasDisponibles = [
    { codigo: "es", nombre: "Español" },
    { codigo: "en", nombre: "English" },
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgMain }]}>
      <View style={[s.header, { backgroundColor: colors.white, borderBottomColor: colors.gray200 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        >
          <Text style={[s.backIcon, { color: colors.darkText }]}>←</Text>
        </TouchableOpacity>

        <Text style={[s.headerTitle, { color: colors.darkText }]}>
          {translations["settings"]}
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel label={translations["auth_section_account"]} darkMode={temaOscuro} />

        <View style={[s.card, { backgroundColor: colors.white }]}>
          <RowItem
            icon={<Text style={[s.plusIcon, { color: colors.primary }]}>@</Text>}
            title={translations["auth_logged_as"]}
            subtitle={usuario?.username ?? "—"}
            darkMode={temaOscuro}
          />

          <RowItem
            icon={<Text style={[s.plusIcon, { color: colors.danger }]}>⇥</Text>}
            title={translations["auth_logout"]}
            subtitle={translations["auth_logout_sub"]}
            right={<Text style={[s.rowChevron, { color: colors.gray500 }]}>›</Text>}
            onPress={handleCerrarSesion}
            isLast
            darkMode={temaOscuro}
          />
        </View>

        <SectionLabel label={translations["calculation_preferences"]} darkMode={temaOscuro} />

        <View style={[s.card, { backgroundColor: colors.white }]}>
          <RowItem
            icon={
              <Image
                source={require("../assets/commerce.png")}
                style={s.iconImg}
              />
            }
            title={translations["default_currency"]}
            subtitle={translations["select_local_symbol"]}
            right={
              <Text style={[s.rowValue, { color: colors.primary }]}>
                {monedaSeleccionada} (
                {
                  MONEDAS_DISPONIBLES.find((m) => m.codigo === monedaSeleccionada)
                    ?.simbolo
                }
                ) ›
              </Text>
            }
            onPress={() => setModalMonedaVisible(true)}
            darkMode={temaOscuro}
          />

          <RowItem
            icon={<Text style={[s.plusIcon, { color: colors.primary }]}>+1</Text>}
            title={translations["automatic_rounding"]}
            subtitle={translations["round_to_nearest"]}
            right={
              <Switch
                value={redondeo}
                onValueChange={handleRedondeoChange}
                trackColor={{ false: colors.gray200, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
            isLast
            darkMode={temaOscuro}
          />
        </View>

        <SectionLabel label={translations["customization"]} darkMode={temaOscuro} />

        <View style={[s.card, { backgroundColor: colors.white }]}>
          <RowItem
            icon={
              <Image
                source={require("../assets/moon.png")}
                style={s.iconImg}
              />
            }
            title={translations["dark_theme"]}
            subtitle={translations["change_visual_appearance"]}
            right={
              <Switch
                value={temaOscuro}
                onValueChange={handleTemaOscuroChange}
                trackColor={{ false: colors.gray200, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
            darkMode={temaOscuro}
          />

          <RowItem
            icon={
              <Image
                source={require("../assets/globe.png")}
                style={s.iconImg}
              />
            }
            title={translations["language"]}
            subtitle={translations["native_language"]}
            right={
              <Text style={[s.rowValue, { color: colors.primary }]}>
                {idioma === "es" ? "Español" : "English"} ›
              </Text>
            }
            onPress={() => setModalIdiomaVisible(true)}
            isLast
            darkMode={temaOscuro}
          />
        </View>

        <SectionLabel label={translations["support"]} darkMode={temaOscuro} />

        <View style={[s.card, { backgroundColor: colors.white }]}>
          <RowItem
            icon={
              <Image
                source={require("../assets/question.png")}
                style={s.iconImg}
              />
            }
            title={translations["help_questions"]}
            subtitle={translations["support_center"]}
            right={<Text style={[s.rowChevron, { color: colors.gray500 }]}>⇗</Text>}
            onPress={handleAyuda}
            darkMode={temaOscuro}
          />

          <RowItem
            icon={
              <Image
                source={require("../assets/support.png")}
                style={s.iconImg}
              />
            }
            title={translations["contact_us"]}
            subtitle={translations["report_error"]}
            right={<Text style={[s.rowChevron, { color: colors.gray500 }]}>›</Text>}
            onPress={handleContacto}
            isLast
            darkMode={temaOscuro}
          />
        </View>
      </ScrollView>

      {/* Modal Moneda */}
      <Modal
        visible={modalMonedaVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMonedaVisible(false)}
      >
        <SafeAreaView style={[s.modalSafe, { backgroundColor: colors.bgMain }]}>
          <View style={[s.modalHeader, { backgroundColor: colors.white, borderBottomColor: colors.gray200 }]}>
            <TouchableOpacity
              onPress={() => setModalMonedaVisible(false)}
              style={s.modalBackBtn}
            >
              <Text style={[s.modalBackIcon, { color: colors.darkText }]}>←</Text>
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.darkText }]}>
              {translations["select_currency"]}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            style={s.modalScroll}
            contentContainerStyle={s.modalScrollContent}
          >
            {MONEDAS_DISPONIBLES.map((moneda) => (
              <TouchableOpacity
                key={moneda.codigo}
                style={[
                  s.monedaItem,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.gray200,
                  },
                  monedaSeleccionada === moneda.codigo && {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleSeleccionarMoneda(moneda.codigo)}
                activeOpacity={0.7}
              >
                <View style={s.monedaItemLeft}>
                  <Text
                    style={[
                      s.monedaSimbolo,
                      { color: colors.primary },
                    ]}
                  >
                    {moneda.simbolo}
                  </Text>
                  <View style={s.monedaTexto}>
                    <Text
                      style={[s.monedaCodigo, { color: colors.darkText }]}
                    >
                      {moneda.codigo}
                    </Text>
                    <Text
                      style={[s.monedaPais, { color: colors.gray500 }]}
                    >
                      {moneda.pais}
                    </Text>
                  </View>
                </View>
                {monedaSeleccionada === moneda.codigo && (
                  <Text style={[s.monedaCheck, { color: colors.primary }]}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Idioma */}
      <Modal
        visible={modalIdiomaVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalIdiomaVisible(false)}
      >
        <SafeAreaView style={[s.modalSafe, { backgroundColor: colors.bgMain }]}>
          <View style={[s.modalHeader, { backgroundColor: colors.white, borderBottomColor: colors.gray200 }]}>
            <TouchableOpacity
              onPress={() => setModalIdiomaVisible(false)}
              style={s.modalBackBtn}
            >
              <Text style={[s.modalBackIcon, { color: colors.darkText }]}>←</Text>
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.darkText }]}>
              {translations["language"]}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            style={s.modalScroll}
            contentContainerStyle={s.modalScrollContent}
          >
            {idiomasDisponibles.map((lang) => (
              <TouchableOpacity
                key={lang.codigo}
                style={[
                  s.monedaItem,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.gray200,
                  },
                  idioma === lang.codigo && {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleSeleccionarIdioma(lang.codigo)}
                activeOpacity={0.7}
              >
                <View style={s.monedaItemLeft}>
                  <Text
                    style={[
                      s.monedaSimbolo,
                      { color: colors.primary },
                      { fontSize: 20, fontWeight: "600" },
                    ]}
                  >
                    {lang.codigo === "es" ? "🇪🇸" : "🇺🇸"}
                  </Text>
                  <View style={s.monedaTexto}>
                    <Text
                      style={[s.monedaCodigo, { color: colors.darkText }]}
                    >
                      {lang.nombre}
                    </Text>
                  </View>
                </View>
                {idioma === lang.codigo && (
                  <Text style={[s.monedaCheck, { color: colors.primary }]}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Estilos estáticos de Ajustes (colores de texto/borde se inyectan en JSX con `colors` donde hace falta).
const s = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  backBtn: { width: 36 },

  backIcon: {
    fontSize: 22,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  scroll: { flex: 1 },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 16,
  },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  rowBorder: {
    borderBottomWidth: 1,
  },

  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  rowInfo: { flex: 1 },

  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },

  rowRight: { marginLeft: 8 },

  rowValue: {
    fontSize: 13,
    fontWeight: "600",
  },

  rowChevron: {
    fontSize: 18,
  },

  iconImg: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },

  plusIcon: {
    fontSize: 16,
    fontWeight: "700",
  },

  modalSafe: {
    flex: 1,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  modalBackBtn: { width: 36 },

  modalBackIcon: {
    fontSize: 22,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  modalScroll: { flex: 1 },

  modalScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  monedaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
  },

  monedaItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  monedaSimbolo: {
    fontSize: 24,
    fontWeight: "700",
    width: 40,
    textAlign: "center",
  },

  monedaTexto: { justifyContent: "center" },

  monedaCodigo: {
    fontSize: 13,
    fontWeight: "700",
  },

  monedaPais: {
    fontSize: 12,
    marginTop: 2,
  },

  monedaCheck: {
    fontSize: 18,
    fontWeight: "700",
  },
});
