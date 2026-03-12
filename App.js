// Importamos los componentes de navegación necesarios para crear la estructura de tabs y stack
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, Image } from "react-native";

// Importamos las pantallas de la aplicación: inicio, calculadora y desglose
import HomeScreen from "./screens/HomeScreen";
import CalculatorScreen from "./screens/CalculatorScreen";
import DesglosScreen from "./screens/DesglosScreen";

// Importamos los íconos de la barra de navegación inferior
import dashboard from "./assets/dashboard.png";
import setting from "./assets/setting.png";
import history from "./assets/history.png";

// Creamos los navegadores de tabs (barra inferior) y stack (navegación entre pantallas)
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack de navegación HOME: contiene las 3 pantallas conectadas
// Home -> Calculator -> Desglose (todas tienen transición entre ellas sin header)
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Desglos" component={DesglosScreen} />
    </Stack.Navigator>
  );
}

// Pantallas placeholder para "Historial" y "Ajustes"
// Estas son solo placeholders, se implementarán en el futuro
function HistorialScreen() {
  return null;
}
function AjustesScreen() {
  return null;
}

// Colores principales de la aplicación
const C_PRIMARY = "#E2725B"; // Color coral/naranja
const C_GRAY = "#8E8E93"; // Color gris neutro

// Componente principal de la app - define la estructura de navegación completa
export default function App() {
  return (
    <NavigationContainer>
      {/* Navegador de tabs (barra de pestañas en la parte inferior) */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // No mostrar header en tabs
          // Estilos de la barra de tabs
          tabBarStyle: {
            backgroundColor: "#FFFFFF", // Fondo blanco
            borderTopColor: "#E5E5EA", // Borde superior gris
            borderTopWidth: 1,
            height: 80, // Altura de la barra
            paddingBottom: 16,
            paddingTop: 10,
          },
          tabBarActiveTintColor: C_PRIMARY, // Color cuando la tab está activa
          tabBarInactiveTintColor: C_GRAY, // Color cuando la tab está inactiva
          // Estilos del texto de las tabs
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.3,
          },
          // Función que renderiza el ícono de cada tab
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Inicio: <Image source={dashboard} style={{ width: 24, height: 24 }} />,
              Historial: <Image source={history} style={{ width: 24, height: 24 }} />,
              Ajustes: <Image source={setting} style={{ width: 24, height: 24 }} />,
            };
            return (
              <Text style={{ fontSize: 22, color }}>{icons[route.name]}</Text>
            );
          },
        })}
      >
        {/* Tab 1: INICIO - Contiene pantalla de inicio + calculadora + desglose */}
        <Tab.Screen name="Inicio" component={HomeStack} />
        {/* Tab 2: HISTORIAL - Placeholder para futuras cuentas guardadas */}
        <Tab.Screen name="Historial" component={HistorialScreen} />
        {/* Tab 3: AJUSTES - Placeholder para configuración de la app */}
        <Tab.Screen name="Ajustes" component={AjustesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}