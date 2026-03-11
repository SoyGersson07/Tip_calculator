import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Switch, Modal, KeyboardAvoidingView, Platform, Image } from "react-native";

import web        from "../assets/web.png";
import profile    from "../assets/profile.png";
import people     from "../assets/people.png";
import calculator from "../assets/calculator.png";
import { useApp } from "../AppContext";

const TIP_PCT = 10;

export default function Calculator({ navigation }) {
  const { moneda, C } = useApp();
  const S = moneda.simbolo;

  const [participantes, setParticipantes] = useState([{ id: 1, nombre: "Tú", consumo: "", excluido: false }]);
  const [modalVisible, setModalVisible]   = useState(false);
  const [newNombre, setNewNombre]         = useState("");
  const [newConsumo, setNewConsumo]       = useState("");

  const activos        = participantes.filter((p) => !p.excluido);
  const excluidos      = participantes.filter((p) => p.excluido);
  const subtotal       = activos.reduce((sum, p) => sum + (parseFloat(p.consumo) || 0), 0);
  const totalExcluidos = excluidos.reduce((sum, p) => sum + (parseFloat(p.consumo) || 0), 0);
  const totalConsumo   = subtotal + totalExcluidos;
  const propina        = totalConsumo * (TIP_PCT / 100);
  const totalAPagar    = totalConsumo + propina;
  const propinaPorPersona = activos.length > 0 ? totalAPagar / activos.length : 0;
  const pctDelConsumo  = subtotal > 0 ? ((propinaPorPersona / subtotal) * 100).toFixed(1) : 0;

  function fmt(val) { return `${S}${(parseFloat(val)||0).toFixed(2)}`; }
  function toggleExcluido(id) { setParticipantes((p) => p.map((x) => x.id === id ? { ...x, excluido: !x.excluido } : x)); }
  function actualizarConsumo(id, val) { setParticipantes((p) => p.map((x) => x.id === id ? { ...x, consumo: val } : x)); }
  function agregarParticipante() {
    if (!newNombre.trim()) return;
    setParticipantes((p) => [...p, { id: Date.now(), nombre: newNombre.trim(), consumo: newConsumo, excluido: false }]);
    setNewNombre(""); setNewConsumo(""); setModalVisible(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bgMain }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.headerBg, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.gray200 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36 }}>
            <Text style={{ fontSize: 22, color: C.darkText }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "700", color: C.darkText }}>Calculadora de Propina</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20 }} showsVerticalScrollIndicator={false}>

          {/* PARTICIPANTES */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: C.primary, letterSpacing: 1.2 }}>PARTICIPANTES</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.primary }}>
                <Image source={web} style={{ width: 18, height: 18 }} /> Añadir
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: C.bgCard, borderRadius: 16, marginBottom: 20, overflow: "hidden" }}>
            {participantes.map((p, index) => (
              <View key={p.id} style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: index < participantes.length - 1 ? 1 : 0, borderBottomColor: C.gray100 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" }}>
                      <Image source={profile} style={{ width: 24, height: 24 }} />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: C.darkText }}>{p.nombre}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: C.primary }}>{S}</Text>
                    <TextInput style={{ fontSize: 15, fontWeight: "700", color: C.primary, minWidth: 60, textAlign: "right", padding: 0 }} value={p.consumo} onChangeText={(v) => actualizarConsumo(p.id, v)} placeholder="0.00" placeholderTextColor={C.gray500} keyboardType="numeric" />
                  </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 13, color: C.gray500 }}>Excluir del pago</Text>
                  <Switch value={p.excluido} onValueChange={() => toggleExcluido(p.id)} trackColor={{ false: C.gray200, true: C.primary }} thumbColor={C.bgCard} />
                </View>
              </View>
            ))}
          </View>

          {/* Resumen */}
          <View style={{ backgroundColor: C.primaryBg, borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
              <Text style={{ fontSize: 14, color: C.darkText }}>Subtotal Consumo</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.darkText }}>{fmt(subtotal)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#E8C5BC" }}>
              <Text style={{ fontSize: 14, color: C.primary, fontWeight: "600" }}>Propina ({TIP_PCT}%)</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.primary }}>+{fmt(propina)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: C.darkText }}>TOTAL A PAGAR</Text>
              <Text style={{ fontSize: 22, fontWeight: "900", color: C.primary }}>{fmt(totalAPagar)}</Text>
            </View>
          </View>

          {/* Propina */}
          <Text style={{ fontSize: 11, fontWeight: "800", color: C.primary, letterSpacing: 1.2, marginBottom: 10 }}>CONFIGURAR PROPINA</Text>
          <View style={{ backgroundColor: C.bgCard, borderRadius: 16, marginBottom: 20, overflow: "hidden" }}>
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: C.primary, letterSpacing: 1, marginBottom: 8 }}>TOTAL PROPINA A REPARTIR ({S})</Text>
              <Text style={{ fontSize: 36, fontWeight: "900", color: C.primary }}>{fmt(propina)}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: C.gray100, marginHorizontal: 16 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: C.gray500, letterSpacing: 0.8 }}>PROPINA POR PERSONA:</Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: C.primary }}>{fmt(propinaPorPersona)}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: C.gray100, borderRadius: 10, padding: 10 }}>
              <Text style={{ fontSize: 13, color: C.primary, fontWeight: "800" }}>%</Text>
              <Text style={{ fontSize: 12, color: C.gray500, flex: 1, lineHeight: 18 }}>
                Equivale al <Text style={{ color: C.primary, fontWeight: "700" }}>{pctDelConsumo}%</Text> del consumo de participantes activos
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: C.gray100, borderRadius: 10, padding: 10 }}>
              <Image source={people} style={{ width: 16, height: 16, marginTop: 2 }} />
              <Text style={{ fontSize: 12, color: C.gray500, flex: 1, lineHeight: 18 }}>
                Dividido entre <Text style={{ color: C.primary, fontWeight: "700" }}>{activos.length}</Text> participante{activos.length !== 1 ? "s" : ""} activo{activos.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Botón flotante */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 28, backgroundColor: C.bgMain + "F5" }}>
          <TouchableOpacity style={{ backgroundColor: C.primary, borderRadius: 16, paddingVertical: 18, alignItems: "center" }} activeOpacity={0.88}
            onPress={() => navigation.navigate("Desglos", { participantes, subtotal: totalConsumo, propina, totalAPagar, propinaPorPersona, pctDelConsumo, activos })}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: 0.3 }}>Calcular Desglose <Image source={calculator} style={{ width: 24, height: 24 }} /></Text>
          </TouchableOpacity>
        </View>

        {/* Modal Añadir */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: C.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 44 }}>
              <View style={{ width: 40, height: 4, borderRadius: 99, backgroundColor: C.gray200, alignSelf: "center", marginBottom: 24 }} />
              <Text style={{ fontSize: 22, fontWeight: "900", color: C.darkText, textAlign: "center", marginBottom: 28 }}>Añadir Participante</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: C.darkText, marginBottom: 8, textAlign: "center" }}>Nombre del participante</Text>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.gray100, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 10 }}>
                <Image source={profile} style={{ width: 24, height: 24 }} />
                <TextInput style={{ flex: 1, fontSize: 15, fontWeight: "600", color: C.darkText, padding: 0 }} value={newNombre} onChangeText={setNewNombre} placeholder="Ej: María García" placeholderTextColor={C.gray500} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: C.darkText, marginBottom: 8, marginTop: 20, textAlign: "center" }}>Consumo individual ({S})</Text>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.gray100, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: C.gray500 }}>{S}</Text>
                <TextInput style={{ flex: 1, fontSize: 15, fontWeight: "600", color: C.darkText, padding: 0 }} value={newConsumo} onChangeText={setNewConsumo} placeholder="0.00" placeholderTextColor={C.gray500} keyboardType="numeric" />
              </View>
              <Text style={{ fontSize: 12, color: C.gray500, marginTop: 8, lineHeight: 17 }}>Si dejas este campo vacío, el total se dividirá equitativamente.</Text>
              <TouchableOpacity style={{ backgroundColor: C.primary, borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 28 }} onPress={agregarParticipante} activeOpacity={0.88}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>+ Añadir</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ alignItems: "center", marginTop: 16, paddingVertical: 8 }} activeOpacity={0.7}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: C.primary }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}