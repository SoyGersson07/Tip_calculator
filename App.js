/**
 * App.js — Raíz de la UI: pestañas inferiores + pila de pantallas del flujo de cuenta.
 * AppProvider envuelve todo para tema/idioma global (contexto).
 */
// Librería base de React (necesaria para JSX y componentes).
import React from "react";
import { View, ActivityIndicator } from "react-native";
// Contenedor de navegación: provee el contexto de navegación a la app.
import { NavigationContainer } from "@react-navigation/native";
// Fábrica del navegador de pestañas inferiores (tabs).
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// Fábrica del navegador de pila nativa (stack) para el flujo Inicio → Calculadora → …
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Componente para mostrar imágenes (iconos del tab bar con tinte).
import { Image } from "react-native";

// Pantalla inicial del stack "Inicio".
import HomeScreen from "./screens/HomeScreen";
// Pantalla de cálculo de propina y participantes.
import CalculatorScreen from "./screens/CalculatorScreen";
// Pantalla de desglose por persona.
import DesglosScreen from "./screens/DesglosScreen";
// Pantalla para fijar monto de propina personalizado.
import TipScreen from "./screens/TipScreen";
// Pantalla de ruleta para elegir quién paga.
import RuletaScreen from "./screens/RuletaScreen";
// Listado global de historial de cuentas.
import HistorialScreen from "./screens/HistorialScreen";
// Ajustes (moneda, redondeo, tema, idioma).
import AjustesScreen from "./screens/AjustesScreen";

// Recurso gráfico del icono "Inicio" en la barra de pestañas.
import dashboard from "./assets/dashboard.png";
// Recurso gráfico del icono "Ajustes".
import setting from "./assets/setting.png";
// Recurso gráfico del icono "Historial".
import history from "./assets/history.png";

// Paleta dinámica según tema claro/oscuro.
import { getColors } from "./config/constants";
// Proveedor y hook del contexto global (tema, idioma, sesión local).
import { AppProvider, useAppContext } from "./context/AppContext";

// Pantalla de acceso antes de cargar datos de usuario.
import AuthScreen from "./screens/AuthScreen";

// Instancia del navegador de pestañas (se usa más abajo en JSX).
const Tab = createBottomTabNavigator();
// Instancia del navegador de pila para el grupo "Inicio".
const Stack = createNativeStackNavigator();

/**
 * Pila de pantallas dentro de la pestaña "Inicio": Home y el flujo de cuenta.
 * headerShown: false oculta la barra nativa de título (cada pantalla dibuja la suya).
 */
function HomeStack() {
  return (
    // Navigator de pila sin cabecera por defecto.
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Pantalla principal de la app dentro del stack. */}
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Calculadora de propina. */}
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      {/* Desglose final. */}
      <Stack.Screen name="Desglos" component={DesglosScreen} />
      {/* Configuración de propina en monto fijo. */}
      <Stack.Screen name="Tip" component={TipScreen} />
      {/* Ruleta "quién paga". */}
      <Stack.Screen name="Ruleta" component={RuletaScreen} />
    </Stack.Navigator>
  );
}

// Mapa nombre de ruta del tab → imagen del icono (se usa en tabBarIcon).
const TAB_ICONS = {
  Inicio: dashboard,
  Historial: history,
  Ajustes: setting,
};

/**
 * Navegación principal: 3 pestañas (Inicio con stack interno, Historial, Ajustes).
 * Lee tema del contexto para colorear la barra de pestañas.
 */
function AppNavigator() {
  // Lee si el usuario activó tema oscuro (desde AppContext).
  const { temaOscuro } = useAppContext();
  // Resuelve objeto de colores según booleano temaOscuro.
  const colors = getColors(temaOscuro);

  return (
    // Proveedor de navegación: estado de rutas, enlaces, etc.
    <NavigationContainer>
      {/* Navegador de pestañas inferior. */}
      <Tab.Navigator
        // Opciones comunes por pestaña; recibe route para saber cuál es la activa.
        screenOptions={({ route }) => ({
          // Oculta cabecera del stack en las tabs (las pantallas lo controlan).
          headerShown: false,
          // Estilo del contenedor de la barra inferior.
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.gray200,
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 16,
            paddingTop: 10,
          },
          // Color del icono/etiqueta de la pestaña seleccionada.
          tabBarActiveTintColor: colors.primary,
          // Color del icono/etiqueta de las pestañas no seleccionadas.
          tabBarInactiveTintColor: colors.gray500,
          // Tipografía de las etiquetas bajo los iconos.
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.3,
          },
          // Renderiza el icono de cada pestaña con tinte según foco (color activo/inactivo).
          tabBarIcon: ({ color }) => (
            <Image
              source={TAB_ICONS[route.name]}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        })}
      >
        {/* Pestaña 1: stack Home + calculadora + desglose + tip + ruleta. */}
        <Tab.Screen name="Inicio" component={HomeStack} />
        {/* Pestaña 2: historial global. */}
        <Tab.Screen name="Historial" component={HistorialScreen} />
        {/* Pestaña 3: ajustes. */}
        <Tab.Screen name="Ajustes" component={AjustesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

/**
 * Export por defecto: envuelve la navegación con el proveedor de contexto app.
 */
/** Bloque intermedio que muestra loading, login o tabs según sesión local. */
function RootNavigator() {
  const { authCargando, usuario, temaOscuro } = useAppContext();
  const colors = getColors(temaOscuro);

  if (authCargando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bgMain,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!usuario) {
    return <AuthScreen />;
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    // Provee idioma, tema, sesión y setters.
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
