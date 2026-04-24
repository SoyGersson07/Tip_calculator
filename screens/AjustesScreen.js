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
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { guardarRedondeo, obtenerRedondeo, guardarMoneda, obtenerMoneda, MONEDAS_DISPONIBLES } from "../settingsStorage";
import { Colors } from "../constants";

function SectionLabel({ label }) {
  return <Text style={s.sectionLabel}>{label}</Text>;
}

function RowItem({ icon, title, subtitle, right, onPress, isLast }) {
  return (
    <TouchableOpacity
      style={[
        s.row,
        !isLast && s.rowBorder,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={s.rowIcon}>{icon}</View>
      <View style={s.rowInfo}>
        <Text style={s.rowTitle}>{title}</Text>
        {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
      </View>
      <View style={s.rowRight}>{right}</View>
    </TouchableOpacity>
  );
}

export default function AjustesScreen({ navigation }) {
  const [redondeo, setRedondeo] = useState(true);
  const [temaOscuro, setTemaOscuro] = useState(false);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState("USD");
  const [modalMonedaVisible, setModalMonedaVisible] = useState(false);

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

  const handleSeleccionarMoneda = useCallback((codigo) => {
    setMonedaSeleccionada(codigo);
    guardarMoneda(codigo);
    setModalMonedaVisible(false);
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        >
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={s.headerTitle}>Ajustes</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel label="PREFERENCIAS DE CÁLCULO" />

        <View style={s.card}>
          <RowItem
            icon={
              <Image
                source={require("../assets/commerce.png")}
                style={s.iconImg}
              />
            }
            title="Moneda predeterminada"
            subtitle="Selecciona el símbolo local"
            right={<Text style={s.rowValue}>{monedaSeleccionada} ({MONEDAS_DISPONIBLES.find(m => m.codigo === monedaSeleccionada)?.simbolo}) ›</Text>}
            onPress={() => setModalMonedaVisible(true)}
          />

          <RowItem
            icon={<Text style={s.plusIcon}>+1</Text>}
            title="Redondeo automático"
            subtitle="Ajustar al entero más cercano"
            right={
              <Switch
                value={redondeo}
                onValueChange={handleRedondeoChange}
                trackColor={{ false: Colors.gray200, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
            isLast
          />
        </View>

        <SectionLabel label="PERSONALIZACIÓN" />

        <View style={s.card}>
          <RowItem
            icon={<Image source={require("../assets/moon.png")} style={s.iconImg}/>}
            title="Tema Oscuro"
            subtitle="Cambiar la apariencia visual"
            right={
              <Switch
                value={temaOscuro}
                onValueChange={setTemaOscuro}
                trackColor={{ false: Colors.gray200, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />

          <RowItem
            icon={<Image source={require("../assets/globe.png")} style={s.iconImg}/>}
            title="Idioma"
            subtitle="App en tu lengua nativa"
            right={<Text style={s.rowValue}>Español ›</Text>}
            isLast
          />
        </View>

        <SectionLabel label="SOPORTE" />

        <View style={s.card}>
          <RowItem
            icon={<Image source={require("../assets/question.png")} style={s.iconImg}/>}
            title="Ayuda y Preguntas"
            subtitle="Centro de soporte al usuario"
            right={<Text style={s.rowChevron}>⇗</Text>}
          />

          <RowItem
            icon={<Image source={require("../assets/support.png")} style={s.iconImg}/>}
            title="Contáctanos"
            subtitle="Reporta un error o sugiere algo"
            right={<Text style={s.rowChevron}>›</Text>}
            isLast
          />
        </View>
      </ScrollView>

      <Modal
        visible={modalMonedaVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMonedaVisible(false)}
      >
        <SafeAreaView style={s.modalSafe}>
          <View style={s.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalMonedaVisible(false)}
              style={s.modalBackBtn}
            >
              <Text style={s.modalBackIcon}>←</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle}>Seleccionar Moneda</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView style={s.modalScroll} contentContainerStyle={s.modalScrollContent}>
            {MONEDAS_DISPONIBLES.map((moneda) => (
              <TouchableOpacity
                key={moneda.codigo}
                style={[
                  s.monedaItem,
                  monedaSeleccionada === moneda.codigo && s.monedaItemActiva,
                ]}
                onPress={() => handleSeleccionarMoneda(moneda.codigo)}
                activeOpacity={0.7}
              >
                <View style={s.monedaItemLeft}>
                  <Text style={s.monedaSimbolo}>{moneda.simbolo}</Text>
                  <View style={s.monedaTexto}>
                    <Text style={s.monedaCodigo}>{moneda.codigo}</Text>
                    <Text style={s.monedaPais}>{moneda.pais}</Text>
                  </View>
                </View>
                {monedaSeleccionada === moneda.codigo && (
                  <Text style={s.monedaCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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

  backBtn: { width: 36 },

  backIcon: {
    fontSize: 22,
    color: Colors.darkText,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.darkText,
  },

  scroll: { flex: 1 },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 16,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },

  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  rowInfo: { flex: 1 },

  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.darkText,
  },

  rowSub: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },

  rowRight: { marginLeft: 8 },

  rowValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },

  rowChevron: {
    fontSize: 18,
    color: Colors.gray500,
  },

  iconImg: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },

  plusIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },

  modalSafe: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },

  modalBackBtn: { width: 36 },

  modalBackIcon: {
    fontSize: 22,
    color: Colors.darkText,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.darkText,
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },

  monedaItemActiva: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 2,
  },

  monedaItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  monedaSimbolo: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    width: 40,
    textAlign: "center",
  },

  monedaTexto: { justifyContent: "center" },

  monedaCodigo: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.darkText,
  },

  monedaPais: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },

  monedaCheck: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "700",
  },
});
