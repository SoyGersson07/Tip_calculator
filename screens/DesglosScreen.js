import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, Share } from "react-native";
import { useApp } from "../AppContext";

export default function DesglosScreen({ route, navigation }) {
  const { agregarCuenta, moneda, C } = useApp();
  const S = moneda.simbolo;

  const { participantes = [], tipPct = 10, subtotal = 0, propina = 0, totalAPagar = 0 } = route?.params || {};

  function fmt(val) { return `${S}${(parseFloat(val)||0).toFixed(2)}`; }

  const activos = participantes.filter((p) => !p.excluido);
  const totalExcluidos = participantes.filter((p) => p.excluido).reduce((s, p) => s + (parseFloat(p.consumo)||0), 0);
  const propinaExclPorActivo  = activos.length > 0 ? (totalExcluidos * (tipPct/100)) / activos.length : 0;
  const consumoExclPorActivo  = activos.length > 0 ? totalExcluidos / activos.length : 0;

  function totalParticipante(p) {
    if (p.excluido) return 0;
    const c = parseFloat(p.consumo)||0;
    return c + c*(tipPct/100) + consumoExclPorActivo + propinaExclPorActivo;
  }
  function propinaParticipante(p) {
    return (parseFloat(p.consumo)||0)*(tipPct/100) + propinaExclPorActivo;
  }

  function handleGuardar() {
    const ahora = new Date();
    const hoy   = new Date(); hoy.setHours(0,0,0,0);
    agregarCuenta({ id: Date.now().toString(), nombre: `Cuenta (${participantes.length} personas)`, personas: activos.length, hora: ahora.toTimeString().slice(0,5), total: totalAPagar, propina, porcentaje: tipPct, fecha: hoy.toISOString(), simbolo: S });
    navigation.navigate("Home");
  }

  async function handleCompartir() {
    const lines = participantes.map((p) => p.excluido ? `${p.nombre} (Invitado): ${S}0.00` : `${p.nombre}: ${fmt(totalParticipante(p))}`);
    await Share.share({ message: `🧾 Desglose - PropinaPlus\n\n${lines.join("\n")}\n\nSubtotal: ${fmt(subtotal)}\nPropina: ${fmt(propina)}\nTOTAL: ${fmt(totalAPagar)}` });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bgMain }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.headerBg, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.gray200 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36 }}>
          <Text style={{ fontSize: 22, color: C.darkText }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: C.darkText }}>Desglose</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: C.gray500, letterSpacing: 1.5 }}>PARTICIPANTES</Text>
          <View style={{ backgroundColor: C.primaryLight, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: C.primary }}>{participantes.length} Persona{participantes.length !== 1 ? "s" : ""}</Text>
          </View>
        </View>

        {participantes.map((p) => {
          const esInv = p.excluido;
          return (
            <View key={p.id} style={{ backgroundColor: esInv ? C.gray100 : C.bgCard, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: esInv ? 1.5 : 0, borderColor: C.gray200, borderStyle: esInv ? "dashed" : "solid" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: "800", color: esInv ? C.gray500 : C.darkText }}>{p.nombre}</Text>
                  {esInv && <View style={{ backgroundColor: C.gray200, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}><Text style={{ fontSize: 10, fontWeight: "800", color: C.gray500 }}>INVITADO</Text></View>}
                </View>
                <Text style={{ fontSize: 20, fontWeight: "900", color: esInv ? C.gray500 : C.primary }}>{fmt(totalParticipante(p))}</Text>
              </View>
              {esInv
                ? <Text style={{ fontSize: 13, color: C.gray500, fontStyle: "italic" }}>Consumo cubierto por el grupo</Text>
                : <View style={{ flexDirection: "row", gap: 12 }}>
                    <Text style={{ fontSize: 13, color: C.gray500 }}>Consumo: {fmt(parseFloat(p.consumo)||0)}</Text>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: C.primary }}>+ Propina: {fmt(propinaParticipante(p))}</Text>
                  </View>
              }
            </View>
          );
        })}

        <View style={{ backgroundColor: C.primary, borderRadius: 20, padding: 24, marginTop: 8, overflow: "hidden" }}>
          <Text style={{ position: "absolute", right: -10, bottom: -20, fontSize: 140, fontWeight: "900", color: "rgba(255,255,255,0.08)" }}>{S}</Text>
          <Text style={{ fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.75)", letterSpacing: 1.5, marginBottom: 10 }}>TOTAL FINAL DE LA CUENTA</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", marginBottom: 16 }}>
            <Text style={{ fontSize: 48, fontWeight: "900", color: "#fff", lineHeight: 54 }}>{fmt(totalAPagar)}</Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600", marginLeft: 4 }}> (Incluye propina total)</Text>
          </View>
          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.25)", marginBottom: 14 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" }}>Subtotal: {fmt(subtotal)}</Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" }}>Propina ({tipPct}%): {fmt(propina)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 28, gap: 10, backgroundColor: C.bgMain + "F5" }}>
        <TouchableOpacity style={{ backgroundColor: C.bgCard, borderRadius: 16, paddingVertical: 16, alignItems: "center", borderWidth: 2, borderColor: C.primary }} onPress={handleGuardar} activeOpacity={0.88}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: C.primary }}>✓  Guardar en Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: C.primary, borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }} onPress={handleCompartir} activeOpacity={0.88}>
          <Text style={{ fontSize: 18, color: "#fff", fontWeight: "800" }}>⇪</Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: 0.3 }}>Compartir Resultado</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}