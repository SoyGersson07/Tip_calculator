import { useState, useCallback, useRef, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
  useWindowDimensions,
  Keyboard,
  Image,
} from "react-native";
import Svg, { Path, Text as SvgText, G } from "react-native-svg";

import { getColors } from "../config/constants";
import { useAppContext } from "../context/AppContext";
import { confirmAction } from "../utils/confirmAction";
import roulette from "../assets/roulette.png";

/*
 * RULETA_SCREEN.js — Participantes, ruleta SVG por sectores, animación de giro y tarjeta de ganador.
 * Funciones polar/sectorPath/truncateNombre/pickLabelColor: geometría SVG y contraste de texto.
 * Constantes SCROLL_H_PADDING / WHEEL_*: márgenes y tamaño máximo de la rueda en px.
 */
const SCROLL_H_PADDING = 16;
const WHEEL_MAX = 280;
const WHEEL_MIN = 200;

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Sector circular: desde degStart hasta degEnd (grados, 0° = derecha, sentido horario SVG). */
function sectorPath(cx, cy, r, degStart, degEnd) {
  const p1 = polar(cx, cy, r, degStart);
  const p2 = polar(cx, cy, r, degEnd);
  const sweep = degEnd - degStart;
  const large = Math.abs(sweep) > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
}

/** Luminancia relativa 0–1 para elegir texto claro u oscuro. */
function pickLabelColor(hex) {
  let h = String(hex).replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return "#FFFFFF";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.55 ? "#1C1C1E" : "#FFFFFF";
}

function truncateNombre(s, max = 12) {
  const t = String(s).trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Ruleta en stack Inicio: participantes, SVG animado y resultado. */
export default function RuletaScreen({ navigation }) {
  const { temaOscuro } = useAppContext();
  const colors = getColors(temaOscuro);
  const { width: windowWidth } = useWindowDimensions();

  const wheelSize = useMemo(() => {
    const usable =
      windowWidth - SCROLL_H_PADDING * 2 - 24;
    return Math.max(WHEEL_MIN, Math.min(WHEEL_MAX, Math.floor(usable)));
  }, [windowWidth]);

  const [participantes, setParticipantes] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [ganador, setGanador] = useState(null);
  const [girando, setGirando] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const rotationRef = useRef(0);

  const handleAgregarParticipante = useCallback(() => {
    Keyboard.dismiss();
    const nombre = inputValue.trim();
    if (!nombre) return;
    let duplicado = false;
    setParticipantes((prev) => {
      if (prev.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase())) {
        duplicado = true;
        return prev;
      }
      return [...prev, { id: Date.now(), nombre }];
    });
    if (duplicado) {
      Alert.alert("Participante repetido", "Este participante ya existe en la ruleta.");
      return;
    }
    setInputValue("");
  }, [inputValue]);

  const handleEliminarParticipante = useCallback((id) => {
    const participante = participantes.find((p) => p.id === id);
    confirmAction({
      title: "Eliminar participante",
      message: `¿Deseas quitar a ${participante?.nombre || "este participante"} de la ruleta?`,
      confirmText: "Eliminar",
      destructive: true,
      onConfirm: () => {
        setParticipantes((prev) => prev.filter((p) => p.id !== id));
        setGanador(null);
      },
    });
  }, [participantes]);

  const reiniciarJuego = useCallback(() => {
    setParticipantes([]);
    setInputValue("");
    setGanador(null);
    rotationRef.current = 0;
    spinAnim.setValue(0);
  }, [spinAnim]);

  const confirmarReiniciarJuego = useCallback(() => {
    confirmAction({
      title: "Reiniciar juego",
      message: "¿Deseas borrar los participantes y empezar una ruleta nueva?",
      confirmText: "Reiniciar",
      destructive: true,
      onConfirm: reiniciarJuego,
    });
  }, [reiniciarJuego]);

  const handleGirar = useCallback(() => {
    if (participantes.length < 2) {
      Alert.alert("Faltan participantes", "Necesitas al menos 2 participantes para girar la ruleta.");
      return;
    }

    setGirando(true);
    setGanador(null);

    const rotacionesCompletas = 8;
    const anguloExtra = Math.random() * 360;
    const desde = rotationRef.current;
    const hasta = desde + rotacionesCompletas * 360 + anguloExtra;

    const angulosPorParticipante = 360 / participantes.length;
    const anguloEnReposo = ((hasta % 360) + 360) % 360;
    const sector = ((360 - anguloEnReposo) % 360) / angulosPorParticipante;
    const indiceGanador = Math.min(
      Math.floor(sector),
      participantes.length - 1
    );
    const ganadorFinal = participantes[indiceGanador];

    spinAnim.setValue(desde);
    Animated.timing(spinAnim, {
      toValue: hasta,
      duration: 4000,
      useNativeDriver: true,
    }).start(() => {
      rotationRef.current = hasta;
      setGanador(ganadorFinal);
      setGirando(false);
    });
  }, [participantes, spinAnim]);

  const coloresRuleta = useMemo(() => {
    const palette = [
      "#E85D4C",
      "#2D9CDB",
      "#27AE60",
      "#9B59B6",
      "#F39C12",
      "#1ABC9C",
      "#E74C3C",
      "#3498DB",
      "#16A085",
      "#8E44AD",
    ];
    return participantes.map((_, idx) => palette[idx % palette.length]);
  }, [participantes]);

  const pie = useMemo(() => {
    const n = participantes.length;
    if (n < 2) return null;

    const cx = wheelSize / 2;
    const cy = wheelSize / 2;
    const r = wheelSize / 2 - 4;
    const slice = 360 / n;
    const paths = [];

    for (let i = 0; i < n; i++) {
      const start = -90 + i * slice;
      const end = -90 + (i + 1) * slice;
      const bg = coloresRuleta[i];
      const mid = -90 + (i + 0.5) * slice;
      const labelR = r * 0.58;
      const tp = polar(cx, cy, labelR, mid);
      const labelFill = pickLabelColor(bg);
      const fontSize = n > 6 ? 10 : n > 4 ? 11 : 13;

      paths.push(
        <G key={participantes[i].id}>
          <Path
            d={sectorPath(cx, cy, r, start, end)}
            fill={bg}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          <SvgText
            x={tp.x}
            y={tp.y}
            fill={labelFill}
            fontSize={fontSize}
            fontWeight="700"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(${mid + 90}, ${tp.x}, ${tp.y})`}
          >
            {truncateNombre(participantes[i].nombre)}
          </SvgText>
        </G>
      );
    }
    return paths;
  }, [participantes, wheelSize, coloresRuleta]);

  const s = useMemo(() => getStyles(colors), [colors]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
    extrapolate: "extend",
  });

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgMain }]}>
      <View
        style={[
          s.header,
          { backgroundColor: colors.white, borderBottomColor: colors.gray200 },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            navigation.goBack();
          }}
          style={s.backBtn}
        >
          <Text style={[s.backIcon, { color: colors.darkText }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.darkText }]}>
          Ruleta Rusa
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={[s.card, { backgroundColor: colors.white, borderColor: colors.gray200 }]}>
          <Text style={[s.sectionTitle, { color: colors.darkText }]}>
            Agregar Participantes
          </Text>
          <View style={s.inputContainer}>
            <TextInput
              style={[
                s.input,
                { borderColor: colors.gray300, color: colors.darkText },
              ]}
              placeholder="Nombre del participante"
              placeholderTextColor={colors.gray400}
              value={inputValue}
              onChangeText={setInputValue}
              editable={!girando}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <TouchableOpacity
              style={[
                s.btnAgregar,
                { backgroundColor: colors.primary },
                girando && s.btnAgregarDisabled,
              ]}
              onPress={handleAgregarParticipante}
              disabled={girando}
              activeOpacity={0.7}
            >
              <Text style={s.btnAgregarText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {participantes.length > 0 && (
          <View style={[s.card, { backgroundColor: colors.white, borderColor: colors.gray200 }]}>
            <Text style={[s.sectionTitle, { color: colors.darkText }]}>
              Participantes ({participantes.length})
            </Text>
            {participantes.map((p, idx) => (
              <View
                key={p.id}
                style={[
                  s.participanteRow,
                  idx !== participantes.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.gray200,
                  },
                ]}
              >
                <View
                  style={[
                    s.participanteColor,
                    { backgroundColor: coloresRuleta[idx] },
                  ]}
                />
                <Text style={[s.participanteNombre, { color: colors.darkText }]}>
                  {p.nombre}
                </Text>
                <TouchableOpacity
                  onPress={() => handleEliminarParticipante(p.id)}
                  disabled={girando}
                  activeOpacity={0.7}
                >
                  <Text style={[s.deleteIcon, girando && { opacity: 0.5 }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {participantes.length === 1 && (
          <Text style={[s.ruletaHint, { color: colors.gray500 }]}>
            Añade al menos un participante más para ver la ruleta.
          </Text>
        )}

        {participantes.length >= 2 && (
          <View style={[s.ruletaWrap, { width: wheelSize }]}>
            <Text style={[s.sectionTitle, { color: colors.darkText }]}>
              La Ruleta
            </Text>

            <View style={[s.aguja, { borderTopColor: colors.primary }]} />

            <Animated.View
              style={[
                s.ruletaWheel,
                {
                  width: wheelSize,
                  height: wheelSize,
                  borderRadius: wheelSize / 2,
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <Svg width={wheelSize} height={wheelSize}>
                {pie}
              </Svg>
            </Animated.View>

            <TouchableOpacity
              style={[
                s.btnGirar,
                { backgroundColor: colors.primary },
                girando && s.btnGirarDisabled,
              ]}
              onPress={handleGirar}
              disabled={girando}
              activeOpacity={0.7}
            >
              <Text style={s.btnGirarText}>
                {girando ? "Girando..." : "GIRAR RULETA"}
              </Text>
            </TouchableOpacity>

            {ganador && (
              <View style={[s.resultCard, { backgroundColor: colors.primary }]}>
                <Text style={s.resultTitle}>¡Ganador!</Text>
                <Text style={[s.resultNombre, { color: colors.white }]}>
                  {ganador.nombre}
                </Text>
                <Text style={s.resultSub}>¡Tiene que pagar la cuenta! 🍽️</Text>
                <TouchableOpacity
                  style={[s.btnResultNew, { backgroundColor: colors.white }]}
                  onPress={confirmarReiniciarJuego}
                  activeOpacity={0.7}
                >
                  <Text style={[s.btnResultNewText, { color: colors.primary }]}>
                    Juego Nuevo
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {participantes.length === 0 && (
          <View style={s.emptyState}>
            <Image source={roulette} style={{ width: 40, height: 40 }} />
            <Text style={[s.emptyTitle, { color: colors.darkText }]}>
              Sin participantes
            </Text>
            <Text style={[s.emptySub, { color: colors.gray500 }]}>
              Agrega nombres arriba para comenzar
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Estilos de la ruleta (cabecera, tarjetas, botones) según `colors`. */
function getStyles(colors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    backBtn: {
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    },
    backIcon: {
      fontSize: 24,
      fontWeight: "600",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: SCROLL_H_PADDING,
      paddingBottom: 32,
      alignItems: "center",
    },
    card: {
      alignSelf: "stretch",
      borderRadius: 12,
      borderWidth: 1,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    inputContainer: {
      flexDirection: "row",
      gap: 8,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
    },
    btnAgregar: {
      width: 44,
      height: 44,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    btnAgregarDisabled: {
      opacity: 0.6,
    },
    btnAgregarText: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.white,
    },
    participanteRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      gap: 12,
    },
    participanteColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    participanteNombre: {
      flex: 1,
      fontSize: 15,
      fontWeight: "500",
    },
    deleteIcon: {
      fontSize: 18,
      fontWeight: "600",
      color: "#FF3B30",
    },
    ruletaHint: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: 16,
      paddingHorizontal: 8,
      lineHeight: 20,
    },
    ruletaWrap: {
      alignItems: "center",
      marginBottom: 24,
      overflow: "hidden",
    },
    aguja: {
      width: 0,
      height: 0,
      borderLeftWidth: 12,
      borderRightWidth: 12,
      borderTopWidth: 20,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      marginBottom: -10,
      zIndex: 10,
    },
    ruletaWheel: {
      overflow: "hidden",
      marginVertical: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    btnGirar: {
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 8,
      marginBottom: 16,
      alignSelf: "stretch",
    },
    btnGirarDisabled: {
      opacity: 0.6,
    },
    btnGirarText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.white,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    resultCard: {
      borderRadius: 12,
      padding: 24,
      alignItems: "center",
      alignSelf: "stretch",
    },
    resultTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.white,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    resultNombre: {
      fontSize: 32,
      fontWeight: "700",
      marginBottom: 8,
      textAlign: "center",
    },
    resultSub: {
      fontSize: 14,
      color: "rgba(255,255,255,0.9)",
      marginBottom: 16,
    },
    btnResultNew: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
    },
    btnResultNewText: {
      fontSize: 13,
      fontWeight: "700",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 6,
    },
    emptySub: {
      fontSize: 14,
      textAlign: "center",
    },
  });
}
