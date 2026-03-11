import {
  Text, View, TouchableOpacity, SafeAreaView, ScrollView, Image
} from "react-native";

import commerce from "../assets/commerce.png";
import charity  from "../assets/charity.png";
import { useApp } from "../AppContext";

function fmt(val) { return `${val}`; }

export default function HomeScreen({ navigation }) {
  const { cuentas, moneda, C } = useApp();
  const S = moneda.simbolo;

  const ahora = new Date();
  const cuentasDelMes = cuentas.filter((c) => {
    const f = new Date(c.fecha);
    return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
  });
  const totalMes      = cuentasDelMes.reduce((sum, c) => sum + (c.total  || 0), 0);
  const totalPropinas = cuentasDelMes.reduce((sum, c) => sum + (c.propina|| 0), 0);
  const historialReciente = cuentas.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bgMain }}>
      <View style={{ backgroundColor: C.headerBg, paddingVertical: 16, alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.gray200 }}>
        <Text style={{ fontSize: 17, fontWeight: "700", color: C.darkText, letterSpacing: 0.3 }}>PropinaPlus</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 28, marginBottom: 24, alignItems: "center" }}>
          <Text style={{ fontSize: 30, fontWeight: "900", color: C.darkText, marginBottom: 8 }}>¡Hola, Usuario! 👋</Text>
          <Text style={{ fontSize: 15, color: C.gray500, lineHeight: 22 }}>Calcula tus propinas de forma rápida y equitativa.</Text>
        </View>

        <TouchableOpacity
          style={{ backgroundColor: C.primary, borderRadius: 18, paddingVertical: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24, shadowColor: C.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 }}
          onPress={() => navigation && navigation.navigate("Calculator")}
          activeOpacity={0.88}
        >
          <Text style={{ fontSize: 22, color: "#fff" }}>⊕</Text>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.3 }}>Nueva Cuenta</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 14, marginBottom: 32 }}>
          <View style={{ flex: 1, backgroundColor: C.bgCard, borderRadius: 18, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <Image source={commerce} style={{ width: 24, height: 24, marginBottom: 6, tintColor: C.primary }} />
            <Text style={{ fontSize: 13, color: C.gray500, marginBottom: 4 }}>Total Mes</Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: C.darkText }}>{S}{totalMes.toFixed(2)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.bgCard, borderRadius: 18, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <Image source={charity} style={{ width: 24, height: 24, marginBottom: 6, tintColor: C.primary }} />
            <Text style={{ fontSize: 13, color: C.gray500, marginBottom: 4 }}>Propinas</Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: C.darkText }}>{S}{totalPropinas.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 20, fontWeight: "900", color: C.darkText, marginBottom: 16 }}>Historial Reciente</Text>

        {historialReciente.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48, backgroundColor: C.bgCard, borderRadius: 18 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🧾</Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: C.darkText, marginBottom: 6 }}>Sin cuentas aún</Text>
            <Text style={{ fontSize: 13, color: C.gray500, textAlign: "center", paddingHorizontal: 32, lineHeight: 20 }}>Toca "Nueva Cuenta" para empezar a calcular</Text>
          </View>
        ) : (
          historialReciente.map((item) => (
            <View key={item.id} style={{ backgroundColor: C.bgCard, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                <Image source={commerce} style={{ width: 24, height: 24, tintColor: C.primary }} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: C.darkText, marginBottom: 4 }}>{item.nombre}</Text>
                <Text style={{ fontSize: 13, color: C.gray500 }}>{item.hora}  ·  {item.personas} {item.personas === 1 ? "persona" : "personas"}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: C.darkText, marginBottom: 3 }}>{S}{item.total.toFixed(2)}</Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#34C759" }}>Propina: {S}{item.propina.toFixed(2)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}