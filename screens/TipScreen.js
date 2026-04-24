import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import { Colors } from "../constants";

export default function TipScreen({ route, navigation }) {
  const {
    subtotal = 0,
    totalConsumo = 0,
    participantes = [],
    nombreCuenta = "",
  } = route?.params || {};

  const [valor, setValor] = useState("");

  const presionar = useCallback((key) => {
    if (key === "⌫") {
      setValor((v) => v.slice(0, -1));
    } else if (key === ".") {
      if (!valor.includes(".")) setValor((v) => v + ".");
    } else {
      if (valor.includes(".") && valor.split(".")[1]?.length >= 2) return;
      setValor((v) => (v === "" ? key : v + key));
    }
  }, [valor]);

  const numerico = useMemo(() => parseFloat(valor) || 0, [valor]);

  const pct = useMemo(
    () =>
      totalConsumo > 0 ? ((numerico / totalConsumo) * 100).toFixed(1) : "0.0",
    [numerico, totalConsumo]
  );

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

  const handleAplicar = useCallback(() => {
    navigation.navigate("Calculator", {
      propinaMonto: numerico,
      participantes,
      nombreCuenta,
    });
  }, [navigation, numerico, participantes, nombreCuenta]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        >
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={s.headerTitle}>Configurar Propina</Text>

        <View style={{ width: 36 }} />
      </View>

      <View style={s.subtotalBox}>
        <Text style={s.subtotalLabel}>SUBTOTAL DE CONSUMO</Text>

        <Text style={s.subtotalVal}>
          ${(parseFloat(subtotal) || 0).toFixed(2)}
        </Text>
      </View>

      <View style={s.inputSection}>
        <Text style={s.inputLabel}>Valor de la Propina</Text>

        <View style={s.inputBox}>
          <Text style={s.inputValue}>
            $ {valor === "" ? "0.00" : valor}
          </Text>
        </View>

        <Text style={s.inputHint}>Equivale al {pct}% del total</Text>
      </View>

      <View style={s.teclado}>
        {keys.map((k) => (
          <TouchableOpacity
            key={k}
            style={s.tecla}
            onPress={() => presionar(k)}
            activeOpacity={0.6}
          >
            <Text style={[s.teclaText, k === "⌫" && { fontSize: 20 }]}>
              {k}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.btnAplicar}
          activeOpacity={0.88}
          onPress={handleAplicar}
        >
          <Text style={s.btnAplicarText}>✓  Aplicar Propina</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

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

  backIcon: { fontSize: 22, color: Colors.darkText },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.darkText,
  },

  subtotalBox: {
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 20,
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },

  subtotalLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.gray500,
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  subtotalVal: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.darkText,
  },

  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.darkText,
    marginBottom: 8,
  },

  inputBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 16,
    alignItems: "center",
  },

  inputValue: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.primary,
  },

  inputHint: {
    fontSize: 12,
    color: Colors.gray500,
    textAlign: "center",
    marginTop: 8,
  },

  teclado: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    alignContent: "center",
  },

  tecla: {
    width: "33.33%",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  teclaText: {
    fontSize: 24,
    fontWeight: "400",
    color: Colors.darkText,
  },

  bottomBar: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: Colors.white,
  },

  btnAplicar: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  btnAplicarText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.white,
  },
});