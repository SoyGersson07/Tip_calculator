/**
 * ShareModal.js — Modal inferior para compartir el texto del desglose (WhatsApp, email, copiar, compartir nativo).
 * Props: visible (boolean), onClose (callback), mensaje (string multilínea), titulo (opcional para email).
 */
// Estado local y memoización de manejadores de eventos.
import { useState, useCallback, useMemo } from "react";
// Componentes RN: modal, texto, scroll, enlaces externos, diálogo nativo, compartir sistema.
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Share,
  Alert,
  Image,
  Platform,
} from "react-native";
// API de portapapeles compatible con Expo (Clipboard ya no está en el core de RN).
import * as Clipboard from "expo-clipboard";
import { getColors } from "../config/constants";
import { useAppContext } from "../context/AppContext";

import whatsappIcon from "../assets/whatsapp.png";
import correoIcon from "../assets/correo.png";
import copiarIcon from "../assets/copiar.png";
import compartirIcon from "../assets/compartir.png";

const SHARE_ICON_BACKGROUND = "#FFFFFF";

export default function ShareModal({ visible, onClose, mensaje, titulo }) {
  const { temaOscuro } = useAppContext();
  const colors = getColors(temaOscuro);
  const s = useMemo(() => getStyles(colors), [colors]);

  // Evita doble pulsación mientras se abre un intent externo.
  const [compartiendo, setCompartiendo] = useState(false);

  // Abre WhatsApp directamente; canOpenURL puede fallar en Expo/Android por package visibility.
  const handleCompartirWhatsApp = useCallback(async () => {
    const textoFormateado = encodeURIComponent(mensaje);
    const whatsappUrl = `whatsapp://send?text=${textoFormateado}`;
    const whatsappUrls =
      Platform.OS === "android"
        ? [
            whatsappUrl,
            `intent://send?text=${textoFormateado}#Intent;scheme=whatsapp;package=com.whatsapp;end`,
            `intent://send?text=${textoFormateado}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`,
          ]
        : [whatsappUrl];

    try {
      setCompartiendo(true);

      for (const url of whatsappUrls) {
        try {
          await Linking.openURL(url);
          onClose();
          return;
        } catch (error) {
          // Intenta la siguiente ruta nativa antes de informar al usuario.
        }
      }

      Alert.alert(
        "WhatsApp no instalado",
        "Por favor instala WhatsApp para compartir por este medio"
      );
    } finally {
      setCompartiendo(false);
    }
  }, [mensaje, onClose]);

  // Abre cliente de correo con mailto: asunto y cuerpo codificados.
  const handleCompartirEmail = useCallback(async () => {
    try {
      setCompartiendo(true);
      const asunto = encodeURIComponent(titulo || "Desglose de Cuenta");
      const cuerpo = encodeURIComponent(mensaje);
      const emailUrl = `mailto:?subject=${asunto}&body=${cuerpo}`;

      await Linking.openURL(emailUrl);
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir el cliente de email");
    } finally {
      setCompartiendo(false);
    }
  }, [mensaje, titulo, onClose]);

  // Hoja de compartir nativa del sistema operativo.
  const handleCompartirNativo = useCallback(async () => {
    try {
      setCompartiendo(true);
      await Share.share({
        message: mensaje,
        title: titulo || "Desglose de Cuenta",
      });
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo compartir");
    } finally {
      setCompartiendo(false);
    }
  }, [mensaje, titulo, onClose]);

  // Copia el mensaje al portapapeles y notifica al usuario.
  const handleCopiarAlPortapapeles = useCallback(async () => {
    try {
      setCompartiendo(true);
      await Clipboard.setStringAsync(mensaje);
      Alert.alert("¡Copiado!", "El texto se copió al portapapeles");
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo copiar al portapapeles");
    } finally {
      setCompartiendo(false);
    }
  }, [mensaje, onClose]);

  // Definición declarativa de las cuatro tarjetas de acción (icono, handler).
  const opciones = [
    {
      id: "whatsapp",
      nombre: "WhatsApp",
      icono: whatsappIcon,
      action: handleCompartirWhatsApp,
    },
    {
      id: "email",
      nombre: "Email",
      icono: correoIcon,
      action: handleCompartirEmail,
    },
    {
      id: "copiar",
      nombre: "Copiar",
      icono: copiarIcon,
      action: handleCopiarAlPortapapeles,
    },
    {
      id: "mas",
      nombre: "Más opciones",
      icono: compartirIcon,
      action: handleCompartirNativo,
    },
  ];

  return (
    // Modal transparente con animación desde abajo; onRequestClose = botón atrás Android.
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.container}>
        {/* Capa oscura semitransparente sobre el contenido detrás del modal. */}
        <View style={s.overlay} />

        {/* Hoja inferior con bordes superiores redondeados. */}
        <View style={s.content}>
          <View style={s.header}>
            <Text style={s.title}>Compartir Resultado</Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={compartiendo}
              activeOpacity={0.7}
              style={s.closeBtn}
            >
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.grid}>
              {opciones.map((opcion) => (
                <TouchableOpacity
                  key={opcion.id}
                  style={s.card}
                  onPress={opcion.action}
                  disabled={compartiendo}
                  activeOpacity={0.7}
                >
                  <View style={s.iconoBg}>
                    <Image
                      source={opcion.icono}
                      style={s.icono}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={s.cardNombre}>{opcion.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bloque de solo lectura con el texto que se va a compartir. */}
            <View style={s.previewSection}>
              <Text style={s.previewTitle}>Vista Previa</Text>
              <View style={s.previewBox}>
                <Text style={s.previewText}>{mensaje}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: "auto",
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  iconoBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: SHARE_ICON_BACKGROUND,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  icono: {
    width: 32,
    height: 32,
  },
  cardNombre: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  previewSection: {
    marginTop: 24,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewBox: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  previewText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    fontFamily: "Menlo",
  },
  });
