import { useState } from "react";
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Switch, Image, Modal, FlatList,
} from "react-native";

import commerce from "../assets/commerce.png";
import { useApp, MONEDAS } from "../AppContext";

export default function AjustesScreen() {
  const { moneda, setMoneda, temaOscuro, setTemaOscuro, C } = useApp();
  const [redondeo, setRedondeo]       = useState(true);
  const [modalMoneda, setModalMoneda] = useState(false);

  const s = StyleSheet.create({
    safe:        { flex: 1, backgroundColor: C.bgMain },
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.headerBg, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.gray200 },
    headerTitle: { fontSize: 17, fontWeight: "700", color: C.darkText },
    scroll:      { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
    grupoLabel:  { fontSize: 12, fontWeight: "800", color: C.primary, letterSpacing: 1, marginTop: 16, marginBottom: 10 },
    card:        { backgroundColor: C.bgCard, borderRadius: 16, marginBottom: 10, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: temaOscuro ? 0 : 0.05, shadowRadius: 6, elevation: 2 },
    fila:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14 },
    filaIzq:     { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    filaDer:     { flexDirection: "row", alignItems: "center", gap: 4 },
    iconoWrap:   { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" },
    icono:       { width: 24, height: 24, tintColor: C.primary },
    iconoTxt:    { fontSize: 15, color: C.primary, fontWeight: "700" },
    filaTitulo:  { fontSize: 15, fontWeight: "700", color: C.darkText, marginBottom: 2 },
    filaSub:     { fontSize: 12, color: C.gray500 },
    filaValor:   { fontSize: 14, fontWeight: "600", color: C.primary },
    flecha:      { fontSize: 20, color: C.gray200 },
    divider:     { height: 1, backgroundColor: C.gray100, marginHorizontal: 14 },
    modalOverlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalSheet:    { backgroundColor: C.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, maxHeight: "75%" },
    modalHandle:   { width: 40, height: 4, borderRadius: 99, backgroundColor: C.gray200, alignSelf: "center", marginBottom: 20 },
    modalTitulo:   { fontSize: 18, fontWeight: "800", color: C.darkText, textAlign: "center", marginBottom: 16 },
    monedaFila:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: C.gray100 },
    monedaFilaActiva: { backgroundColor: C.primaryLight, borderRadius: 12, paddingHorizontal: 8 },
    monedaIzq:     { flexDirection: "row", alignItems: "center", gap: 12 },
    monedaSimboloBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.gray100, alignItems: "center", justifyContent: "center" },
    monedaSimboloBoxActivo: { backgroundColor: C.primary },
    monedaSimbolo: { fontSize: 16, fontWeight: "800", color: C.darkText },
    monedaSimboloActivo: { color: C.white },
    monedaNombre:  { fontSize: 14, fontWeight: "600", color: C.darkText },
    monedaNombreActivo: { color: C.primary },
    monedaCodigo:  { fontSize: 12, color: C.gray500 },
    checkmark:     { fontSize: 18, color: C.primary, fontWeight: "800" },
    btnCerrar:     { marginTop: 16, paddingVertical: 14, alignItems: "center" },
    btnCerrarText: { fontSize: 15, fontWeight: "700", color: C.primary },
  });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={{ width: 36 }} />
        <Text style={s.headerTitle}>Ajustes</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* PREFERENCIAS */}
        <Text style={s.grupoLabel}>PREFERENCIAS DE CÁLCULO</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.fila} activeOpacity={0.7} onPress={() => setModalMoneda(true)}>
            <View style={s.filaIzq}>
              <View style={s.iconoWrap}>
                <Image source={commerce} style={s.icono} resizeMode="contain" />
              </View>
              <View>
                <Text style={s.filaTitulo}>Moneda predeterminada</Text>
                <Text style={s.filaSub}>Selecciona el símbolo local</Text>
              </View>
            </View>
            <View style={s.filaDer}>
              <Text style={s.filaValor}>{moneda.codigo} ({moneda.simbolo})</Text>
              <Text style={s.flecha}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={s.divider} />

          <View style={s.fila}>
            <View style={s.filaIzq}>
              <View style={s.iconoWrap}>
                <Text style={s.iconoTxt}>+1</Text>
              </View>
              <View>
                <Text style={s.filaTitulo}>Redondeo automático</Text>
                <Text style={s.filaSub}>Ajustar al entero más cercano</Text>
              </View>
            </View>
            <Switch value={redondeo} onValueChange={setRedondeo} trackColor={{ false: C.gray200, true: C.primary }} thumbColor={C.bgCard} />
          </View>
        </View>

        {/* PERSONALIZACIÓN */}
        <Text style={s.grupoLabel}>PERSONALIZACIÓN</Text>
        <View style={s.card}>
          <View style={s.fila}>
            <View style={s.filaIzq}>
              <View style={s.iconoWrap}>
                <Text style={s.iconoTxt}>☾</Text>
              </View>
              <View>
                <Text style={s.filaTitulo}>Tema Oscuro</Text>
                <Text style={s.filaSub}>Cambiar la apariencia visual</Text>
              </View>
            </View>
            <Switch value={temaOscuro} onValueChange={setTemaOscuro} trackColor={{ false: C.gray200, true: C.primary }} thumbColor={C.bgCard} />
          </View>

          <View style={s.divider} />

          <TouchableOpacity style={s.fila} activeOpacity={0.7}>
            <View style={s.filaIzq}>
              <View style={s.iconoWrap}>
                <Text style={s.iconoTxt}>🌐</Text>
              </View>
              <View>
                <Text style={s.filaTitulo}>Idioma</Text>
                <Text style={s.filaSub}>App en tu lengua nativa</Text>
              </View>
            </View>
            <View style={s.filaDer}>
              <Text style={s.filaValor}>Español</Text>
              <Text style={s.flecha}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SOPORTE */}
        <Text style={s.grupoLabel}>SOPORTE</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.fila} activeOpacity={0.7}>
            <View style={s.filaIzq}>
              <View style={s.iconoWrap}><Text style={s.iconoTxt}>?</Text></View>
              <View>
                <Text style={s.filaTitulo}>Ayuda y Preguntas</Text>
                <Text style={s.filaSub}>Centro de soporte al usuario</Text>
              </View>
            </View>
            <Text style={s.flecha}>↗</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.fila} activeOpacity={0.7}>
            <View style={s.filaIzq}>
              <View style={s.iconoWrap}><Text style={s.iconoTxt}>✉</Text></View>
              <View>
                <Text style={s.filaTitulo}>Contáctanos</Text>
                <Text style={s.filaSub}>Reporta un error o sugiere algo</Text>
              </View>
            </View>
            <Text style={s.flecha}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal Moneda */}
      <Modal visible={modalMoneda} transparent animationType="slide" onRequestClose={() => setModalMoneda(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitulo}>Seleccionar Moneda</Text>
            <FlatList
              data={MONEDAS}
              keyExtractor={(item) => item.codigo}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const sel = item.codigo === moneda.codigo;
                return (
                  <TouchableOpacity style={[s.monedaFila, sel && s.monedaFilaActiva]} onPress={() => { setMoneda(item); setModalMoneda(false); }} activeOpacity={0.7}>
                    <View style={s.monedaIzq}>
                      <View style={[s.monedaSimboloBox, sel && s.monedaSimboloBoxActivo]}>
                        <Text style={[s.monedaSimbolo, sel && s.monedaSimboloActivo]}>{item.simbolo}</Text>
                      </View>
                      <View>
                        <Text style={[s.monedaNombre, sel && s.monedaNombreActivo]}>{item.nombre}</Text>
                        <Text style={s.monedaCodigo}>{item.codigo}</Text>
                      </View>
                    </View>
                    {sel && <Text style={s.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={s.btnCerrar} onPress={() => setModalMoneda(false)}>
              <Text style={s.btnCerrarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}