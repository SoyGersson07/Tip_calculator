import { useState } from "react";
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native";

import commerce from "../assets/commerce.png";
import people   from "../assets/people.png";
import { useApp } from "../AppContext";

const TABS = ["Recientes", "Este Mes", "Favoritos"];

function getFechaLabel(fechaISO) {
  const fecha = new Date(fechaISO);
  const hoy   = new Date(); hoy.setHours(0,0,0,0);
  const ayer  = new Date(hoy); ayer.setDate(ayer.getDate() - 1);
  if (fecha >= hoy)  return "HOY";
  if (fecha >= ayer) return "AYER";
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long" }).toUpperCase();
}

export default function HistorialScreen() {
  const { cuentas, moneda, C } = useApp();
  const S = moneda.simbolo;
  const [tabActiva, setTabActiva] = useState("Recientes");

  function fmt(val) { return `${S}${(parseFloat(val)||0).toFixed(2)}`; }

  const grupos = {};
  cuentas.forEach((c) => {
    const label = getFechaLabel(c.fecha);
    if (!grupos[label]) grupos[label] = [];
    grupos[label].push(c);
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bgMain }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.headerBg, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.gray200 }}>
        <View style={{ width: 36 }} />
        <Text style={{ fontSize: 17, fontWeight: "700", color: C.darkText }}>Historial de Cuentas</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", backgroundColor: C.headerBg, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.gray200 }}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setTabActiva(tab)} style={{ marginRight: 24, paddingVertical: 12, alignItems: "center" }} activeOpacity={0.7}>
            <Text style={{ fontSize: 14, fontWeight: tabActiva === tab ? "700" : "600", color: tabActiva === tab ? C.primary : C.gray500 }}>{tab}</Text>
            {tabActiva === tab && <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2.5, borderRadius: 2, backgroundColor: C.primary }} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
        {cuentas.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🧾</Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: C.darkText, marginBottom: 6 }}>Sin cuentas aún</Text>
            <Text style={{ fontSize: 13, color: C.gray500, textAlign: "center", paddingHorizontal: 32, lineHeight: 20 }}>Crea una nueva cuenta y guárdala para verla aquí</Text>
          </View>
        ) : (
          Object.entries(grupos).map(([fecha, items]) => (
            <View key={fecha}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: C.primary, letterSpacing: 1, marginTop: 16, marginBottom: 10 }}>{fecha}</Text>
              {items.map((item) => (
                <TouchableOpacity key={item.id} style={{ backgroundColor: C.bgCard, borderRadius: 16, flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 10 }} activeOpacity={0.75}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Image source={commerce} style={{ width: 24, height: 24, tintColor: C.primary }} resizeMode="contain" />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: C.darkText, marginBottom: 3 }} numberOfLines={1}>{item.nombre}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                      <Image source={people} style={{ width: 13, height: 13, tintColor: C.gray500, marginRight: 4 }} resizeMode="contain" />
                      <Text style={{ fontSize: 12, color: C.gray500 }}>{item.personas} {item.personas === 1 ? "persona" : "personas"}{"  ·  "}{item.hora}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: C.primary, fontWeight: "600" }}>Propina: {fmt(item.propina)} ({item.porcentaje}%)</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 17, fontWeight: "800", color: C.darkText }}>{fmt(item.total)}</Text>
                    <Text style={{ fontSize: 20, color: C.gray200, marginTop: 2 }}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        {cuentas.length > 0 && <Text style={{ textAlign: "center", fontSize: 12, color: C.gray500, marginTop: 16 }}>Se muestran los últimos 30 días</Text>}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}