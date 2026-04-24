import { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { obtenerHistorial } from "../historialStorage";
import { obtenerMoneda, obtenerSimboloMoneda } from "../settingsStorage";
import { Colors } from "../constants";

import commerce from "../assets/commerce.png";
import charity from "../assets/charity.png";

function HistorialItem({ item, isExpanded, onToggle, fmt }) {
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.historialCard,
          isExpanded && styles.historialCardExpanded,
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.historialIconWrap}>
          <Image source={commerce} style={{ width: 22, height: 22 }} />
        </View>
        <View style={styles.historialInfo}>
          <Text style={styles.historialNombre}>{item.nombre}</Text>
          <Text style={styles.historialFecha}>
            {item.personas} persona{item.personas !== 1 ? "s" : ""} ·{" "}
            {new Date(item.fecha).toLocaleDateString("es-ES")}
          </Text>
        </View>
        <View style={styles.historialAmounts}>
          <Text style={styles.historialTotal}>{fmt(item.total)}</Text>
          <Text style={styles.historialPropina}>
            Propina: {fmt(item.propina)}
          </Text>
        </View>
        <Text style={[styles.chevron, isExpanded && styles.chevronRotated]}>
          ›
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardExpandedContent}>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Monto Original:</Text>
            <Text style={styles.detailValue}>
              {fmt(item.total - item.propina)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Porcentaje Propina:</Text>
            <Text style={styles.detailValue}>{item.pct}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Propina:</Text>
            <Text style={[styles.detailValue, styles.detailValueHighlight]}>
              {fmt(item.propina)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Total ({item.personas}{" "}
              {item.personas === 1 ? "persona" : "personas"}):
            </Text>
            <Text style={styles.detailTotal}>{fmt(item.total)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Por persona:</Text>
            <Text style={[styles.detailValue, styles.detailValueHighlight]}>
              {fmt(item.total / item.personas)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.fecha).toLocaleDateString("es-ES", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [historial, setHistorial] = useState([]);
  const [cuentaExpandida, setCuentaExpandida] = useState(null);
  const [simboloMoneda, setSimboloMoneda] = useState("$");

  const totalMes = useMemo(
    () => historial.reduce((s, i) => s + (i.total || 0), 0),
    [historial]
  );

  const totalPropinas = useMemo(
    () => historial.reduce((s, i) => s + (i.propina || 0), 0),
    [historial]
  );

  const recientes = useMemo(() => historial.slice(0, 3), [historial]);

  useFocusEffect(
    useCallback(() => {
      obtenerHistorial().then(setHistorial);
      obtenerMoneda().then((cod) => {
        setSimboloMoneda(obtenerSimboloMoneda(cod));
      });
    }, [])
  );

  const fmt = useCallback(
    (val) => `${simboloMoneda}${(parseFloat(val) || 0).toFixed(2)}`,
    [simboloMoneda]
  );

  const handleNavigateCalculator = useCallback(() => {
    navigation.navigate("Calculator");
  }, [navigation]);

  const handleToggleExpand = useCallback((id) => {
    setCuentaExpandida((prev) => (prev === id ? null : id));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PropinaPlus</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetSection}>
          <Text style={styles.greetTitle}>¡Hola, Usuario! 👋</Text>
          <Text style={styles.greetSub}>
            Calcula tus propinas de forma rápida y equitativa.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnNuevaCuenta}
          onPress={handleNavigateCalculator}
          activeOpacity={0.88}
        >
          <Text style={styles.btnNuevaCuentaIcon}>⊕</Text>
          <Text style={styles.btnNuevaCuentaText}>Nueva Cuenta</Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Image
              source={commerce}
              style={{ width: 24, height: 24, marginBottom: 6 }}
            />
            <Text style={styles.statLabel}>Total Mes</Text>
            <Text style={styles.statValue}>{fmt(totalMes)}</Text>
          </View>
          <View style={styles.statCard}>
            <Image
              source={charity}
              style={{ width: 24, height: 24, marginBottom: 6 }}
            />
            <Text style={styles.statLabel}>Propinas</Text>
            <Text style={styles.statValue}>{fmt(totalPropinas)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Historial Reciente</Text>

        {recientes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyTitle}>Sin cuentas aún</Text>
            <Text style={styles.emptySub}>
              Toca "Nueva Cuenta" para empezar a calcular
            </Text>
          </View>
        ) : (
          recientes.map((item) => (
            <HistorialItem
              key={item.id}
              item={item}
              isExpanded={cuentaExpandida === item.id}
              onToggle={() => handleToggleExpand(item.id)}
              fmt={fmt}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  header: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.darkText,
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  greetSection: {
    marginTop: 28,
    marginBottom: 24,
    alignItems: "center",
  },
  greetTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: Colors.darkText,
    marginBottom: 8,
  },
  greetSub: {
    fontSize: 15,
    color: Colors.gray500,
    lineHeight: 22,
  },
  btnNuevaCuenta: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  btnNuevaCuentaIcon: {
    fontSize: 22,
    color: Colors.white,
  },
  btnNuevaCuentaText: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.gray500,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.darkText,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.darkText,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: Colors.white,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.darkText,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.gray500,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  historialCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  historialCardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  historialIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  historialInfo: {
    flex: 1,
  },
  historialNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.darkText,
    marginBottom: 4,
  },
  historialFecha: {
    fontSize: 13,
    color: Colors.gray500,
  },
  historialAmounts: {
    alignItems: "flex-end",
  },
  historialTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.darkText,
    marginBottom: 3,
  },
  historialPropina: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.green,
  },
  chevron: {
    fontSize: 24,
    color: Colors.gray500,
    marginLeft: 8,
  },
  chevronRotated: {
    transform: [{ rotate: "90deg" }],
  },
  cardExpandedContent: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.gray500,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    color: Colors.darkText,
    fontWeight: "600",
  },
  detailValueHighlight: {
    color: Colors.primary,
    fontWeight: "700",
  },
  detailTotal: {
    fontSize: 14,
    color: Colors.darkText,
    fontWeight: "800",
  },
});