/**
 * AuthScreen.js — Login y registro local (sin servidor); alterna modo con pie de página.
 */
import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { getColors } from "../config/constants";
import { getAllTranslations } from "../config/languages";
import { useAppContext } from "../context/AppContext";

export default function AuthScreen() {
  const { temaOscuro, idioma, authRegistrar, authIniciarSesion } = useAppContext();
  const colors = getColors(temaOscuro);
  const tr = getAllTranslations(idioma);
  const style = styles(colors);

  const [modo, setModo] = useState("login");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [clave2, setClave2] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const refClave = useRef(null);
  const refClave2 = useRef(null);

  const traducirError = useCallback(
    (code) => {
      const loc = getAllTranslations(idioma);
      const map = {
        AUTH_INVALID_USERNAME: loc["auth_invalid_username"],
        AUTH_WEAK_PASSWORD: loc["auth_weak_password"],
        AUTH_USER_EXISTS: loc["auth_user_exists"],
        AUTH_CREDENTIALS: loc["auth_credentials"],
        AUTH_PASSWORD_MISMATCH: loc["auth_password_mismatch"],
      };
      return map[code] || loc["auth_error_generic"];
    },
    [idioma]
  );

  const alEnviar = useCallback(async () => {
    Keyboard.dismiss();
    setMensaje("");
    setEnviando(true);
    try {
      if (modo === "login") {
        const r = await authIniciarSesion(nombreUsuario, clave);
        if (!r.ok) setMensaje(traducirError(r.code));
      } else {
        const r = await authRegistrar(nombreUsuario, clave, clave2);
        if (!r.ok) setMensaje(traducirError(r.code));
      }
    } catch (e) {
      console.error(e);
      setMensaje(getAllTranslations(idioma)["auth_error_generic"]);
    } finally {
      setEnviando(false);
    }
  }, [
    modo,
    nombreUsuario,
    clave,
    clave2,
    authIniciarSesion,
    authRegistrar,
    traducirError,
    idioma,
  ]);

  return (
    <SafeAreaView style={style.safe}>
      <KeyboardAvoidingView
        style={style.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={style.scrollInner}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Text style={style.logo}>PropinaPlus</Text>
          <Text style={style.sub}>
            {modo === "login"
              ? tr["auth_sub_login"]
              : tr["auth_sub_register"]}
          </Text>

          <View style={style.card}>
            <Text style={style.label}>{tr["auth_username"]}</Text>
            <TextInput
              style={style.input}
              value={nombreUsuario}
              onChangeText={setNombreUsuario}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!enviando}
              placeholderTextColor={colors.gray400}
              placeholder=""
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => refClave.current?.focus()}
            />

            <Text style={style.label}>{tr["auth_password"]}</Text>
            <TextInput
              ref={refClave}
              style={style.input}
              value={clave}
              onChangeText={setClave}
              secureTextEntry
              editable={!enviando}
              placeholderTextColor={colors.gray400}
              returnKeyType={modo === "register" ? "next" : "done"}
              blurOnSubmit={modo !== "register"}
              onSubmitEditing={() => {
                if (modo === "register") {
                  refClave2.current?.focus();
                } else {
                  Keyboard.dismiss();
                }
              }}
            />

            {modo === "register" ? (
              <>
                <Text style={style.label}>{tr["auth_password_repeat"]}</Text>
                <TextInput
                  ref={refClave2}
                  style={style.input}
                  value={clave2}
                  onChangeText={setClave2}
                  secureTextEntry
                  editable={!enviando}
                  placeholderTextColor={colors.gray400}
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </>
            ) : null}

            {mensaje ? <Text style={style.error}>{mensaje}</Text> : null}

            <TouchableOpacity
              style={[style.btnPrim, enviando && style.btnDisabled]}
              onPress={alEnviar}
              disabled={enviando}
              activeOpacity={0.88}
            >
              {enviando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={style.btnPrimText}>
                  {modo === "login"
                    ? tr["auth_btn_login"]
                    : tr["auth_btn_register"]}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={style.hintLocal}>{tr["auth_local_hint"]}</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setModo(modo === "login" ? "register" : "login");
              setMensaje("");
              setNombreUsuario("");
              setClave("");
              setClave2("");
            }}
            disabled={enviando}
            style={style.switchWrap}
          >
            <Text style={style.switchText}>
              {modo === "login"
                ? tr["auth_go_register"]
                : tr["auth_go_login"]}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function styles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgMain },
    flex: { flex: 1 },
    scrollInner: {
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 40,
    },
    logo: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.darkText,
      textAlign: "center",
      letterSpacing: -0.5,
    },
    sub: {
      marginTop: 8,
      fontSize: 15,
      color: colors.gray500,
      textAlign: "center",
      marginBottom: 28,
      lineHeight: 22,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.gray500,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.gray200,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 16,
      color: colors.darkText,
      marginBottom: 16,
      backgroundColor: colors.bgMain,
    },
    error: {
      color: colors.danger,
      fontSize: 13,
      marginBottom: 12,
      fontWeight: "600",
    },
    btnPrim: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    btnDisabled: { opacity: 0.65 },
    btnPrimText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "800",
    },
    hintLocal: {
      marginTop: 14,
      fontSize: 12,
      color: colors.gray500,
      lineHeight: 18,
      textAlign: "center",
    },
    switchWrap: { marginTop: 24, alignItems: "center" },
    switchText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.primary,
    },
  });
}
