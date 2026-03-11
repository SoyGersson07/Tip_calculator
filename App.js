import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, Image } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import CalculatorScreen from "./screens/CalculatorScreen";
import DesglosScreen from "./screens/DesglosScreen";

import dashboard from "./assets/dashboard.png";
import setting from "./assets/setting.png";
import history from "./assets/history.png";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack que contiene Home + Calculator
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Desglos" component={DesglosScreen} />
    </Stack.Navigator>
  );
}

// Pantallas placeholder para las otras tabs
function HistorialScreen() {
  return null;
}
function AjustesScreen() {
  return null;
}

const C_PRIMARY = "#E2725B";
const C_GRAY = "#8E8E93";

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E5E5EA",
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 16,
            paddingTop: 10,
          },
          tabBarActiveTintColor: C_PRIMARY,
          tabBarInactiveTintColor: C_GRAY,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.3,
          },
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
        <Tab.Screen name="Inicio" component={HomeStack} />
        <Tab.Screen name="Historial" component={HistorialScreen} />
        <Tab.Screen name="Ajustes" component={AjustesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}